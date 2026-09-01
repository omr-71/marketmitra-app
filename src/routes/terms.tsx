import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";

const TITLE = "Terms & Conditions — Market Mitra";
const DESC =
  "Terms of use for Market Mitra: how mandi price data, weather guidance, crop diagnosis and Mitra Link coordination may be used by farmers.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections: { heading: string; body: string[] }[] = [
  {
    heading: "1. About this service",
    body: [
      "Market Mitra is an agriculture information and coordination platform for Indian farmers, built and operated by Om Labhade. By creating an account or using any screen of the platform you accept these terms.",
    ],
  },
  {
    heading: "2. Market price information",
    body: [
      "Mandi prices shown in the app are sourced from official APMC market reporting. Every price carries the market name, the reporting date and a freshness badge in Indian Standard Time.",
      "Prices are reported figures, not offers. Actual rates at the gate depend on grade, moisture, arrivals and negotiation. Market Mitra does not guarantee that any price will be available to you.",
    ],
  },
  {
    heading: "3. Weather and farming guidance",
    body: [
      "Weather data and spray, harvest or irrigation guidance are advisory only. Conditions change quickly. Always confirm with local observation before acting on any recommendation.",
    ],
  },
  {
    heading: "4. Crop diagnosis and Mitra AI",
    body: [
      "Crop disease identification and Mitra AI answers are automated assistance, not a substitute for a qualified agronomist or your local Krishi Vigyan Kendra.",
      "Market Mitra never recommends unlabelled, banned or unsafe chemical use. Always follow the product label, approved dose and pre-harvest interval, and wear protective equipment.",
    ],
  },
  {
    heading: "5. Mitra Link coordination",
    body: [
      "Mitra Link only introduces farmers to each other for machines and farm resources. Rental terms, payment, condition of equipment and safety remain entirely between the two farmers.",
      "You must list only resources you genuinely own or control, describe them honestly, and keep your mobile number verified. Listing chemicals, pesticides, restricted substances or anything unsafe is not allowed and such listings are removed.",
      "Contact details are revealed only after a match is accepted. Misuse of another farmer's contact details will result in removal from the platform.",
    ],
  },
  {
    heading: "6. Your account",
    body: [
      "You are responsible for the accuracy of your profile, your location and the security of your login. Do not share your account with others. Report suspicious activity to us immediately.",
    ],
  },
  {
    heading: "7. Acceptable use",
    body: [
      "Do not scrape, resell or republish platform data, attempt to break access controls, upload unlawful content, or impersonate another person, organisation or government body.",
    ],
  },
  {
    heading: "8. Liability",
    body: [
      "Market Mitra is provided on an as-is basis. To the maximum extent permitted by law, we are not liable for crop loss, price loss, transport cost, equipment damage or any indirect loss arising from decisions taken using the platform.",
    ],
  },
  {
    heading: "9. Changes and contact",
    body: [
      "These terms may be updated as the platform grows; continued use means you accept the updated terms. For any question, correction or grievance, write to hello.marketmitra@gmail.com.",
    ],
  },
];

function TermsPage() {
  return (
    <Screen>
      <TopBar title="Terms & Conditions" subtitle="Last updated 1 September 2026" back="/settings" />

      <div className="px-5 pt-5 lg:px-0 lg:pt-8">
        <div className="glass rounded-3xl p-5 lg:p-8">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Plain-language terms for using Market Mitra. We keep data traceable, guidance honest and
            farmer-to-farmer coordination safe.
          </p>
        </div>

        <div className="mt-4 space-y-3 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {sections.map((s) => (
            <section
              key={s.heading}
              className="rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl lg:p-6"
            >
              <h2 className="font-display text-base font-bold lg:text-lg">{s.heading}</h2>
              <div className="mt-2 space-y-2">
                {s.body.map((p) => (
                  <p key={p} className="text-sm leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-muted-foreground">
          Questions?{" "}
          <Link to="/about" className="text-primary hover:underline">
            Read about Market Mitra
          </Link>
        </p>
      </div>
    </Screen>
  );
}
