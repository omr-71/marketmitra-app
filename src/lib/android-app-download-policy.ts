const MARKET_MITRA_ANDROID_REFERRER = "android-app://app.marketmitra.android";

export function shouldShowAndroidAppDownload({
  isMobileViewport,
  hasNativeBridge,
  referrer,
}: {
  isMobileViewport: boolean;
  hasNativeBridge: boolean;
  referrer: string;
}) {
  const launchedFromMarketMitraTwa =
    referrer === MARKET_MITRA_ANDROID_REFERRER ||
    referrer.startsWith(`${MARKET_MITRA_ANDROID_REFERRER}/`);

  return isMobileViewport && !hasNativeBridge && !launchedFromMarketMitraTwa;
}
