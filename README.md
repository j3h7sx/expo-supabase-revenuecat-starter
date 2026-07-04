# Expo Supabase RevenueCat Starter

An opinionated iOS-first Expo starter for a small paid mobile app.

It includes:

- Expo Router + TypeScript
- Supabase auth, profiles, onboarding state, RLS
- Apple, Google, and email/password auth
- MMKV-backed local persistence
- Data-driven onboarding examples
- Superwall paywall placements
- RevenueCat purchase/restore handling
- Supabase webhook sync for server-authoritative subscription access
- EAS build profiles for iOS

## Architecture

The monetization stack is deliberately split:

- Superwall presents paywalls and controls placements.
- RevenueCat owns StoreKit purchases, restores, offerings, and entitlements.
- Supabase stores the server-authoritative access cache on `profiles`.
- The app unlocks from `profiles.has_active_entitlement`, not from local purchase state alone.

## First Setup

```bash
bun install
cp .env.example .env
```

Fill `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.your-reversed-ios-client-id
EXPO_PUBLIC_SUPERWALL_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=pro
```

Then run:

```bash
bun run ios
```

## Expo Go vs Development Builds

This starter does not run in Expo Go as-is.

It includes native SDKs that are not bundled with Expo Go:

- `@react-native-google-signin/google-signin`
- `react-native-purchases` for RevenueCat
- `expo-superwall`
- `react-native-mmkv`

Use a custom development build instead. This still works for someone on Windows with an iPhone; they do not need a local iOS simulator or a Mac.

Recommended flow:

```bash
eas build --profile development --platform ios
```

Install that development build on the iPhone. After it is installed, run Metro from the laptop:

```bash
bun run start
```

Then open the project from the development build, not Expo Go. JavaScript changes will load from Metro into the installed dev build.

## Auth

The starter includes three sign-in options:

- Email/password through Supabase
- Apple Sign-In through Supabase
- Google Sign-In through Supabase

### Google Sign-In Setup

Create Google OAuth client IDs in Google Cloud:

- iOS OAuth client ID for the app bundle ID in `app.json`
- Web OAuth client ID for server-side token verification

Fill these values in `.env`:

```bash
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME=com.googleusercontent.apps.your-reversed-ios-client-id
```

The iOS URL scheme is the reversed iOS client ID. For example:

```text
Client ID: 1234567890-abc.apps.googleusercontent.com
URL scheme: com.googleusercontent.apps.1234567890-abc
```

Enable Google as an auth provider in Supabase and paste the Google client credentials there too. The app calls `supabase.auth.signInWithIdToken({ provider: "google", token })` after Google returns an ID token.

After changing `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`, rebuild the development build:

```bash
eas build --profile development --platform ios
```

## Supabase

Apply the migrations in `supabase/migrations` to create:

- `profiles`
- `onboarding_responses`
- auth user profile trigger
- RLS policies
- billing-field protection

Deploy the functions:

```bash
supabase functions deploy revenuecat-webhook
supabase functions deploy delete-account
supabase secrets set REVENUECAT_WEBHOOK_SECRET=your-secret
```

In RevenueCat, configure the webhook URL to your deployed `revenuecat-webhook` function and send:

```http
Authorization: Bearer your-secret
```

The starter assumes `RevenueCat app_user_id === Supabase auth user id`. That is handled by `Purchases.logIn(user.id)` after Supabase auth.

## Superwall

Create these placements in Superwall:

- `onboarding_paywall`
- `locked_feature`

The names can be changed in `.env`.

Configure Superwall products so their product IDs match RevenueCat/App Store product IDs. When Superwall asks for a product purchase, the starter looks up that product in RevenueCat offerings and calls `Purchases.purchaseStoreProduct(...)`.

## Onboarding

Edit `src/onboarding/steps.ts`.

The starter includes:

- intro screen
- single-choice screen
- multi-choice screen
- paywall checkpoint
- completion screen

Choice answers persist locally with Zustand/MMKV and sync to `onboarding_responses`.

## Important Files

- `app/_layout.tsx` - root providers and navigation
- `app/(auth)/sign-in.tsx` - Apple + Google + email auth
- `app/(onboarding)/[step].tsx` - generic onboarding renderer
- `app/(app)/index.tsx` - example locked app screen
- `src/providers/revenuecat-superwall-provider.tsx` - purchase bridge
- `src/presentation/contexts/app-access-context.tsx` - access state
- `supabase/functions/revenuecat-webhook/index.ts` - RevenueCat to Supabase sync

## iOS-First Notes

This starter is intentionally iOS-first. Android support can be added later by adding Android package IDs, Google Android OAuth credentials, RevenueCat Android keys, and Superwall Android keys.
