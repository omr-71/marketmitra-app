import { existsSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

const keystore = process.env.MARKETMITRA_ANDROID_KEYSTORE;
const keyAlias = process.env.MARKETMITRA_ANDROID_KEY_ALIAS;

if (!keystore || !keyAlias || !existsSync(resolve(keystore))) {
  console.error(
    "Set MARKETMITRA_ANDROID_KEYSTORE to an existing keystore outside this repository and MARKETMITRA_ANDROID_KEY_ALIAS to its key alias.",
  );
  process.exit(1);
}

console.error(
  "Android native sources have not been generated yet. Initialize Bubblewrap with android/twa-manifest.template.json, then use this script as the release wrapper.",
);
process.exit(2);
