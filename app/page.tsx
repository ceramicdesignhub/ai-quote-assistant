"use client";

import { useRef, useState } from "react";

const EXAMPLE_ENQUIRY =
  "Hi, I need a quote to pressure wash a 3-bedroom house in Austin. Please include the driveway and tell me your earliest available date.";

export default function Home() {
  const [enquiry, setEnquiry] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState(0);
  const enquiryField = useRef<HTMLTextAreaElement>(null);
  const canGenerate = enquiry.trim().length > 0;

  function clearEnquiry() {
    setEnquiry("");
    setShowQuote(false);
    setIsApproved(false);
  }

  function useExample() {
    setEnquiry(EXAMPLE_ENQUIRY);
    setShowQuote(false);
    setIsApproved(false);
    enquiryField.current?.focus();
  }

  function generateQuote() {
    if (!canGenerate) return;

    setQuoteNumber((current) => current + 1);
    setShowQuote(true);
    setIsApproved(false);
  }

  function editQuote() {
    setShowQuote(false);
    setIsApproved(false);
    enquiryField.current?.focus();
  }

  return (
    <main style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoBox}>Q</span>
          QuotePilot
        </div>
        <span style={styles.badge}>MVP Preview</span>
      </nav>

      <section style={styles.hero}>
        <div>
          <div style={styles.eyebrow}>AI QUOTE ASSISTANT</div>

          <h1 style={styles.title}>
            Turn enquiries into
            <br />
            <span style={styles.highlight}>ready-to-send quotes.</span>
          </h1>

          <p style={styles.subtitle}>
            Paste a customer enquiry. QuotePilot extracts the requirements
            and prepares a professional quote for your approval.
          </p>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.heading}>Customer enquiry</h2>
              <p style={styles.muted}>
                Paste an email, web-form message or customer notes.
              </p>
            </div>
          </div>

          <textarea
            ref={enquiryField}
            value={enquiry}
            onChange={(e) => setEnquiry(e.target.value)}
            aria-label="Customer enquiry"
            placeholder="Example: Hi, I need a quote to pressure wash a 3-bedroom house in Austin. Please include the driveway and tell me your earliest available date..."
            style={styles.textarea}
          />

          <div style={styles.actions}>
            <button
              onClick={useExample}
              style={styles.secondaryButton}
            >
              Use example
            </button>

            <button onClick={clearEnquiry} style={styles.secondaryButton}>
              Clear
            </button>

            <button
              onClick={generateQuote}
              disabled={!canGenerate}
              style={{
                ...styles.primaryButton,
                ...(canGenerate ? {} : styles.disabledButton),
              }}
            >
              Generate quote →
            </button>
          </div>

          <p style={styles.note}>
            MVP preview — AI processing will be connected in the next stage.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.heading}>Quote preview</h2>
              <p style={styles.muted}>
                Review the quote before sending it.
              </p>
            </div>
          </div>

          {!showQuote ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>✦</div>
              <strong>Ready when you are</strong>
              <span style={styles.muted}>
                Enter an enquiry and generate a quote.
              </span>
            </div>
          ) : (
            <div style={styles.quote}>
              <div style={styles.quoteTop}>
                <div>
                  <small style={styles.label}>QUOTE FOR</small>
                  <strong>Alex Morgan</strong>
                  <span>Morgan Property Services</span>
                </div>

                <small style={styles.muted}>
                  DRAFT #QP-{String(quoteNumber).padStart(3, "0")}
                </small>
              </div>

              <div style={styles.project}>
                <small style={styles.label}>PROJECT</small>
                <strong>Exterior house wash</strong>
              </div>

              <div style={styles.items}>
                <div style={styles.item}>
                  <span>Exterior pressure washing</span>
                  <strong>$650.00</strong>
                </div>

                <div style={styles.item}>
                  <span>Driveway cleaning</span>
                  <strong>$180.00</strong>
                </div>

                <div style={styles.item}>
                  <span>Travel allowance</span>
                  <strong>$70.00</strong>
                </div>
              </div>

              <div style={styles.total}>
                <span>Total</span>
                <strong>$990.00</strong>
              </div>

              <div style={styles.actions}>
                <button onClick={editQuote} style={styles.secondaryButton}>
                  Edit enquiry
                </button>
                <button
                  onClick={() => setIsApproved(true)}
                  disabled={isApproved}
                  style={{
                    ...styles.primaryButton,
                    ...(isApproved ? styles.disabledButton : {}),
                  }}
                >
                  {isApproved ? "Quote approved" : "Approve quote"}
                </button>
              </div>

              {isApproved && (
                <p role="status" style={styles.approvalNote}>
                  Quote approved — it’s ready to send.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <footer style={styles.footer}>
        QuotePilot MVP • Human approval stays in the loop.
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#08111f",
    color: "#eef5ff",
    padding: "28px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  nav: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 800,
    fontSize: "18px",
  },

  logoBox: {
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    borderRadius: "9px",
    background: "#72e0bd",
    color: "#07111d",
    fontWeight: 900,
  },

  badge: {
    border: "1px solid #1d3048",
    borderRadius: "999px",
    padding: "7px 12px",
    color: "#8fa3bd",
    fontSize: "12px",
  },

  hero: {
    maxWidth: "1180px",
    margin: "0 auto",
    padding: "90px 0 50px",
  },

  eyebrow: {
    color: "#72e0bd",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.16em",
    marginBottom: "15px",
  },

  title: {
    fontSize: "clamp(42px, 6vw, 72px)",
    lineHeight: 1,
    letterSpacing: "-0.055em",
    margin: 0,
  },

  highlight: {
    color: "#87b7ff",
  },

  subtitle: {
    color: "#8fa3bd",
    maxWidth: "650px",
    fontSize: "17px",
    lineHeight: 1.6,
    marginTop: "22px",
  },

  grid: {
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  card: {
    background: "#0d1929",
    border: "1px solid #1d3048",
    borderRadius: "18px",
    padding: "22px",
  },

  cardHeader: {
    marginBottom: "18px",
  },

  heading: {
    fontSize: "17px",
    margin: "0 0 5px",
  },

  muted: {
    color: "#8fa3bd",
    fontSize: "13px",
  },

  textarea: {
    width: "100%",
    minHeight: "300px",
    resize: "vertical",
    border: "1px solid #1d3048",
    borderRadius: "12px",
    background: "#091524",
    color: "#eef5ff",
    padding: "16px",
    outline: "none",
    lineHeight: 1.6,
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "14px",
  },

  primaryButton: {
    border: 0,
    borderRadius: "10px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 700,
    background: "#72e0bd",
    color: "#06121b",
  },

  secondaryButton: {
    border: "1px solid #1d3048",
    borderRadius: "10px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 700,
    background: "#132238",
    color: "#cbd8e8",
  },

  note: {
    color: "#627893",
    fontSize: "11px",
    marginTop: "13px",
  },

  disabledButton: {
    cursor: "not-allowed",
    opacity: 0.5,
  },

  empty: {
    minHeight: "370px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },

  emptyIcon: {
    width: "48px",
    height: "48px",
    border: "1px solid #1d3048",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    color: "#72e0bd",
    fontSize: "22px",
    marginBottom: "8px",
  },

  quote: {
    background: "#f5f8fb",
    color: "#142033",
    borderRadius: "13px",
    padding: "20px",
  },

  quoteTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    paddingBottom: "17px",
    borderBottom: "1px solid #d9e1e9",
  },

  label: {
    display: "block",
    color: "#7c8998",
    fontWeight: 800,
    fontSize: "9px",
    letterSpacing: "0.12em",
    marginBottom: "3px",
  },

  project: {
    padding: "15px 0",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  items: {
    borderTop: "1px solid #d9e1e9",
    borderBottom: "1px solid #d9e1e9",
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
    fontSize: "12px",
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "15px",
    fontSize: "18px",
    fontWeight: 800,
  },

  approvalNote: {
    color: "#17634f",
    fontSize: "12px",
    fontWeight: 700,
    margin: "14px 0 0",
  },

  footer: {
    maxWidth: "1180px",
    margin: "0 auto",
    textAlign: "center",
    color: "#536a84",
    fontSize: "11px",
    padding: "25px 0",
  },
};
