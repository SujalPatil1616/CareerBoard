import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness, LayoutDashboard, ListChecks, Search, Plus, RefreshCw,
  ExternalLink, Pencil, Trash2, X, CalendarDays, Building2, CircleCheck,
  Clock3, Send, TrendingUp, Filter, Sparkles, ChevronDown, AlertCircle
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api/applications";
const STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const emptyForm = { company: "", role: "", jobUrl: "", status: "APPLIED", appliedDate: new Date().toISOString().slice(0, 10), notes: "" };

function prettyStatus(status = "") {
  return status.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
function shortDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ApplicationModal({ item, onClose, onSave, saving }) {
  const [form, setForm] = useState(item ? {
    company: item.company || "", role: item.role || "", jobUrl: item.jobUrl || "",
    status: item.status || "APPLIED", appliedDate: item.appliedDate || "", notes: item.notes || ""
  } : emptyForm);
  const [error, setError] = useState("");
  function update(key, value) { setForm(old => ({ ...old, [key]: value })); }
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.company.trim() || !form.role.trim()) {
      setError("Company and role are required.");
      return;
    }
    try { await onSave(form); } catch (e) { setError(e.message || "Could not save application."); }
  }
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit}>
      <div className="modal-head">
        <div><div className="eyebrow">{item ? "UPDATE RECORD" : "NEW OPPORTUNITY"}</div><h2>{item ? "Edit application" : "Add application"}</h2><p>Keep your job search organized.</p></div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={19}/></button>
      </div>
      <div className="form-grid">
        <label>Company name *<input autoFocus value={form.company} onChange={e => update("company", e.target.value)} placeholder="e.g. Google" maxLength="120" required /></label>
        <label>Job title *<input value={form.role} onChange={e => update("role", e.target.value)} placeholder="e.g. Software Engineer" maxLength="120" required /></label>
        <label>Application status<select value={form.status} onChange={e => update("status", e.target.value)}>{STATUSES.map(s => <option key={s} value={s}>{prettyStatus(s)}</option>)}</select></label>
        <label>Applied date<input type="date" value={form.appliedDate} onChange={e => update("appliedDate", e.target.value)} /></label>
        <label className="span-two">Job posting URL<input type="url" value={form.jobUrl} onChange={e => update("jobUrl", e.target.value)} placeholder="https://company.com/careers/job" maxLength="500" /></label>
        <label className="span-two">Notes<textarea value={form.notes} onChange={e => update("notes", e.target.value)} placeholder="Recruiter details, interview preparation, next steps…" rows="3" maxLength="2000" /></label>
      </div>
      {error && <div className="inline-error"><AlertCircle size={16}/>{error}</div>}
      <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : item ? "Save changes" : "Add application"}</button></div>
    </form>
  </div>;
}

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalItem, setModalItem] = useState(undefined);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error(`API returned ${response.status}. Make sure the Spring Boot backend and MySQL are running.`);
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Could not connect to the backend.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter(a => a.status === "APPLIED").length,
    interviews: applications.filter(a => a.status === "INTERVIEW").length,
    offers: applications.filter(a => a.status === "OFFER").length
  }), [applications]);

  const filtered = useMemo(() => applications.filter(a => {
    const text = `${a.company || ""} ${a.role || ""} ${a.notes || ""}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (statusFilter === "ALL" || a.status === statusFilter);
  }).sort((a, b) => (b.appliedDate || "").localeCompare(a.appliedDate || "") || b.id - a.id), [applications, query, statusFilter]);

  async function saveApplication(form) {
    setSaving(true);
    try {
      const editing = modalItem && modalItem !== "new";
      const url = editing ? `${API}/${modalItem.id}` : API;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, appliedDate: form.appliedDate || null, jobUrl: form.jobUrl || null, notes: form.notes || null })
      });
      if (!response.ok) {
        let message = `Request failed (${response.status}).`;
        try { const body = await response.json(); message = body.details?.join(", ") || body.error || message; } catch {}
        throw new Error(message);
      }
      setModalItem(undefined);
      setNotice(editing ? "Application updated successfully." : "Application added successfully.");
      await load();
      setTimeout(() => setNotice(""), 3000);
    } finally { setSaving(false); }
  }

  async function removeApplication(item) {
    if (!window.confirm(`Delete the ${item.role} application at ${item.company}? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API}/${item.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Could not delete application (${response.status}).`);
      setNotice("Application deleted.");
      await load();
      setTimeout(() => setNotice(""), 3000);
    } catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BriefcaseBusiness size={21}/></div><div><strong>CareerBoard</strong><span>JOB SEARCH WORKSPACE</span></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className="nav-item active"><LayoutDashboard size={18}/> Overview</button>
      <button className="nav-item" onClick={() => { setStatusFilter("ALL"); document.getElementById("applications")?.scrollIntoView({ behavior: "smooth" }); }}><ListChecks size={18}/> Applications <span className="nav-count">{applications.length}</span></button>
      <div className="sidebar-bottom"><div className="tip-card"><div className="tip-icon"><Sparkles size={17}/></div><strong>Small steps, big career.</strong><p>Keep every opportunity moving forward.</p></div><div className="profile"><div className="avatar">JS</div><div><strong>Job seeker</strong><span>Personal workspace</span></div><ChevronDown size={16}/></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="top-actions"><span className="live-dot"></span><span>Local workspace</span><button className="icon-btn" onClick={load} title="Refresh data"><RefreshCw size={17}/></button></div></header>
      <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"></span> YOUR CAREER, IN FOCUS</div><h1>Good work starts with <span>a plan.</span></h1><p>One clear view of every opportunity you're pursuing.</p></div><button className="btn btn-primary add-top" onClick={() => setModalItem("new")}><Plus size={18}/> Add application</button></section>

      {notice && <div className="toast"><CircleCheck size={17}/>{notice}</div>}
      {error && <div className="error-banner"><AlertCircle size={18}/><div><strong>Couldn't load the applications</strong><p>{error}</p><span>Check that MySQL is running and the Spring Boot API is available at localhost:8080.</span></div><button className="btn btn-ghost" onClick={load}>Retry</button></div>}

      <section className="stats-grid">
        <div className="stat-card stat-total"><div className="stat-top"><span>Total applications</span><div className="stat-icon"><BriefcaseBusiness size={18}/></div></div><div className="stat-number">{loading ? "—" : stats.total}</div><div className="stat-foot"><TrendingUp size={14}/> All tracked opportunities</div></div>
        <div className="stat-card"><div className="stat-top"><span>Applied</span><div className="stat-icon blue"><Send size={18}/></div></div><div className="stat-number">{loading ? "—" : stats.applied}</div><div className="stat-foot">Waiting for a response</div></div>
        <div className="stat-card"><div className="stat-top"><span>Interviews</span><div className="stat-icon violet"><CalendarDays size={18}/></div></div><div className="stat-number">{loading ? "—" : stats.interviews}</div><div className="stat-foot">Conversations in progress</div></div>
        <div className="stat-card"><div className="stat-top"><span>Offers</span><div className="stat-icon green"><CircleCheck size={18}/></div></div><div className="stat-number">{loading ? "—" : stats.offers}</div><div className="stat-foot">Opportunities converted</div></div>
      </section>

      <section className="applications-section" id="applications">
        <div className="section-heading"><div><div className="eyebrow">YOUR PIPELINE</div><h2>Applications <span className="count-pill">{filtered.length}</span></h2><p>Review progress and keep your next step close.</p></div><button className="btn btn-secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>
        <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search company, role or notes…" /></div><div className="filter-box"><Filter size={16}/><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All statuses</option>{STATUSES.map(s => <option key={s} value={s}>{prettyStatus(s)}</option>)}</select></div></div>
        <div className="table-wrap"><table><thead><tr><th>COMPANY / ROLE</th><th>STATUS</th><th>APPLIED DATE</th><th>JOB LINK</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
          {loading ? <tr><td colSpan="5"><div className="empty-state"><RefreshCw className="spin" size={22}/><strong>Loading applications…</strong></div></td></tr>
          : filtered.length === 0 ? <tr><td colSpan="5"><div className="empty-state"><div className="empty-illustration"><Building2 size={25}/></div><strong>{applications.length ? "No matching applications" : "Your next opportunity starts here"}</strong><p>{applications.length ? "Try another search or status filter." : "Add your first job application to start tracking your progress."}</p>{!applications.length && <button className="btn btn-primary" onClick={() => setModalItem("new")}><Plus size={17}/> Add first application</button>}</div></td></tr>
          : filtered.map(item => <tr key={item.id}><td><div className="company-cell"><div className="company-avatar">{(item.company || "?").slice(0,1).toUpperCase()}</div><div><strong>{item.company}</strong><span>{item.role}</span></div></div></td><td><span className={`status-badge status-${(item.status || "applied").toLowerCase()}`}><span></span>{prettyStatus(item.status)}</span></td><td><div className="date-cell"><CalendarDays size={14}/>{shortDate(item.appliedDate)}</div></td><td>{item.jobUrl ? <a className="job-link" href={item.jobUrl} target="_blank" rel="noreferrer">View job <ExternalLink size={13}/></a> : <span className="muted">No link</span>}</td><td><div className="row-actions"><button className="icon-btn edit" title="Edit application" onClick={() => setModalItem(item)}><Pencil size={16}/></button><button className="icon-btn delete" title="Delete application" onClick={() => removeApplication(item)}><Trash2 size={16}/></button></div></td></tr>)}
        </tbody></table></div>
        <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{applications.length}</strong> applications</span><span><span className="live-dot"></span> Synced with your backend</span></div>
      </section>
      <footer className="footer"><span>CareerBoard <span>·</span> Job Application Tracker</span><span>Built with React, Spring Boot & MySQL</span></footer>
    </main>
    {modalItem !== undefined && <ApplicationModal item={modalItem === "new" ? null : modalItem} onClose={() => setModalItem(undefined)} onSave={saveApplication} saving={saving}/>}
  </div>;
}

export default App;