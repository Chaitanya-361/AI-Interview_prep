import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function InterviewScorecard() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [id]);

  const fetchSession = async () => {
    try {
      const res = await apiFetch(`interview/${id}`);
      setSession(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-400">Loading scorecard...</div>;
  if (!session || !session.scorecard) return <div className="text-center mt-20 text-gray-400">Scorecard not available.</div>;

  const { scorecard, company, role, difficulty } = session;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-500">
            Interview Results
          </h1>
          <p className="text-gray-400 mt-2">{company} • {role} • {difficulty}</p>
        </div>
        <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 text-center shadow-xl">
          <p className="text-sm font-medium text-gray-400 mb-2">Overall Score</p>
          <p className={`text-5xl font-bold ${scorecard.overallScore > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
            {scorecard.overallScore}<span className="text-2xl text-gray-600">/100</span>
          </p>
        </div>
        <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 text-center shadow-xl">
          <p className="text-sm font-medium text-gray-400 mb-2">Communication</p>
          <p className="text-5xl font-bold text-blue-500">
            {scorecard.communication}<span className="text-2xl text-gray-600">/100</span>
          </p>
        </div>
        <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 text-center shadow-xl">
          <p className="text-sm font-medium text-gray-400 mb-2">Technical / Content</p>
          <p className="text-5xl font-bold text-indigo-500">
            {scorecard.technical}<span className="text-2xl text-gray-600">/100</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Strengths
          </h3>
          <ul className="space-y-3">
            {scorecard.feedback.strengths?.map((item: string, i: number) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {scorecard.feedback.areasToImprove?.map((item: string, i: number) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-[#151521] border border-gray-700 rounded-xl p-6 mt-6 shadow-xl">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Final Verdict</h3>
        <p className="text-white text-lg leading-relaxed">
          {scorecard.feedback.finalVerdict}
        </p>
      </div>

    </div>
  );
}
