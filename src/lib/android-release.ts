import { useEffect, useState } from "react";

export type AndroidRelease = {
  available: boolean;
  versionName: string;
  versionCode: number;
  packageId: string;
  fileSize?: string;
  download: string;
};

export function useAndroidRelease() {
  const [release, setRelease] = useState<AndroidRelease | null>(null);

  useEffect(() => {
    let active = true;

    void fetch("/android-release.json", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        const value: unknown = await response.json();
        if (!value || typeof value !== "object") return null;

        const candidate = value as Partial<AndroidRelease>;
        if (
          candidate.available !== true ||
          typeof candidate.versionName !== "string" ||
          typeof candidate.versionCode !== "number" ||
          typeof candidate.download !== "string"
        ) {
          return null;
        }
        return candidate as AndroidRelease;
      })
      .then((value) => {
        if (active) setRelease(value);
      })
      .catch(() => {
        if (active) setRelease(null);
      });

    return () => {
      active = false;
    };
  }, []);

  return release;
}
