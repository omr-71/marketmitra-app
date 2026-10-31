import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/.well-known/assetlinks.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify([
          {
            relation: [
              "delegate_permission/common.handle_all_urls",
              "delegate_permission/common.get_login_creds",
            ],
            target: {
              namespace: "android_app",
              package_name: "app.marketmitra.android",
              sha256_cert_fingerprints: [
                "09:AC:AF:BD:52:E5:C9:33:43:B8:59:A6:AF:F3:11:E4:39:1D:DA:DA:FE:DC:91:4F:97:B3:F5:C1:E9:55:17:A5",
              ],
            },
          },
        ]), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        }),
    },
  },
});
