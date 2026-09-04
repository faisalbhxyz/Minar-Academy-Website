# Student Watch Time & Learning Report API

Spec so **actual video watch minutes** (report-card learning time) live on the server and stay in sync across **mobile app**, **website**, and **admin student details**.

---

## Current state (important distinction)

Two different things exist today. Only one is fully backend-connected.

| Metric | What it means | Where it lives today | Sync across devices? |
| --- | --- | --- | --- |
| **Resume position** | How far into a lesson the playhead got (`max_position_seconds`) | Backend `PATCH /course/{slug}/lessons/{id}/progress` | ✅ Yes (resume works on other devices) |
| **Actual watch time** | How many seconds the student **really played** (rewatch counts again) | Mobile: **device-local** AsyncStorage (`dailyWatchByUserDate`). Web: **not recorded** locally; UI only reads `GET /student/learning-report` | ❌ No |

### What already works

- `PATCH .../lessons/{id}/progress` with `{ max_position_seconds, duration_seconds }` — resume + lesson % complete.
- `POST .../lessons/{id}/complete` when ≥ ~80% of duration.
- `GET /student/learning-report?period=7d|30d|90d` — contract exists; clients (web + mobile) already call it for chart / insights.

### What does **not** work for report-card minutes

1. Mobile accumulates real play time **only on device** (`useLessonWatch` → `addDailyWatchSeconds`). It never POSTs those seconds to the API.
2. Website `LessonVideoPlayer` only saves resume position — it does **not** track wall-clock play time.
3. Admin dashboard has **no** student-details surface for total / daily watch minutes.
4. `max_position_seconds` **must not** be used as “minutes watched” — seeking to end, rewatching, or quitting mid-video all make position ≠ play time.

**Verdict for backend team:** treat **actual watch-time ingestion + daily aggregation + admin read** as the missing piece. Enhance existing `GET /student/learning-report` so `daily_watch_seconds` is authoritative once clients start posting events.

---

## Goals

1. Persist **actual video play seconds** per student per local calendar day (and optionally per lesson).
2. Same student on phone A → phone B / website → same total learning time + daily chart.
3. Admin opens student details → sees total watch time, streak, period breakdown (same numbers student sees).
4. Keep resume progress API unchanged (still `max_position_seconds`).
5. Clients: local cache OK for offline; **server wins** after sync.

---

## Canonical model

### A. Daily aggregate (required — powers report card)

```text
student_daily_watch
  id                    bigint PK
  tenant_id             bigint NOT NULL
  student_id            bigint NOT NULL
  watch_date            date NOT NULL          -- student's local calendar day (YYYY-MM-DD)
  timezone              varchar(64) NOT NULL  -- e.g. Asia/Dhaka
  video_seconds         int NOT NULL DEFAULT 0
  live_class_seconds    int NOT NULL DEFAULT 0  -- optional v1: keep 0
  quiz_seconds          int NOT NULL DEFAULT 0  -- optional estimate later
  updated_at            datetime NOT NULL
  created_at            datetime NOT NULL
  UNIQUE (tenant_id, student_id, watch_date)
```

**Indexes:** `(tenant_id, student_id, watch_date)`, `(tenant_id, student_id, updated_at)`.

### B. Watch session / delta log (recommended — audit + anti-cheat)

```text
student_watch_events
  id                    bigint PK
  tenant_id             bigint NOT NULL
  student_id            bigint NOT NULL
  course_id             bigint NULL
  lesson_id             bigint NULL
  source                varchar(32) NOT NULL  -- enrolled | free_lesson | offline
  watched_seconds       int NOT NULL          -- delta this flush (1..300 typical)
  client_event_id       varchar(64) NOT NULL  -- UUID; idempotent
  watched_at            datetime NOT NULL     -- client timestamp (UTC)
  watch_date            date NOT NULL         -- derived from client local date
  timezone              varchar(64) NOT NULL
  device_platform       varchar(16) NULL      -- ios | android | web
  created_at            datetime NOT NULL
  UNIQUE (tenant_id, student_id, client_event_id)
```

**Indexes:** `(tenant_id, student_id, watch_date)`, `(tenant_id, lesson_id)`, `(client_event_id)`.

On each accepted event: `student_daily_watch.video_seconds += watched_seconds` (idempotent via `client_event_id`).

---

## Validation & anti-abuse (v1)

| Rule | Behaviour |
| --- | --- |
| `watched_seconds` ≤ 0 | ignore / `422` |
| `watched_seconds` > 300 per event | clamp to 300 (clients flush ~15s) |
| Same `client_event_id` twice | `200` no-op (idempotent) |
| Sum of events for one student in one UTC hour > 3600 | accept but flag; optional soft cap |
| Unauthenticated | `401` |
| Lesson not playable for student (not enrolled & not public free) | `403` |
| Future `watch_date` > today+1 in given timezone | `422` |

Do **not** derive daily totals from `max_position_seconds` deltas.

---

## Endpoints

All under `/v1`. Auth: **Bearer** (student JWT) unless noted. Header: `app-key` as usual.

### 1. `POST /student/watch-time` (required — ingest)

Clients call this on the same cadence as progress save (~every 15s while playing, and on pause / background / unmount).

```http
POST /v1/student/watch-time
Authorization: Bearer <token>
app-key: <key>
Content-Type: application/json

{
  "client_event_id": "550e8400-e29b-41d4-a716-446655440000",
  "watched_seconds": 14,
  "watch_date": "2026-09-04",
  "timezone": "Asia/Dhaka",
  "watched_at": "2026-09-04T08:15:22Z",
  "course_id": 12,
  "lesson_id": 88,
  "source": "enrolled",
  "device_platform": "android"
}
```

Minimal accepted body:

```json
{
  "client_event_id": "…",
  "watched_seconds": 14,
  "watch_date": "2026-09-04",
  "timezone": "Asia/Dhaka"
}
```

**Success `200`:**

```json
{
  "data": {
    "accepted": true,
    "watch_date": "2026-09-04",
    "day_video_seconds": 1842,
    "duplicate": false
  }
}
```

Duplicate `client_event_id` → `accepted: true`, `duplicate: true`, same `day_video_seconds`.

**Batch (optional but preferred for offline catch-up):**

```http
POST /v1/student/watch-time/batch
```

```json
{
  "events": [ /* up to 50 watch-time objects */ ]
}
```

Response: per-event accept/duplicate counts + updated daily totals for touched dates.

---

### 2. `GET /student/learning-report` (already exists — make authoritative)

```http
GET /v1/student/learning-report?period=7d|30d|90d
```

**Required response shape** (frontend already typed):

```json
{
  "data": {
    "period": "7d",
    "daily_watch_seconds": [
      { "date": "2026-08-29", "seconds": 0 },
      { "date": "2026-08-30", "seconds": 1200 },
      { "date": "2026-09-04", "seconds": 3600 }
    ],
    "streak_days": 3,
    "quiz_accuracy_percent": 85.5,
    "courses_in_progress": 2,
    "courses_completed": 1
  }
}
```

Rules:

- Return **one row per calendar day** in the period (including `seconds: 0` days) so charts align — **or** only non-zero days (clients already pad empty days). Prefer **sparse OK**; clients pad.
- `daily_watch_seconds[].seconds` = sum of `student_daily_watch.video_seconds` (+ optional categories later).
- `streak_days` = consecutive days ending today (in student timezone) with `video_seconds > 0`.
- `quiz_accuracy_percent` / course counts: keep existing logic from quiz submissions + enrollments.

Until ingest ships, empty `daily_watch_seconds: []` is acceptable; after ingest, this must reflect posted events.

---

### 3. Admin — student details watch summary (required for dashboard)

Admin auth (existing admin middleware). Suggested:

```http
GET /v1/admin/students/{studentId}/learning-report?period=7d|30d|90d|all
```

Same `data` shape as student GET, plus extras for support:

```json
{
  "data": {
    "period": "30d",
    "daily_watch_seconds": [ /* … */ ],
    "streak_days": 5,
    "quiz_accuracy_percent": 72,
    "courses_in_progress": 1,
    "courses_completed": 2,
    "totals": {
      "video_seconds_period": 54000,
      "video_seconds_all_time": 180000,
      "last_watched_at": "2026-09-04T08:15:22Z"
    },
    "by_course": [
      {
        "course_id": 12,
        "course_title": "HSC Physics",
        "video_seconds": 12000
      }
    ]
  }
}
```

Also embed a short summary on existing admin student detail payload if that endpoint already exists:

```json
{
  "learning_time": {
    "video_seconds_7d": 7200,
    "video_seconds_30d": 54000,
    "streak_days": 5,
    "last_watched_at": "2026-09-04T08:15:22Z"
  }
}
```

---

## Sync behaviour (app + website)

```text
┌─────────────┐   POST watch-time (deltas)    ┌──────────────┐
│ Mobile / Web│ ─────────────────────────────►│   Backend    │
│ playing…    │                               │ daily + log  │
└─────────────┘                               └──────┬───────┘
                                                     │
┌─────────────┐   GET learning-report                │
│ Other device│ ◄────────────────────────────────────┤
│ Admin UI    │   GET admin/.../learning-report      │
└─────────────┘
```

| Event | Client action |
| --- | --- |
| Playing video (~15s) | Buffer seconds → `POST /student/watch-time` (+ keep existing `PATCH` progress) |
| Pause / background / leave lesson | Flush pending seconds |
| Offline | Queue events with stable `client_event_id`; `POST .../batch` on reconnect |
| Open Learning Report / Home chart | `GET /student/learning-report` — **server wins** over local cache |
| Admin opens student | `GET /admin/students/{id}/learning-report` |

**Local cache:** Mobile may keep `dailyWatchByUserDate` as offline UX only. After successful GET, overwrite with server days (or `max(local, server)` only until migration completes — prefer server-only after first successful sync).

---

## Client wiring after backend ships

### Mobile (`mobile/`)

| Current | After API |
| --- | --- |
| `addDailyWatchSeconds` AsyncStorage only | Also enqueue + `POST /student/watch-time` ✅ |
| `flushDailyWatch` in `useLessonWatch` | Flush to API with UUID `client_event_id` ✅ |
| Report prefers API ∪ local max | Prefer API once GET succeeds ✅ |
| Files | `useLessonWatch.ts`, `watchTime.ts`, `learningStore.ts`, `api/index.ts`, `LearningReportScreen` |

### Website (`app/` + `lib/`)

| Current | After API |
| --- | --- |
| `saveWatchPosition` only | Also track play ticks → `POST /student/watch-time` ✅ |
| `LearningReportInsights` GET only | Same GET; chart fills once ingest works |
| Files | `LessonVideoPlayer.tsx`, `lib/watchTimeApi.ts` |

### Admin

- Student details page: show 7d / 30d total minutes, streak, simple bar chart from admin GET.

---

## Relation to existing progress API

Keep both:

```text
PATCH .../progress     → resume position + completion %
POST  .../watch-time   → actual learning minutes for report card
POST  .../complete     → lesson marked done (≥80% position)
```

Never replace one with the other.

Free / public lessons: same `POST /student/watch-time` with `source: "free_lesson"` (progress PATCH already allowed without enrollment for public lessons — see [`free-lessons-api.md`](./free-lessons-api.md)).

---

## Suggested migration sketch

```sql
CREATE TABLE student_daily_watch (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  watch_date DATE NOT NULL,
  timezone VARCHAR(64) NOT NULL,
  video_seconds INT NOT NULL DEFAULT 0,
  live_class_seconds INT NOT NULL DEFAULT 0,
  quiz_seconds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_daily_watch (tenant_id, student_id, watch_date),
  KEY idx_daily_watch_student (tenant_id, student_id, watch_date)
);

CREATE TABLE student_watch_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  course_id BIGINT NULL,
  lesson_id BIGINT NULL,
  source VARCHAR(32) NOT NULL,
  watched_seconds INT NOT NULL,
  client_event_id VARCHAR(64) NOT NULL,
  watched_at TIMESTAMP NOT NULL,
  watch_date DATE NOT NULL,
  timezone VARCHAR(64) NOT NULL,
  device_platform VARCHAR(16) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_watch_event (tenant_id, student_id, client_event_id),
  KEY idx_watch_events_day (tenant_id, student_id, watch_date)
);
```

(Adjust names to `lurnic-server` conventions.)

Update `GET /student/learning-report` implementation in `modules/student/storefront_service.go` (or equivalent) to read from `student_daily_watch` instead of empty / incorrect sources.

---

## Acceptance checklist

- [ ] `POST /student/watch-time` upserts daily total; duplicate `client_event_id` is idempotent
- [ ] Playing 2 minutes on phone increases that day’s `seconds` by ~120 (not by seek position)
- [ ] Same student logs into web → `GET /student/learning-report` shows those ~120s
- [ ] Rewatching the same lesson adds more seconds (position API does not “reset” daily total)
- [ ] Offline batch flush does not double-count
- [ ] Admin `GET .../students/{id}/learning-report` matches student totals for same period
- [ ] Existing `PATCH` progress / complete behaviour unchanged
- [ ] Abuse caps do not block normal binge watching (~few hours/day)

---

## Out of scope (v1)

- Live-class / quiz time categories (schema columns reserved; keep 0)
- Realtime WebSocket push of report updates (refetch on focus is enough)
- Migrating historical AsyncStorage minutes from old app installs (optional one-time client upload)
- Per-instructor analytics dashboards

---

## Interim (until ingest exists)

- Mobile: keep local daily watch for on-device report only.
- Web / other devices / admin: learning-time chart may stay empty or incomplete.
- Resume position across devices continues to work via existing progress API.

When ingest ships:

1. Mobile starts POSTing deltas; stop treating local as source of truth after first successful GET.
2. Website starts POSTing deltas from the video player.
3. Admin wires student details to admin learning-report GET.
