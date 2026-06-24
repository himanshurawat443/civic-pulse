import React, { useState } from "react";
import { CivicIssue } from "../types";
import {
  Search,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  AlertOctagon,
  ArrowRight,
  Plus,
  Send,
  Wrench,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface IssueListProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issue: CivicIssue | null) => void;
  onVerify: (issueId: string) => void;
  onAddComment: (issueId: string, text: string) => void;
  onAdvanceStatus: (issueId: string, note?: string) => void;
  currentUserEmail: string;
}

export default function IssueList({
  issues,
  selectedIssueId,
  onSelectIssue,
  onVerify,
  onAddComment,
  onAdvanceStatus,
  currentUserEmail
}: IssueListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const [commentText, setCommentText] = useState("");
  const [advanceNote, setAdvanceNote] = useState("");
  const [showAdvancePanel, setShowAdvancePanel] = useState(false);

  const selectedIssue = issues.find(i => i.id === selectedIssueId) || null;

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = filterCat === "All" || issue.category === filterCat;
    const matchesStatus = filterStatus === "All" || issue.status === filterStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Reported":
        return <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><AlertOctagon className="h-3 w-3" /> Reported</span>;
      case "Verified":
        return <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Community Verified</span>;
      case "Scheduled":
        return <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Calendar className="h-3 w-3" /> Scheduled</span>;
      case "In Progress":
        return <span className="text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><Wrench className="h-3 w-3 animate-spin" /> In Progress</span>;
      case "Resolved":
        return <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Resolved</span>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">Critical</span>;
      case "High":
        return <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">High</span>;
      case "Medium":
        return <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 border border-yellow-100 px-1.5 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">Low</span>;
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedIssue) return;
    onAddComment(selectedIssue.id, commentText);
    setCommentText("");
  };

  const handleAdvanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    onAdvanceStatus(selectedIssue.id, advanceNote);
    setAdvanceNote("");
    setShowAdvancePanel(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Search, Filters & Issues List (5 columns on desktop) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Search and Filters Header */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by street name, landmark, neighborhood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">CATEGORY</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full text-[11px] bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                <option value="Pothole">Potholes</option>
                <option value="Water Leakage">Water Leakages</option>
                <option value="Streetlight">Streetlights</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Public Infrastructure">Infrastructure</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">STATUS</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-[11px] bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="Verified">Verified</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* List of Issues */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              return (
                <div
                  key={issue.id}
                  onClick={() => onSelectIssue(issue)}
                  className={`bg-white rounded-xl border-t border-r border-b p-4 transition-all duration-200 cursor-pointer text-left hover:shadow-md border-l-4 ${
                    issue.status === "Reported" ? "border-l-amber-500" :
                    issue.status === "Verified" ? "border-l-blue-500" :
                    issue.status === "Scheduled" ? "border-l-purple-500" :
                    issue.status === "In Progress" ? "border-l-indigo-500" :
                    "border-l-green-500"
                  } ${
                    isSelected ? "border-t-blue-600 border-r-blue-600 border-b-blue-600 ring-1 ring-blue-600 bg-blue-50/5" : "border-t-slate-100 border-r-slate-100 border-b-slate-100"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {issue.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getSeverityBadge(issue.severity)}
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                    {issue.title}
                  </h3>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{issue.location.address} ({issue.location.neighborhood})</span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" /> {issue.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {issue.comments.length}
                      </span>
                    </div>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 border border-slate-100">
              <AlertOctagon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No issue reports match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Detailed Card Drawer/View (7 columns on desktop) */}
      <div className="lg:col-span-7">
        {selectedIssue ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 text-left">
            {/* Header: Title, Category, Action bar */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-50 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-full">
                    {selectedIssue.category}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedIssue.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedIssue.severity)}
                  {getStatusBadge(selectedIssue.status)}
                </div>
              </div>

              {/* Geo Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{selectedIssue.location.address}</span>
                  <span className="text-slate-400">({selectedIssue.location.neighborhood})</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  GPS: {selectedIssue.location.lat.toFixed(5)}, {selectedIssue.location.lng.toFixed(5)}
                </div>
              </div>
            </div>

            {/* Display Image & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-100 max-h-48 md:max-h-full">
                <img
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">CITIZEN DESCRIPTION</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100 h-[calc(100%-20px)] overflow-y-auto">
                  {selectedIssue.description}
                </p>
              </div>
            </div>

            {/* AI Automated Predictive Analysis block */}
            {selectedIssue.aiAnalysis && (
              <div className="bg-slate-900 text-slate-50 rounded-xl p-5 border border-slate-800 shadow-inner relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-10">
                  <Sparkles className="h-20 w-20 text-blue-300" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4.5 w-4.5 text-blue-400 animate-pulse" />
                  <h3 className="text-xs font-bold tracking-wider uppercase text-blue-400">
                    AI Auto-Analysis & Predictive Hazard
                  </h3>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-300">10-Day Deterioration Risk:</span>
                    <p className="text-slate-200 mt-1">{selectedIssue.aiAnalysis.predictiveInsight}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Suggested Municipal Action Plan:</span>
                    <ol className="list-decimal list-inside text-slate-200 mt-1 space-y-1 pl-1">
                      {selectedIssue.aiAnalysis.actionPlan.split("\n").map((step, idx) => (
                        <li key={idx} className="leading-relaxed">{step.replace(/^\d+[\.\s]*/, "")}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-800 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <DollarSign className="h-4 w-4" /> Est. Cost: <strong className="text-white">{selectedIssue.aiAnalysis.estimatedCost || "$300 - $600"}</strong>
                    </span>
                    <span className="text-slate-400">• Target: 48-Hour Response Priority</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Voting Center */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700">Does this issue need immediate resolving?</h4>
                <p className="text-[11px] text-slate-500">
                  Verify to validate the issue or alert municipal services. You earn <strong>+15 XP</strong>.
                </p>
              </div>
              <button
                disabled={selectedIssue.verifiedBy.includes(currentUserEmail)}
                onClick={() => onVerify(selectedIssue.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                  selectedIssue.verifiedBy.includes(currentUserEmail)
                    ? "bg-blue-50 border-blue-100 text-blue-600 cursor-default"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${selectedIssue.verifiedBy.includes(currentUserEmail) ? "fill-blue-600 text-blue-600" : ""}`} />
                {selectedIssue.verifiedBy.includes(currentUserEmail) ? "Verified" : `Verify (+${selectedIssue.votes})`}
              </button>
            </div>

            {/* Collaboration Comments & Community Feed */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">COMMUNITY COMMENTS & TIMELINE</h3>

              {/* Scrollable Comments/History Timeline feed */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {selectedIssue.comments.length > 0 ? (
                  selectedIssue.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded-xl text-xs ${
                        comment.isOfficial ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          {comment.user}
                          {comment.isOfficial && (
                            <span className="text-[8px] uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded font-extrabold">Official Response</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 italic text-center py-2">No discussion comments yet. Be the first to coordinate!</p>
                )}
              </div>

              {/* Post comment form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share coordination notes, cleanup offer, or report details..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* SIMULATOR: Municipal Progress Timeline & Actions */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Resolution Milestone Timeline
                </h4>
                {selectedIssue.status !== "Resolved" && (
                  <button
                    onClick={() => setShowAdvancePanel(!showAdvancePanel)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Wrench className="h-3.5 w-3.5" />
                    Simulate Next Step
                  </button>
                )}
              </div>

              {/* Progress Stepper Timeline */}
              <div className="relative flex justify-between items-center mt-6">
                <div className="absolute left-0 right-0 h-0.5 bg-slate-100 -z-10" />
                {["Reported", "Verified", "Scheduled", "In Progress", "Resolved"].map((step, sIdx) => {
                  const statuses = ["Reported", "Verified", "Scheduled", "In Progress", "Resolved"];
                  const currentIndex = statuses.indexOf(selectedIssue.status);
                  const isCompleted = statuses.indexOf(step) <= currentIndex;
                  const isActive = step === selectedIssue.status;

                  return (
                    <div key={step} className="flex flex-col items-center text-center relative z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive ? "bg-blue-600 border-blue-600 text-white shadow-md ring-4 ring-blue-50" :
                        isCompleted ? "bg-blue-500 border-blue-500 text-white" :
                        "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-3 w-3" />}
                      </div>
                      <span className={`text-[9px] font-bold mt-2 ${isActive ? "text-blue-600" : "text-slate-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Details list */}
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50 text-[11px] text-slate-600">
                {selectedIssue.timeline.map((mile, mIdx) => (
                  <div key={mIdx} className="flex items-start gap-2">
                    <span className="font-bold text-slate-800 shrink-0">{mile.label}:</span>
                    <span>{mile.note || "Milestone completed successfully."}</span>
                    <span className="text-[10px] text-slate-400 ml-auto font-mono">{new Date(mile.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>

              {/* Advance step simulator panel */}
              {showAdvancePanel && (
                <form onSubmit={handleAdvanceSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Simulate Municipal Milestone Advance</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                      {selectedIssue.status} → {
                        selectedIssue.status === "Reported" ? "Verified" :
                        selectedIssue.status === "Verified" ? "Scheduled" :
                        selectedIssue.status === "Scheduled" ? "In Progress" :
                        "Resolved"
                      }
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter resolution notes (e.g. 'Crew dispatch scheduled for Wednesday morning')"
                    value={advanceNote}
                    onChange={(e) => setAdvanceNote(e.target.value)}
                    required
                    className="w-full text-xs border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAdvancePanel(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      Confirm Transition <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[400px]">
            <Search className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-600">No Report Selected</h3>
            <p className="text-xs mt-1 max-w-xs">
              Select any community complaint from the list or click on map beacons to inspect deep hazard projections, repair schedules, and comments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
