import { useState, useEffect, useRef } from 'react';
import LoginGate from './components/LoginGate';
import Dashboard from './components/Dashboard';
import ModuleAcademic from './components/ModuleAcademic';
import ModulePhysical from './components/ModulePhysical';
import ModuleSchedule from './components/ModuleSchedule';
import ModuleChat from './components/ModuleChat';
import ModuleMusic from './components/ModuleMusic';
import ModuleMemories from './components/ModuleMemories';
import MainHub from './components/MainHub';
import InstitutionalLogo from './components/InstitutionalLogo';
import { motion, AnimatePresence } from 'motion/react';
import { VORTEX_PROFILES } from './data/profiles';
import { UserProfile } from './types';
import { ChevronLeft } from 'lucide-react';
import { supabase } from './lib/supabase';

const MUSIC_PLAYLIST = [
  { title: 'The Weeknd - What You Need', src: '/audio/the-weeknd-what-you-need.mp3' },
  { title: 'Survivor - Eye Of The Tiger Lyrics', src: '/audio/survivor-eye-of-the-tiger.mp3' },
  { title: 'Linkin Park - What Ive Done Lyrics', src: '/audio/linkin-park-what-ive-done.mp3' },
];

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('hub');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [globalData, setGlobalData] = useState<{ guides: any[], notes: any[] }>(() => {
    const saved = localStorage.getItem('vortex_global_data');
    return saved ? JSON.parse(saved) : { guides: [], notes: [] };
  });

  // Sync with Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guidesRes, notesRes] = await Promise.all([
          supabase.from('guides').select('*').order('created_at', { ascending: false }),
          supabase.from('notes').select('*').order('created_at', { ascending: false })
        ]);
        
        if (guidesRes.error) throw guidesRes.error;
        if (notesRes.error) throw notesRes.error;
        
        const guides = guidesRes.data.map(g => ({
          id: g.id,
          title: g.title,
          date: new Date(g.date).toLocaleDateString('es-CL'),
          status: g.status,
          category: g.category,
          fileUrl: g.file_url
        }));
        
        const notes = notesRes.data.map(n => ({
          id: n.id,
          tag: n.tag,
          text: n.text,
          date: new Date(n.date).toLocaleDateString('es-CL')
        }));

        const newData = { guides, notes };
        setGlobalData(newData);
        localStorage.setItem('vortex_global_data', JSON.stringify(newData));
      } catch (err) {
        console.error("Error fetching from Supabase:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.volume = 1;
    audio.src = MUSIC_PLAYLIST[currentSongIndex].src;
    audio.load();
    if (isMusicPlaying) {
      audio.play().catch((err) => console.error('Error reproduciendo audio:', err));
    }
  }, [currentSongIndex]);

  const toggleMusicPlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => console.error('Error reproduciendo audio:', err));
    }
  };

  const addGlobalGuide = async (guide: any) => {
    try {
      // Guardado local inmediato para no esperar (Optimistic UI)
      const newGlobalData = { ...globalData, guides: [guide, ...globalData.guides] };
      setGlobalData(newGlobalData);
      localStorage.setItem('vortex_global_data', JSON.stringify(newGlobalData));

      // Guardar en Supabase (si tiene un UUID falso, Supabase lo ignorará o podemos no enviarlo)
      const { error } = await supabase.from('guides').insert([{
        id: guide.id, // Pasamos el UUID generado en el frontend
        title: guide.title,
        category: guide.category,
        status: guide.status || 'PENDING',
        date: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;
    } catch (err) {
      console.error("Error adding guide to Supabase:", err);
    }
  };

  const addGlobalNote = async (note: any) => {
    try {
      // Guardado local inmediato
      const newGlobalData = { ...globalData, notes: [note, ...globalData.notes] };
      setGlobalData(newGlobalData);
      localStorage.setItem('vortex_global_data', JSON.stringify(newGlobalData));

      // Guardar en Supabase
      const { error } = await supabase.from('notes').insert([{
        id: note.id,
        tag: note.tag,
        text: note.text,
        date: new Date().toISOString().split('T')[0]
      }]);

      if (error) throw error;
    } catch (err) {
      console.error("Error adding note to Supabase:", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement));
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const element = document.documentElement as any;
      const requestMethod = element.requestFullscreen || 
                           element.webkitRequestFullscreen || 
                           element.mozRequestFullScreen || 
                           element.msRequestFullscreen;

      if (requestMethod) {
        requestMethod.call(element).catch((err: any) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
          alert(`Error de pantalla completa: Tu navegador o entorno actual no permite esta acción (${err.message}). Si estás en una vista previa integrada, intenta abrirlo en una pestaña nueva.`);
        });
      } else {
        alert("Tu navegador no soporta el modo pantalla completa.");
      }
    } else {
      const doc = document as any;
      const exitMethod = doc.exitFullscreen || 
                         doc.webkitExitFullscreen || 
                         doc.mozCancelFullScreen || 
                         doc.msExitFullscreen;
      
      if (exitMethod) {
        exitMethod.call(doc).catch((err: any) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  useEffect(() => {
    // Reset scroll when tab changes
    const mainArea = document.querySelector('main');
    if (mainArea) mainArea.scrollTo(0, 0);

    const savedCode = localStorage.getItem('vortex_code');
    const savedData = localStorage.getItem('vortex_user_data');
    
    if (savedCode) {
      const baseProfile = VORTEX_PROFILES[savedCode] || VORTEX_PROFILES['VX-13'];
      if (savedData) {
        const customData = JSON.parse(savedData);
        if (customData.code === savedCode) {
          setUserProfile({ ...baseProfile, ...customData });
        } else {
          setUserProfile(baseProfile);
        }
      } else {
        setUserProfile(baseProfile);
      }
    }
    // Artificial delay to feel "premium"
    setTimeout(() => setIsInitializing(false), 800);
  }, []);

  const handleLogin = (code: string) => {
    const profile = VORTEX_PROFILES[code] || VORTEX_PROFILES['VX-13'];
    setUserProfile(profile);
    localStorage.setItem('vortex_code', code);
    // Try to load existing data for this code
    const savedData = localStorage.getItem(`vortex_data_${code}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setUserProfile({ ...profile, ...parsed });
    }
  };

  const updateProfile = (newData: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated = { ...userProfile, ...newData };
    setUserProfile(updated);
    localStorage.setItem(`vortex_data_${userProfile.code}`, JSON.stringify(updated));
  };

  const handleLogout = () => {
    setUserProfile(null);
    localStorage.removeItem('vortex_code');
    setActiveTab('hub');
  };

  if (isInitializing) {
    return (
      <>
        <div className="absolute top-8 left-8 z-20">
          <InstitutionalLogo className="w-16 h-16" onClick={toggleFullscreen} />
        </div>
        <div className="min-h-screen bg-vortex-dark flex flex-col items-center justify-center gap-8">
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-vortex-accent text-3xl font-serif italic tracking-widest text-center"
          >
            LOS HÉROES<br/>
            <span className="text-sm tracking-[0.5em] text-white">DE ÑUBLE</span>
          </motion.div>
        </div>
      </>
    );
  }

  if (!userProfile) {
    return <LoginGate onLogin={handleLogin} onToggleFullscreen={toggleFullscreen} />;
  }

  const renderContent = () => {
    // Merge personal profile with global guides/notes
    const connectedProfile = userProfile ? {
      ...userProfile,
      guides: globalData.guides,
      notes: globalData.notes
    } : null;

    if (!connectedProfile) return null;

    switch (activeTab) {
      case 'hub':
        return <MainHub onSelectModule={setActiveTab} userName={connectedProfile.name} onToggleFullscreen={toggleFullscreen} isFullscreen={isFullscreen} onLogout={handleLogout} />;
      case 'dashboard':
        return <Dashboard profile={connectedProfile} updateProfile={updateProfile} />;
      case 'academic':
      case 'history':
      case 'languages':
      case 'paes-math':
      case 'paes-lang':
      case 'psychology':
      case 'doctrine':
      case 'admin':
        return (
          <ModuleAcademic 
            profile={connectedProfile} 
            updateProfile={updateProfile} 
            activeTab={activeTab} 
            onAddGlobalGuide={addGlobalGuide}
            onAddGlobalNote={addGlobalNote}
          />
        );
      case 'physical':
        return <ModulePhysical profile={connectedProfile} updateProfile={updateProfile} />;
      case 'schedule':
        return <ModuleSchedule />;
      case 'chat':
        return <ModuleChat currentUser={connectedProfile} />;
      case 'music':
        return (
          <ModuleMusic
            isPlaying={isMusicPlaying}
            songs={MUSIC_PLAYLIST}
            currentSongIndex={currentSongIndex}
            onTogglePlayback={toggleMusicPlayback}
            onSelectSong={setCurrentSongIndex}
          />
        );
      case 'memories':
        return <ModuleMemories />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-slate-700 py-20 border border-slate-800 rounded opacity-50">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded flex items-center justify-center mb-6 text-2xl font-serif italic">?</div>
            <h3 className="text-xl font-serif italic mb-2 tracking-widest text-slate-500">Terminal Restringida</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Enlace encriptado o módulo en desarrollo</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-vortex-dark">
      <audio ref={audioRef} preload="metadata" onPlay={() => setIsMusicPlaying(true)} onPause={() => setIsMusicPlaying(false)} />
      {/* Sidebar is now conditional or hidden in isolated mode */}
      {/* For this specific request, we won't show the sidebar at all if we are in a module, 
          instead we show a "Back to Menu" button to keep it isolated. */}
      
      <main className={`min-h-screen ${activeTab === 'hub' ? '' : 'p-6 md:p-12'} relative flex flex-col scroll-smooth`}>
        {/* Isolated Navigation Bar (only when not in HUB) */}
        {activeTab !== 'hub' && (
          <nav className="fixed top-0 left-0 right-0 h-16 bg-vortex-surface/80 backdrop-blur-md border-b border-white/5 z-40 px-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <InstitutionalLogo className="w-10 h-10" onClick={toggleFullscreen} />
              <button 
                onClick={() => setActiveTab('hub')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold group"
              >
                <div className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-[#2563eb]/50">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">Regresar al Menú Principal</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4">
                <span className="text-[10px] text-slate-600 font-mono italic">TERMINAL // {activeTab.toUpperCase()}</span>
                <button onClick={handleLogout} className="text-slate-500 hover:text-vortex-accent transition-colors text-[9px] uppercase tracking-widest font-bold">Cerrar Sesión</button>
              </div>
            </div>
          </nav>
        )}

        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-vortex-accent/5 rounded-full blur-[150px] -z-10 select-none pointer-events-none" />
        
        {/* Loading Indicator for "Page Changes" */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`loader-${activeTab}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`fixed top-0 left-0 right-0 h-0.5 bg-vortex-accent z-50 pointer-events-none origin-left`}
          />
        </AnimatePresence>

        <div className={`flex-1 ${activeTab !== 'hub' ? 'pt-16' : ''}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={activeTab === 'hub' ? 'w-full' : 'max-w-7xl mx-auto'}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {activeTab !== 'hub' && (
          <footer className="mt-auto py-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between gap-4 text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">
            <div className="flex gap-4 items-center">
              <span className="w-1.5 h-1.5 bg-[#2563eb] rounded-full opacity-50"></span>
              <p>© 2026 PREUNIVERSITARIO LOS HÉROES DE ÑUBLE // V2.0.0</p>
            </div>
            <div className="flex gap-8">
              <p>Destino: {userProfile.targetInstitution}</p>
              <p>ID Sesión: {userProfile.code}</p>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}
