import React, { useState, useEffect } from "react";

export function FacultyDashboard({ apiBaseUrl = "http://127.0.0.1:8000/api/v1" }) {
  const [filters, setFilters] = useState({
    department: "All",
    batch: "All",
    target_role: "All",
    skill: "All"
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams(filters).toString();
      const res = await fetch(`${apiBaseUrl}/faculty/analytics/batch?${q}`, {
        headers: { "X-User-Role": "faculty_tp" }
      });
      const json = await res.json();
      if (json.status === "error") throw new Error(json.message);
      setAnalytics(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Faculty & T&P Batch Analytics</h1>
          <p className="text-sm text-slate-500">Continuous multi-source evidence synthesis & placement readiness</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-semibold border border-indigo-200">
          [DEMO DATA - 2026 COHORT]
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Department</label>
          <select 
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white"
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science & Eng</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Data Science & AI">Data Science & AI</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Batch</label>
          <select 
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white"
            value={filters.batch}
            onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
          >
            <option value="All">All Batches</option>
            <option value="2025">Batch 2025</option>
            <option value="2026">Batch 2026</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Target Role</label>
          <select 
            className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white"
            value={filters.target_role}
            onChange={(e) => setFilters({ ...filters, target_role: e.target.value })}
          >
            <option value="All">All Roles</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
          </select>
        </div>

        <button 
          onClick={fetchAnalytics}
          className="self-end bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-4 py-2 rounded-md transition"
        >
          Refresh Analytics
        </button>
      </div>

      {/* Loading & Error States */}
      {loading && <div className="p-12 text-center text-slate-500">Loading batch analytics...</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      {/* Main Stats */}
      {analytics && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Total Students</div>
              <div className="text-3xl font-bold mt-1">{analytics.total_students}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Placement Ready</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{analytics.readiness_summary.job_ready_pct}%</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Average Readiness</div>
              <div className="text-3xl font-bold text-teal-600 mt-1">{analytics.readiness_summary.avg_readiness_score}</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Needs Upskilling</div>
              <div className="text-3xl font-bold text-rose-600 mt-1">{analytics.readiness_summary.needs_upskilling_count}</div>
            </div>
          </div>

          {/* Skill Distribution & Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold mb-4">Batch-Level Skill Distribution</h2>
              <div className="space-y-4">
                {Object.values(analytics.skill_distribution).map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{cat.category_name}</span>
                      <span>{cat.average_score}% ({cat.proficiency_band})</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full" style={{ width: `${cat.average_score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold mb-4">Common Skill Gaps vs 75% Benchmark</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="py-2 px-3">Skill</th>
                      <th className="py-2 px-3">Avg Score</th>
                      <th className="py-2 px-3">Gap</th>
                      <th className="py-2 px-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.common_skill_gaps.map((g, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 px-3 font-semibold">{g.skill}</td>
                        <td className="py-2 px-3">{g.avg_score}%</td>
                        <td className="py-2 px-3 text-red-600 font-semibold">-{g.gap} pts</td>
                        <td className="py-2 px-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                            {g.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FacultyDashboard;
