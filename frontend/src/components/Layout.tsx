import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            name: 'Mock Interview',
            path: '/interview/setup',
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Cover Letter',
            path: '/cover-letter',
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            )
        },
        {
            name: 'History',
            path: '/history',
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-sans">
            {/* Left Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between fixed top-0 left-0 h-screen overflow-y-auto">
                <div>
                    {/* Logo Area */}
                    <div className="flex items-center px-6 py-8 border-b border-gray-100">
                        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
                            I
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 leading-tight">Interview<br/>Prep</h1>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-2 mt-4">
                        {navItems.map((item) => {
                            // Check if current route is active
                            const isActiveRoute = location.pathname === item.path || 
                                                  (item.path !== '/dashboard' && location.pathname.startsWith(item.path.split('/')[1] ? `/${item.path.split('/')[1]}` : ''));
                            
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-xl transition-all font-medium ${
                                        isActiveRoute
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {item.icon}
                                    {item.name}
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom User Area */}
                <div className="p-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center px-4 py-3 mb-2 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-900 flex items-center justify-center font-bold text-sm mr-3">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">Candidate</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
