import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  History,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';

const MockInterview = () => {
  const { api } = useAuth();

  const [role, setRole] = useState('');
  const [type, setType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'SDE',
    'Data Analyst',
    'AI/ML Engineer',
    'Product Manager',
  ];

  const interviewTypes = ['HR', 'Technical', 'DSA', 'Project Discussion'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const { data } = await api.get('/interview/history');
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, [api]);

  useEffect(() => {
    const loadHistory = async () => {
      await fetchHistory();
    };

    loadHistory();
  }, [fetchHistory]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role || !type || !difficulty) {
      setError('Please select role, interview type, and difficulty.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setSession(null);
      setAnswers([]);

      const { data } = await api.post('/interview/generate', {
        role,
        type,
        difficulty,
        questionCount: Number(questionCount),
      });

      setSession(data);
      setAnswers((data.questions || []).map(() => ({ answer: '' })));
      setSuccess('Interview questions generated. Answer each question and submit for evaluation.');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const nextAnswers = [...answers];
    nextAnswers[index] = { answer: value };
    setAnswers(nextAnswers);
  };

  const handleEvaluate = async () => {
    if (!session?._id) {
      setError('Generate an interview session first.');
      return;
    }

    const hasAnswer = answers.some((item) => item.answer.trim().length > 0);
    if (!hasAnswer) {
      setError('Please answer at least one question before evaluation.');
      return;
    }

    try {
      setEvaluating(true);
      setError(null);
      setSuccess(null);

      const { data } = await api.post(`/interview/${session._id}/evaluate`, {
        answers,
      });

      setSession(data);
      setSuccess('Interview evaluated and saved to your history.');
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Could not evaluate interview answers.');
    } finally {
      setEvaluating(false);
    }
  };

  const score = session?.score || 0;
  const scoreLabel = score >= 80 ? 'Interview Ready' : score >= 55 ? 'Good Progress' : 'Needs Practice';

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquareText className="text-indigo-500" /> AI Mock Interview Coach
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Practice role-specific interview questions and get AI feedback on your answers
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
            <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
                  required
                >
                  <option value="">Select role</option>
                  {roles.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Interview Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
                  required
                >
                  <option value="">Select type</option>
                  {interviewTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
                  required
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all appearance-none"
                >
                  {[5, 6, 7, 8, 9, 10].map((item) => (
                    <option key={item} value={item}>
                      {item} questions
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Generating
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} /> Generate Questions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {session && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {session.role} Interview
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {session.type} | {session.difficulty} | {session.questions?.length || 0} questions
                  </p>
                </div>
                {session.status === 'evaluated' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/40">
                    <Award size={14} /> {scoreLabel}: {score}/100
                  </span>
                )}
              </div>

              {(session.questions || []).map((item, index) => {
                const evaluatedAnswer = session.answers?.[index];
                return (
                  <div
                    key={`${item.question}-${index}`}
                    className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5"
                  >
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold shrink-0">
                        {index + 1}
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                        {item.question}
                      </h3>
                    </div>

                    <textarea
                      value={answers[index]?.answer ?? evaluatedAnswer?.answer ?? ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      disabled={session.status === 'evaluated'}
                      rows={5}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white transition-all resize-y disabled:opacity-70"
                    />

                    {session.status === 'evaluated' && evaluatedAnswer && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                            Feedback
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {evaluatedAnswer.feedback}
                          </p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
                            Ideal Answer
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {evaluatedAnswer.idealAnswer || item.idealAnswer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {session.status !== 'evaluated' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={evaluating}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Evaluating
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit for AI Evaluation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Target size={18} className="text-indigo-500" /> Evaluation
            </h3>

            {session?.status === 'evaluated' ? (
              <>
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-8 border-indigo-100 dark:border-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <span className="text-3xl font-extrabold">{score}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {scoreLabel}
                  </p>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {session.feedback}
                </p>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {session.strengths?.map((item, index) => (
                        <li key={index} className="text-xs text-slate-600 dark:text-slate-300">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-2">
                      <XCircle size={16} /> Weaknesses
                    </h4>
                    <ul className="space-y-2">
                      {session.weaknesses?.map((item, index) => (
                        <li key={index} className="text-xs text-slate-600 dark:text-slate-300">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-2">
                      <Lightbulb size={16} /> Improvements
                    </h4>
                    <ul className="space-y-2">
                      {session.suggestions?.map((item, index) => (
                        <li key={index} className="text-xs text-slate-600 dark:text-slate-300">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <BrainCircuit className="mx-auto text-slate-300 dark:text-slate-700" size={42} />
                <p className="text-sm text-slate-400 mt-3">
                  Generate questions and submit answers to receive your score.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800/60 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History size={18} className="text-indigo-500" /> Recent Attempts
            </h3>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">
                No interview attempts yet.
              </p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      setSession(item);
                      setAnswers((item.questions || []).map((question, index) => ({
                        answer: item.answers?.[index]?.answer || '',
                      })));
                      setError(null);
                      setSuccess(null);
                    }}
                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.role}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {item.type} | {item.difficulty}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {item.status === 'evaluated' ? `${item.score}/100` : 'Draft'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <ClipboardList size={18} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tip: For best feedback, answer like you would in a real placement interview. Use examples, decisions, trade-offs, and outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
