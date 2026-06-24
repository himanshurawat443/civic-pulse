/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { CivicIssue, UserStats, CommunityForecast } from "./types";
import CommunityMap from "./components/CommunityMap";
import StatsDashboard from "./components/StatsDashboard";
import IssueList from "./components/IssueList";
import ReportForm from "./components/ReportForm";
import Leaderboard from "./components/Leaderboard";
import { Shield, Sparkles, Navigation, Award, BarChart3, AlertCircle, Users, CheckCircle, BrainCircuit, LayoutDashboard, Map, Compass, Activity, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "report" | "analytics" | "leaderboard">("map");
  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [forecast, setForecast] = useState<CommunityForecast | null>(null);
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number; address: string; neighborhood: string } | null>(null);
  
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  
  // Simulation personas list to let users test multi-user interaction flows
  const personas = [
    "sarah.m@oakwood.org",
    "jason.reed@gmail.com",
    "mark.d@gmail.com",
    "cycle_champion@outlook.com",
    "helen_grey@valley.net",
    "new_citizen@valley.net"
  ];
  const [currentUserEmail, setCurrentUserEmail] = useState(personas[0]);

  // Fetch initial data
  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      const res = await fetch("/api/issues");
      const data = await res.json();
      if (res.ok) {
        setIssues(data);
        // Default select first issue
        if (data.length > 0 && !selectedIssueId) {
          setSelectedIssueId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading issues:", err);
    } finally {
      setLoadingIssues(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoadingLeaderboard(true);
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (res.ok) setLeaderboard(data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const fetchForecast = async (forceRefresh = false) => {
    try {
      setLoadingForecast(true);
      const res = await fetch("/api/predictive-insights");
      const data = await res.json();
      if (res.ok) setForecast(data);
    } catch (err) {
      console.error("Error loading forecast:", err);
    } finally {
      setLoadingForecast(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchLeaderboard();
    fetchForecast();
  }, []);

  // Action: Add new issue report
  const handleAddIssue = async (issuePayload: any) => {
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issuePayload)
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(prev => [data, ...prev]);
        setSelectedIssueId(data.id);
        // Refresh stats/leaderboard
        fetchLeaderboard();
        fetchForecast();
        // Go back to map/list tab to inspect
        setActiveTab("map");
        setClickedCoords(null);
      }
    } catch (err) {
      console.error("Error reporting issue:", err);
    }
  };

  // Action: Upvote/Verify report
  const handleVerify = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: currentUserEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(prev => prev.map(issue => issue.id === issueId ? data : issue));
        fetchLeaderboard();
        fetchForecast();
      } else {
        alert(data.error || "Failed to verify issue.");
      }
    } catch (err) {
      console.error("Error verifying issue:", err);
    }
  };

  // Action: Add comment to issue
  const handleAddComment = async (issueId: string, text: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: currentUserEmail,
          text,
          isOfficial: currentUserEmail.endsWith(".org") // Simulated organization official responses
        })
      });
      const data = await res.json();
      if (res.ok) {
        // Refresh issues list locally to append comment
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            return {
              ...issue,
              comments: [...issue.comments, data],
              updatedAt: new Date().toISOString()
            };
          }
          return issue;
        }));
        fetchLeaderboard();
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Action: Simulate advancing milestone status
  const handleAdvanceStatus = async (issueId: string, note?: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: currentUserEmail,
          note
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIssues(prev => prev.map(issue => issue.id === issueId ? data : issue));
        fetchLeaderboard();
        fetchForecast();
      }
    } catch (err) {
      console.error("Error advancing issue status:", err);
    }
  };

  // Callback when user clicks map to pre-populate report
  const handleSelectCoordinates = (coords: { lat: number; lng: number; address: string; neighborhood: string }) => {
    setClickedCoords(coords);
    setActiveTab("report");
  };

  // User profile computations for Marcus Chen look-and-feel
  const currentUserStats = leaderboard.find(u => u.email.toLowerCase() === currentUserEmail.toLowerCase()) || {
    email: currentUserEmail,
    points: 120,
    reportsSubmitted: 2,
    validationsMade: 4,
    commentsAdded: 1,
    resolvedHelpCount: 1
  };

  const getUserDisplayName = (email: string) => {
    const prefix = email.split("@")[0];
    return prefix
      .split(".")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getUserInitials = (email: string) => {
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const userDisplayName = getUserDisplayName(currentUserEmail);
  const userInitials = getUserInitials(currentUserEmail);
  const userLevel = Math.floor(currentUserStats.points / 200) + 1;
  const xpInCurrentLevel = currentUserStats.points % 200;
  const levelProgressPercentage = (xpInCurrentLevel / 200) * 100;

  return (
    <div id="civic-pulse-app-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Dynamic Top Banner for Simulator personae selection */}
      <div className="bg-slate-900 text-white px-8 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 z-50 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-blue-400 font-medium">
          <BrainCircuit className="h-4 w-4 animate-pulse" />
          <span>Interactive Full-Stack Mode Active • Persistent Civic Store</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-400 font-bold">Simulating Citizen Identity:</label>
          <select
            value={currentUserEmail}
            onChange={(e) => setCurrentUserEmail(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
          >
            {personas.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Header navigation */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab("map"); setClickedCoords(null); }}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-100">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-800 tracking-tight">CivicPulse AI</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search local concerns & schedules..."
              onClick={() => setActiveTab("map")}
              className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs w-80 focus:ring-2 focus:ring-blue-500 text-slate-600 focus:outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-2.5" />
          </div>

          <button
            onClick={() => { setActiveTab("report"); setClickedCoords(null); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-semibold shadow-md shadow-blue-100 transition-all flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Report New Issue
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{userDisplayName}</p>
              <p className="text-[10px] text-blue-600 font-bold">Level {userLevel} Citizen</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-bold text-blue-700 font-display">
              {userInitials}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 gap-8 flex-shrink-0 hidden lg:flex">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
            <nav className="space-y-1">
              <button
                onClick={() => { setActiveTab("map"); setClickedCoords(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "map"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Map className="w-4 h-4" />
                Interactive Map
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "report"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Compass className="w-4 h-4" />
                Report Concern
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "analytics"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Activity className="w-4 h-4" />
                Live Tracking & Stats
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Award className="w-4 h-4" />
                Citizen Impact Hub
              </button>
            </nav>
          </div>

          {/* Personal Impact Widget */}
          <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm text-left">
            <p className="text-xs font-semibold text-slate-600 mb-2">Personal Impact</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-xl font-black text-slate-800">{currentUserStats.points} XP</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Lvl {userLevel}</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              You submitted <strong>{currentUserStats.reportsSubmitted}</strong> reports and supported <strong>{currentUserStats.validationsMade}</strong> consensus validations.
            </p>
            <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${levelProgressPercentage}%` }}
              ></div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around px-4 z-40 shadow-lg">
          <button
            onClick={() => { setActiveTab("map"); setClickedCoords(null); }}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "map" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <Map className="w-5 h-5" />
            Map
          </button>
          <button
            onClick={() => setActiveTab("report")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "report" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <Compass className="w-5 h-5" />
            Report
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "analytics" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <Activity className="w-5 h-5" />
            Stats
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
              activeTab === "leaderboard" ? "text-blue-600" : "text-slate-400"
            }`}
          >
            <Award className="w-5 h-5" />
            Hub
          </button>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 flex flex-col gap-6 pb-24 lg:pb-12 text-left">
          {/* Header Stats Rows matching Professional Polish Design HTML */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Concerns</p>
              <h3 className="text-2xl font-black text-slate-800 mt-2">
                {issues.filter(i => i.status !== "Resolved").length}
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Resolved Concerns</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">
                {issues.filter(i => i.status === "Resolved").length}
              </h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">City Health Index</p>
              <h3 className="text-2xl font-black text-blue-600 mt-2">
                {forecast?.overallScore || 75}%
              </h3>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "map" && (
              <motion.div
                key="map-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Civic Vector Map visualizer */}
                <CommunityMap
                  issues={issues}
                  selectedIssueId={selectedIssueId}
                  onSelectIssue={(issue) => {
                    setSelectedIssueId(issue.id);
                    // Scroll to details on list section below smoothly
                    const detailSec = document.getElementById("civic-issues-list-details-section");
                    if (detailSec) detailSec.scrollIntoView({ behavior: "smooth" });
                  }}
                  onSelectCoordinates={handleSelectCoordinates}
                />

                {/* Bento Grid layout containing list and drawer */}
                <div id="civic-issues-list-details-section" className="pt-4 border-t border-slate-200">
                  <div className="mb-4 text-left">
                    <h2 className="text-base font-bold text-slate-950 flex items-center gap-1.5">
                      <Users className="h-5 w-5 text-blue-600" />
                      Civic Concerns Ledger
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">Audit reported complaints, verify consensus, and coordinate municipal repairs.</p>
                  </div>
                  {loadingIssues ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">Loading issues ledger...</div>
                  ) : (
                    <IssueList
                      issues={issues}
                      selectedIssueId={selectedIssueId}
                      onSelectIssue={(issue) => setSelectedIssueId(issue ? issue.id : null)}
                      onVerify={handleVerify}
                      onAddComment={handleAddComment}
                      onAdvanceStatus={handleAdvanceStatus}
                      currentUserEmail={currentUserEmail}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "report" && (
              <motion.div
                key="report-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto w-full"
              >
                <ReportForm
                  onAddIssue={handleAddIssue}
                  clickedCoords={clickedCoords}
                  currentUserEmail={currentUserEmail}
                />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div
                key="analytics-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <StatsDashboard
                  issues={issues}
                  forecast={forecast}
                  loadingForecast={loadingForecast}
                  onRefreshForecast={() => fetchForecast(true)}
                />
              </motion.div>
            )}

            {activeTab === "leaderboard" && (
              <motion.div
                key="leaderboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {loadingLeaderboard ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">Loading citizen rankings...</div>
                ) : (
                  <Leaderboard
                    leaderboard={leaderboard}
                    issues={issues}
                    onVerifyIssue={handleVerify}
                    currentUserEmail={currentUserEmail}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer matching template exactly */}
      <footer className="h-10 bg-slate-800 text-slate-400 flex items-center justify-between px-8 text-[10px] uppercase tracking-widest flex-shrink-0 border-t border-slate-700 z-40">
        <div>© 2026 CivicPulse Governance Solutions</div>
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> AI Systems Active
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> 12 Node Validators Online
          </span>
        </div>
      </footer>
    </div>
  );
}
