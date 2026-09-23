"use client";

import { useEffect, useState } from "react";

type Settings = {
  businessName: string;
  paintingRate: string;
  pressureWashRate: string;
  drivewayRate: string;
};

const DEFAULT_SETTINGS: Settings = {
  businessName: "My Business",
  paintingRate: "3.75",
  pressureWashRate: "325",
  drivewayRate: "175",
};

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [enquiry, setEnquiry] = useState("");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem("quotepilot-settings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Ignore invalid settings.
      }
    }
  }, []);

  function updateSetting(key: keyof Settings, value: string) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function saveSettings() {
    localStorage.setItem(
      "quotepilot-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function useExample() {
    setEnquiry(
      "Hi, I need a quote to pressure wash a 3-bedroom house in Austin. Please include the driveway and tell me your earliest available date."
    );

    setQuote("");
    setApproved(false);
    setCopied(false);
    setError("");
  }

  function clearAll() {
    setEnquiry("");
    setQuote("");
    setApproved(false);
    setCopied(false);
    setError("");
  }

  async function generateQuote() {
    if (!enquiry.trim()) {
      setError("Please enter the customer's enquiry first.");
      return;
    }

    setLoading(true);
    setError("");
    setQuote("");
    setApproved(false);
    setCopied(false);

    try {
      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enquiry,
          pricingSettings: {
            businessName: settings.businessName,
            paintingRate: Number(settings.paintingRate),
            pressureWashRate: Number(settings.pressureWashRate),
            drivewayRate: Number(settings.drivewayRate),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to generate quote."
        );
      }

      setQuote(data.quote || "");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the quote."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyQuote() {
    if (!quote) return;

    try {
      await navigator.clipboard.writeText(quote);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Could not copy the quote. Please copy it manually."
      );
    }
  }

  function approveQuote() {
    if (!quote) return;
    setApproved(true);
  }

  return (
    <main className="app">
      <div className="shell">
        <header className="nav">
          <div className="brand">
            <div className="brandMark">Q</div>

            <div>
              <div className="brandName">QUOTEPILOT</div>
              <div className="brandSub">
                AI quoting assistant for service businesses
              </div>
            </div>
          </div>

          <div className="status">
            <span className="dot" />
            AI Ready
          </div>
        </header>

        <section className="hero">
          <div>
            <p className="eyebrow">QUOTE AUTOMATION</p>

            <h1>
              Turn enquiries into
              <br />
              <span>ready-to-send quotes.</span>
            </h1>

            <p className="heroCopy">
              Capture the customer request, calculate your estimate,
              and create a professional quote in seconds.
            </p>
          </div>

          <div className="heroBadge">
            <strong>Fast. Consistent. Human-controlled.</strong>
            <span>
              QuotePilot assists with the quote — you stay in control
              before anything is sent.
            </span>
          </div>
        </section>

        <section className="settingsPanel">
          <div className="settingsHeader">
            <div>
              <p className="sectionEyebrow">BUSINESS PROFILE</p>
              <h2>Pricing & business settings</h2>
              <p>
                These values are used when QuotePilot calculates estimates.
              </p>
            </div>

            {saved && (
              <div className="savedMessage">
                ✓ Saved
              </div>
            )}
          </div>

          <div className="settingsGrid">
            <SettingInput
              label="Business name"
              value={settings.businessName}
              onChange={(value) =>
                updateSetting("businessName", value)
              }
            />

            <SettingInput
              label="Interior painting"
              prefix="$"
              suffix="/ sq ft"
              type="number"
              value={settings.paintingRate}
              onChange={(value) =>
                updateSetting("paintingRate", value)
              }
            />

            <SettingInput
              label="House pressure wash"
              prefix="$"
              type="number"
              value={settings.pressureWashRate}
              onChange={(value) =>
                updateSetting("pressureWashRate", value)
              }
            />

            <SettingInput
              label="Driveway pressure wash"
              prefix="$"
              type="number"
              value={settings.drivewayRate}
              onChange={(value) =>
                updateSetting("drivewayRate", value)
              }
            />
          </div>

          <div className="settingsFooter">
            <span>
              Your saved settings stay on this browser.
            </span>

            <button
              onClick={saveSettings}
              className="primary"
            >
              Save settings
            </button>
          </div>
        </section>

        <section className="workspace">
          <div className="panel">
            <div className="panelHead">
              <div>
                <p className="sectionEyebrow">STEP 01 · INPUT</p>

                <h2>Customer enquiry</h2>

                <p>
                  Paste the customer's message exactly as received.
                </p>
              </div>

              <div className="counter">
                {enquiry.length} chars
              </div>
            </div>

            <textarea
              value={enquiry}
              onChange={(e) => {
                setEnquiry(e.target.value);
                setError("");
              }}
              placeholder="Example: Hi, I need a quote to pressure wash a 3-bedroom house..."
            />

            <div className="actions">
              <button
                onClick={useExample}
                className="secondary"
              >
                Use example
              </button>

              <button
                onClick={clearAll}
                className="secondary"
              >
                Clear
              </button>

              <button
                onClick={generateQuote}
                disabled={loading}
                className="primary generateBtn"
              >
                {loading ? "Generating..." : "Generate quote →"}
              </button>
            </div>

            {error && (
              <div className="errorBox">
                <strong>Something needs attention</strong>
                <span>{error}</span>
              </div>
            )}

            <p className="demoNote">
              QuotePilot uses your configured business rates and does not
              invent pricing.
            </p>
          </div>

          <div className="panel">
            <div className="panelHead">
              <div>
                <p className="sectionEyebrow">STEP 02 · OUTPUT</p>

                <h2>Quote preview</h2>

                <p>
                  Review the AI-generated quote before approval.
                </p>
              </div>

              {quote && (
                <span
                  className={
                    approved ? "approved" : "review"
                  }
                >
                  {approved ? "APPROVED" : "DRAFT"}
                </span>
              )}
            </div>

            {!quote && !loading && (
              <div className="empty">
                <div className="emptyIcon">✦</div>

                <strong>
                  Your quote will appear here
                </strong>

                <span>
                  Generate a quote from the customer enquiry.
                </span>

                <div className="emptySteps">
                  <span>1. Paste enquiry</span>
                  <span>2. Generate</span>
                  <span>3. Review</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="loadingBox">
                <div className="loader">
                  <div />
                  <div />
                  <div />
                </div>

                <strong>
                  Creating your quote
                </strong>

                <span>
                  Analysing requirements and calculating pricing...
                </span>
              </div>
            )}

            {quote && !loading && (
              <>
                <div className="quoteCard">
                  <div className="quoteTop">
                    <div>
                      <span className="miniLabel">
                        QUOTE DRAFT
                      </span>

                      <strong>
                        {settings.businessName}
                      </strong>
                    </div>

                    <span className="quoteNo">
                      AI GENERATED
                    </span>
                  </div>

                  <div className="quoteContent">
                    <textarea
                      value={quote}
                      onChange={(e) => {
                        setQuote(e.target.value);
                        setApproved(false);
                      }}
                      aria-label="Generated quote"
                    />
                  </div>

                  <div className="humanCheck">
                    <span className="checkIcon">✓</span>

                    <div>
                      <strong>
                        Review before sending
                      </strong>

                      <p>
                        Confirm customer details, scope, pricing and timing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="quoteActions">
                  <button
                    onClick={copyQuote}
                    className="secondary"
                  >
                    {copied ? "✓ Copied" : "Copy quote"}
                  </button>

                  <button
                    onClick={approveQuote}
                    className={
                      approved ? "approvedBtn" : "primary"
                    }
                  >
                    {approved
                      ? "✓ Quote approved"
                      : "Approve quote"}
                  </button>
                </div>

                {approved && (
                  <div className="successBox">
                    <strong>
                      Ready to send
                    </strong>

                    <span>
                      The quote has been reviewed and approved.
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <footer>
          <span>QUOTEPILOT</span>
          <span>AI-assisted quoting · Human approval required</span>
        </footer>
      </div>
    </main>
  );
}

function SettingInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <div className="settingField">
      <label>{label}</label>

      <div className="settingInput">
        {prefix && (
          <span className="inputPrefix">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {suffix && (
          <span className="inputSuffix">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}