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

  if (loading) return <div className="text-center mt-20 text-gray-400">Loading interview...</div>;

  return (
    <div className="max-w-4xl mx-auto h-[85vh] flex flex-col bg-[#1e1e2d] border border-gray-800 rounded-xl overflow-hidden mt-6 shadow-2xl">
      
      {/* Header */}
      <div className="bg-[#151521] border-b border-gray-800 p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-white">{session?.company} Interview</h2>
          <p className="text-sm text-gray-400">{session?.role} • {session?.difficulty} • {session?.type}</p>
        </div>
        <button onClick={endInterview} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors">
          End Interview
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-none border border-gray-700 p-4 text-gray-400">
              <span className="animate-pulse">Typing...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#151521] p-4 border-t border-gray-800">
        <form onSubmit={sendMessage} className="flex gap-3">
          <button
            type="button"
            onClick={toggleListen}
            className={`p-4 rounded-xl flex items-center justify-center transition-colors ${
              isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
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
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
          
          <button
            type="submit"
            disabled={!input.trim() || isAiTyping}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
