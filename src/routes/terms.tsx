import { createFileRoute, Link } from "@tanstack/react-router";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleDot,
  FileText,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  MousePointer2,
  Radar,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Waves,
} from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { Screen, TopBar } from "@/components/app-shell";

const TITLE = "Terms & Conditions — Market Mitra";
const DESC =
  "Terms of use for Market Mitra: market information, weather guidance, crop assistance and farmer-to-farmer resource coordination.";

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

const sections = [
  {
    number: "01",
    label: "FOUNDATION",
    heading: "About this service",
    icon: Sparkles,
    accent: "blue",
    body: [
      "Market Mitra is an agriculture information and coordination platform for Indian farmers, built and operated by Om Labhade. By creating an account or using the platform, you agree to use the service responsibly and according to these terms.",
      "Market Mitra is designed to bring market information, agricultural guidance and farmer-to-farmer resource coordination into one place. It is an information product and coordination layer, not a guarantee of a particular agricultural or financial outcome.",
    ],
  },
  {
    number: "02",
    label: "MARKET INTELLIGENCE",
    heading: "Market price information",
    icon: FileText,
    accent: "green",
    body: [
      "Market Mitra may use public market-price datasets and market reporting sources such as AGMARKNET or government-published data where applicable. The source, reporting date and freshness status displayed with a figure are the relevant context for that information.",
      "A displayed price is a reported market figure, not an offer or guaranteed selling price. Actual rates can vary because of crop quality, variety, grade, moisture, arrivals, demand, local conditions, commissions and negotiation.",
      "Market Mitra does not promise that a displayed price will be available when you reach a market or that using the information will result in a particular income.",
    ],
  },
  {
    number: "03",
    label: "FIELD CONDITIONS",
    heading: "Weather and farming guidance",
    icon: Waves,
    accent: "cyan",
    body: [
      "Weather information is provided to help with planning. Weather conditions can change quickly and local conditions may differ from a forecast.",
      "Irrigation, spraying, harvesting and other farming guidance is advisory. Before taking an important farming decision, consider field conditions, crop stage, local observation and advice from an appropriately qualified agricultural professional.",
    ],
  },
  {
    number: "04",
    label: "CROP INTELLIGENCE",
    heading: "Crop diagnosis and Mitra AI",
    icon: ScanLine,
    accent: "purple",
    body: [
      "Crop diagnosis and Mitra AI provide automated assistance based on the information supplied to the platform. Results may be incomplete or incorrect and should not be treated as a confirmed agricultural diagnosis.",
      "Mitra AI means Agriculture Intelligence within Market Mitra. It is intended to help users understand agricultural information, not replace a qualified agronomist, agricultural officer or local expert.",
      "Never use an automated suggestion as permission to ignore a product label, legally required instruction or professional agricultural advice. Always follow the approved label, dose, safety instructions and applicable waiting period for agricultural products.",
    ],
  },
  {
    number: "05",
    label: "FARMER NETWORK",
    heading: "Mitra Link coordination",
    icon: Globe2,
    accent: "green",
    body: [
      "Mitra Link is designed to connect farmers for machines and other farm resources. It is a coordination feature and does not itself create a rental contract, guarantee a transaction or guarantee the condition or availability of equipment.",
      "The farmers involved are responsible for agreeing on rental terms, timing, payment, equipment condition, operation and safety. Market Mitra is not a party to those private arrangements.",
      "Users must list resources they genuinely own or are authorised to offer, provide accurate information and keep their contact information truthful. Unsafe, restricted or prohibited listings may be removed.",
      "Contact information should only be used for the legitimate purpose for which it was shared. Harassment, spam, impersonation or misuse of another user's information is not permitted.",
    ],
  },
  {
    number: "06",
    label: "IDENTITY",
    heading: "Your account",
    icon: Fingerprint,
    accent: "blue",
    body: [
      "You are responsible for keeping your account information accurate and for protecting your login credentials. Do not knowingly allow another person to use your account in a way that misrepresents who is using the service.",
      "If you notice suspicious account activity, incorrect profile information or unauthorised use, contact Market Mitra so the issue can be reviewed.",
      "Location and device permissions are used only where a feature needs them. You can control permissions through your device or browser settings, although some location-dependent features may not work without the required permission.",
    ],
  },
  {
    number: "07",
    label: "PLATFORM RULES",
    heading: "Acceptable use",
    icon: ShieldCheck,
    accent: "cyan",
    body: [
      "Use Market Mitra only for legitimate agricultural information and coordination. Do not attempt to break access controls, interfere with the service, introduce malicious code or deliberately overload the platform.",
      "Do not scrape, resell or republish platform information in a way that violates applicable rights or restrictions. Do not impersonate another person, organisation, government body or Market Mitra representative.",
      "Do not upload unlawful, fraudulent, abusive or unsafe content. Listings and accounts may be restricted or removed when they violate these rules or create a meaningful risk to other users.",
    ],
  },
  {
    number: "08",
    label: "LIMITATIONS",
    heading: "Service availability and liability",
    icon: Layers3,
    accent: "purple",
    body: [
      "Market Mitra depends on external information, connectivity, device permissions and other technical systems. Information may occasionally be delayed, unavailable, incomplete or temporarily incorrect.",
      "The service is provided on an as-is and as-available basis. To the maximum extent permitted by applicable law, Market Mitra is not responsible for losses arising from reliance on reported prices, forecasts, automated guidance, farmer-to-farmer arrangements, equipment use or service interruptions.",
      "Users remain responsible for making decisions appropriate to their own circumstances and for independently verifying information when the decision involves significant financial, agricultural or safety consequences.",
    ],
  },
  {
    number: "09",
    label: "KEEPING IT CURRENT",
    heading: "Changes, ownership and contact",
    icon: ArrowUpRight,
    accent: "green",
    body: [
      "Market Mitra may evolve as new features, datasets and agricultural workflows are introduced. These terms may therefore be updated to reflect changes in the product.",
      "Market Mitra, its branding, interface, original visual design, software and original content remain protected by applicable intellectual-property laws. You may use the service as intended, but you may not present the product or its original materials as your own.",
      "For questions, corrections or grievances relating to the product or these terms, contact hello.marketmitra@gmail.com. If these terms are materially changed, the updated version and effective date should be published on this page.",
    ],
  },
];

function TermsPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const smoothY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
    mass: 0.5,
  });

  const orbX = useTransform(smoothX, [-600, 600], [-45, 45]);
  const orbY = useTransform(smoothY, [-600, 600], [-30, 30]);

  const [activeSection, setActiveSection] = useState("01");

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      mouseX.set(event.clientX - window.innerWidth / 2);
      mouseY.set(event.clientY - window.innerHeight / 2);
    };

    window.addEventListener("pointermove", handlePointer);

    return () => {
      window.removeEventListener("pointermove", handlePointer);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section) => {
      const element = document.getElementById(`terms-${section.number}`);

      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setActiveSection(section.number);
          }
        },
        {
          threshold: 0.2,
          rootMargin: "-18% 0px -58% 0px",
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <Screen>
      <div className="mm-terms-experience">
        <TopBar
          title="Terms & Conditions"
          subtitle="Last updated 23 September 2026"
          back="/settings"
        />

        {/* IMMERSIVE BACKGROUND */}
        <div className="mm-terms-universe" aria-hidden="true">
          <div className="mm-terms-universe-gradient" />
          <div className="mm-terms-universe-grid" />
          <div className="mm-terms-universe-noise" />

          <motion.div
            className="mm-terms-cursor-light"
            style={{
              x: orbX,
              y: orbY,
            }}
          />

          <div className="mm-terms-horizon" />
          <div className="mm-terms-beam beam-one" />
          <div className="mm-terms-beam beam-two" />
          <div className="mm-terms-beam beam-three" />

          <div className="mm-terms-orbit orbit-a">
            <span />
          </div>

          <div className="mm-terms-orbit orbit-b">
            <span />
          </div>

          <div className="mm-terms-orbit orbit-c">
            <span />
          </div>

          <div className="mm-terms-field">
            {Array.from({ length: 54 }).map((_, index) => (
              <i
                key={index}
                style={
                  {
                    "--particle": index,
                  } as CSSProperties
                }
              />
            ))}
          </div>

          <div className="mm-terms-data-stream stream-a" />
          <div className="mm-terms-data-stream stream-b" />
          <div className="mm-terms-data-stream stream-c" />
        </div>

        {/* DOCUMENT MAP */}
        <aside className="mm-terms-side-nav">
          <div className="mm-terms-side-label">
            <Radar size={13} />
            <span>DOCUMENT MAP</span>
          </div>

          <div className="mm-terms-side-track">
            {sections.map((section) => (
              <a
                key={section.number}
                href={`#terms-${section.number}`}
                className={
                  activeSection === section.number ? "is-active" : undefined
                }
              >
                <span>{section.number}</span>
                <i />
              </a>
            ))}
          </div>

          <div className="mm-terms-side-current">
            <span>READING</span>
            <strong>{activeSection}/09</strong>
          </div>
        </aside>

        <main className="mm-terms-main">
          {/* HERO */}
          <section className="mm-terms-hero-new">
            <motion.div
              className="mm-terms-hero-copy-new"
              initial={{ opacity: 0, y: 45, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mm-terms-live-label">
                <span />
                MARKET MITRA · TRUST LAYER
              </div>

              <div className="mm-terms-hero-title-wrap">
                <span className="mm-terms-hero-index">/ TERMS · 2026</span>

                <h1>
                  Built for the
                  <em> real world.</em>
                </h1>
              </div>

              <p className="mm-terms-hero-description">
                The rules behind Market Mitra are built around one principle:
                useful agricultural information should be clear about where it
                comes from, what it means and where its limits are.
              </p>

              <div className="mm-terms-hero-actions">
                <a href="#terms-01" className="mm-terms-scroll-button">
                  <span>Explore the terms</span>
                  <ArrowDown size={16} />
                </a>

                <div className="mm-terms-status">
                  <span className="mm-terms-status-dot" />
                  <span>VERSION 01 · SEPT 2026</span>
                </div>
              </div>
            </motion.div>

            {/* 3D OBJECT */}
            <motion.div
              className="mm-terms-hero-object"
              initial={{ opacity: 0, scale: 0.72, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="mm-terms-object-shadow" />

              <div className="mm-terms-object-orbit orbit-object-one">
                <span />
              </div>

              <div className="mm-terms-object-orbit orbit-object-two">
                <span />
              </div>

              <motion.div
                className="mm-terms-core"
                animate={{
                  rotateY: [0, 12, -8, 0],
                  rotateX: [0, -4, 4, 0],
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="mm-terms-core-face">
                  <div className="mm-terms-core-top">
                    <span>MARKET MITRA</span>
                    <CheckCircle2 size={15} />
                  </div>

                  <div className="mm-terms-core-logo">MM</div>

                  <div className="mm-terms-core-scan">
                    <ScanLine size={22} />
                  </div>

                  <div className="mm-terms-core-title">
                    TRUST
                    <strong>LAYER</strong>
                  </div>

                  <div className="mm-terms-core-line" />

                  <div className="mm-terms-core-data">
                    <span>DATA</span>
                    <span>GUIDANCE</span>
                    <span>PEOPLE</span>
                  </div>

                  <div className="mm-terms-core-check">
                    <Check size={18} />
                  </div>

                  <div className="mm-terms-core-footer">
                    SELL SMARTER · EARN BETTER
                  </div>
                </div>

                <div className="mm-terms-core-edge edge-one" />
                <div className="mm-terms-core-edge edge-two" />
              </motion.div>

              <div className="mm-terms-object-caption">
                <CircleDot size={12} />
                <span>MARKET MITRA / TRUST / 2026</span>
              </div>
            </motion.div>

            <div className="mm-terms-hero-bottom">
              <div>
                <span>01</span>
                <p>Foundation</p>
              </div>

              <div className="mm-terms-hero-line" />

              <div>
                <span>09</span>
                <p>Contact</p>
              </div>
            </div>
          </section>

          {/* TRUST PANEL */}
          <motion.section
            className="mm-terms-trust-panel"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75 }}
          >
            <div className="mm-terms-trust-icon">
              <LockKeyhole size={21} />
            </div>

            <div className="mm-terms-trust-copy">
              <span>WHY THIS PAGE EXISTS</span>
              <h2>No mystery behind the product.</h2>
              <p>
                Market Mitra connects information, agricultural guidance and
                farmer coordination. These terms explain the boundaries of each
                part so the product stays understandable as it grows.
              </p>
            </div>

            <div className="mm-terms-trust-visual">
              <div>
                <CheckCircle2 size={15} />
                <span>TRACEABLE</span>
              </div>

              <div>
                <CheckCircle2 size={15} />
                <span>CLEAR</span>
              </div>

              <div>
                <CheckCircle2 size={15} />
                <span>PRODUCT-SPECIFIC</span>
              </div>
            </div>
          </motion.section>

          {/* PRODUCT PRINCIPLES */}
          <section className="mm-terms-principles">
            <div className="mm-terms-principles-head">
              <div>
                <span>MARKET MITRA / PRINCIPLES</span>
                <h2>Three things we keep clear.</h2>
              </div>
              <span className="mm-terms-principles-code">MM.TRUST_03</span>
            </div>

            <div className="mm-terms-principles-grid">
              <div className="mm-terms-principle-card">
                <div className="mm-terms-principle-icon">
                  <FileText size={18} />
                </div>
                <span>01 · INFORMATION</span>
                <h3>Reported is not guaranteed.</h3>
                <p>
                  Market figures describe reported conditions. They do not
                  promise the price you will receive.
                </p>
                <div className="mm-terms-principle-line" />
              </div>

              <div className="mm-terms-principle-card">
                <div className="mm-terms-principle-icon">
                  <Waves size={18} />
                </div>
                <span>02 · GUIDANCE</span>
                <h3>Advice has boundaries.</h3>
                <p>
                  Forecasts and automated agricultural guidance should be
                  considered together with real field conditions.
                </p>
                <div className="mm-terms-principle-line" />
              </div>

              <div className="mm-terms-principle-card">
                <div className="mm-terms-principle-icon">
                  <Globe2 size={18} />
                </div>
                <span>03 · CONNECTIONS</span>
                <h3>A match is not a contract.</h3>
                <p>
                  Mitra Link helps farmers discover resources; the final
                  arrangement remains between the people involved.
                </p>
                <div className="mm-terms-principle-line" />
              </div>
            </div>
          </section>

          {/* DOCUMENT */}
          <section className="mm-terms-document-section">
            <div className="mm-terms-document-heading">
              <div>
                <span>TERMS / 01—09</span>
                <h2>How Market Mitra works with you.</h2>
              </div>

              <div className="mm-terms-document-hint">
                <MousePointer2 size={14} />
                <span>SCROLL TO EXPLORE</span>
              </div>
            </div>

            <div className="mm-terms-sections-new">
              {sections.map((section, index) => {
                const Icon = section.icon;

                return (
                  <motion.article
                    id={`terms-${section.number}`}
                    key={section.number}
                    className={`mm-terms-section-new accent-${section.accent}`}
                    initial={{
                      opacity: 0,
                      y: 60,
                      scale: 0.96,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.16,
                    }}
                    transition={{
                      duration: 0.75,
                      delay: Math.min(index * 0.025, 0.15),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <div className="mm-terms-section-bg-number">
                      {section.number}
                    </div>

                    <div className="mm-terms-section-top">
                      <div className="mm-terms-section-number">
                        {section.number}
                      </div>

                      <div className="mm-terms-section-icon">
                        <Icon size={19} />
                      </div>

                      <div className="mm-terms-section-label">
                        <span>{section.label}</span>
                        <h3>{section.heading}</h3>
                      </div>

                      <div className="mm-terms-section-node">
                        <span />
                      </div>
                    </div>

                    <div className="mm-terms-section-content">
                      {section.body.map((paragraph, paragraphIndex) => (
                        <p key={paragraph}>
                          {paragraphIndex === 0 && (
                            <span className="mm-terms-paragraph-marker">
                              →
                            </span>
                          )}
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    <div className="mm-terms-section-footer">
                      <span>MARKET MITRA</span>

                      <div className="mm-terms-section-progress">
                        <span />
                      </div>

                      <span>{section.number} / 09</span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>

          {/* FINAL BRAND MOMENT */}
          <motion.section
            className="mm-terms-final"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9 }}
          >
            <div className="mm-terms-final-world">
              <div className="mm-terms-final-glow" />
              <div className="mm-terms-final-ring ring-1" />
              <div className="mm-terms-final-ring ring-2" />
              <div className="mm-terms-final-ring ring-3" />

              <motion.div
                className="mm-terms-final-core"
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 28,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <span />
              </motion.div>
            </div>

            <div className="mm-terms-final-content">
              <div className="mm-terms-live-label">
                <span />
                MARKET MITRA · AGRICULTURE INTELLIGENCE
              </div>

              <h2>
                Sell smarter.
                <br />
                <em>Earn better.</em>
              </h2>

              <p>
                Market information, agricultural guidance and farmer
                connections should stay useful, understandable and honest about
                their limits.
              </p>

              <Link to="/about" className="mm-terms-final-link">
                <span>Discover Market Mitra</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </motion.section>

          <footer className="mm-terms-footer-new">
            <div>
              <strong>MARKET MITRA</strong>
              <span>AGRICULTURE INTELLIGENCE</span>
            </div>

            <div>
              <span>Questions, corrections or grievances?</span>
              <a href="mailto:hello.marketmitra@gmail.com">
                hello.marketmitra@gmail.com
              </a>
            </div>
          </footer>
        </main>
      </div>
    </Screen>
  );
}