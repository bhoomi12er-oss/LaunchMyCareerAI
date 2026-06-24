import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Award, Code, CheckCircle, ArrowRight, Github, Linkedin, Briefcase, FileText } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    if (!user) return 0;
    const fields = [
      user.college,
      user.branch,
      user.year,
      user.cgpa,
      user.skills?.length > 0 ? true : null,
      user.github,
      user.linkedin,
    ];
    const filledCount = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-xl shadow-indigo-600/10">
        <div className="absolute right-0 bottom-0 translate-y-12 translate-x-12 opacity-15 hidden md:block">
          <Briefcase size={240} />
        </div>
        <div className="relative z-10 space-y-4 max-w-xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
            Workspace Console
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Explorer'}!
          </h1>
          <p className="text-indigo-100 text-sm md:text-base">
            Configure your professional profiles, add your academic stats, and let CareerVerse AI optimize your career trajectory.
          </p>
        </div>
      </div>

      {/* Completeness Card & Profile Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completeness Progress Card */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              Profile Completeness
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Complete your profile setup to unlock AI-driven job matches and portfolio reviews.
            </p>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-indigo-600 dark:text-indigo-400">{completeness}% Complete</span>
                <span className="text-slate-400">{completeness === 100 ? 'Excellent!' : 'Pending setup'}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all group"
            >
              Update Profile Details
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Quick Credentials Info Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
            Academic Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-sm text-slate-500 dark:text-slate-400">College</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {user?.college || <span className="text-slate-400 italic">Not set</span>}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-sm text-slate-500 dark:text-slate-400">Major/Branch</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                {user?.branch || <span className="text-slate-400 italic">Not set</span>}
              </span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-slate-500 dark:text-slate-400">Year</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {user?.year || <span className="text-slate-400 italic">Not set</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile highlights stats grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CGPA Badge */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">CGPA Rating</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {user?.cgpa !== null && user?.cgpa !== undefined ? user.cgpa.toFixed(2) : '--'}
            </span>
          </div>
        </div>

        {/* Skills count */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Code size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Skills Logged</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {user?.skills?.length || 0}
            </span>
          </div>
        </div>

        {/* Social connections */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Social Portfolios</span>
            <div className="flex gap-2.5 mt-1">
              <span className={`transition-colors ${user?.github ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}`}>
                <Github size={20} />
              </span>
              <span className={`transition-colors ${user?.linkedin ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                <Linkedin size={20} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested next steps / action placeholders */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Career Actions Pending
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl mt-0.5">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">AI Resume Optimizer</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload your resume and get recommendations based on industry roles (Unlocks in Phase 2).
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/40 rounded-2xl flex items-start gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-500 rounded-xl mt-0.5">
              <Briefcase size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Mock Interview Coach</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Practice answering role-specific questions with AI real-time response analysis (Unlocks in Phase 3).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
