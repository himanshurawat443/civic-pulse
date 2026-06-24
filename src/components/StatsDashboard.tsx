import { useEffect, useState } from "react";
import { CivicIssue, CommunityForecast } from "../types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Sparkles, Brain, AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface StatsDashboardProps {
  issues: CivicIssue[];
  forecast: CommunityForecast | null;
  loadingForecast: boolean;
  onRefreshForecast: () => void;
}

export default function StatsDashboard({
  issues,
  forecast,
  loadingForecast,
  onRefreshForecast
}: StatsDashboardProps) {
  // Compute basic stats
  const activeIssues = issues.filter(i => i.status !== "Resolved");
  const resolvedCount = issues.filter(i => i.status === "Resolved").length;
  const verifiedCount = issues.filter(i => i.status !== "Reported" && i.status !== "Resolved").length;

  const totalReports = issues.length;
  const verificationRate = totalReports > 0
    ? Math.round(((issues.filter(i => i.status !== "Reported").length) / totalReports) * 100)
    : 100;

  // Prepare chart data for categories
  const categoriesList = ["Pothole", "Water Leakage", "Streetlight", "Waste Management", "Public Infrastructure", "Other"];
  const categoryChartData = categoriesList.map(cat => {
    const count = issues.filter(i => i.category === cat).length;
    return { name: cat === "Public Infrastructure" ? "Infra" : cat, count };
  });

  const categoryColors: { [key: string]: string } = {
    "Pothole": "#f59e0b",
    "Water Leakage": "#3b82f6",
    "Streetlight": "#eab308",
    "Waste Management": "#ef4444",
    "Public Infrastructure": "#10b981",
    "Other": "#64748b"
  };

  // Status chart data
  const statusCounts = {
    "Reported": issues.filter(i => i.status === "Reported").length,
    "Verified": issues.filter(i => i.status === "Verified").length,
    "Scheduled": issues.filter(i => i.status === "Scheduled").length,
    "In Progress": issues.filter(i => i.status === "In Progress").length,
    "Resolved": issues.filter(i => i.status === "Resolved").length
  };

  const statusPieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value
  })).filter(d => d.value > 0);

  const statusColors = {
    "Reported": "#94a3b8",
    "Verified": "#c084fc",
    "Scheduled": "#60a5fa",
    "In Progress": "#facc15",
    "Resolved": "#34d399"
  };

  return (
    <div className="space-y-6">
      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">ACTIVE CONCERNS</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeIssues.length}</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Open</span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">Pending city or community action</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">SUCCESSFULLY RESOLVED</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">{resolvedCount}</span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">Fixed</span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">Resolved through civic response</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">VERIFICATION RATE</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{verificationRate}%</span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Verified</span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">Citizen consensus rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-400 text-xs font-semibold tracking-wider uppercase">CITIZEN POINTS INVOLVED</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-700">1,295</span>
            <span className="text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded-full font-medium">XP</span>
          </div>
          <p className="text-slate-500 text-[11px] mt-1">Earned via validation & cleanups</p>
        </div>
      </div>

      {/* Main Insights Panel (AI Forecast & Health Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle Gauge for overall health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Community Infrastructure Health
            </h3>
            <p className="text-slate-500 text-xs mt-1">Combined health score of roads, water, lights, and waste</p>
          </div>

          <div className="my-6 flex flex-col items-center justify-center relative">
            {/* SVG Progress Circle */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-slate-100 fill-none"
                  strokeWidth="12"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                  strokeWidth="12"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - (forecast?.overallScore || 75) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800">{forecast?.overallScore || 75}</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">HEALTH INDEX</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-700">
                {(forecast?.overallScore || 75) >= 80 ? "Pristine Status" : "Attention Required"}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center">
            Updated: {forecast?.updatedAt ? new Date(forecast.updatedAt).toLocaleTimeString() : "Just now"}
          </div>
        </div>

        {/* AI Forecast Insights */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl text-white shadow-md flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-400/30">
                <Sparkles className="h-5 w-5 text-blue-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">AI Civic Health Forecast</h3>
                <p className="text-blue-200 text-xs">Real-time systemic risk prediction using Gemini AI</p>
              </div>
            </div>
            <button
              onClick={onRefreshForecast}
              disabled={loadingForecast}
              className="text-xs bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10 rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1"
            >
              <Brain className="h-3.5 w-3.5" />
              {loadingForecast ? "Analyzing..." : "Re-Analyze"}
            </button>
          </div>

          <div className="my-4 text-blue-100 text-sm leading-relaxed border-l-2 border-blue-500/40 pl-4 py-1 italic bg-blue-950/25 rounded-r-lg pr-2">
            {forecast?.aiSummary || "Generating Bengaluru ward infrastructure health summary..."}
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-blue-300 tracking-wider uppercase">UPCOMING RISKS PREVENTIVE ACTIONS</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(forecast?.predictions || []).map((pred, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-blue-200 tracking-widest uppercase">{pred.location}</span>
                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        pred.riskLevel === "High" ? "bg-red-500/20 text-red-300" :
                        pred.riskLevel === "Medium" ? "bg-amber-500/20 text-amber-300" :
                        "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {pred.riskLevel} Risk
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white line-clamp-2">{pred.title}</h4>
                    <p className="text-[10px] text-blue-200/85 mt-2 line-clamp-3">
                      💡 {pred.recommendedPreemptiveAction}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-blue-300">
                    <span>Probability:</span>
                    <span className="font-bold">{pred.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown bar chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Category Concentration</h3>
          <p className="text-slate-500 text-xs mb-4">Total reported complaints categorized by type</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "none", color: "#ffffff" }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryChartData.map((entry, index) => {
                    const originalName = categoriesList[index];
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={categoryColors[originalName] || "#64748b"}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current status breakdowns */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Issue Workflow Distribution</h3>
            <p className="text-slate-500 text-xs mb-4">Proportion of civic concerns by status step</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-44 flex justify-center">
              {statusPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColors[entry.name as keyof typeof statusColors] || "#cbd5e1"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#white" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center text-slate-400 text-xs">No active reports</div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {Object.entries(statusCounts).map(([status, val]) => (
                <div key={status} className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                    />
                    <span className="text-slate-700 font-medium">{status}</span>
                  </div>
                  <span className="text-slate-900 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-3">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span>Target resolution time: Less than 72 hours following verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
