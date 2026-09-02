# Firebase FCM Push Notifications — Setup Guide

Minar Academy mobile app uses **Firebase Cloud Messaging (FCM)** with:

- `@react-native-firebase/messaging` — FCM token + delivery
- `expo-notifications` — permission, Android channel, foreground display

> **Expo Go-তে push কাজ করবে না।** EAS dev build বা production APK/IPA লাগবে।

---

## তোমাকে যা দিতে হবে (Checklist)

### 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com/) → **Create project** (বা existing project)
2. Project name suggestion: `minar-academy`

### 2. Android app (Firebase-এ add করো)

| Field | Value |
|-------|-------|
| Package name | `com.minaracademy.app` |
| App nickname | Minar Academy Android |

Download **`google-services.json`** → রাখো:

```
mobile/google-services.json
```

### 3. iOS app (Firebase-এ add করো)

| Field | Value |
|-------|-------|
| Bundle ID | `com.minaracademy.app` |
| App nickname | Minar Academy iOS |

Download **`GoogleService-Info.plist`** → রাখো:

```
mobile/GoogleService-Info.plist
```

### 4. Apple APNs key (iOS push-এর জন্য — বাধ্যতামূলক)

1. [Apple Developer](https://developer.apple.com/account/resources/authkeys/list) → **Keys** → `+`
2. Name: `Minar Academy APNs`
3. Enable **Apple Push Notifications service (APNs)**
4. Download `.p8` file (একবারই download হয় — সেভ করে রাখো)
5. Note করো:
   - **Key ID** (যেমন `AB12CD34EF`)
   - **Team ID** (Apple Developer account-এ)

6. Firebase Console → Project Settings → **Cloud Messaging** → iOS app → **Upload APNs Authentication Key**
   - `.p8` file upload
   - Key ID + Team ID দাও

### 5. Firebase Service Account (Backend-এর জন্য — বাধ্যতামূলক)

Backend থেকে push পাঠাতে:

1. Firebase Console → Project Settings → **Service accounts**
2. **Generate new private key** → JSON download
3. API server-এ env হিসেবে রাখো (git-এ commit করবে না):

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
# অথবা file path:
FIREBASE_SERVICE_ACCOUNT_PATH=/secrets/firebase-service-account.json
```

### 6. নতুন EAS build (বাধ্যতামূলক)

Config file যোগ করার পর **নতুন native build** করতে হবে:

```bash
cd mobile
npm run build:apk
# iOS: npx eas-cli build -p ios --profile production
```

OTA update দিয়ে push setup হবে না — native module লাগে।

---

## Backend API (তোমার Go API-তে implement করতে হবে)

Mobile app ইতিমধ্যে এই endpoint call করে:

### `POST /student/push-token` (Bearer)

Register বা update FCM token.

```json
{
  "token": "fcm_registration_token_here",
  "platform": "android",
  "device_id": "uuid-from-app"
}
```

`platform`: `"android"` | `"ios"`

**Suggested table:** `student_push_tokens`

| Column | Type |
|--------|------|
| id | bigint PK |
| student_id | bigint FK, indexed |
| device_id | varchar(64), indexed |
| token | varchar(512), indexed |
| platform | enum(android, ios) |
| created_at | timestamp |
| updated_at | timestamp |

Unique: `(student_id, device_id)` — এক device-এ এক row।

### `DELETE /student/push-token` (Bearer)

Logout-এ token remove।

```json
{
  "device_id": "uuid-from-app",
  "token": "optional-fcm-token"
}
```

### Push পাঠানো (notification create-এর সময়)

`student_notifications` insert-এর পর FCM পাঠাও:

```json
{
  "notification": {
    "title": "নতুন অ্যাসাইনমেন্ট",
    "body": "গণিত অ্যাসাইনমেন্ট জমা দিন"
  },
  "data": {
    "notification_id": "42",
    "link": "/assignments/12",
    "course_slug": "hsc-math",
    "assignment_id": "12",
    "screen": "assignments"
  },
  "token": "student_fcm_token"
}
```

**Go example (Firebase Admin SDK):**

```go
import "firebase.google.com/go/v4/messaging"

msg := &messaging.Message{
    Token: fcmToken,
    Notification: &messaging.Notification{
        Title: title,
        Body:  body,
    },
    Data: map[string]string{
        "notification_id": strconv.Itoa(id),
        "link":            link,
    },
    Android: &messaging.AndroidConfig{Priority: "high"},
    APNS: &messaging.APNSConfig{
        Payload: &messaging.APNSPayload{
            Aps: &messaging.Aps{Sound: "default"},
        },
    },
}
_, err := fcmClient.Send(ctx, msg)
```

**Invalid token cleanup:** `messaging.IsRegistrationTokenNotRegistered(err)` হলে DB থেকে token delete করো।

---

## Mobile app flow (already implemented)

| Event | Action |
|-------|--------|
| Login | FCM token → `POST /student/push-token` |
| App bootstrap (logged in) | Token refresh check |
| Token refresh | Re-register |
| Logout | `DELETE /student/push-token` |
| Foreground message | Local notification show |
| Tap notification | Deep link → screen navigate |

### Supported `data` payload keys

| Key | Example | Opens |
|-----|---------|-------|
| `screen` | `notifications` | Notifications |
| `screen` | `assignments` | Assignments |
| `screen` | `orders` | Orders |
| `screen` | `course` + `course_slug` | Course detail |
| `link` | `/course/hsc-math` | Course detail |
| `link` | `/assignments/12` | Assignment detail (with `course_slug`) |

---

## Test করার ধাপ

1. `google-services.json` + `GoogleService-Info.plist` যোগ করো
2. EAS build করো → real device-এ install
3. Login করো
4. Backend log-এ token register confirm করো
5. Firebase Console → **Messaging** → **Send test message** → FCM token paste → Send
6. App foreground + background দুটোতেই test করো

---

## Troubleshooting

| সমস্যা | সমাধান |
|--------|--------|
| Expo Go-তে কাজ করে না | EAS build ব্যবহার করো |
| Android-এ permission নেই | Settings → Notifications allow |
| iOS-এ push আসে না | APNs key Firebase-এ upload হয়েছে কিনা check |
| Build fail: google-services missing | `mobile/google-services.json` আছে কিনা |
| Token register 404 | Backend `POST /student/push-token` implement করো |
| Foreground-এ দেখায় না | `expo-notifications` channel + handler আছে (implemented) |

---

## Files in this repo

| File | Purpose |
|------|---------|
| `mobile/src/lib/pushNotifications.ts` | Permission, token, register |
| `mobile/src/components/PushNotificationManager.tsx` | Listeners |
| `mobile/src/navigation/notificationRouting.ts` | Tap → screen |
| `mobile/google-services.json.example` | Android config template |
| `mobile/GoogleService-Info.plist.example` | iOS config template |

**Never commit:** `google-services.json`, `GoogleService-Info.plist`, `firebase-service-account.json`
