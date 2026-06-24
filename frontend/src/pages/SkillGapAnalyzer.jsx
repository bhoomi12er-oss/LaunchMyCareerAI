import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, Lightbulb, Compass, Award, Code } from 'lucide-react';

const SkillGapAnalyzer = () => {
  const { api } = useAuth();
  
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
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

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!targetRole) {
      setError('Please select a target role');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      const { data } = await api.post('/skills/analyze', { targetRole });
      setAnalysis(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Skill gap evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="text-indigo-500" /> Skill Gap Analyzer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Select your target professional role and contrast your skills with requirements using AI
        </p>
      </div>

      {/* Selector card */}
      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row items-end gap-6">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Target Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
              required
            >
              <option value="">Choose a career path...</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
            ) : (
              'Analyze Gap'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl">
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
          
          {/* Strengths card */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={20} /> Matched Strengths
            </h3>
            <p className="text-xs text-slate-400">Skills you possess that match the role requirements</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.strengths.length === 0 ? (
                <span className="text-sm text-slate-400 italic">No matching skills found. Add skills to your profile page to recalculate.</span>
              ) : (
                analysis.strengths.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100/30 dark:border-emerald-900/30"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Missing Skills card */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle size={20} /> Missing Skills
            </h3>
            <p className="text-xs text-slate-400">Required technologies or competencies missing from your profile</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {analysis.missingSkills.length === 0 ? (
                <span className="text-sm text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle2 size={16} /> All target skills matched!
                </span>
              ) : (
                analysis.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold border border-rose-100/30 dark:border-rose-900/30"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Suggestions Card */}
          <div className="md:col-span-2 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <Lightbulb size={20} /> AI Career Recommendations
            </h3>
            <ul className="space-y-3.5">
              {analysis.suggestions.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;
