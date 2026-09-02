import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export default function CoverLetterGenerator() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available resumes when component mounts
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await apiFetch('user/history');
        if (data.resumeAnalyses) {
          const uniqueResumes = data.resumeAnalyses.map((a: any) => a.resume);
          // deduplicate if multiple analyses for same resume
          const unique = Array.from(new Set(uniqueResumes.map((a: any) => a.id)))
            .map(id => uniqueResumes.find((a: any) => a.id === id));
          
          setResumes(unique);
          if (unique.length > 0) setSelectedResumeId(unique[0].id);
        }
      } catch (err) {
        console.error('Failed to load resumes for cover letter generator');
      }
    };
    fetchResumes();
  }, []);

  const handleJDUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('jd', file);

    try {
      const response = await fetch('/api/cover-letter/upload-jd', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJobDescription(data.text);
      setSuccess('Job description loaded from file!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload JD file');
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId) return setError('Please select a resume.');
    if (!jobDescription.trim()) return setError('Please paste a job description.');

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedContent('');

    try {
      const data = await apiFetch('cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId: selectedResumeId, jobDescription }),
      });
      setGeneratedContent(data.content);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cover letter.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    setIsSaving(true);
    setError('');
    
    try {
      await apiFetch('cover-letter/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeId: selectedResumeId, 
          jobDescription,
          content: generatedContent 
        }),
      });
      setSuccess('Cover letter saved to your history!');
    } catch (err: any) {
      setError('Failed to save cover letter.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">
        AI Cover Letter Generator
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-medium">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Form */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col space-y-6">
          
          <div>
            <label className="block text-gray-700 font-bold mb-2">1. Select Your Resume</label>
            <select 
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors appearance-none font-medium"
            >
              <option value="" disabled>Select a previously uploaded resume</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.fileUrl.split('_').pop()} (Uploaded: {new Date(r.uploadedAt).toLocaleDateString()})
                </option>
              ))}
            </select>
            {resumes.length === 0 && (
              <p className="text-sm text-gray-900 font-medium mt-2">
                No resumes found. Please upload a resume on the Dashboard first!
              </p>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 font-bold">2. Paste or Upload Job Description</label>
              <label className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-900 px-3 py-1 rounded-lg cursor-pointer transition-colors border border-gray-300 font-medium">
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleJDUpload} />
                Upload PDF/DOCX
              </label>
            </div>
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here..."
              className="w-full flex-1 min-h-[200px] bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedResumeId || !jobDescription}
            className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm
              ${isGenerating || !selectedResumeId || !jobDescription 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-gray-900 hover:bg-black text-white shadow-md hover:-translate-y-0.5'
              }`}
          >
            {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>

        {/* Right Column: Output / Editor */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Generated Cover Letter</h2>
            {generatedContent && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  setSuccess('Copied to clipboard!');
                  setTimeout(() => setSuccess(''), 3000);
                }}
                className="text-sm font-medium text-gray-900 hover:text-gray-900 bg-gray-100 px-3 py-1 rounded-lg"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
          
          {generatedContent ? (
            <div className="flex-1 flex flex-col">
              <textarea 
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="w-full flex-1 min-h-[400px] bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-6 py-5 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors resize-none leading-relaxed"
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="mt-6 w-full py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save to History'}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-10">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <p className="font-medium text-gray-500">Your tailored cover letter will appear here.</p>
              <p className="text-sm mt-2">You can edit the text directly before saving.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
