# MarketMitra Android release

The native Android project for `app.marketmitra.android` is created and maintained with Google Bubblewrap. Keep signing credentials outside the repository.

## Prerequisites

- Node.js
- Java JDK compatible with Android Gradle
- Android SDK platform and build tools
- Bubblewrap CLI (`npx @bubblewrap/cli`)
- The production signing keystore

## Initialize

Use the checked-in template to create the native project. Replace only values that must be supplied by the signed release process:

```powershell
npx @bubblewrap/cli init --manifest=android/twa-manifest.template.json
```

Generate the TWA project outside the repository first if Bubblewrap prompts for output location, then configure the checked-in release scripts around that project.

## Signing

Never add the keystore, passwords, or aliases to Git. Supply these values through environment variables or a protected local properties file ignored by Git:

```text
MARKETMITRA_ANDROID_KEYSTORE=C:\secure\path\marketmitra-release.jks
MARKETMITRA_ANDROID_KEY_ALIAS=<alias>
MARKETMITRA_ANDROID_KEYSTORE_PASSWORD=<password>
MARKETMITRA_ANDROID_KEY_PASSWORD=<password>
```

Only use the production signing identity for production APKs. Before the first signed release, retrieve its certificate SHA-256 fingerprint with `keytool` and add it to `public/.well-known/assetlinks.json`.

## Release sequence

1. Increment `appVersionName` and `appVersionCode`.
2. Build the signed release APK.
3. Verify its package and signer with `apksigner verify --print-certs`.
4. Install the APK on a physical Android device and run the production site.
5. Copy the verified APK to `public/downloads/marketmitra-android.apk`.
6. Update `public/android-release.json` with the real, verified version and byte size.
7. Verify the download URL and asset-links endpoint before deployment.
