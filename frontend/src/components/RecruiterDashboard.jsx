import React, { useState, useEffect } from "react";

export function RecruiterDashboard({ apiBaseUrl = "http://127.0.0.1:8000/api/v1" }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidatesData, setCandidatesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shortlistNotes, setShortlistNotes] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/recruiter/jobs`, {
        headers: { "X-User-Role": "recruiter" }
      });
      const data = await res.json();
      setJobs(data.jobs || []);
      if (data.jobs && data.jobs.length > 0) {
        selectJob(data.jobs[0].job_id);
      }
    } catch (e) {
      console.error("Failed to load recruiter jobs:", e);
    }
  };

  const selectJob = async (jobId) => {
    setSelectedJob(jobId);
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/recruiter/jobs/${jobId}/candidates`, {
        headers: { "X-User-Role": "recruiter" }
      });
      const data = await res.json();
      setCandidatesData(data.data || null);
    } catch (e) {
      console.error("Failed to fetch ranked candidates:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateShortlist = async (studentId, status) => {
    const note = shortlistNotes[studentId] || "Qualified match";
    try {
      const res = await fetch(`${apiBaseUrl}/recruiter/shortlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Role": "recruiter"
        },
        body: JSON.stringify({
          job_id: selectedJob,
          student_id: studentId,
          status,
          notes: note
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        selectJob(selectedJob); // Refresh
      }
    } catch (e) {
      console.error("Shortlist update failed:", e);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Recruiter Candidate Matching & Pipeline</h1>
          <p className="text-sm text-slate-500">Explainable AI match scoring • Strict candidate privacy consent</p>
        </div>
        <span className="bg-teal-50 text-teal-700 text-xs px-3 py-1 rounded-full font-semibold border border-teal-200">
          Recruiter Persona Active
        </span>
      </div>

      {/* Job Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500">Select Job Requisition:</label>
          <select 
            value={selectedJob || ""} 
            onChange={(e) => selectJob(e.target.value)}
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white"
          >
            {jobs.map(j => (
              <option key={j.job_id} value={j.job_id}>
                {j.title} ({j.company}) - Min {j.min_readiness_score}%
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400">Excludes unconsented candidates automatically</span>
      </div>

      {/* Candidate Ranking List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Computing explainable candidate match ranking...</div>
      ) : candidatesData && candidatesData.candidates && candidatesData.candidates.length > 0 ? (
        <div className="space-y-4">
          {candidatesData.candidates.map((c) => (
            <div key={c.student_id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{c.candidate_alias}</h3>
                    <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      Consented
                    </span>
                    <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded border border-teal-200 font-semibold">
                      {c.confidence} Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.department} • Batch {c.batch} • Target: {c.target_role}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-400 uppercase">Match Score</div>
                  <div className="text-3xl font-extrabold text-teal-600">{c.match_score}%</div>
                </div>
              </div>

              {/* Skills matched vs missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-emerald-700 block mb-1">✓ Matched Requirements:</span>
                  <div className="flex flex-wrap gap-1">
                    {c.matched_skills.map((m, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                        {m.skill}: {m.candidate_score}%
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-rose-700 block mb-1">⚠ Shortfalls:</span>
                  <div className="flex flex-wrap gap-1">
                    {c.missing_skills.length === 0 ? (
                      <span className="text-emerald-600">Zero shortfalls</span>
                    ) : (
                      c.missing_skills.map((g, idx) => (
                        <span key={idx} className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                          {g.skill}: -{g.shortfall} pts
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Explainable Text */}
              <div className="bg-slate-100 p-3 rounded text-xs text-slate-700">
                <strong>Explainable Match Reasoning:</strong> {c.explanation}
              </div>

              {/* Shortlist Action */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-semibold text-slate-500">
                  Status: <strong className="text-teal-700 uppercase">{c.shortlist_status}</strong>
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => updateShortlist(c.student_id, "shortlisted")}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                  >
                    Shortlist
                  </button>
                  <button 
                    onClick={() => updateShortlist(c.student_id, "interview_scheduled")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
                  >
                    Schedule Interview
                  </button>
                  <button 
                    onClick={() => updateShortlist(c.student_id, "rejected")}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded transition"
                  >
                    Pass
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-600">No candidates currently match defined job thresholds.</p>
        </div>
      )}
    </div>
  );
}

export default RecruiterDashboard;
