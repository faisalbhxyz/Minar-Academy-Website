# Minar Academy — React Native (Expo)

ওয়েবের **একই API** (`https://api.minaracademy.com/v1`) দিয়ে স্টুডেন্ট অ্যাপ।

## চালানো (এই ভার্সন)

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

টার্মিনালে QR আসবে। ফোনে [Expo Go](https://expo.dev/go) খুলে স্ক্যান করুন। একই Wi‑Fi না থাকলে:

```bash
npm run start:tunnel
```

## Features

- Login / Register / Forgot & reset password
- Home, courses, search, checkout
- Lesson player: resume, auto-complete, next/prev
- Continue last lesson (home + my learning)
- Lesson PDF/notes
- Offline save (uploaded video or Drive file) — student UI just says সেভ/অফলাইন
- Assignments, quizzes, academic notes, teachers, about
- Profile + certificates
