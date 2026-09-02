import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(''); 
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setIsUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file); 

        try {
            const data = await apiFetch('resume/upload', {
                method: 'POST',
                body: formData,
            });
            navigate(`/analysis/${data.resume.id}`);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center pt-10">
            <div className="text-center mb-10">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
                    Welcome back, {user?.name?.split(' ')[0]}
                </h2>
                <p className="text-lg text-gray-500">
                    Upload your resume to get instant ATS feedback and AI-driven insights.
                </p>
            </div>

            {/* The Main Upload Card */}
            <div className="w-full max-w-xl bg-white border border-gray-100 p-10 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Resume</h3>
                <p className="text-gray-500 mb-8 text-sm">Upload your PDF or DOCX file to begin.</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* The Drop Zone */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 rounded-2xl p-10 transition-colors">
                    
                    <input 
                        type="file" 
                        id="resumeUpload" 
                        className="hidden" 
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                    />
                    
                    <label 
                        htmlFor="resumeUpload" 
                        className="cursor-pointer flex flex-col items-center w-full h-full"
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-gray-800">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <span className="text-gray-900 font-bold mb-1">Click to browse</span>
                        <span className="text-gray-400 text-sm">or drag and drop</span>
                    </label>

                    {/* Show the name of the file once they select it */}
                    {file && (
                        <div className="mt-6 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-sm font-medium truncate max-w-full">
                            Selected: {file.name}
                        </div>
                    )}
                </div>

                {/* The Upload Action Button */}
                <button
                    onClick={handleUpload}
                    disabled={isUploading || !file} 
                    className={`w-full mt-8 py-3.5 rounded-xl font-bold transition-all shadow-md 
                        ${isUploading || !file 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                            : 'bg-gray-900 hover:bg-black text-white hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                >
                    {isUploading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading & Parsing...
                        </span>
                    ) : 'Analyze My Resume'}
                </button>
            </div>
        </div>
    );
}
