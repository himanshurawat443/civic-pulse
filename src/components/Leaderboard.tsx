import { CivicIssue, UserStats } from "../types";
import { Award, CheckCircle, ThumbsUp, MessageSquare, Flame, HelpCircle, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardProps {
  leaderboard: UserStats[];
  issues: CivicIssue[];
  onVerifyIssue: (issueId: string) => void;
  currentUserEmail: string;
}

export default function Leaderboard({
  leaderboard,
  issues,
  onVerifyIssue,
  currentUserEmail
}: LeaderboardProps) {
  // Sort leaderboard by points
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);

  // Find unverified issues to present as "Daily Verification Challenges"
  const unverifiedIssues = issues
    .filter(i => i.status === "Reported" && !i.verifiedBy.includes(currentUserEmail))
    .slice(0, 3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">🥇 Gold Guard</span>;
      case 1:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">🥈 Silver Guard</span>;
      case 2:
        return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">🥉 Bronze Guard</span>;
      default:
        return <span className="bg-slate-50 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Civic Supporter</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Citizen Leaderboard Table (2 columns on desktop) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-left space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Civic Leaderboard & Engagement
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Bengaluru residents earn XP for active reporting, validation, and community coordination.
          </p>
        </div>

        {/* Leaderboard list */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Rank</th>
                <th className="py-3 px-2">Citizen Email</th>
                <th className="py-3 px-2 text-center">Score (XP)</th>
                <th className="py-3 px-2 text-center">Reports</th>
                <th className="py-3 px-2 text-center">Validations</th>
                <th className="py-3 px-2 text-center">Helped</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedLeaderboard.map((user, index) => {
                const isCurrentUser = user.email.toLowerCase() === currentUserEmail.toLowerCase();
                return (
                  <tr
                    key={user.email}
                    className={`hover:bg-slate-50 transition-all ${
                      isCurrentUser ? "bg-blue-50/20 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-500">
                      #{index + 1}
                    </td>
                    <td className="py-3.5 px-2 text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[150px] md:max-w-xs">{user.email}</span>
                        {getRankBadge(index)}
                        {isCurrentUser && (
                          <span className="bg-blue-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-2 text-center text-blue-600 font-extrabold font-mono">
                      {user.points}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-600 font-medium font-mono">
                      {user.reportsSubmitted}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-600 font-medium font-mono">
                      {user.validationsMade}
                    </td>
                    <td className="py-3.5 px-2 text-center text-slate-600 font-medium font-mono">
                      {user.resolvedHelpCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Challenges & Rewards Guide (1 column on desktop) */}
      <div className="space-y-6 text-left">
        {/* Verification Challenges */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
              Community Action Challenges
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Verify these reports to help reach consensus and trigger repairs.
            </p>
          </div>

          <div className="space-y-3">
            {unverifiedIssues.length > 0 ? (
              unverifiedIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start gap-1 mb-1.5">
                    <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {issue.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      XP reward: +15
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {issue.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                    {issue.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">📍 {issue.location.neighborhood}</span>
                    <button
                      onClick={() => onVerifyIssue(issue.id)}
                      className="text-[10px] text-blue-600 font-bold hover:text-blue-800 flex items-center gap-0.5"
                    >
                      Verify Now <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Heart className="h-7 w-7 text-blue-400 mx-auto mb-2" />
                <p className="text-[11px] font-medium">Consensus complete! All current reports are community verified.</p>
              </div>
            )}
          </div>
        </div>

        {/* XP Mechanics Card */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-100 p-6 space-y-3.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Flame className="h-4.5 w-4.5 text-blue-600" />
            XP Scoring System
          </h3>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100/40">
              <span className="font-semibold text-slate-700">Submit verified report</span>
              <span className="text-blue-600 font-bold font-mono">+50 XP</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100/40">
              <span className="font-semibold text-slate-700">Support validation vote</span>
              <span className="text-blue-600 font-bold font-mono">+15 XP</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100/40">
              <span className="font-semibold text-slate-700">Help resolution / Coordinate</span>
              <span className="text-blue-600 font-bold font-mono">+30 XP</span>
            </div>
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100/40">
              <span className="font-semibold text-slate-700">Engage on comments feed</span>
              <span className="text-blue-600 font-bold font-mono">+10 XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
