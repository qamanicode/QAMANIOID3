import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { 
  Zap, Code, Terminal as TerminalIcon, Bot, BookOpen, Layers, Rocket, 
  Search, Download, Share2, Play, Plus, X, Command, Globe, Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { debugCode } from './services/geminiService';

// --- Types ---
type TerminalTab = {
  id: string;
  title: string;
  history: string[];
};

type Package = {
  name: string;
  version: string;
  description: string;
  installed: boolean;
};

// --- Components ---

const SplashScreen = () => (
  <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
      className="text-6xl font-extrabold font-display text-cosmic-blue drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] uppercase tracking-tighter"
    >
      QAMANIOID3
    </motion.div>
    <div className="mt-8 flex gap-2">
      <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-75"></div>
      <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-150"></div>
      <div className="w-2 h-2 bg-cyber-cyan rounded-full animate-bounce delay-300"></div>
    </div>
    <p className="mt-4 text-muted text-xs uppercase tracking-widest font-mono">Initializing Imperial Core v2.0</p>
  </div>
);

const KeyboardToolbar = ({ onInsert }: { onInsert: (s: string) => void }) => {
  const symbols = ['(', ')', ':', '[', ']', '{', '}', '=', '+', '"', "'", '.', ',', '#', '$', '|', '>', '_'];
  return (
    <div className="flex bg-card-background border-t border-border overflow-x-auto p-2 gap-2 scrollbar-hide shrink-0">
      {symbols.map(s => (
        <button 
          key={s} 
          onClick={() => onInsert(s)} 
          className="px-4 py-1.5 bg-background border border-border rounded-md text-text hover:bg-cosmic-blue hover:border-cyber-cyan transition-all font-mono min-w-[44px] text-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [stage, setStage] = useState<'splash' | 'landing' | 'ide'>('splash');
  const [activeSidebar, setActiveSidebar] = useState<'files' | 'pip' | 'ai'>('files');
  const [code, setCode] = useState("import os\nimport sys\n\ndef main():\n    print('Welcome to QAMANIOID3 Terminal Environment')\n    print(f'Python version: {sys.version}')\n\nif __name__ == '__main__':\n    main()");
  const [isDebugging, setIsDebugging] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Terminal State
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    { id: 'tab-1', title: 'bash', history: ['QAMANIOID3 OS [Version 2.0.4] ready...', 'Type "help" for commands.'] }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('tab-1');
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // PIP Manager State
  const [searchQuery, setSearchQuery] = useState("");
  const [installingPack, setInstallingPack] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [availablePackages] = useState<Package[]>([
    { name: 'NumPy', version: '1.24.3', description: 'Fundamental package for scientific computing.', installed: true },
    { name: 'Pandas', version: '2.0.2', description: 'Data analysis and manipulation library.', installed: true },
    { name: 'TensorFlow', version: '2.12.0', description: 'End-to-end open source platform for ML.', installed: false },
    { name: 'PyTorch', version: '2.0.1', description: 'Tensors and Dynamic neural networks with strong GPU acceleration.', installed: false },
    { name: 'Requests', version: '2.31.0', description: 'Elegant and simple HTTP library for Python.', installed: false },
    { name: 'Flask', version: '2.3.2', description: 'Lightweight WSGI web application framework.', installed: false },
    { name: 'OpenCV', version: '4.8.0', description: 'Open Source Computer Vision Library.', installed: false },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setStage('landing'), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalTabs]);

  const insertCodeSymbol = (symbol: string) => setCode(prev => prev + symbol);

  // Simulated Terminal Logic
  const executeTerminalCommand = (cmd: string) => {
    const newTabs = [...terminalTabs];
    const tabIndex = newTabs.findIndex(t => t.id === activeTerminalId);
    if (tabIndex === -1) return;

    const history = [...newTabs[tabIndex].history];
    history.push(`$ ${cmd}`);

    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        history.push('Available commands: ls, cd, mkdir, pip, python, clear, date, whoami, help');
        break;
      case 'ls':
        history.push('main.py  utils.py  requirements.txt  src/');
        break;
      case 'clear':
        history.length = 0;
        history.push('Terminal cleared.');
        break;
      case 'date':
        history.push(new Date().toString());
        break;
      case 'whoami':
        history.push('imperial_developer');
        break;
      case 'python':
        if (parts[1] === 'main.py') {
          history.push('Running main.py...');
          history.push('Welcome to QAMANIOID3 Terminal Environment');
          history.push('Python version: 3.11.0 (Imperial build)');
        } else {
          history.push('Python 3.11.0 (Imperial) - Type "exit()" to quit.');
        }
        break;
      case 'pip':
        if (parts[1] === 'install') {
          history.push(`Searching for ${parts[2]}...`);
          history.push(`Successfully installed ${parts[2]}-latest`);
        } else {
          history.push('pip 23.1.2 - Usage: pip install <package>');
        }
        break;
      case '':
        break;
      default:
        history.push(`bash: ${command}: command not found`);
    }

    newTabs[tabIndex].history = history;
    setTerminalTabs(newTabs);
    setTerminalInput("");
  };

  const handleRunCode = () => {
    executeTerminalCommand('python main.py');
  };

  const addTerminalTab = () => {
    const newId = `tab-${Date.now()}`;
    setTerminalTabs([...terminalTabs, { id: newId, title: 'bash', history: [`Session ${terminalTabs.length + 1} started.`] }]);
    setActiveTerminalId(newId);
  };

  const removeTerminalTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (terminalTabs.length === 1) return;
    const newTabs = terminalTabs.filter(t => t.id !== id);
    setTerminalTabs(newTabs);
    if (activeTerminalId === id) setActiveTerminalId(newTabs[0].id);
  };

  const handleInstallPackage = (name: string) => {
    setInstallingPack(name);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(old => {
        if (old >= 100) {
          clearInterval(interval);
          setInstallingPack(null);
          executeTerminalCommand(`pip install ${name}`);
          return 100;
        }
        return old + 5;
      });
    }, 100);
  };

  const handleShare = () => {
    setIsSharing(true);
    setTimeout(() => {
      setIsSharing(false);
      alert("Link copied: https://qamanioid3.io/share/" + Math.random().toString(36).substring(7));
    }, 1500);
  };

  if (stage === 'splash') return <SplashScreen />;

  if (stage === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-text font-sans p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4c1d95,_transparent_70%)] opacity-20"></div>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-10 animate-pulse"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 2}px`, height: `${Math.random() * 2}px`, animationDelay: `${Math.random() * 5}s` }}
            />
          ))}
        </div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center max-w-2xl px-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-deep-purple via-cosmic-blue to-cyber-cyan flex items-center justify-center shadow-2xl shadow-cosmic-blue/20">
              <Code size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold font-display text-text mb-4 tracking-tighter uppercase italic">
            Qamanioid3
          </h1>
          <p className="text-cyber-cyan text-xl font-display mb-8 tracking-[0.3em] uppercase opacity-80">Codex Imperium</p>
          <p className="text-muted text-lg mb-12 leading-relaxed">
            The world's most advanced Android Python IDE. Linux terminal, smart package management, and AI debugging - all in your pocket.
          </p>
          <button 
            onClick={() => setStage('ide')} 
            className="group relative px-12 py-5 bg-transparent border-2 border-cyber-cyan text-cyber-cyan rounded-full font-display text-2xl hover:bg-cyber-cyan hover:text-background transition-all duration-500 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)]"
          >
            <span className="relative z-10 flex items-center gap-4">
              Launch Terminal <Rocket size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-text selection:bg-cosmic-blue/30 overflow-hidden font-sans">
      {/* --- Top Navbar --- */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card-background/80 backdrop-blur-lg sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setStage('landing')}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-deep-purple to-cosmic-blue flex items-center justify-center font-bold text-white shadow-lg">Q</div>
            <h1 className="text-lg font-bold font-display text-text hidden sm:block uppercase tracking-widest group-hover:text-cyber-cyan transition-colors">QAMANIOID3</h1>
          </div>
          <div className="h-6 w-[1.5px] bg-border mx-2 hidden sm:block"></div>
          <div className="hidden md:flex gap-1">
             <button onClick={handleRunCode} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-matrix-green hover:bg-matrix-green/10 rounded transition uppercase tracking-wider">
               <Play size={14} fill="currentColor" /> Run
             </button>
             <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-cosmic-blue hover:bg-cosmic-blue/10 rounded transition uppercase tracking-wider">
               <Share2 size={14} /> {isSharing ? 'Sharing...' : 'Share'}
             </button>
          </div>
        </div>

        <button 
          onClick={async () => { setIsDebugging(true); const r = await debugCode(code); setTerminalTabs(prev => {
            const next = [...prev];
            const idx = next.findIndex(t => t.id === activeTerminalId);
            next[idx].history.push(`AI DEBUGGER LOG: [NEURAL_ANALYSIS_COMPLETE]`);
            next[idx].history.push(r);
            return next;
          }); setIsDebugging(false); }} 
          disabled={isDebugging}
          className="bg-deep-purple/20 border border-deep-purple/50 text-cyber-cyan px-4 py-1.5 rounded-full font-bold text-xs flex items-center gap-3 hover:bg-deep-purple/40 transition shadow-lg shadow-deep-purple/20 disabled:opacity-50 uppercase tracking-widest"
        >
          <Bot size={16} className={isDebugging ? 'animate-bounce' : ''} /> {isDebugging ? 'Analyzing...' : 'AI Debug'}
        </button>
      </header>

      {/* --- Main Layout --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* --- Sidebar Buttons --- */}
        <aside className="w-16 bg-card-background border-r border-border h-full flex flex-col items-center py-6 gap-8 shrink-0 z-20">
          <button onClick={() => setActiveSidebar('files')} title="File Explorer" className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'files' ? 'bg-cosmic-blue/20 text-cyber-cyan shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Layers size={22} />
          </button>
          <button onClick={() => setActiveSidebar('pip')} title="PIP Manager" className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'pip' ? 'bg-cosmic-blue/20 text-cyber-cyan shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Search size={22} />
          </button>
          <button onClick={() => setActiveSidebar('ai')} title="AI Assistant" className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'ai' ? 'bg-cosmic-blue/20 text-cyber-cyan shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Bot size={22} />
          </button>
          <div className="mt-auto flex flex-col gap-6 mb-6">
            <button className="text-muted hover:text-cyber-cyan transition-all transform hover:scale-110"><Globe size={20}/></button>
            <button className="text-muted hover:text-cyber-cyan transition-all transform hover:scale-110"><Github size={20}/></button>
          </div>
        </aside>

        {/* --- Sidebar Panels --- */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeSidebar}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-72 bg-card-background border-r border-border h-full overflow-y-auto hidden lg:block shrink-0 z-10"
          >
            {activeSidebar === 'files' && (
              <div className="p-6 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] font-bold text-muted uppercase tracking-[0.3em]">Project Explorer</h2>
                  <button className="text-muted hover:text-cyber-cyan transition-colors"><Plus size={16}/></button>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cosmic-blue/10 text-cyber-cyan cursor-pointer border border-cosmic-blue/20 shadow-sm"><Layers size={18}/> main.py</div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer text-muted group">
                    <Layers size={18} className="group-hover:text-cyber-cyan transition-colors"/> utils.py
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer text-muted group">
                    <Code size={18} className="group-hover:text-cyber-cyan transition-colors"/> requirements.txt
                  </div>
                </div>
              </div>
            )}
            {activeSidebar === 'pip' && (
              <div className="p-6 flex flex-col gap-8">
                <h2 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2"><Download size={14}/> Hyper-PIP Engine</h2>
                <div className="relative group">
                  <Search size={14} className="absolute left-3 top-3 text-muted group-focus-within:text-cyber-cyan transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search package index..." 
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-cosmic-blue outline-none transition-all shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid gap-4">
                  {availablePackages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(lib => (
                    <motion.div 
                      layout
                      key={lib.name} 
                      className="glass-card hover:border-cosmic-blue/50 transition-all group p-4 border border-border/50 bg-black/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-sm font-bold group-hover:text-cyber-cyan transition-colors">{lib.name}</span>
                         <span className="text-[10px] text-muted font-mono">{lib.version}</span>
                      </div>
                      <p className="text-[11px] text-muted mb-4 line-clamp-2 leading-relaxed">{lib.description}</p>
                      {installingPack === lib.name ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-[9px] uppercase tracking-widest text-cyber-cyan">
                             <span>Installing...</span>
                             <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-white/5">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-cosmic-blue to-cyber-cyan shadow-[0_0_15px_#22d3ee]"/>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleInstallPackage(lib.name)}
                          className={`w-full text-[10px] uppercase font-bold py-2 rounded-lg transition-all transform active:scale-95 ${lib.installed ? 'bg-matrix-green/10 text-matrix-green border border-matrix-green/20' : 'bg-cosmic-blue text-white hover:bg-cyber-cyan hover:text-background shadow-lg shadow-cosmic-blue/20'}`}
                        >
                          {lib.installed ? 'Reinstall Package' : 'Install Package'}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {activeSidebar === 'ai' && (
              <div className="p-6 flex flex-col gap-6">
                <h2 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] flex items-center gap-2"><Bot size={14}/> Neural Assistant</h2>
                <div className="bg-background/50 rounded-2xl p-5 border border-border relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                      <Bot size={40} />
                   </div>
                   <p className="text-xs leading-relaxed text-text relative z-10">
                     Systems operational. Imperial neural network linked. I can analyze logic, refactor blocks, and eliminate architectural bugs.
                   </p>
                </div>
                <div className="space-y-3">
                   <button className="w-full py-3 text-[10px] uppercase tracking-widest font-bold border border-border rounded-xl hover:border-cyber-cyan hover:text-cyber-cyan transition-all">Optimization Log</button>
                   <button className="w-full py-3 text-[10px] uppercase tracking-widest font-bold border border-border rounded-xl hover:border-cyber-cyan hover:text-cyber-cyan transition-all">Refactor History</button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* --- Editor & Terminal Area --- */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* --- Editor Area --- */}
          <div className="flex-1 overflow-hidden relative border-b border-border bg-[#0a0a0c]">
            <div className="h-10 bg-card-background/30 border-b border-border flex items-center px-6 gap-6 text-[11px] font-mono tracking-wider">
               <div className="flex items-center gap-2 text-cyber-cyan border-b-2 border-cyber-cyan h-full px-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_5px_#22d3ee]"></div>
                 main.py
               </div>
               <span className="text-muted hover:text-text transition-colors cursor-pointer px-3">utils.py</span>
               <span className="text-muted hover:text-text transition-colors cursor-pointer px-3">env.py</span>
            </div>
            <Editor
              height="calc(100% - 40px)"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => v !== undefined && setCode(v)}
              options={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 16,
                minimap: { enabled: true, side: 'right' },
                automaticLayout: true,
                formatOnType: true,
                cursorBlinking: 'smooth',
                lineHeight: 28,
                padding: { top: 20 },
                scrollbar: {
                  verticalSliderSize: 5,
                  horizontalSliderSize: 5,
                }
              }}
            />
          </div>

          <KeyboardToolbar onInsert={insertCodeSymbol} />

          {/* --- Hyper-Terminal --- */}
          <motion.div 
            initial={false}
            animate={{ height: stage === 'ide' ? 260 : 0 }}
            className="bg-[#050507] flex flex-col overflow-hidden relative group border-t border-border"
          >
            <div className="terminal-scanline"></div>
            {/* Terminal Tabs */}
            <div className="flex bg-black/60 border-b border-border/30 overflow-x-auto shrink-0 scrollbar-hide h-12">
               {terminalTabs.map(tab => (
                 <div 
                   key={tab.id} 
                   onClick={() => setActiveTerminalId(tab.id)}
                   className={`px-6 h-full text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-3 cursor-pointer transition-all border-r border-border/20 min-w-[150px] relative ${activeTerminalId === tab.id ? 'bg-matrix-green/5 text-matrix-green after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-matrix-green' : 'text-muted hover:bg-white/5'}`}
                 >
                   <TerminalIcon size={14} className={activeTerminalId === tab.id ? 'animate-pulse' : ''} /> {tab.title}
                   <X size={14} className="ml-auto hover:text-red-500 opacity-20 group-hover:opacity-100 transition-opacity" onClick={(e) => removeTerminalTab(tab.id, e)} />
                 </div>
               ))}
               <button onClick={addTerminalTab} className="px-4 text-muted hover:text-matrix-green transition-colors border-r border-border/20"><Plus size={18}/></button>
               <div className="ml-auto flex items-center px-6 gap-6 text-[10px] font-mono uppercase tracking-[0.2em] text-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-matrix-green animate-pulse"></div>
                    CLI Online
                  </div>
                  <span>SESSION_ID: {activeTerminalId.split('-')[1] || '0XF1'}</span>
               </div>
            </div>

            {/* Terminal Content Area with AnimatePresence for smooth transitions */}
            <div className="flex-1 p-6 font-mono text-xs overflow-y-auto scrollbar-thin scrollbar-thumb-matrix-green/10">
               <AnimatePresence mode="popLayout" initial={false}>
                 <motion.div 
                   key={activeTerminalId}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                   {terminalTabs.find(t => t.id === activeTerminalId)?.history.map((line, i) => (
                     <div 
                       key={i} 
                       className={`mb-1.5 leading-relaxed tracking-wide ${
                         line.startsWith('$') ? 'text-matrix-green font-bold' : 
                         line.startsWith('AI') ? 'text-cyber-cyan italic border-l-2 border-cyber-cyan/30 pl-3 my-2' : 
                         'text-text/70'
                       }`}
                     >
                       {line}
                     </div>
                   ))}
                 </motion.div>
               </AnimatePresence>
               <div ref={terminalBottomRef} />
            </div>

            {/* Terminal Input Bar */}
            <div className="h-12 border-t border-border/20 bg-black/80 flex items-center px-6 gap-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
               <span className="text-matrix-green font-bold select-none tracking-widest">{" >>> "}</span>
               <input 
                 type="text" 
                 className="flex-1 bg-transparent border-none outline-none text-matrix-green font-mono text-xs caret-matrix-green placeholder:text-matrix-green/20"
                 value={terminalInput}
                 onChange={(e) => setTerminalInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && executeTerminalCommand(terminalInput)}
                 autoFocus
                 placeholder="Execute command..."
               />
               <div className="flex gap-4">
                 <button onClick={() => executeTerminalCommand('ls')} className="text-[9px] uppercase font-bold text-muted hover:text-matrix-green transition-colors tracking-widest border border-border/30 px-3 py-1 rounded hover:border-matrix-green/50">List</button>
                 <button onClick={handleRunCode} className="text-[9px] uppercase font-bold text-muted hover:text-matrix-green transition-colors tracking-widest border border-border/30 px-3 py-1 rounded hover:border-matrix-green/50">Run_Script</button>
               </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
