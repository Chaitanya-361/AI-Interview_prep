import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const resumeId = location.state?.resumeId || null; 

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    difficulty: 'Medium',
    type: 'Behavioral',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    try {
      setLoading(true);
      const res = await apiFetch('interview/setup', {
        method: 'POST',
        body: JSON.stringify({ ...formData, resumeId }),
      });
      // Redirect to the actual interview chat room
      navigate(`/interview/${res.id}`);
    } catch (error) {
      console.error(error);
      alert('Error: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">
        Configure Mock Interview
      </h1>
      
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Target Company</label>
            <input
              required
              type="text"
              placeholder="e.g. Google, Amazon, Stripe..."
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Target Role</label>
            <input
              required
              type="text"
              placeholder="e.g. Frontend Engineer, Product Manager..."
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
              >
                <option value="Easy">Easy (Entry Level)</option>
                <option value="Medium">Medium (Mid Level)</option>
                <option value="Hard">Hard (Senior)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Interview Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
              >
                <option value="Behavioral">Behavioral / HR</option>
                <option value="Technical">Technical (Concepts)</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 mt-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
          >
            {loading ? 'Setting up...' : 'Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );
}
