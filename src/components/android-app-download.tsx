import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";

import { useAndroidRelease } from "@/lib/android-release";

export function AndroidAppDownload({
  compact = false,
}: {
  compact?: boolean;
}) {
  const release = useAndroidRelease();
  const [mobile, setMobile] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (!mobile || !release?.available) return null;

  return (
    <section
      aria-label="Download the official MarketMitra Android app"
      className={compact ? "block" : "block md:hidden"}
    >
      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.09] via-card to-primary/[0.03] shadow-sm">
        <div className="flex items-start gap-3 p-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Smartphone className="size-6" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Official Android app
            </p>
            <h2 className="mt-1 font-display text-base font-black text-foreground">
              Get the MarketMitra App
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Android app · Version {release.versionName}
            </p>
          </div>
        </div>
        <div className="border-t border-primary/10 px-4 py-3">
          <a
            href={release.download}
            download="marketmitra-android.apk"
            onClick={() => setStarted(true)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground press"
          >
            <Download className="size-4" aria-hidden="true" />
            {started ? "Download started" : "Download APK"}
          </a>
          {release.fileSize && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              APK · {release.fileSize}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
