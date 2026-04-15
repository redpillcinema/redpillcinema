import { useState } from "react";

const SYSTEM_PROMPT = "You are Red Pill Cinema - an underground movie analysis engine that reveals what mainstream critics won't tell you. When given a movie quote, return ONLY a valid JSON object with exactly these keys:\n\n{\"movie\": \"Movie title\", \"year\": \"Year released\", \"scene\": \"Brief scene context (1-2 sentences)\", \"character\": \"Character name\", \"actor\": \"Actor name\", \"quoteAccuracy\": \"Confirmed accurate / or correction if wrong\", \"exactQuote\": \"The verified exact quote\", \"coreMeaning\": \"What the quote means in the film context (2-3 sentences)\", \"deeperInterpretation\": \"Symbolism, themes, or foreshadowing analysis - go deeper than surface level (2-3 sentences)\", \"wildPerspective\": \"A conspiracy-level, mind-bending interpretation - what if this quote was secretly about society, power, control, psychology, or the human condition? Make it provocative, slightly controversial, and impossible to unsee once you read it (3-4 sentences)\", \"socialMedia\": \"A viral-ready 1-2 sentence hot take that will make people stop scrolling\"}\n\nIf the quote is unknown, use Quote not confidently identified for movie and give your best guess. Return ONLY the JSON object, no markdown, no backticks, no extra text.";

const sections = [
  { key: "scene", icon: "🎬", label: "Scene Intel" },
  { key: "quoteAccuracy", icon: "📼", label: "Quote Verification" },
  { key: "coreMeaning", icon: "🧠", label: "Surface Level" },
  { key: "deeperInterpretation", icon: "🔍", label: "Go Deeper" },
  { key: "wildPerspective", icon: "💊", label: "Red Pill Take" },
  { key: "socialMedia", icon: "📡", label: "Broadcast This" },
];

const EXAMPLES = [
  "You can't handle the truth!",
  "Why so serious?",
  "I'll be back.",
  "We accept the love we think we deserve.",
];

const Pill = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <ellipse cx="14" cy="14" rx="11" ry="6" transform="rotate(-35 14 14)" fill="#cc2200" stroke="#ff3311" strokeWidth="1" />
    <line x1="7" y1="10" x2="21" y2="18" stroke="#ff6644" strokeWidth="1.5" />
  </svg>
);

const CSS = `
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }
  @keyframes flicker {
    0%, 95%, 100% { opacity: 1; }
    96% { opacity: 0.4; }
    97% { opacity: 1; }
    98% { opacity: 0.2; }
    99% { opacity: 1; }
  }
  @keyframes glitch {
    0% { transform: translate(0); }
    20% { transform: translate(-3px, 1px); }
    40% { transform: translate(3px, -1px); }
    60% { transform: translate(-2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
  @keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 8px rgba(204,34,0,0.3); }
    50% { box-shadow: 0 0 24px rgba(204,34,0,0.7); }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .scanline-overlay {
    position: fixed;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: rgba(204,34,0,0.08);
    animation: scanline 6s linear infinite;
    pointer-events: none;
    z-index: 999;
  }
  .section-card:hover {
    border-color: #4a1008 !important;
    background: #110909 !important;
  }
`;

const cornerStyles = [
  { top: -1, left: -1, borderTop: "2px solid #cc2200", borderLeft: "2px solid #cc2200", width: 16, height: 16 },
  { top: -1, right: -1, borderTop: "2px solid #cc2200", borderRight: "2px solid #cc2200", width: 16, height: 16 },
  { bottom: -1, left: -1, borderBottom: "2px solid #cc2200", borderLeft: "2px solid #cc2200", width: 16, height: 16 },
  { bottom: -1, right: -1, borderBottom: "2px solid #cc2200", borderRight: "2px solid #cc2200", width: 16, height: 16 },
];

export default function Home() {
  const [quote, setQuote] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [glitch, setGlitch] = useState(false);

  async function analyzeQuote() {
    if (!quote.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setActiveSection(null);
    setGlitch(true);
    setTimeout(() => setGlitch(false), 600);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Analyze this movie quote: \"" + quote + "\"" }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (e) {
      setError("Signal lost. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080608",
      fontFamily: "Courier New, monospace",
      color: "#ffffff",
      padding: "0 0 80px 0",
      position: "relative",
      overflowX: "hidden",
    }}>
      <style>{CSS}</style>

      <div className="scanline-overlay" />

      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(120,10,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(80,0,20,0.06) 0%, transparent 60%)",
      }} />

      {/* Header */}
      <div style={{
        background: "#0c0608",
        borderBottom: "1px solid #2a0a08",
        padding: "52px 24px 36px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
        animation: "flicker 8s infinite",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent 0%, #cc2200 30%, #ff3311 50%, #cc2200 70%, transparent 100%)",
        }} />

        {[15, 45, 75].map(top => (
          <div key={top} style={{
            position: "absolute", left: 0, right: 0, top: top + "%", height: "1px",
            background: "rgba(204,34,0,0.06)",
          }} />
        ))}

        <div style={{ position: "relative" }}>
          <div style={{
            fontSize: "10px", letterSpacing: "8px", textTransform: "uppercase",
            color: "#661100", marginBottom: "20px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
          }}>
            <span>CLASSIFIED</span>
            <span style={{ animation: "blink 1.5s infinite", color: "#cc2200" }}>●</span>
            <span>REC</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "8px" }}>
            <Pill />
            <h1 style={{
              fontSize: "clamp(36px, 7vw, 64px)",
              fontWeight: "900",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              margin: 0,
              color: "#f0e8e0",
              letterSpacing: "-2px",
              textShadow: "0 0 40px rgba(204,34,0,0.4), 2px 2px 0px #330800",
              animation: glitch ? "glitch 0.3s steps(1) 2" : "none",
            }}>
              Red Pill
            </h1>
            <Pill />
          </div>

          <div style={{
            fontSize: "clamp(14px, 3vw, 22px)",
            letterSpacing: "10px",
            textTransform: "uppercase",
            color: "#cc2200",
            marginBottom: "16px",
            fontFamily: "monospace",
            fontWeight: "normal",
          }}>
            CINEMA
          </div>

          <p style={{ color: "#ff2a2a", fontSize: "12px", margin: 0, letterSpacing: "3px", textTransform: "uppercase" }}>
            They hid it in the dialogue. We found it.
          </p>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 20px 0", position: "relative", zIndex: 1 }}>

        {/* Input card */}
        <div style={{
          background: "#0c0608",
          border: "1px solid #2a0a08",
          padding: "28px",
          position: "relative",
          animation: "pulse-red 4s ease-in-out infinite",
        }}>
          {cornerStyles.map((s, i) => (
            <div key={i} style={{ position: "absolute", ...s }} />
          ))}

          <div style={{
            fontSize: "10px", letterSpacing: "5px", color: "#661100",
            marginBottom: "16px", textTransform: "uppercase",
          }}>
            INPUT QUOTE FOR DECRYPTION
          </div>

          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), analyzeQuote())}
            placeholder="What if I told you...?"
            rows={3}
            style={{
              width: "100%",
              background: "#080608",
              border: "1px solid #1a0808",
              color: "#f0e8e0",
              fontSize: "17px",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              padding: "14px",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: "1.7",
              transition: "border-color 0.2s, box-shadow 0.2s",
              caretColor: "#cc2200",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#cc2200";
              e.target.style.boxShadow = "0 0 12px rgba(204,34,0,0.2) inset";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#1a0808";
              e.target.style.boxShadow = "none";
            }}
          />

          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setQuote(ex)}
                style={{
                  background: "transparent",
                  border: "1px solid #1a0808",
                  color: "#ff2a2a",
                  fontSize: "10px",
                  padding: "4px 10px",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                  transition: "all 0.15s",
                }}
                onMouseOver={e => {
                  e.target.style.borderColor = "#661100";
                  e.target.style.color = "#cc2200";
                  e.target.style.background = "#110404";
                }}
                onMouseOut={e => {
                  e.target.style.borderColor = "#1a0808";
                  e.target.style.color = "#4a3030";
                  e.target.style.background = "transparent";
                }}
              >
                {ex.length > 24 ? ex.slice(0, 24) + "..." : ex}
              </button>
            ))}
          </div>

          <button
            onClick={analyzeQuote}
            disabled={loading || !quote.trim()}
            style={{
              marginTop: "20px",
              width: "100%",
              background: loading || !quote.trim() ? "#0f0608" : "linear-gradient(135deg, #cc2200 0%, #8b1500 50%, #cc2200 100%)",
              color: loading || !quote.trim() ? "#2a1010" : "#f0e8e0",
              border: "1px solid " + (loading || !quote.trim() ? "#1a0808" : "#ff3311"),
              padding: "15px",
              fontSize: "12px",
              letterSpacing: "5px",
              textTransform: "uppercase",
              fontFamily: "monospace",
              fontWeight: "bold",
              cursor: loading || !quote.trim() ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: loading || !quote.trim() ? "none" : "0 0 20px rgba(204,34,0,0.3)",
            }}
            onMouseOver={e => { if (!loading && quote.trim()) e.target.style.boxShadow = "0 0 30px rgba(204,34,0,0.5)"; }}
            onMouseOut={e => { if (!loading && quote.trim()) e.target.style.boxShadow = "0 0 20px rgba(204,34,0,0.3)"; }}
          >
            {loading ? "DECRYPTING SIGNAL..." : "TAKE THE RED PILL"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "56px 0", color: "#4a3030" }}>
            <div style={{
              width: "40px", height: "40px",
              border: "2px solid #1a0808",
              borderTop: "2px solid #cc2200",
              borderRadius: "50%",
              margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }} />
            <div style={{ fontSize: "10px", letterSpacing: "5px", color: "#661100" }}>
              ACCESSING CLASSIFIED ARCHIVES
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "20px",
            background: "#0f0404",
            border: "1px solid #4a0808",
            padding: "14px 18px",
            color: "#cc4444",
            fontSize: "11px",
            letterSpacing: "2px",
          }}>
            SIGNAL INTERRUPTED - {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: "28px" }}>

            {/* Identity card */}
            <div style={{
              background: "#0c0608",
              border: "1px solid #2a0a08",
              padding: "28px",
              marginBottom: "16px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, transparent, #cc2200, #ff3311, #cc2200, transparent)",
              }} />
              <div style={{
                position: "absolute", bottom: 0, right: 0, width: "80px", height: "80px",
                background: "radial-gradient(circle, rgba(204,34,0,0.05) 0%, transparent 70%)",
              }} />

              <div style={{
                fontSize: "10px", letterSpacing: "5px", color: "#661100",
                marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ animation: "blink 1s infinite", color: "#cc2200" }}>●</span>
                FILE UNLOCKED
              </div>

              <div style={{
                fontSize: "clamp(20px, 4vw, 30px)",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: "normal",
                color: "#f0e8e0",
                marginBottom: "4px",
                lineHeight: "1.2",
              }}>
                {result.movie}
              </div>

              <div style={{ color: "#cc2200", fontSize: "12px", letterSpacing: "4px", marginBottom: "20px", fontFamily: "monospace" }}>
                {result.year}
              </div>

              <div style={{ display: "flex", borderTop: "1px solid #1a0808", paddingTop: "16px", flexWrap: "wrap", gap: "0" }}>
                <div style={{ flex: 1, minWidth: "140px", paddingRight: "20px", borderRight: "1px solid #1a0808", marginRight: "20px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#ff2a2a", marginBottom: "6px" }}>CHARACTER</div>
                  <div style={{ color: "#ffffff", fontSize: "14px" }}>{result.character}</div>
                </div>
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <div style={{ fontSize: "9px", letterSpacing: "4px", color: "#ff2a2a", marginBottom: "6px" }}>PORTRAYED BY</div>
                  <div style={{ color: "#ffffff", fontSize: "14px" }}>{result.actor}</div>
                </div>
              </div>
            </div>

            {/* Section cards */}
            {sections.map(s => (
              <div
                key={s.key}
                className="section-card"
                onClick={() => setActiveSection(activeSection === s.key ? null : s.key)}
                style={{
                  background: activeSection === s.key ? "#100808" : "#0c0608",
                  border: "1px solid " + (activeSection === s.key ? "#3a0a08" : s.key === "wildPerspective" ? "#2a0a08" : "#1a0808"),
                  padding: "18px 22px",
                  marginBottom: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
              >
                {s.key === "wildPerspective" && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0, width: "3px",
                    background: "#cc2200",
                  }} />
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "16px" }}>{s.icon}</span>
                    <span style={{
                      fontSize: "10px",
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: activeSection === s.key ? "#cc2200" : s.key === "wildPerspective" ? "#661100" : "#4a3030",
                      fontWeight: s.key === "wildPerspective" ? "bold" : "normal",
                    }}>
                      {s.label}
                      {s.key === "wildPerspective" && (
                        <span style={{ color: "#cc2200", marginLeft: "8px" }}>*</span>
                      )}
                    </span>
                  </div>
                  <span style={{
                    color: activeSection === s.key ? "#cc2200" : "#ff2a2a",
                    fontSize: "14px",
                    display: "inline-block",
                    transform: activeSection === s.key ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}>
                    v
                  </span>
                </div>

                {activeSection === s.key && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1a0808" }}>
                    {s.key === "quoteAccuracy" ? (
                      <div>
                        <p style={{ margin: "0 0 14px", color: "#a09090", lineHeight: "1.8", fontSize: "14px" }}>
                          {result.quoteAccuracy}
                        </p>
                        <div style={{
                          background: "#080608",
                          borderLeft: "3px solid #cc2200",
                          padding: "14px 18px",
                          fontStyle: "italic",
                          color: "#f0e8e0",
                          fontSize: "16px",
                          fontFamily: "Georgia, serif",
                          lineHeight: "1.6",
                        }}>
                          "{result.exactQuote}"
                        </div>
                      </div>
                    ) : s.key === "socialMedia" ? (
                      <div>
                        <div style={{
                          background: "#080608",
                          border: "1px solid #1a0808",
                          padding: "18px",
                          fontSize: "15px",
                          fontStyle: "italic",
                          fontFamily: "Georgia, serif",
                          color: "#f0e8e0",
                          lineHeight: "1.7",
                          marginBottom: "12px",
                        }}>
                          {result.socialMedia}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); copyToClipboard(result.socialMedia); }}
                          style={{
                            background: "transparent",
                            border: "1px solid " + (copied ? "#cc2200" : "#1a0808"),
                            color: copied ? "#cc2200" : "#ff2a2a",
                            padding: "8px 16px",
                            fontFamily: "monospace",
                            fontSize: "10px",
                            letterSpacing: "3px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          {copied ? "TRANSMITTED" : "COPY AND BROADCAST"}
                        </button>
                      </div>
                    ) : (
                      <p style={{
                        margin: 0,
                        color: s.key === "wildPerspective" ? "#c8b8b0" : "#a09090",
                        lineHeight: "1.9",
                        fontSize: s.key === "wildPerspective" ? "15px" : "14px",
                        fontFamily: s.key === "wildPerspective" ? "Georgia, serif" : "monospace",
                        fontStyle: s.key === "wildPerspective" ? "italic" : "normal",
                      }}>
                        {result[s.key]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Reset */}
            <button
              onClick={() => { setResult(null); setQuote(""); setActiveSection(null); }}
              style={{
                marginTop: "20px",
                background: "transparent",
                border: "1px solid #1a0808",
                color: "#ff2a2a",
                padding: "14px",
                fontFamily: "monospace",
                fontSize: "10px",
                letterSpacing: "5px",
                cursor: "pointer",
                width: "100%",
                textTransform: "uppercase",
                transition: "all 0.2s",
              }}
              onMouseOver={e => { e.target.style.borderColor = "#661100"; e.target.style.color = "#661100"; }}
              onMouseOut={e => { e.target.style.borderColor = "#1a0808"; e.target.style.color = "#2a1010"; }}
            >
              EJECT AND REWIND
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
