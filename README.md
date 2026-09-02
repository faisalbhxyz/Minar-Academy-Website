This is a [Next.js](https://nextjs.org) storefront for **Minar Academy**.

## Getting Started (Web)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mobile app (React Native / Expo)

Student Android/iOS app lives in [`mobile/`](./mobile) and uses the **same backend API**.

```bash
cd mobile
cp .env.example .env   # set EXPO_PUBLIC_API_URL + EXPO_PUBLIC_APP_KEY
npm install
npx expo start
```

টার্মিনালের QR স্ক্যান করুন (ফোনে Expo Go)। `--android` শুধু Android Studio/SDK থাকলে।

See [`mobile/README.md`](./mobile/README.md) for features and stack.
