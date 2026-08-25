// frontend/src/pages/Dashboard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
    // useNavigate allows us to change the URL programmatically (e.g. redirecting after upload)
    const navigate = useNavigate();
    // Grab the logged in user and the logout function from our global context
    const { user, logout } = useAuth();

    // State to store the actual File object the user selected from their computer
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    // Triggered whenever the user selects a file from the hidden <input type="file">
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(''); // Clear any previous errors once they pick a valid file
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setError('');

        // The browser's FormData API allows us to securely pack binary files into a network request
        const formData = new FormData();
        // IMPORTANT: The key MUST be 'resume' to match `upload.single('resume')` in your backend!
        formData.append('resume', file); 

        try {
            // Call our API! Because we pass FormData, our apiFetch function automatically 
            // lets the browser set the correct multipart/form-data boundary headers!
            const data = await apiFetch('resume/upload', {
                method: 'POST',
                body: formData,
            });
            
            // The backend returns the new resume in data.resume. 
            // We instantly redirect the user to the Analysis page for that specific ID!
            navigate(`/analysis/${data.resume.id}`);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false); // Stop the loading spinner regardless of success or failure
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            
            {/* Top Navigation Bar */}
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-12">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-indigo-400">
                    Dashboard
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">Welcome, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/50 px-4 py-2 rounded-lg transition-all"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-12">
                <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-8 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Ready to practice?</h2>
                        <p className="text-gray-400 mb-6">Start an AI mock interview tailored to your resume.</p>
                    </div>
                    <Link
                        to="/interview/setup"
                        className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
                        Start Mock Interview &rarr;
                    </Link>
                </div>

                <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-8 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Need a Cover Letter?</h2>
                        <p className="text-gray-400 mb-6">Instantly generate a tailored cover letter.</p>
                    </div>
                    <Link
                        to="/cover-letter"
                        className="inline-block text-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-1">
                        Generate Cover Letter &rarr;
                    </Link>
                </div>

                <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-8 shadow-xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Your Progress</h2>
                        <p className="text-gray-400 mb-6">Review your past resumes and interview scorecards.</p>
                    </div>
                    <Link
                        to="/history"
                        className="inline-block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-1">
                        View History &rarr;
                    </Link>
                </div>
            </div>

            
            {/* The Main Upload Card */}
            <div className="max-w-xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <h2 className="text-2xl font-semibold mb-2">Upload Resume</h2>
                <p className="text-gray-400 mb-8">Upload your PDF or DOCX resume to get instant AI feedback on your ATS score, strengths, and weaknesses.</p>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* The Drop Zone (Styled to look like a drag-and-drop box) */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 hover:border-purple-500 bg-gray-800/50 rounded-2xl p-10 transition-all">
                    
                    {/* The actual HTML file input is hidden for aesthetic purposes */}
                    <input 
                        type="file" 
                        id="resumeUpload" 
                        className="hidden" 
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                    />
                    
                    {/* Clicking this label triggers the hidden input! */}
                    <label 
                        htmlFor="resumeUpload" 
                        className="cursor-pointer flex flex-col items-center"
                    >
                        {/* A sleek cloud upload icon */}
                        <svg className="w-12 h-12 text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-purple-400 font-medium hover:underline">Click to browse</span>
                        <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
                    </label>

                    {/* Show the name of the file once they select it */}
                    {file && (
                        <div className="mt-6 text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-2 rounded-lg text-sm truncate max-w-full">
                            Selected: {file.name}
                        </div>
                    )}
                </div>

                {/* The Upload Action Button */}
                <button
                    onClick={handleUpload}
                    disabled={isUploading || !file} // Disabled if loading or if no file picked
                    className={`w-full mt-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg 
                        ${isUploading || !file 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]'
                        }`}
                >
                    {isUploading ? 'Uploading & Parsing...' : 'Analyze My Resume'}
                </button>
            </div>
        </div>
    );
}
