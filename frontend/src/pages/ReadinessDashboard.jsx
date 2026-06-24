import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Code, CheckCircle, ShieldAlert, Cpu, Sparkles, Send, Play } from 'lucide-react';

const ReadinessDashboard = () => {
  const { api } = useAuth();
  
  // Scoring parameters state
  const [dsaProgress, setDsaProgress] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [gitHubCommits, setGitHubCommits] = useState(0);

  const [scoreData, setScoreData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load readiness status
  const fetchReadiness = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/readiness');
      setScoreData(data.latest);
      setHistory(data.history || []);
      
      // Update form values with latest saved data
      if (data.latest) {
        setDsaProgress(data.latest.dsaProgress || 0);
        setProjectsCount(data.latest.projectsCount || 0);
        setGitHubCommits(data.latest.gitHubCommits || 0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch readiness scoring dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  // Submit and calculate new score
  const handleCalculate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const { data } = await api.post('/readiness', {
        dsaProgress: Number(dsaProgress),
        projectsCount: Number(projectsCount),
        gitHubCommits: Number(gitHubCommits),
      });
      setScoreData(data);
      // Prepend to history
      setHistory([data, ...history.filter(h => h._id !== data._id)].slice(0, 10));
    } catch (err) {
      console.error(err);
      setError('Could not update readiness score. Make sure parameters are valid.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Ring parameters for SVG Readiness Score indicator
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = scoreData 
    ? circumference - (scoreData.score / 100) * circumference 
    : circumference;

  const scorePercentage = scoreData ? scoreData.score : 0;

  // Determine indicator color
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 50) return 'text-indigo-500 stroke-indigo-500';
    return 'text-amber-500 stroke-amber-500';
  };

  const getScoreText = (score) => {
    if (score >= 80) return 'Placement Ready';
    if (score >= 50) return 'Moderate Readiness';
    return 'Action Needed';
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="text-indigo-500" /> Placement Readiness Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Calculate your placement metrics, analyze scores out of 100, and evaluate breakdowns
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 rounded-2xl flex items-center gap-2">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Score overview cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Readiness Circular Progress card */}
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6">Readiness Rating</h3>
          
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="rgba(99, 102, 241, 0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className={`transition-all duration-1000 ease-out ${getScoreColorClass(scorePercentage)}`}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{scorePercentage}</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">out of 100</span>
            </div>
          </div>

          <div className="mt-6">
            <span className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950/60 text-sm font-semibold rounded-full border border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              Status: {getScoreText(scorePercentage)}
            </span>
          </div>
        </div>

        {/* Input parameters card */}
        <div className="lg:col-span-2 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-6 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" /> Recalculate Score Parameters
          </h3>
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                DSA Solved (LeetCode/GFG)
              </label>
              <input
                type="number"
                min="0"
                value={dsaProgress}
                onChange={(e) => setDsaProgress(e.target.value)}
                placeholder="E.g. 150"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Weight: 30% (Target 200+)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Core Portfolio Projects
              </label>
              <input
                type="number"
                min="0"
                value={projectsCount}
                onChange={(e) => setProjectsCount(e.target.value)}
                placeholder="E.g. 3"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Weight: 25% (Target 3+)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                GitHub Commits (Last Year)
              </label>
              <input
                type="number"
                min="0"
                value={gitHubCommits}
                onChange={(e) => setGitHubCommits(e.target.value)}
                placeholder="E.g. 120"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Weight: 10% (Target 100+)</p>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={16} /> Update Dashboard
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SVG Bar Chart for Score Breakdown */}
      {scoreData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Breakdown description */}
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
              <Award size={18} className="text-indigo-500" /> Score Breakdown
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">DSA Progress (Max 30)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{scoreData.breakdown?.dsaScore}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Projects Quality (Max 25)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{scoreData.breakdown?.projectsScore}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Skills Weight (Max 15)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{scoreData.breakdown?.skillsScore}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Resume Quality (Max 20)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{scoreData.breakdown?.resumeScore}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400">GitHub Activity (Max 10)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{scoreData.breakdown?.githubScore}</span>
              </div>
            </div>
          </div>

          {/* SVG Visual Bar Chart */}
          <div className="lg:col-span-2 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4">Breakdown Chart</h3>
            
            <div className="flex-1 min-h-[200px] flex items-end justify-between px-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              {/* DSA Bar */}
              <div className="flex flex-col items-center w-12 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreData.breakdown?.dsaScore}/30
                  </div>
                  <div 
                    className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${(scoreData.breakdown?.dsaScore / 30) * 160}px` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full font-semibold">DSA</span>
              </div>

              {/* Projects Bar */}
              <div className="flex flex-col items-center w-12 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreData.breakdown?.projectsScore}/25
                  </div>
                  <div 
                    className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${(scoreData.breakdown?.projectsScore / 25) * 160}px` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full font-semibold">Projects</span>
              </div>

              {/* Skills Bar */}
              <div className="flex flex-col items-center w-12 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreData.breakdown?.skillsScore}/15
                  </div>
                  <div 
                    className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${(scoreData.breakdown?.skillsScore / 15) * 160}px` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full font-semibold">Skills</span>
              </div>

              {/* Resume Bar */}
              <div className="flex flex-col items-center w-12 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreData.breakdown?.resumeScore}/20
                  </div>
                  <div 
                    className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${(scoreData.breakdown?.resumeScore / 20) * 160}px` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full font-semibold">Resume</span>
              </div>

              {/* GitHub Bar */}
              <div className="flex flex-col items-center w-12 group">
                <div className="relative w-full flex justify-center">
                  <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {scoreData.breakdown?.githubScore}/10
                  </div>
                  <div 
                    className="w-8 bg-indigo-500 dark:bg-indigo-600 rounded-t-lg transition-all duration-1000"
                    style={{ height: `${(scoreData.breakdown?.githubScore / 10) * 160}px` }}
                  ></div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-2 text-center truncate w-full font-semibold">GitHub</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadinessDashboard;
