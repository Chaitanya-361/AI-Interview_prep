import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

// Browser type definitions for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface Message {
  id: string;
  role: string;
  content: string;
}

export default function InterviewRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchSession();
    setupSpeechRecognition();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const setupSpeechRecognition = () => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => prev + ' ' + transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setInput(''); // Clear input when starting to speak
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        alert("Your browser doesn't support speech recognition. Try Google Chrome.");
      }
    }
  };

  const fetchSession = async () => {
    try {
      const res = await apiFetch(`interview/${id}`);
      setSession(res);
      setMessages(res.messages || []);
      if (res.status === 'completed') navigate(`/interview/${id}/scorecard`);
    } catch (error) {
      console.error(error);
      alert('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiTyping) return;

    // Stop listening if they hit send
    if (isListening) toggleListen();

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: 'temp', role: 'user', content: userMessage }]);
    setIsAiTyping(true);

    try {
      const res = await apiFetch(`interview/${id}/message`, { method: 'POST', body: JSON.stringify({ content: userMessage }) });
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== 'temp');
        return Array.isArray(res) ? [...withoutTemp, ...res] : [...withoutTemp, res];
      });
    } catch (error) {
      console.error(error);
      alert('Failed to send message');
    } finally {
      setIsAiTyping(false);
    }
  };

  const endInterview = async () => {
    if (!confirm('Are you sure you want to end the interview?')) return;
    try {
      setLoading(true);
      if (isListening) toggleListen();
      await apiFetch(`interview/${id}/end`, { method: 'POST' });
      navigate(`/interview/${id}/scorecard`);
    } catch (error) {
      console.error(error);
      alert('Failed to end interview');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500 font-medium">Loading interview...</div>;

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden mt-6 shadow-sm">
      
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{session?.company} Interview</h2>
          <p className="text-sm text-gray-500 font-medium">{session?.role} • {session?.difficulty} • {session?.type}</p>
        </div>
        <button onClick={endInterview} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors border border-red-100 hover:border-red-600">
          End Interview
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gray-900 text-white rounded-br-none font-medium' 
                : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 rounded-2xl rounded-bl-none border border-gray-200 p-4 text-gray-500 shadow-sm font-medium">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-gray-200">
        <form onSubmit={sendMessage} className="flex gap-3">
          <button
            type="button"
            onClick={toggleListen}
            className={`p-4 rounded-xl flex items-center justify-center transition-colors border ${
              isListening 
                ? 'bg-red-500 border-red-600 animate-pulse text-white shadow-sm' 
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Use voice input"
          >
            {/* Microphone Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your answer..."}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors font-medium"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isAiTyping}
            className="bg-gray-900 hover:bg-black text-white px-8 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:hover:bg-gray-900 shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
