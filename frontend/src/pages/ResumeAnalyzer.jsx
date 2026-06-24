import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  History,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  Upload,
  WandSparkles,
  XCircle,
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { api } = useAuth();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const jobDescriptionWordCount = useMemo(
    () => jobDescription.trim().split(/\s+/).filter(Boolean).length,
    [jobDescription]
  );

  const score = analysis?.matchScore ?? analysis?.atsScore ?? 0;
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const loadRecentAnalyses = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await api.get('/resume/analyses');
      setRecentAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const setSelectedFile = (selected) => {
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setError(null);
      return;
    }

    setError('Please select a valid PDF resume.');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Upload your resume PDF before running the match.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Paste the job description before running the match.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription.trim());

    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      const { data } = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(data);
      loadRecentAnalyses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Resume match analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (value) => {
    if (value >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (value >= 55) return 'text-indigo-500 stroke-indigo-500';
    return 'text-amber-500 stroke-amber-500';
  };

  const scoreMessage = () => {
    if (score >= 80) return 'Strong alignment with the pasted role. Refine bullets for sharper impact.';
    if (score >= 55) return 'Good base. Add missing role keywords and stronger evidence in project bullets.';
    return 'Needs stronger tailoring before applying. Focus on required skills and measurable outcomes.';
  };

  const renderKeywordList = (items, emptyLabel, tone) => {
    const tones = {
      green: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30',
      rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-900/30',
      indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30',
    };

    if (!items?.length) {
      return <span className="text-sm text-slate-400 italic">{emptyLabel}</span>;
    }

    return items.map((item) => (
      <span
        key={item}
        className={`px-3 py-1.5 rounded-full text-xs font-bold border ${tones[tone]}`}
      >
        {item}
      </span>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Target className="text-indigo-500" /> Resume Match Analyzer
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload your resume, paste a job description, and get a saved match report.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-6"
      >
        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText size={20} className="text-indigo-500" /> Resume PDF
            </h2>
            <p className="text-xs text-slate-400 mt-1">PDF files up to 5MB are supported.</p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex min-h-72 flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragOver
                ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-500'
            }`}
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full mb-4">
              <Upload size={32} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Drop resume here</h3>
            <div className="mt-4">
              <input
                type="file"
                id="resume-file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resume-file"
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer inline-block"
              >
                Browse Files
              </label>
            </div>

            {file && (
              <div className="flex items-center gap-2 mt-6 max-w-full px-4 py-2 bg-indigo-50/60 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                <FileText size={16} className="shrink-0" />
                <span className="text-xs font-bold truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList size={20} className="text-indigo-500" /> Job Description
              </h2>
              <p className="text-xs text-slate-400 mt-1">Paste the role exactly as written by the employer.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-300">
              {jobDescriptionWordCount} words
            </span>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job responsibilities, requirements, qualifications, and preferred skills here..."
            className="w-full min-h-72 resize-y px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 transition-all"
          />

          {error && (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium bg-rose-50 dark:bg-rose-950/20 p-3.5 border border-rose-200 dark:border-rose-900/30 rounded-xl">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file || !jobDescription.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <WandSparkles size={18} />
                  Analyze Match
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm flex flex-col items-center justify-center text-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4">Match Score</h3>
            <div className="relative flex items-center justify-center">
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
                  className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{score}</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">out of 100</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed px-4">{scoreMessage()}</p>
          </div>

          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 size={20} /> Matched Keywords
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {renderKeywordList(analysis.matchedKeywords, 'No matched keywords returned.', 'green')}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <XCircle size={20} /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {renderKeywordList(analysis.missingKeywords, 'No missing keywords found.', 'rose')}
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Lightbulb size={20} /> Improvement Suggestions
              </h3>
              <ul className="space-y-3.5">
                {(analysis.suggestions || []).map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Sparkles size={20} /> Rewritten Bullet Points
              </h3>
              <ul className="space-y-3.5">
                {(analysis.rewrittenBulletPoints || []).map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History size={20} className="text-indigo-500" /> Recent Saved Analyses
          </h3>
          {historyLoading && <RefreshCw size={16} className="animate-spin text-slate-400" />}
        </div>

        {recentAnalyses.length === 0 ? (
          <p className="text-sm text-slate-400">No saved resume match reports yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentAnalyses.map((item) => (
              <div
                key={item._id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                      {item.fileName}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                    {item.matchScore ?? item.atsScore ?? 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {renderKeywordList((item.matchedKeywords || []).slice(0, 4), 'No keywords saved.', 'indigo')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
