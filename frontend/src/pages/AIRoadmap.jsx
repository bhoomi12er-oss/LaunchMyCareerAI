import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Calendar, BookOpen, ExternalLink, Flag, HelpCircle, Compass } from 'lucide-react';

const AIRoadmap = () => {
  const { api, user } = useAuth();

  const [targetRole, setTargetRole] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    'SDE',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'AI/ML Engineer',
  ];

  const years = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole) {
      setError('Please select a target role');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRoadmap(null);
      
      const { data } = await api.post('/roadmap/generate', {
        targetRole,
        currentYear: currentYear || user?.year || '3rd Year',
      });
      setRoadmap(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Roadmap generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="text-indigo-500 animate-pulse" /> AI Career Roadmap
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate a personalized month-by-month learning roadmap powered by Gemini AI
        </p>
      </div>

      {/* Parameter Selection Card */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Target Career Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
              required
            >
              <option value="">Select Target Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Current Year of Study
            </label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
            >
              <option value="">Select Year (Defaults to Profile)</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Compass size={18} /> Generate Learning Roadmap
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl">
          <span>{error}</span>
        </div>
      )}

      {/* Timeline Tree output */}
      {roadmap && (
        <div className="relative border-l border-indigo-200 dark:border-indigo-950 ml-4 md:ml-8 space-y-12 py-4 animate-fadeIn">
          {roadmap.timeline.map((monthData, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12 group">
              {/* Radial month bubble node */}
              <div className="absolute left-0 top-0 -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 border-4 border-slate-50 dark:border-slate-950 transition-transform group-hover:scale-110">
                {idx + 1}
              </div>

              {/* Glass Card content */}
              <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-500" /> {monthData.month}
                  </h3>
                </div>

                {/* Sub-topics list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-indigo-500" /> What to Learn:
                    </h4>
                    <ul className="space-y-2">
                      {monthData.topics.map((topic, tIdx) => (
                        <li key={tIdx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Free resources */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ExternalLink size={14} className="text-indigo-500" /> Suggested Resources:
                    </h4>
                    <ul className="space-y-2">
                      {monthData.resources.map((res, rIdx) => (
                        <li key={rIdx} className="text-sm text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <span className="w-1 h-1 bg-indigo-300 rounded-full"></span>
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Milestone box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/60 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl mt-0.5">
                    <Flag size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Month Milestone Project:</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {monthData.milestone}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIRoadmap;
