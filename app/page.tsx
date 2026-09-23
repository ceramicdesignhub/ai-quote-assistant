"use client";

import { useEffect, useState } from "react";

type Settings = {
  businessName: string;
  paintingRate: number;
  pressureWashRate: number;
  drivewayRate: number;
};

type QuoteHistoryItem = {
  id: string;
  enquiry: string;
  quote: string;
  createdAt: string;
  approved: boolean;
};

const defaultSettings: Settings = {
  businessName: "Test Business",
  paintingRate: 10,
  pressureWashRate: 500,
  drivewayRate: 200,
};

export default function Home() {
  const [enquiry, setEnquiry] = useState("");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] =
    useState<Settings>(defaultSettings);

  const [history, setHistory] =
    useState<QuoteHistoryItem[]>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const savedSettings =
      localStorage.getItem("quotepilot-settings");

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Ignore invalid settings.
      }
    }

    const savedHistory =
      localStorage.getItem("quotepilot-history");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore invalid history.
      }
    }
  }, []);

  function updateSetting(
    key: keyof Settings,
    value: string
  ) {
    setSettings((current) => ({
      ...current,
      [key]:
        key === "businessName"
          ? value
          : Number(value),
    }));
  }

  function saveSettings() {
    localStorage.setItem(
      "quotepilot-settings",
      JSON.stringify(settings)
    );

    setSettingsOpen(false);
  }

  async function generateQuote() {
    if (!enquiry.trim()) {
      setError(
        "Please enter the customer's enquiry first."
      );
      return;
    }

    setLoading(true);
    setError("");
    setQuote("");
    setApproved(false);
    setCopied(false);

    try {
      const response = await fetch(
        "/api/generate-quote",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enquiry,
            pricingSettings: settings,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to generate quote."
        );
      }

      setQuote(data.quote);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
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

  async function copyQuote() {
    if (!quote) return;

    try {
      await navigator.clipboard.writeText(
        quote
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        "Unable to copy the quote."
      );
    }
  }

  function approveQuote() {
    if (!quote) return;

    const newItem: QuoteHistoryItem = {
      id: `${Date.now()}`,
      enquiry,
      quote,
      createdAt:
        new Date().toLocaleString(),
      approved: true,
    };

    const updatedHistory = [
      newItem,
      ...history,
    ].slice(0, 20);

    setHistory(updatedHistory);

    localStorage.setItem(
      "quotepilot-history",
      JSON.stringify(updatedHistory)
    );

    setApproved(true);
  }

  function loadHistoryItem(
    item: QuoteHistoryItem
  ) {
    setEnquiry(item.enquiry);
    setQuote(item.quote);
    setApproved(item.approved);
    setCopied(false);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function deleteHistoryItem(
    id: string
  ) {
    const updatedHistory =
      history.filter(
        (item) => item.id !== id
      );

    setHistory(updatedHistory);

    localStorage.setItem(
      "quotepilot-history",
      JSON.stringify(updatedHistory)
    );
  }

  function clearHistory() {
    setHistory([]);

    localStorage.removeItem(
      "quotepilot-history"
    );
  }

  function startNewQuote() {
    clearAll();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main className="appShell">
      <div className="container">

        {/* HEADER */}

        <header className="topBar">

          <div className="brand">

            <div className="brandMark">
              Q
            </div>

            <div>
              <div className="brandName">
                QuotePilot
              </div>

              <div className="brandTagline">
                AI-powered quoting for
                service businesses
              </div>
            </div>

          </div>

          <button
            className="settingsButton"
            onClick={() =>
              setSettingsOpen(
                !settingsOpen
              )
            }
          >
            ⚙ Settings
          </button>

        </header>

        {/* SETTINGS */}

        {settingsOpen && (
          <section className="settingsPanel">

            <div className="settingsHeader">
              <div>
                <div className="sectionEyebrow">
                  BUSINESS SETTINGS
                </div>

                <h2>
                  Configure your pricing
                </h2>

                <p>
                  These values are used
                  by QuotePilot when
                  calculating estimates.
                </p>
              </div>
            </div>

            <div className="settingsGrid">

              <label>
                <span>
                  Business name
                </span>

                <input
                  value={
                    settings.businessName
                  }
                  onChange={(e) =>
                    updateSetting(
                      "businessName",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Interior painting
                  ($ / sq ft)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    settings.paintingRate
                  }
                  onChange={(e) =>
                    updateSetting(
                      "paintingRate",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  House pressure wash ($)
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    settings.pressureWashRate
                  }
                  onChange={(e) =>
                    updateSetting(
                      "pressureWashRate",
                      e.target.value
                    )
                  }
                />
              </label>

              <label>
                <span>
                  Driveway pressure wash ($)
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={
                    settings.drivewayRate
                  }
                  onChange={(e) =>
                    updateSetting(
                      "drivewayRate",
                      e.target.value
                    )
                  }
                />
              </label>

            </div>

            <div className="settingsActions">

              <button
                className="secondary"
                onClick={() =>
                  setSettings(
                    defaultSettings
                  )
                }
              >
                Reset
              </button>

              <button
                className="primary"
                onClick={saveSettings}
              >
                Save settings
              </button>

            </div>

          </section>
        )}

        {/* HERO */}

        <section className="hero">

          <div className="heroBadge">
            <span className="statusDot" />
            HUMAN APPROVAL INCLUDED
          </div>

          <h1>
            Turn enquiries into
            <span> ready-to-send quotes.</span>
          </h1>

          <p>
            QuotePilot extracts customer
            requirements, calculates
            business pricing and creates
            a professional customer-ready
            quote.
          </p>

        </section>

        {/* WORKSPACE */}

        <section className="workspace">

          {/* LEFT */}

          <div className="panel">

            <div className="panelHead">

              <div>
                <div className="sectionEyebrow">
                  STEP 01
                </div>

                <h2>
                  Customer enquiry
                </h2>

                <p>
                  Paste the customer's
                  message below.
                </p>
              </div>

              <div className="stepNumber">
                01
              </div>

            </div>

            <textarea
              className="enquiryInput"
              value={enquiry}
              onChange={(e) =>
                setEnquiry(
                  e.target.value
                )
              }
              placeholder="Paste the customer's enquiry here..."
            />

            <div className="inputMeta">
              <span>
                {enquiry.length} characters
              </span>

              <span>
                AI will extract requirements
              </span>
            </div>

            <div className="buttonRow">

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
                className="primary generateButton"
              >
                {loading
                  ? "Generating..."
                  : "Generate quote →"}
              </button>

            </div>

            {error && (
              <div className="errorBox">
                {error}
              </div>
            )}

          </div>

          {/* RIGHT */}

          <div className="panel">

            <div className="panelHead">

              <div>
                <div className="sectionEyebrow">
                  STEP 02
                </div>

                <h2>
                  Quote preview
                </h2>

                <p>
                  Review before sending
                  to the customer.
                </p>
              </div>

              <div className="draftBadge">
                {approved
                  ? "APPROVED"
                  : "DRAFT"}
              </div>

            </div>

            {!quote && !loading && (
              <div className="emptyState">

                <div className="emptyIcon">
                  ✦
                </div>

                <strong>
                  Your quote will appear
                  here
                </strong>

                <span>
                  Generate a quote to
                  preview the customer
                  response.
                </span>

              </div>
            )}

            {loading && (
              <div className="loadingState">

                <div className="loader" />

                <strong>
                  Analysing enquiry...
                </strong>

                <span>
                  Calculating pricing and
                  preparing your quote.
                </span>

              </div>
            )}

            {quote && (
              <>

                <div className="quoteCard">

                  <div className="quoteTop">

                    <span className="miniLabel">
                      CUSTOMER-READY DRAFT
                    </span>

                    <span className="estimateBadge">
                      ESTIMATE
                    </span>

                  </div>

                  <div className="quoteContent">
                    {quote}
                  </div>

                </div>

                <div className="quoteActions">

                  <button
                    onClick={copyQuote}
                    className="secondary"
                  >
                    {copied
                      ? "✓ Copied"
                      : "Copy quote"}
                  </button>

                  <button
                    onClick={startNewQuote}
                    className="secondary"
                  >
                    New quote
                  </button>

                  <button
                    onClick={approveQuote}
                    disabled={approved}
                    className="primary"
                  >
                    {approved
                      ? "✓ Quote approved"
                      : "Approve quote"}
                  </button>

                </div>

                {approved && (
                  <div className="approvedBox">
                    <span>✓</span>

                    <div>
                      <strong>
                        Quote approved
                      </strong>

                      <p>
                        Saved to quote
                        history and ready
                        to send.
                      </p>
                    </div>
                  </div>
                )}

              </>
            )}

          </div>

        </section>

        {/* HISTORY */}

        {history.length > 0 && (
          <section className="panel historyPanel">

            <div className="panelHead">

              <div>
                <div className="sectionEyebrow">
                  QUOTE HISTORY
                </div>

                <h2>
                  Recent quotes
                </h2>

                <p>
                  Your latest generated and
                  approved quotes are saved
                  on this browser.
                </p>
              </div>

              <button
                onClick={clearHistory}
                className="secondary"
              >
                Clear history
              </button>

            </div>

            <div className="historyList">

              {history.map((item) => (
                <div
                  key={item.id}
                  className="historyItem"
                >

                  <div className="historyInfo">

                    <div className="historyStatus">
                      <span
                        className={
                          item.approved
                            ? "historyApproved"
                            : "historyDraft"
                        }
                      >
                        {item.approved
                          ? "APPROVED"
                          : "DRAFT"}
                      </span>

                      <span>
                        {item.createdAt}
                      </span>
                    </div>

                    <div className="historyEnquiry">
                      {item.enquiry}
                    </div>

                  </div>

                  <div className="historyActions">

                    <button
                      onClick={() =>
                        loadHistoryItem(
                          item
                        )
                      }
                      className="secondary"
                    >
                      Load
                    </button>

                    <button
                      onClick={() =>
                        deleteHistoryItem(
                          item.id
                        )
                      }
                      className="secondary dangerButton"
                    >
                      Delete
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}

        {/* FOOTER */}

        <footer className="footer">

          <div>
            <strong>
              QuotePilot
            </strong>

            <span>
              AI-assisted quoting with
              human approval.
            </span>
          </div>

          <span>
            Pricing is controlled by
            your business settings.
          </span>

        </footer>

      </div>
    </main>
  );
}