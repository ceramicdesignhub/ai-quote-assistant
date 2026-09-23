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
        // Ignore invalid saved settings
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
    localStorage.setItem("quotepilot-settings", JSON.stringify(settings));
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  function useExample() {
    setEnquiry(
      "Customer needs 500 sq ft interior painting in Austin. White color. Wants it completed next week. Please send price."
    );
    setQuote("");
    setApproved(false);
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
        throw new Error(data?.error || "Failed to generate quote.");
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

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Could not copy the quote. Please select and copy it manually.");
    }
  }

  function approveQuote() {
    if (!quote) return;

    setApproved(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <div className="text-sm font-bold tracking-[0.2em] text-slate-900">
              QUOTEPILOT
            </div>

            <p className="mt-1 text-xs text-slate-500">
              AI quoting assistant for service businesses
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            AI Ready
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        {/* HERO */}
        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            Quote automation
          </p>

          <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Turn enquiries into ready-to-send quotes.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Paste a customer enquiry, let QuotePilot calculate the estimate,
            and review the professional quote before sending it.
          </p>
        </section>

        {/* BUSINESS SETTINGS */}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Business settings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set your business name and pricing rates.
              </p>
            </div>

            {saved && (
              <div className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                ✓ Settings saved
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SettingInput
              label="Business name"
              value={settings.businessName}
              onChange={(value) => updateSetting("businessName", value)}
            />

            <SettingInput
              label="Painting"
              prefix="$"
              suffix="/ sq ft"
              type="number"
              value={settings.paintingRate}
              onChange={(value) => updateSetting("paintingRate", value)}
            />

            <SettingInput
              label="House wash"
              prefix="$"
              type="number"
              value={settings.pressureWashRate}
              onChange={(value) =>
                updateSetting("pressureWashRate", value)
              }
            />

            <SettingInput
              label="Driveway wash"
              prefix="$"
              type="number"
              value={settings.drivewayRate}
              onChange={(value) => updateSetting("drivewayRate", value)}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={saveSettings}
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
            >
              Save settings
            </button>
          </div>
        </section>

        {/* WORKSPACE */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* CUSTOMER ENQUIRY */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  Customer enquiry
                </h2>

                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  INPUT
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Paste the customer's message below.
              </p>
            </div>

            <textarea
              value={enquiry}
              onChange={(e) => {
                setEnquiry(e.target.value);
                setError("");
              }}
              placeholder="Example: Customer needs 500 sq ft interior painting in Austin..."
              className="min-h-[300px] w-full resize-y rounded-xl border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={useExample}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Use example
              </button>

              <button
                onClick={clearAll}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear
              </button>

              <button
                onClick={generateQuote}
                disabled={loading}
                className="ml-auto rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate quote"}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* QUOTE PREVIEW */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Quote preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review before sending to the customer.
                </p>
              </div>

              {quote && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    approved
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {approved ? "APPROVED" : "DRAFT"}
                </span>
              )}
            </div>

            {!quote && !loading && (
              <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                <div>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                    ✦
                  </div>

                  <p className="font-semibold text-slate-700">
                    Your AI-generated quote will appear here.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Enter an enquiry and click Generate quote.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="min-h-[300px] rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-20 rounded bg-slate-200" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Creating your quote...
                </p>
              </div>
            )}

            {quote && !loading && (
              <>
                <textarea
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    setApproved(false);
                  }}
                  className="min-h-[300px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  aria-label="Generated quote"
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={copyQuote}
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {copied ? "✓ Copied" : "Copy quote"}
                  </button>

                  <button
                    onClick={approveQuote}
                    className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                      approved
                        ? "bg-emerald-600"
                        : "bg-slate-950 hover:bg-slate-800"
                    }`}
                  >
                    {approved ? "✓ Quote approved" : "Approve quote"}
                  </button>
                </div>

                {approved && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-800">
                      Quote approved — ready to send.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      The quote has been reviewed and approved. Email sending
                      can be connected as the next step.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            Human approval stays in the loop.
          </p>
        </div>
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
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <div className="flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
        {prefix && (
          <span className="pl-3 text-sm font-semibold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-3 text-sm font-medium text-slate-900 outline-none"
        />

        {suffix && (
          <span className="pr-3 text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}