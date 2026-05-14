import { useState, useEffect } from "react";

const PROFILE = {
  name: "Emmanuel Aghedo",
  location: "BS34, Bristol, United Kingdom",
  phone: "+4407888317704",
  email: "aghedoemmanuel67@yahoo.com",
  linkedin: "https://www.linkedin.com/in/emmanuel-aghedo-14a819172/",
  portfolio: "https://www.amdari.io/profile/emmanuel-aghedo-6663",
  github: "https://github.com/Aghedo67",
  summary: `Strategic and results-driven Data Scientist with several years of experience delivering data-powered solutions across real estate, insurance, and sales sectors. Proven expertise in machine learning, predictive analytics, and statistical modelling. Skilled in transforming complex data into actionable insights through end-to-end data pipelines, robust data engineering, and compelling data visualizations.`,
  skills: ["Python", "R", "SQL", "Power BI", "Tableau", "Machine Learning", "Deep Learning", "NLP/LLMs", "AWS", "Azure", "Scikit-Learn", "XGBoost", "TensorFlow", "Streamlit", "Snowflake", "Computer Vision", "Data Visualization", "Forecasting & Predictive Analytics"],
  experience: [
    { role: "Data Science Consultant", company: "AMDARI", period: "April 2025 – Present", bullets: ["Delivered end-to-end data science consultancy projects for clients across multiple sectors.", "Built and deployed machine learning models to solve real-world business problems.", "Communicated insights and recommendations to technical and non-technical stakeholders."] },
    { role: "Data Scientist", company: "Dig Data (NHS/Experian)", period: "April 2025 – June 2025", bullets: ["Analysed large-scale healthcare and financial datasets to extract actionable insights.", "Developed predictive models supporting NHS operational decision-making.", "Collaborated with cross-functional teams to deliver data-driven solutions."] },
    { role: "Commercial Data Scientist", company: "LandWey Investment Limited", period: "June 2020 – August 2024", bullets: ["Built ML models to forecast property valuations and investment risks.", "Designed Power BI dashboards tracking KPIs for senior leadership.", "Automated data pipelines reducing manual reporting effort by 60%."] },
  ],
  education: [
    { degree: "M.Sc Data Science", institution: "University of the West of England (UWE)" },
    { degree: "B.Sc Mathematics", institution: "University of Benin (UNIBEN)" },
  ],
};

const TABS = ["Cover Letter", "CV Tailor", "Application Tracker", "Quick Apply"];

const STATUS_COLORS = {
  "Applied": "#4ade80", "Interview": "#facc15", "Offer": "#60a5fa", "Rejected": "#f87171", "Saved": "#a78bfa",
};

// ── CV Tailor Tab ─────────────────────────────────────────────────────────────
function CVTailorTab() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailored, setTailored] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function tailorCV() {
    if (!jobTitle || !jobDesc) return;
    setLoading(true);
    setTailored(null);
    try {
      const prompt = `You are an expert CV writer and career coach. Tailor the following CV to best match the job description provided. 

ORIGINAL CV:
Name: ${PROFILE.name}
Location: ${PROFILE.location} | Phone: ${PROFILE.phone} | Email: ${PROFILE.email}
LinkedIn: ${PROFILE.linkedin} | Portfolio: ${PROFILE.portfolio}

PROFESSIONAL SUMMARY:
${PROFILE.summary}

SKILLS: ${PROFILE.skills.join(", ")}

EXPERIENCE:
${PROFILE.experience.map(e => `${e.role} at ${e.company} (${e.period})\n${e.bullets.map(b => `- ${b}`).join("\n")}`).join("\n\n")}

EDUCATION:
${PROFILE.education.map(e => `${e.degree} – ${e.institution}`).join("\n")}

JOB TO APPLY FOR:
Title: ${jobTitle}
Company: ${company || "Not specified"}
Description: ${jobDesc}

INSTRUCTIONS:
1. Rewrite the Professional Summary to directly mirror key language and priorities from the job description.
2. Reorder and emphasise the most relevant skills for this specific role. Remove or demote less relevant ones.
3. Rewrite experience bullet points to highlight achievements and responsibilities most relevant to this job. Use keywords from the job description naturally. Keep 3 bullets per role.
4. Keep education as-is.
5. Return ONLY the tailored CV in clean plain text format using these exact section headers: PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, EDUCATION. No preamble or explanation.`;

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "Error tailoring CV.";
      setTailored(text);
    } catch {
      setTailored("Error tailoring CV. Please try again.");
    }
    setLoading(false);
  }

  const fullCV = tailored ? `${PROFILE.name}
${PROFILE.location} | ${PROFILE.phone} | ${PROFILE.email}
LinkedIn: ${PROFILE.linkedin} | Portfolio: ${PROFILE.portfolio}

${tailored}` : "";

  function copyCV() {
    navigator.clipboard.writeText(fullCV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCV() {
    const blob = new Blob([fullCV], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Emmanuel_Aghedo_CV_${jobTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse sections for highlighted display
  function parseSections(text) {
    const headers = ["PROFESSIONAL SUMMARY", "SKILLS", "EXPERIENCE", "EDUCATION"];
    const parts = [];
    let remaining = text;
    headers.forEach(h => {
      const idx = remaining.indexOf(h);
      if (idx === -1) return;
      if (idx > 0) parts.push({ type: "text", content: remaining.slice(0, idx) });
      const nextIdx = headers.reduce((min, hh) => {
        if (hh === h) return min;
        const i = remaining.indexOf(hh, idx + h.length);
        return i !== -1 && i < min ? i : min;
      }, Infinity);
      const end = nextIdx === Infinity ? remaining.length : nextIdx;
      parts.push({ type: "section", header: h, content: remaining.slice(idx + h.length, end).trim() });
      remaining = remaining.slice(end);
    });
    if (remaining.trim()) parts.push({ type: "text", content: remaining });
    return parts;
  }

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <div style={{ flex: "1", minWidth: "280px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Job Title *</label>
          <input style={inputStyle} placeholder="e.g. Senior Data Scientist" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Company Name</label>
          <input style={inputStyle} placeholder="e.g. DeepMind (optional)" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Job Description *</label>
          <textarea
            style={{ ...inputStyle, height: "200px", resize: "vertical", fontFamily: "inherit" }}
            placeholder="Paste the full job description here..."
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
          />
        </div>
        <button style={btnStyle} onClick={tailorCV} disabled={loading || !jobTitle || !jobDesc}>
          {loading ? "✦ Tailoring..." : "✦ Tailor My CV"}
        </button>
        {tailored && (
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={copyCV} style={{ ...smallBtnStyle, background: copied ? "#4ade8022" : "#1e293b", color: copied ? "#4ade80" : "#94a3b8", flex: 1 }}>
              {copied ? "✓ Copied!" : "📋 Copy CV"}
            </button>
            <button onClick={downloadCV} style={{ ...smallBtnStyle, background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144", flex: 1 }}>
              ⬇ Download .txt
            </button>
          </div>
        )}
      </div>

      <div style={{ flex: "1.4", minWidth: "300px" }}>
        <label style={{ ...labelStyle, marginBottom: "10px" }}>Tailored CV Preview</label>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "20px", minHeight: "380px", maxHeight: "480px", overflowY: "auto", fontSize: "13px", lineHeight: "1.75", color: "#cbd5e1" }}>
          {loading && <span style={{ color: "#475569" }}>Tailoring your CV to this role...</span>}
          {!loading && !tailored && (
            <span style={{ color: "#334155" }}>Your tailored CV will appear here. Skills and bullet points will be reordered and rewritten to match the job description.</span>
          )}
          {tailored && (() => {
            const sections = parseSections(tailored);
            return (
              <div>
                <div style={{ borderBottom: "1px solid #1e293b", paddingBottom: "12px", marginBottom: "16px" }}>
                  <div style={{ fontWeight: "700", color: "#f1f5f9", fontSize: "15px" }}>{PROFILE.name}</div>
                  <div style={{ color: "#64748b", fontSize: "12px", marginTop: "3px" }}>{PROFILE.location} · {PROFILE.email} · {PROFILE.phone}</div>
                </div>
                {sections.map((s, i) =>
                  s.type === "section" ? (
                    <div key={i} style={{ marginBottom: "16px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px", borderBottom: "1px solid #1e293b", paddingBottom: "4px" }}>{s.header}</div>
                      <div style={{ whiteSpace: "pre-wrap", color: "#94a3b8" }}>{s.content}</div>
                    </div>
                  ) : (
                    <div key={i} style={{ whiteSpace: "pre-wrap", color: "#64748b" }}>{s.content}</div>
                  )
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ── Cover Letter Tab ──────────────────────────────────────────────────────────
function CoverLetterTab() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generateLetter() {
    if (!jobTitle || !company || !jobDesc) return;
    setLoading(true);
    setLetter("");
    try {
      const prompt = `You are a professional cover letter writer. Write a compelling, tailored cover letter for the following applicant applying to a specific job.

APPLICANT PROFILE:
Name: ${PROFILE.name}
Location: ${PROFILE.location}
Email: ${PROFILE.email}
Summary: ${PROFILE.summary}
Skills: ${PROFILE.skills.join(", ")}
Experience: ${PROFILE.experience.map(e => `${e.role} at ${e.company} (${e.period})`).join("; ")}
Education: ${PROFILE.education.map(e => `${e.degree} – ${e.institution}`).join("; ")}

JOB DETAILS:
Job Title: ${jobTitle}
Company: ${company}
Job Description: ${jobDesc}

Write a 3-4 paragraph professional cover letter. Match specific skills and experiences to the job requirements. Be enthusiastic but professional. Do not use generic filler. End with a confident call to action. Start with "Dear Hiring Manager," and sign off with the applicant's name.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await response.json();
      setLetter(data.content?.map(b => b.text || "").join("\n") || "Error generating letter.");
    } catch { setLetter("Error generating cover letter. Please try again."); }
    setLoading(false);
  }

  function copyToClipboard() { navigator.clipboard.writeText(letter); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  function openInMail() {
    const subject = encodeURIComponent(`Application for ${jobTitle} – ${PROFILE.name}`);
    const body = encodeURIComponent(`${letter}\n\n---\n${PROFILE.name}\n${PROFILE.phone}\n${PROFILE.email}\nLinkedIn: ${PROFILE.linkedin}\nPortfolio: ${PROFILE.portfolio}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <div style={{ flex: "1", minWidth: "280px" }}>
        <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Job Title</label><input style={inputStyle} placeholder="e.g. Senior Data Scientist" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div>
        <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Company Name</label><input style={inputStyle} placeholder="e.g. DeepMind" value={company} onChange={e => setCompany(e.target.value)} /></div>
        <div style={{ marginBottom: "20px" }}><label style={labelStyle}>Job Description</label><textarea style={{ ...inputStyle, height: "180px", resize: "vertical", fontFamily: "inherit" }} placeholder="Paste the job description here..." value={jobDesc} onChange={e => setJobDesc(e.target.value)} /></div>
        <button style={btnStyle} onClick={generateLetter} disabled={loading || !jobTitle || !company || !jobDesc}>{loading ? "✦ Generating..." : "✦ Generate Cover Letter"}</button>
      </div>
      <div style={{ flex: "1.4", minWidth: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label style={labelStyle}>Generated Letter</label>
          {letter && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={copyToClipboard} style={{ ...smallBtnStyle, background: copied ? "#4ade8022" : "#1e293b", color: copied ? "#4ade80" : "#94a3b8" }}>{copied ? "✓ Copied!" : "📋 Copy"}</button>
              <button onClick={openInMail} style={{ ...smallBtnStyle, background: "#6366f122", color: "#818cf8", border: "1px solid #6366f144" }}>✉️ Open in Mail</button>
            </div>
          )}
        </div>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "20px", minHeight: "340px", fontSize: "13.5px", lineHeight: "1.8", color: loading ? "#475569" : "#cbd5e1", whiteSpace: "pre-wrap", overflowY: "auto", maxHeight: "420px" }}>
          {loading ? "Crafting your letter..." : letter || <span style={{ color: "#334155" }}>Your tailored cover letter will appear here...</span>}
        </div>
      </div>
    </div>
  );
}

// ── Tracker Tab ───────────────────────────────────────────────────────────────
function TrackerTab() {
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState({ company: "", role: "", date: "", status: "Applied", link: "", notes: "" });
  const [adding, setAdding] = useState(false);

  function addApp() {
    if (!form.company || !form.role) return;
    setApps(prev => [{ ...form, id: Date.now(), date: form.date || new Date().toISOString().slice(0, 10) }, ...prev]);
    setForm({ company: "", role: "", date: "", status: "Applied", link: "", notes: "" });
    setAdding(false);
  }
  function updateStatus(id, status) { setApps(prev => prev.map(a => a.id === id ? { ...a, status } : a)); }
  function deleteApp(id) { setApps(prev => prev.filter(a => a.id !== id)); }
  const stats = Object.keys(STATUS_COLORS).map(s => ({ label: s, count: apps.filter(a => a.status === s).length }));

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#0f172a", border: `1px solid ${STATUS_COLORS[s.label]}33`, borderRadius: "8px", padding: "10px 18px", flex: "1", minWidth: "80px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: "700", color: STATUS_COLORS[s.label] }}>{s.count}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 18px", flex: "1", minWidth: "80px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#e2e8f0" }}>{apps.length}</div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Total</div>
        </div>
      </div>
      {adding ? (
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div><label style={labelStyle}>Company *</label><input style={inputStyle} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" /></div>
            <div><label style={labelStyle}>Role *</label><input style={inputStyle} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Job title" /></div>
            <div><label style={labelStyle}>Date Applied</label><input style={inputStyle} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div><label style={labelStyle}>Status</label><select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: "12px" }}><label style={labelStyle}>Job Link</label><input style={inputStyle} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://..." /></div>
          <div style={{ marginBottom: "16px" }}><label style={labelStyle}>Notes</label><textarea style={{ ...inputStyle, height: "70px", resize: "vertical", fontFamily: "inherit" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Recruiter name, follow-up date, etc." /></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={btnStyle} onClick={addApp}>Save Application</button>
            <button style={{ ...smallBtnStyle, padding: "10px 16px" }} onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <button style={{ ...btnStyle, marginBottom: "20px" }} onClick={() => setAdding(true)}>+ Add Application</button>
      )}
      {apps.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#334155" }}>No applications tracked yet. Add your first one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {apps.map(app => (
            <div key={app.id} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
              <div style={{ flex: "1", minWidth: "160px" }}>
                <div style={{ fontWeight: "600", color: "#e2e8f0", fontSize: "14px" }}>{app.role}</div>
                <div style={{ color: "#64748b", fontSize: "12px", marginTop: "2px" }}>{app.company} · {app.date}</div>
                {app.notes && <div style={{ color: "#475569", fontSize: "11.5px", marginTop: "4px" }}>{app.notes}</div>}
              </div>
              {app.link && <a href={app.link} target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: "12px", textDecoration: "none" }}>↗ View</a>}
              <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)} style={{ background: `${STATUS_COLORS[app.status]}18`, border: `1px solid ${STATUS_COLORS[app.status]}55`, color: STATUS_COLORS[app.status], borderRadius: "6px", padding: "4px 10px", fontSize: "12px", cursor: "pointer" }}>
                {Object.keys(STATUS_COLORS).map(s => <option key={s} style={{ background: "#0f172a", color: "#e2e8f0" }}>{s}</option>)}
              </select>
              <button onClick={() => deleteApp(app.id)} style={{ background: "none", border: "none", color: "#334155", cursor: "pointer", fontSize: "16px", padding: "4px" }}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quick Apply Tab ───────────────────────────────────────────────────────────
function QuickApplyTab() {
  const fields = [
    { label: "Full Name", value: PROFILE.name }, { label: "Email", value: PROFILE.email },
    { label: "Phone", value: PROFILE.phone }, { label: "Location", value: PROFILE.location },
    { label: "LinkedIn", value: PROFILE.linkedin }, { label: "Portfolio", value: PROFILE.portfolio },
    { label: "GitHub", value: PROFILE.github }, { label: "Current Role", value: "Data Science Consultant at AMDARI" },
    { label: "Years of Experience", value: "5+" }, { label: "Highest Education", value: "M.Sc Data Science – University of the West of England" },
    { label: "Key Skills (comma-sep)", value: PROFILE.skills.join(", ") }, { label: "Notice Period", value: "Available immediately" },
    { label: "Right to Work (UK)", value: "Yes" },
  ];
  const [copied, setCopied] = useState(null);
  function copyField(i, val) { navigator.clipboard.writeText(val); setCopied(i); setTimeout(() => setCopied(null), 1500); }

  return (
    <div>
      <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>Click any field to copy it instantly for pasting into online application forms.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
        {fields.map((f, i) => (
          <div key={i} onClick={() => copyField(i, f.value)} style={{ background: copied === i ? "#4ade8010" : "#0f172a", border: `1px solid ${copied === i ? "#4ade8055" : "#1e293b"}`, borderRadius: "10px", padding: "12px 16px", cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontSize: "10px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{f.label}</div>
            <div style={{ fontSize: "13px", color: copied === i ? "#4ade80" : "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{copied === i ? "✓ Copied!" : f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const labelStyle = { display: "block", fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" };
const inputStyle = { width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "10px 14px", color: "#e2e8f0", fontSize: "13.5px", outline: "none", boxSizing: "border-box" };
const btnStyle = { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", border: "none", borderRadius: "8px", padding: "11px 22px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.02em" };
const smallBtnStyle = { background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" };

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "32px 20px", color: "#e2e8f0" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Job Application Hub</h1>
              <div style={{ fontSize: "12px", color: "#475569", marginTop: "1px" }}>Emmanuel Aghedo · Data Scientist</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px", background: "#0f172a", borderRadius: "10px", padding: "4px", marginBottom: "28px", width: "fit-content", flexWrap: "wrap" }}>
          {TABS.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{ background: activeTab === i ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", color: activeTab === i ? "#fff" : "#64748b", border: "none", borderRadius: "7px", padding: "8px 18px", fontSize: "13px", fontWeight: activeTab === i ? "600" : "400", cursor: "pointer", transition: "all 0.2s" }}>{tab}</button>
          ))}
        </div>
        <div style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: "14px", padding: "28px" }}>
          {activeTab === 0 && <CoverLetterTab />}
          {activeTab === 1 && <CVTailorTab />}
          {activeTab === 2 && <TrackerTab />}
          {activeTab === 3 && <QuickApplyTab />}
        </div>
      </div>
    </div>
  );
}
