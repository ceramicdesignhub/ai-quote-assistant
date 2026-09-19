"use client";

import { useState } from "react";

export default function Home() {
  const [enquiry, setEnquiry] = useState("");
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");

  async function generateQuote() {
    if (!enquiry.trim()) {
      setError("Please enter a customer enquiry.");
      return;
    }

    setLoading(true);
    setError("");
    setQuote("");
    setApproved(false);

    try {
      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enquiry }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quote.");
      }

      setQuote(data.quote);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
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
    setError("");
  }

  function clearAll() {
    setEnquiry("");
    setQuote("");
    setApproved(false);
    setError("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 35 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              color: "#667085",
              marginBottom: 10,
            }}
          >
            AI QUOTE ASSISTANT
          </div>

          <h1
            style={{
              fontSize: 42,
              margin: 0,
              color: "#111827",
            }}
          >
            Turn enquiries into ready-to-send quotes.
          </h1>

          <p
            style={{
              color: "#667085",
              fontSize: 17,
              marginTop: 12,
            }}
          >
            QuotePilot extracts customer requirements and creates a
            professional quote draft.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <section
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Customer enquiry</h2>

            <textarea
              value={enquiry}
              onChange={(e) => setEnquiry(e.target.value)}
              placeholder="Paste the customer's enquiry here..."
              style={{
                width: "100%",
                minHeight: 280,
                padding: 16,
                borderRadius: 12,
                border: "1px solid #d0d5dd",
                fontSize: 15,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 15,
              }}
            >
              <button
                onClick={useExample}
                style={secondaryButton}
              >
                Use example
              </button>

              <button
                onClick={clearAll}
                style={secondaryButton}
              >
                Clear
              </button>

              <button
                onClick={generateQuote}
                disabled={loading}
                style={primaryButton}
              >
                {loading ? "Generating..." : "Generate quote"}
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginTop: 15,
                  padding: 12,
                  borderRadius: 10,
                  background: "#fff1f2",
                  color: "#be123c",
                }}
              >
                {error}
              </div>
            )}
          </section>

          <section
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Quote draft</h2>

            {!quote && !loading && (
              <div
                style={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#98a2b3",
                  textAlign: "center",
                }}
              >
                Your AI-generated quote will appear here.
              </div>
            )}

            {loading && (
              <div
                style={{
                  minHeight: 280,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#475467",
                }}
              >
                AI is analysing the enquiry...
              </div>
            )}

            {quote && (
              <>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    color: "#344054",
                    background: "#f9fafb",
                    padding: 18,
                    borderRadius: 12,
                    maxHeight: 400,
                    overflowY: "auto",
                  }}
                >
                  {quote}
                </div>

                <button
                  onClick={() => setApproved(true)}
                  disabled={approved}
                  style={{
                    ...primaryButton,
                    marginTop: 18,
                    width: "100%",
                  }}
                >
                  {approved ? "Quote approved" : "Approve quote"}
                </button>

                {approved && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 10,
                      background: "#ecfdf3",
                      color: "#027a48",
                      textAlign: "center",
                    }}
                  >
                    Quote approved — ready to send.
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#98a2b3",
            fontSize: 13,
            marginTop: 30,
          }}
        >
          Human approval stays in the loop.
        </p>
      </div>
    </main>
  );
}

const primaryButton = {
  background: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton = {
  background: "#ffffff",
  color: "#344054",
  border: "1px solid #d0d5dd",
  borderRadius: 10,
  padding: "12px 16px",
  fontWeight: 600,
  cursor: "pointer",
};