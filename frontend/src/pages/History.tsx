import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { Link } from 'react-router-dom';

export default function History() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [resumeAnalyses, setResumeAnalyses] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiFetch('user/history');
      setInterviews(data.interviews || []);
      setResumeAnalyses(data.resumeAnalyses || []);
      setCoverLetters(data.coverLetters || []);
    } catch (error) {
      console.error('Failed to fetch history', error);
      alert('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const deleteInterview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview history?')) return;
    try {
      await apiFetch(`interview/${id}`, { method: 'DELETE' });
      setInterviews(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete interview');
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume analysis?')) return;
    try {
      await apiFetch(`resume/${id}`, { method: 'DELETE' });
      setResumeAnalyses(prev => prev.filter(r => r.resumeId !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete resume');
    }
  };

  const deleteCoverLetter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) return;
    try {
      await apiFetch(`cover-letter/${id}`, { method: 'DELETE' });
      setCoverLetters(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
      alert('Failed to delete cover letter');
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-gray-500 font-medium">Loading your history...</div>;
  }

  return (
    <div className="space-y-10">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Progress History</h1>
        <p className="text-gray-500 mb-8">Review your past resume analyses and mock interview performance.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Interviews Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-900 mr-2"></span>
              Mock Interviews
            </h2>
            {interviews.length === 0 ? (
              <p className="text-gray-400 italic">No mock interviews completed yet.</p>
            ) : (
              interviews.map(interview => (
                <div key={interview.id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl hover:border-gray-900 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{interview.role}</h3>
                      <p className="text-sm text-gray-500">{interview.company} • {interview.difficulty}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">{new Date(interview.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gray-900 h-full rounded-full" 
                        style={{ width: `${interview.scorecard?.overallScore || 0}%` }} 
                      />
                    </div>
                    <span className="text-gray-900 font-bold">{interview.scorecard?.overallScore || 0}/100</span>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/interview/${interview.id}/scorecard`}
                      className="block flex-1 text-center bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Scorecard
                    </Link>
                    <button 
                      onClick={() => deleteInterview(interview.id)}
                      className="bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                      title="Delete Interview"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumes Column */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-900 mr-2"></span>
              Resume Analyses
            </h2>
            {resumeAnalyses.length === 0 ? (
              <p className="text-gray-400 italic">No resume analyses yet.</p>
            ) : (
              resumeAnalyses.map(analysis => (
                <div key={analysis.id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl hover:border-gray-900 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">ATS Review</h3>
                      <p className="text-sm text-gray-500">Resume uploaded</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">{new Date(analysis.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gray-900 h-full rounded-full" 
                        style={{ width: `${analysis.atsScore || 0}%` }} 
                      />
                    </div>
                    <span className="text-gray-900 font-bold">{analysis.atsScore || 0}/100</span>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/analysis/${analysis.resumeId}`}
                      className="block flex-1 text-center bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => deleteResume(analysis.resumeId)}
                      className="bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                      title="Delete Resume"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Cover Letters Row */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-3 flex items-center mb-6">
            <span className="w-3 h-3 rounded-full bg-gray-900 mr-2"></span>
            Saved Cover Letters
          </h2>
          {coverLetters.length === 0 ? (
            <p className="text-gray-400 italic">No cover letters saved yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetters.map(letter => (
                <div key={letter.id} className="bg-gray-50 border border-gray-200 p-5 rounded-xl hover:border-gray-900 hover:shadow-md transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 truncate max-w-[200px]" title={letter.jobDescription}>
                        {letter.jobDescription || 'Unknown Job'}
                      </h3>
                      <span className="text-xs font-medium text-gray-400">{new Date(letter.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-100 p-3 rounded-lg text-sm text-gray-500 mb-4 h-24 overflow-hidden relative">
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white to-transparent"></div>
                    {letter.content.substring(0, 150)}...
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(letter.content);
                        alert('Copied to clipboard!');
                      }}
                      className="block flex-1 text-center bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Copy Text
                    </button>
                    <button 
                      onClick={() => deleteCoverLetter(letter.id)}
                      className="bg-white border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-500 hover:border-red-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
                      title="Delete Cover Letter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
