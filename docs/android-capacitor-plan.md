# Coral DB Lite Android / Capacitor Plan

## Goal

Coral DB Lite will remain one product across the web and Android, with an
Android shell built with Capacitor. The Android app must preserve the existing
Next.js and Supabase web release while gradually adding camera, local
notifications, durable device storage, offline work, and Play Store delivery.

Capacitor 8 is already installed with `@capacitor/core`,
`@capacitor/cli`, and `@capacitor/android`. The native project lives in
`android/`, and `capacitor.config.json` is the source configuration.

Official references:

- [Capacitor documentation](https://capacitorjs.com/docs/)
- [Android platform guide](https://capacitorjs.com/docs/android)
- [Development workflow](https://capacitorjs.com/docs/basics/workflow)
- [Camera plugin](https://capacitorjs.com/docs/apis/camera)
- [Filesystem plugin](https://capacitorjs.com/docs/apis/filesystem)
- [Local Notifications plugin](https://capacitorjs.com/docs/apis/local-notifications)
- [Network plugin](https://capacitorjs.com/docs/apis/network)

## Next.js strategy

The current Next.js app includes server-rendered routes and Supabase-backed
flows, so it cannot be treated as a simple static export without redesign.

The present review build loads the deployed HTTPS site inside the Capacitor
shell. This keeps the web release stable and provides an installable Android
MVP. It is not the final offline architecture.

Migration path:

1. Keep shared UI and domain logic framework-independent.
2. Move Lite reads and writes behind a small repository interface.
3. Make the Lite routes client-capable and remove avoidable server-only
   dependencies.
4. Bundle a local Lite application shell in `webDir`.
5. Use Supabase only as a synchronization target when connectivity and login
   are available.
6. Keep Pro and public coral pages online-first until separately migrated.

After every web change:

```bash
npm test
npm run build -- --webpack
npm run android:sync
npm run android:build
```

## Android setup and release path

1. Open `android/` in Android Studio.
2. Use the bundled JDK and installed Android SDK.
3. Test on API 24 and a current API emulator/device.
4. Replace generated app icons and splash assets with Coral DB artwork.
5. Configure Android App Links for Supabase sign-in callbacks.
6. Create a release signing key outside the repository.
7. Build an Android App Bundle for Play Console internal testing.
8. Complete privacy, data safety, camera, notification, and account-deletion
   disclosures before production.

## Device storage

IndexedDB is the primary structured store for Lite:

- Tank profile
- Sparse water measurements
- Water changes
- Additive usage
- Photo metadata
- Pending synchronization operations
- Last synchronized server versions

`localStorage` is limited to small preferences such as selected tank, dismissed
guidance, language, and migration flags. Aquarium records must not depend on
`localStorage` as their only durable copy.

Each local record receives:

- A client-generated UUID
- `created_at` and `updated_at`
- A local revision
- Synchronization state: local only, pending, synchronized, or conflict
- Optional Supabase row ID and server revision

Writes go to IndexedDB first. The screen confirms success only after the local
transaction completes. Network synchronization happens afterward and must not
block daily logging.

## Login and conflict handling

Login never silently overwrites device or cloud data.

When both sides contain data, show three explicit choices:

1. **この端末のデータを使う**
   Keep the device set as the working copy. Conflicting cloud records remain
   recoverable until the user confirms upload.
2. **クラウドのデータを使う**
   Download the cloud set after creating a device backup.
3. **クラウドへコピーする**
   Upload non-conflicting device records. Present individual conflicts for
   review instead of overwriting them.

Before any replacement, create an exportable local backup. Deletes are
tombstones until synchronization succeeds.

## Photo strategy

For the web, continue accepting a file input. On Android, use the Capacitor
Camera plugin to take or choose a picture and the Filesystem plugin to keep the
original in app storage.

Flow:

1. Capture or select the image.
2. Keep the original locally.
3. Create a smaller display thumbnail.
4. Store metadata in IndexedDB: tank, date, note, local path, checksum, and
   upload state.
5. Upload to a private Supabase Storage bucket after login and connectivity.
6. Save signed/storage paths in Supabase, never a large base64 image in a
   database column for the production design.

The shop card uses the local image immediately and the cloud image after sync.

## Notification strategy

Use Local Notifications for user-selected measurement reminders. Do not send
marketing or automatic dosing prompts.

- Permission is requested only after the user enables a reminder.
- Suggested schedules remain optional.
- Notification text says what may be measured, not that the user failed.
- Tapping opens the relevant one-task input screen.

Push notifications are a later phase for account or shop interactions. They
require a separate consent and server delivery design.

## Offline and synchronization

Use the Network plugin only as a connectivity signal; never treat it as proof
that a request will succeed.

The synchronization worker:

1. Reads pending operations from IndexedDB.
2. Sends idempotent upserts using client UUIDs.
3. Records successful server revisions.
4. Retries temporary failures with backoff.
5. Stops on authentication or validation errors and explains the next action.
6. Presents conflicts instead of applying last-write-wins automatically.

The shop card must remain readable from device data while offline.

## Android UI rules

- Large text and controls
- At least 48dp touch targets
- No horizontal scrolling
- One primary task per screen
- No hidden gestures
- No nested navigation menus
- Plain Japanese labels
- The shop card remains the highest-priority review screen

The Android app is ready for wider testing only when water quality, water
changes, additives, photos, and the shop card work offline and survive app
restart before login.
