import { createFileRoute } from "@tanstack/react-router";
import { Screen, TopBar } from "@/components/app-shell";
import { schemes } from "@/lib/schemes";
import { track } from "@/lib/analytics";
import { useLang } from "@/lib/i18n";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Landmark,
  ListChecks,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/schemes/$schemeId")({
  component: SchemeDetailsPage,
});

function SchemeDetailsPage() {
  const { t } = useLang();
  const { schemeId } = Route.useParams();
  const scheme = schemes.find((item) => item.id === schemeId);

  if (!scheme) {
    return (
      <Screen>
        <TopBar title="Scheme details" back="/schemes" />
        <div className="card-surface mt-6 p-6 text-center text-sm text-muted-foreground">
          {t("schemeNotFound")}
        </div>
      </Screen>
    );
  }

  const applyOnOfficialPortal = () => track("scheme_portal_clicked", { label: scheme.name });

  return (
    <Screen>
      <TopBar title={scheme.name} back="/schemes" settings={false} />
      <main className="pb-10">
        <header className="overflow-hidden rounded-b-[28px] border-b border-border bg-card px-5 py-6 lg:mt-6 lg:rounded-[28px] lg:border lg:px-8 lg:py-8">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Landmark className="size-7" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {scheme.level === "State" ? t("stateSchemes") : t("centralSchemes")}
                </span>
                {scheme.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                    <BadgeCheck className="size-3.5" /> Official information
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight lg:text-4xl">
                {scheme.name}
              </h1>
              <p className="mt-2 text-xs text-muted-foreground">{scheme.dept}</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/8 p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gold-foreground">
              {t("mainBenefit")}
            </p>
            <p className="mt-1 text-base font-bold leading-6 text-foreground">{scheme.benefit}</p>
          </div>
          {scheme.url && (
            <a
              href={scheme.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={applyOnOfficialPortal}
              className="press mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground lg:w-fit lg:px-6"
            >
              {t("visitOfficialPortal")} <ExternalLink className="size-4" />
            </a>
          )}
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <section className="card-surface p-5 lg:p-6">
              <h2 className="text-lg font-extrabold">{t("aboutScheme")}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {scheme.overview ??
                  `${scheme.name} is an agriculture programme administered through official government channels. Review the published implementing guidelines before preparing an application.`}
              </p>
            </section>

            <section className="card-surface p-5 lg:p-6">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h2 className="text-lg font-extrabold">{t("benefits")}</h2>
              </div>
              <div className="mt-4 rounded-2xl bg-primary/6 p-4">
                <p className="text-sm font-bold leading-6">{scheme.benefit}</p>
              </div>
            </section>

            <section className="card-surface p-5 lg:p-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <h2 className="text-lg font-extrabold">{t("eligibility")}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {scheme.criteria.map((criterion) => (
                  <li
                    key={criterion}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
                    {criterion}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
                Final eligibility and benefit amount are decided under the latest official
                guidelines. This information is not an approval guarantee.
              </p>
            </section>

            <section className="card-surface p-5 lg:p-6">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <h2 className="text-lg font-extrabold">{t("documentsReady")}</h2>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {(
                  scheme.documents ?? [
                    "Aadhaar card",
                    "Relevant land or registration records",
                    "Bank account details",
                    "Any documents requested in the current official application",
                  ]
                ).map((document) => (
                  <div
                    key={document}
                    className="flex items-center gap-2 rounded-xl border border-border p-3 text-xs font-semibold leading-5"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    {document}
                  </div>
                ))}
              </div>
            </section>

            <section className="card-surface p-5 lg:p-6">
              <div className="flex items-center gap-2">
                <ListChecks className="size-5 text-primary" />
                <h2 className="text-lg font-extrabold">{t("howToApply")}</h2>
              </div>
              <ol className="mt-4 space-y-4">
                {(
                  scheme.applicationSteps ?? [
                    "Open the official programme website listed below.",
                    "Check the current beneficiary or application notice and required eligibility.",
                    "Prepare the relevant farmer, land and bank documents.",
                    "Complete the official application or visit an authorized agriculture office or Common Service Centre.",
                    "Keep the acknowledgement and use the official portal to track the application when tracking is available.",
                  ]
                ).map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <section className="card-surface p-5">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                <h2 className="text-sm font-extrabold">{t("whereToApply")}</h2>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Use the official portal for online applications. The relevant Agriculture department
                office, bank, CSC or state portal may be listed in the current programme notice.
              </p>
            </section>
            <section className="card-surface p-5">
              <h2 className="text-sm font-extrabold">{t("officialResources")}</h2>
              {scheme.url && (
                <a
                  href={scheme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={applyOnOfficialPortal}
                  className="mt-3 flex items-center justify-between rounded-xl border border-border p-3 text-xs font-bold text-primary"
                >
                  {t("officialWebsite")} <ExternalLink className="size-3.5" />
                </a>
              )}
              {(scheme.sourceName || scheme.lastVerified) && (
                <div className="mt-3 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                  {scheme.sourceName && (
                    <p>
                      {t("source")}: {scheme.sourceName}
                    </p>
                  )}
                  {scheme.lastVerified && (
                    <p>
                      {t("lastVerified")}: {scheme.lastVerified}
                    </p>
                  )}
                  {scheme.verificationNote && <p className="mt-1">{scheme.verificationNote}</p>}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </Screen>
  );
}
