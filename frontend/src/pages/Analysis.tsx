// frontend/src/pages/Analysis.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

// We define the shape of the data Gemini will return to us!
type AnalysisData = {
    atsScore: number;
    strengths: string[];
    weaknesses: string[];
    skillGaps: string[];
    suggestions: string[];
};

export default function Analysis() {
    // Grab the Resume ID from the URL (e.g. /analysis/12345)
    const { id } = useParams<{ id: string }>();

    // States to manage the loading spinner, any errors, and the final AI data
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [error, setError] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

    // useEffect runs the moment this page appears on the screen
    useEffect(() => {
        const triggerAnalysis = async () => {
            try {
                // We ask the backend to chunk the resume and send it to Gemini Flash!
                const data = await apiFetch(`resume/${id}/analyze`, {
                    method: 'POST'
                });
                // Save the Gemini output into our React state
                setAnalysis(data.analysis);
            } catch (err: any) {
                setError(err.message);
            } finally {
                // Turn off the loading spinner
                setIsAnalyzing(false); 
            }
        };

        if (id) {
            triggerAnalysis();
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-5xl mx-auto">
                <Link to="/dashboard" className="text-purple-400 hover:text-purple-300 font-medium hover:underline mb-8 inline-block transition-all">&larr; Back to Dashboard</Link>
                
                <h1 className="text-3xl font-bold mb-8">Resume Analysis Report</h1>

                {/* SHOW ERROR IF FAILED */}
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl">
                        <p className="font-semibold mb-1">Analysis Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* SHOW LOADING SCREEN WHILE GEMINI IS THINKING */}
                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h2 className="text-xl font-semibold text-purple-300">Google Gemini is reading your resume...</h2>
                        <p className="text-gray-400 mt-2">Extracting skills, computing ATS score, and generating feedback.</p>
                    </div>
                )}

                {/* SHOW RESULTS ONCE GEMINI IS DONE */}
                {!isAnalyzing && analysis && (
                    <div className="space-y-8">
                        {/* Top Row: ATS Score & Skill Gaps */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* ATS Score Card */}
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col items-center justify-center shadow-xl">
                                <h3 className="text-gray-400 font-medium mb-4 uppercase tracking-wider text-sm">Overall ATS Score</h3>
                                <div className={`text-6xl font-black ${
                                    analysis.atsScore >= 80 ? 'text-green-400' : 
                                    analysis.atsScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                    {analysis.atsScore}<span className="text-3xl text-gray-500">/100</span>
                                </div>
                            </div>

                            {/* Skill Gaps Card */}
                            <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
                                <h3 className="text-gray-400 font-medium mb-4 uppercase tracking-wider text-sm">Critical Skill Gaps</h3>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.skillGaps.length > 0 ? analysis.skillGaps.map((skill, i) => (
                                        <span key={i} className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-sm">
                                            {skill}
                                        </span>
                                    )) : (
                                        <p className="text-green-400 text-sm">No major skill gaps detected!</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Strengths & Weaknesses */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Strengths */}
                            <div className="bg-green-500/5 border border-green-500/20 p-8 rounded-3xl">
                                <h3 className="text-green-400 font-semibold mb-4 text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Key Strengths
                                </h3>
                                <ul className="space-y-3">
                                    {analysis.strengths.map((str, i) => (
                                        <li key={i} className="flex gap-3 text-gray-300 text-sm">
                                            <span className="text-green-500 mt-1">•</span> {str}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-3xl">
                                <h3 className="text-red-400 font-semibold mb-4 text-lg flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    Areas for Improvement
                                </h3>
                                <ul className="space-y-3">
                                    {analysis.weaknesses.map((weak, i) => (
                                        <li key={i} className="flex gap-3 text-gray-300 text-sm">
                                            <span className="text-red-500 mt-1">•</span> {weak}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Row: AI Suggestions */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-xl">
                            <h3 className="text-purple-400 font-semibold mb-6 text-lg flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                Actionable AI Suggestions
                            </h3>
                            <div className="space-y-4">
                                {analysis.suggestions.map((sug: any, i: number) => (
                                    <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5 text-gray-300 text-sm leading-relaxed">
                                        <p className="text-gray-500 line-through mb-2">{sug.original}</p>
                                        <p className="text-green-400 font-medium mb-1">↳ {sug.suggested}</p>
                                        <p className="text-purple-300/80 text-xs mt-2 text-right italic">{sug.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
