
import React, { useState, useEffect } from 'react';
import { Syllabus, UserProgress, Difficulty } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QuizEngine from './components/QuizEngine';
import TutorChat from './components/TutorChat';
import ProgressAnalytics from './components/ProgressAnalytics';
import SyllabusMap from './components/SyllabusMap';
import Login from './components/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string; picture: string; regNo: string } | null>(() => {
    const saved = localStorage.getItem('lumina_current_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'quiz' | 'tutor' | 'analytics' | 'map'>('dashboard');
  const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedSyllabus = localStorage.getItem(`lumina_syllabus_${user.regNo}`);
      const savedProgress = localStorage.getItem(`lumina_progress_${user.regNo}`);
      try {
        if (savedSyllabus) setSyllabus(JSON.parse(savedSyllabus));
        if (savedProgress) setProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Data load error", e);
      }
    }
  }, [user]);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('lumina_current_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSyllabus(null);
    setProgress(null);
    localStorage.removeItem('lumina_current_user');
    setActiveTab('dashboard');
  };

  const handleSyllabusUpload = (newSyllabus: Syllabus) => {
    if (!user) return;
    setSyllabus(newSyllabus);
    const initialProgress: UserProgress = {
      syllabusId: newSyllabus.id,
      score: 0,
      totalAttempted: 0,
      currentLevel: Difficulty.EASY,
      gaps: []
    };
    setProgress(initialProgress);
    localStorage.setItem(`lumina_syllabus_${user.regNo}`, JSON.stringify(newSyllabus));
    localStorage.setItem(`lumina_progress_${user.regNo}`, JSON.stringify(initialProgress));
    setActiveTab('map');
  };

  const updateProgress = (updates: Partial<UserProgress>) => {
    if (progress && user) {
      const newProgress = { ...progress, ...updates };
      setProgress(newProgress);
      localStorage.setItem(`lumina_progress_${user.regNo}`, JSON.stringify(newProgress));
    }
  };

  const handleTopicAction = (topic: string, action: 'quiz' | 'tutor') => {
    setSelectedTopic(null);
    setTimeout(() => {
      setSelectedTopic(topic);
      setActiveTab(action);
    }, 0);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const navItems = [
    { id: 'dashboard', icon: 'fa-table-columns', label: 'Home' },
    { id: 'map', icon: 'fa-diagram-project', label: 'Roadmap' },
    { id: 'quiz', icon: 'fa-bolt', label: 'Adaptive' },
    { id: 'tutor', icon: 'fa-comment-dots', label: 'Neural' },
    { id: 'analytics', icon: 'fa-chart-line', label: 'Cognitive' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50 pb-20 lg:pb-0 selection:bg-indigo-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} syllabus={syllabus} user={user} onLogout={handleLogout} />
      
      <main className="flex-1 lg:ml-64 p-4 md:p-10 transition-all">
        <header className="mb-10 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">
              {activeTab === 'dashboard' && 'Neural Dashboard'}
              {activeTab === 'map' && 'Cognitive Roadmap'}
              {activeTab === 'quiz' && 'Adaptive Engine'}
              {activeTab === 'tutor' && 'AI Neural Tutor'}
              {activeTab === 'analytics' && 'Cognitive Metrics'}
            </h1>
            <p className="text-indigo-600 text-[10px] md:text-xs mt-2 font-black uppercase tracking-[0.4em] truncate">
              {syllabus ? `Projected Subject: ${syllabus.subject}` : `Neural Sync Active: ${user.name.split(' ')[0]}`}
            </p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex items-center gap-4 bg-white p-3 px-6 rounded-2xl shadow-xl shadow-indigo-50 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <i className="fa-solid fa-fingerprint"></i>
              </div>
              <div className="pr-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{user.regNo}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">{progress?.currentLevel || 'Syncing...'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard syllabus={syllabus} onUpload={handleSyllabusUpload} progress={progress} onNavigate={setActiveTab} user={user} />}
          {activeTab === 'map' && syllabus && <SyllabusMap syllabus={syllabus} onTopicAction={handleTopicAction} />}
          {activeTab === 'quiz' && syllabus && progress && <QuizEngine syllabus={syllabus} progress={progress} onProgressUpdate={updateProgress} onNavigate={setActiveTab} initialTopic={selectedTopic} onClearTopic={() => setSelectedTopic(null)} />}
          {activeTab === 'tutor' && syllabus && <TutorChat syllabus={syllabus} initialTopic={selectedTopic} onClearTopic={() => setSelectedTopic(null)} />}
          {activeTab === 'analytics' && syllabus && progress && <ProgressAnalytics syllabus={syllabus} progress={progress} onTopicAction={handleTopicAction} />}

          {!syllabus && activeTab !== 'dashboard' && (
            <div className="text-center py-32 bg-white rounded-[3rem] shadow-2xl border-2 border-dashed border-gray-100 animate-fadeIn">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <i className="fa-solid fa-brain text-4xl text-gray-200"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-800 mb-2">Neural Link Incomplete</h2>
              <p className="text-gray-400 mb-10 max-w-xs mx-auto font-medium">Please initialize your curriculum data in the Neural Dashboard.</p>
              <button onClick={() => setActiveTab('dashboard')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-indigo-100 transition-all active:scale-95">Initialize Roadmap</button>
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-between items-center lg:hidden z-[1000] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-gray-400'}`}>
            <i className={`fa-solid ${item.icon} text-xl`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
