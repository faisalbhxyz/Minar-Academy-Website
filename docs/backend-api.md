# Minar Academy — Backend API (Frontend integration)

এই ডকুমেন্টটি **minar-academy** Next.js অ্যাপ থেকে যে বাহ্যিক ব্যাকএন্ড API কল হয়, তার উপর ভিত্তি করে লেখা। ব্যাকএন্ডের অফিসিয়াল OpenAPI/Swagger থাকলে সেটার সাথে cross-check করা উচিত।

---

## Base configuration

| Item | Source |
|------|--------|
| **Base URL** | Environment variable `NEXT_PUBLIC_API_URL` |
| **HTTP client** | Axios instance: `lib/axiosInstance.ts` |

### Common headers

প্রায় সব রিকোয়েস্টে:

- `Content-Type: application/json`
- `app-key: <NEXT_PUBLIC_APP_KEY>` (value from `NEXT_PUBLIC_APP_KEY`)

### Authenticated requests

যেখানে লগইন লাগে, অতিরিক্ত:

- `Authorization: Bearer <JWT access token>`

টোকেন NextAuth সেশন থেকে আসে (`session.accessToken`)।

---

## Response shape (as used in this repo)

| Pattern | Where |
|---------|--------|
| Most **GET** success payloads | Main data is in **`response.data.data`** (array or object). |
| **POST `/student/login`** | Top-level **`response.data`** with `token` and `user` (see `lib/auth.ts`). |
| **POST `/order/create`** | `message`, `order` (with fields like `course_id`, `customer_note`, `invoice_id`, `total`) — see `app/components/checkout/CheckoutBox.tsx`. |

Error responses: কোডে প্রায়ই `err.response.data.error` বা `message` ব্যবহার করা হয়েছে (যেমন রেজিস্টার/চেকআউট)।

---

## Public / data-display APIs (GET)

| Method & path | Used in | Purpose |
|---------------|---------|---------|
| `GET /banners` | `app/(home)/page.tsx` | Home page banner carousel |
| `GET /course?showItems=<n>` or `GET /course?showItems=all` | `getAllCourses` in `app/actions.ts` | Course list; limit by number or fetch all |
| `GET /course/{slug}` | `getCourseBySlug` in `app/actions.ts` | Single course detail by slug |
| `GET /category` | `getAllCategories` in `app/actions.ts` | All categories |
| `GET /course/menu/{slug}` | `app/(home)/courses/[menu]/page.tsx` | Courses filtered by menu slug |
| `GET /course/category/{slug}` | `app/(home)/courses/category/[slug]/page.tsx` | Courses filtered by category slug |
| `GET /course/search?search=<query>` | `app/components/CourseSearch.tsx` | Course search (debounced client-side) |
| `GET /instructor/all` | `app/(home)/teachers/page.tsx` | All instructors / teachers |
| `GET /payment-methods` | `getPaymentMethods` in `app/actions.ts`, checkout | Available payment methods |

### Query parameters

- **`/course`**: `showItems` — either a number (e.g. `12`) or `all`.
- **`/course/search`**: `search` — search string (axios `params`).

---

## Authenticated APIs (GET)

| Method & path | Used in | Purpose |
|---------------|---------|---------|
| `GET /student/details` | `getStudentDetails` in `app/actions.ts` | Logged-in student profile |
| `GET /enrolled/courses` | `getStudentEnrollments` in `app/actions.ts` | Student’s enrolled courses |

Both require: `app-key` + `Authorization: Bearer <token>`.

---

## Authenticated mutations (PUT)

| Method & path | Used in | Body (summary) | Auth |
|---------------|---------|----------------|------|
| `PUT /student/update` | `StudentProfileForm.tsx`, `StudentProfileImage.tsx` | `multipart/form-data`: `first_name` (required), `last_name`, `phone`, optional `profile_image` | `app-key` + Bearer (student JWT; updates logged-in student only — no `:id` in URL) |

Admin-only equivalent: `PUT /private/student/update/:id`.

---

## Mutations (POST)

| Method & path | Used in | Body (summary) | Auth |
|---------------|---------|----------------|------|
| `POST /student/login` | `lib/auth.ts` (NextAuth Credentials) | `{ email, password, device_id, device_name? }` — `device_id` from `localStorage` (`lib/deviceId.ts`) | `app-key` only |
| `POST /student/logout` | `doCretendentialLogout` in `app/actions.ts` | — | `app-key` + Bearer |
| `POST /student/register` | `app/components/auth/RegisterForm.tsx` | `first_name`, `last_name`, `email`, `phone`, `password`, `confirm_password` | `app-key` only |
| `POST /student/forgot-password` | `app/components/auth/ForgotPasswordForm.tsx` | `{ email, reset_url }` — `reset_url` is storefront reset page without query | `app-key` only |
| `POST /student/reset-password` | `app/components/auth/ResetPasswordForm.tsx` | `{ email, token, password }` — `token`/`email` from email link query | `app-key` only |
| `POST /order/create` | `app/components/checkout/CheckoutBox.tsx` | `course_id`, `payment_method`, `transaction_id` (nullable per UI logic) | `app-key` + Bearer |

---

## TypeScript types (frontend)

Shared shapes live in **`types/index.d.ts`**, including:

- `CourseDetails`, `Category`, `Banner`, `Instructor`, `Student`
- `Enrollment`, `IPaymentMethod`

Use these as a **frontend contract**; the backend may return extra fields.

---

## Page → API quick map

| User-facing area | APIs involved |
|------------------|---------------|
| Home | `GET /banners`, `GET /course?showItems=...`, `GET /category` |
| Course listing (menu / category) | `GET /course/menu/{slug}` or `GET /course/category/{slug}`, often with `GET /category` |
| Course detail | `GET /course/{slug}` |
| Search (header/component) | `GET /course/search?search=...` |
| Teachers | `GET /instructor/all` |
| Login | `POST /student/login` |
| Register | `POST /student/register` |
| Forgot password | `POST /student/forgot-password` |
| Reset password | `POST /student/reset-password` (link lands on `/auth/reset-password?token=…&email=…`) |
| Checkout | `GET /payment-methods`, `POST /order/create` |
| Dashboard / profile | `GET /student/details`, `PUT /student/update`, `GET /enrolled/courses` |

---

## Single-device student sessions

Each student may have **one active device session** at a time. Login must include a stable `device_id` (stored in `localStorage` under `lurnic_device_id` via `lib/deviceId.ts`).

| Behaviour | Frontend handling |
|-----------|-------------------|
| Login on a new device | `POST /student/login` with new `device_id`; previous device gets `401` on next API call |
| `401` with `code: "SESSION_REPLACED"` | `lib/sessionReplaced.ts` — sign out, redirect to `/auth/login?reason=session_replaced`, toast |
| Explicit logout | `POST /student/logout` then NextAuth `signOut` (`doCretendentialLogout`) |
| Password reset success | All sessions invalidated; user must log in again with `device_id` |

Session checks: axios response interceptor (`lib/axiosInstance.ts`), `ifSessionReplaced` on client `fetch` calls, and `SessionGuard` (`app/components/SessionGuard.tsx`) on authenticated pages.

---

## Environment variables required

- `NEXT_PUBLIC_API_URL` — API base URL (must be reachable from the browser for client-side calls).
- `NEXT_PUBLIC_APP_KEY` — Sent as `app-key` on every integrated request above.

---

*Last aligned with frontend codebase structure; update when backend routes or response envelopes change.*
