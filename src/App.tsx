import React, { useState, useEffect, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { 
  Zap, Code, Terminal as TerminalIcon, Bot, BookOpen, Layers, Rocket, 
  Search, Download, Share2, Play, Plus, X, Command, Globe, Github, Smartphone, Monitor, Save, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { debugCode, cloneWebsite, getCloneSuggestions } from './services/geminiService';

// Capacitor & Storage
import { Device } from '@capacitor/device';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import Dexie, { type Table } from 'dexie';

// --- Database Configuration ---
class QamaniDB extends Dexie {
  files!: Table<ProjectFile>;

  constructor() {
    super('QamaniSovereignDB');
    this.version(1).stores({
      files: '++id, name, language, isCloned'
    });
  }
}

const db = new QamaniDB();

// --- Types ---
type TerminalTab = {
  id: string;
  title: string;
  history: string[];
};

type ProjectFile = {
  id?: string;
  name: string;
  content: string;
  language: string;
  isCloned?: boolean;
};

type Package = {
  name: string;
  version: string;
  description: string;
  installed: boolean;
};

// --- Components ---

const SplashScreen = () => (
  <div className="fixed inset-0 bg-[#050507] flex flex-col items-center justify-center z-[100] overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4c1d95_0%,_transparent_70%)] opacity-30"></div>
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
      transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
      className="text-6xl sm:text-8xl font-black font-display text-text drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] uppercase italic tracking-tighter z-10"
    >
      QAMANIOID3
    </motion.div>
    <div className="mt-12 flex gap-4 z-10">
      <div className="w-3 h-3 bg-cyber-cyan border border-white/20 rounded-full animate-ping"></div>
      <div className="w-3 h-3 bg-cosmic-blue border border-white/20 rounded-full animate-ping delay-150"></div>
      <div className="w-3 h-3 bg-deep-purple border border-white/20 rounded-full animate-ping delay-300"></div>
    </div>
    <p className="mt-8 text-cyber-cyan text-sm uppercase tracking-[0.5em] font-mono animate-pulse">Initializing Imperial Core v3.0</p>
  </div>
);

const KeyboardToolbar = ({ onInsert }: { onInsert: (s: string) => void }) => {
  const symbols = ['(', ')', ':', '[', ']', '{', '}', '=', '+', '"', "'", '.', ',', '#', '$', '|', '>', '_', '/', '\\'];
  return (
    <div className="flex bg-black/80 border-t border-white/5 overflow-x-auto p-4 gap-3 scrollbar-hide shrink-0 backdrop-blur-xl">
      {symbols.map(s => (
        <button 
          key={s} 
          onClick={() => onInsert(s)} 
          className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-text hover:bg-cosmic-blue hover:text-white hover:border-cyber-cyan transition-all font-mono min-w-[56px] text-lg active:scale-90 shadow-lg"
        >
          {s}
        </button>
      ))}
    </div>
  );
};

// --- Qamani Language Definitions ---
const qamaniKeywords = {
   اطبع: 'print',
   إذا: 'if',
   وإلا: 'else',
   كرر: 'for',
   بينما: 'while',
   عرف: 'def',
   رجع: 'return',
   استورد: 'import',
   من: 'from',
   ك: 'as',
   صحيح: 'True',
   خطأ: 'False',
   ليس: 'None',
   في: 'in',
   جرب: 'try',
   أمسك: 'except',
   نهائياً: 'finally'
};

const transpileQamani = (source: string) => {
  let pyCode = source;
  // Replace keywords (sorted by length descending to avoid partial matches)
  const sortedKeywords = Object.keys(qamaniKeywords).sort((a, b) => b.length - a.length);
  sortedKeywords.forEach(qKey => {
    const pyKey = qamaniKeywords[qKey as keyof typeof qamaniKeywords];
    const regex = new RegExp(qKey, 'g');
    pyCode = pyCode.replace(regex, pyKey);
  });
  return pyCode;
};

// --- Main Application ---

export default function App() {
  const [stage, setStage] = useState<'splash' | 'landing' | 'ide'>('splash');
  const [activeSidebar, setActiveSidebar] = useState<'files' | 'pip' | 'ai'>('files');
  
  // Dynamic File State
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [isDebugging, setIsDebugging] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<{ platform: string; isTouch: boolean }>({ platform: 'web', isTouch: false });
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const pyodideRef = useRef<any>(null);

  const activeFile = files.find(f => f.id === activeFileId) || files[0] || { id: 'temp', name: 'main.py', content: '', language: 'python' };
  const code = activeFile.content;

  const setCode = (value: string | ((prev: string) => string)) => {
    setFiles(prev => prev.map(f => {
      if (f.id === activeFileId) {
        const newContent = typeof value === 'function' ? value(f.content) : value;
        return { ...f, content: newContent };
      }
      return f;
    }));
  };

  // Sync with IndexedDB
  useEffect(() => {
    const loadFromDB = async () => {
      const allFiles = await db.files.toArray();
      if (allFiles.length > 0) {
        setFiles(allFiles);
        setActiveFileId(allFiles[0].id!);
      } else {
        const defaultFiles: ProjectFile[] = [
          { name: 'ترحيب.qmani', language: 'qamani', content: "عرف الرئيسية():\n    اطبع('مرحباً بك في لغة قماني الأولى')\n    اطبع('هذه البداية لعصر جديد')\n\nالرئيسية()" },
          { name: 'main.py', language: 'python', content: "import os\nimport sys\n\ndef main():\n    print('Welcome to QAMANIOID3 Sovereign v3.0')\n    print(f'Kernel: {sys.platform}')\n\nif __name__ == '__main__':\n    main()" },
          { name: 'utils.py', language: 'python', content: "def help():\n    print('Imperial assistance ready.')" }
        ];
        const ids = await db.files.bulkAdd(defaultFiles, { allKeys: true });
        const createdFiles = defaultFiles.map((f, i) => ({ ...f, id: String(ids[i]) }));
        setFiles(createdFiles);
        setActiveFileId(createdFiles[0].id!);
      }
    };
    loadFromDB();
  }, []);

  // Autosave Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (activeFile && activeFile.id && activeFile.id !== 'temp') {
        await db.files.update(String(activeFile.id), { content: code });
        console.debug("Autosaved to SovereignDB.");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [code, activeFileId]);

  // Terminal State
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([
    { id: 'tab-1', title: 'bash', history: ['QAMANIOID3 Sovereign [Kernel v3.1] calibration...', 'Neural Link established. Standby for Pyodide...'] }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('tab-1');
  const [terminalInput, setTerminalInput] = useState("");
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const addLogToActiveTerminal = (msg: string) => {
    setTerminalTabs(prev => {
      const next = [...prev];
      const idx = next.findIndex(t => t.id === activeTerminalId);
      if (idx !== -1) {
        next[idx].history.push(msg);
      }
      return next;
    });
  };

  // Initialize Pyodide with hardened path
  useEffect(() => {
    const initPyodide = async () => {
      try {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.loadPyodide) {
          // @ts-ignore
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/"
          });
          pyodide.setStderr({ batched: (s: string) => console.debug("Core Log:", s) });
          pyodideRef.current = pyodide;
          setIsPyodideLoading(false);
          addLogToActiveTerminal('Neural Engine: CALIBRATED [PYTHONHOME=/]');
        }
      } catch (e) {
        addLogToActiveTerminal('Error: Imperial Engine failed calibration.');
      }
    };
    initPyodide();
  }, []);

  // Platform & UI Adjustments
  useEffect(() => {
    const checkEnv = async () => {
      const info = await Device.getInfo();
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      setPlatformInfo({ platform: info.platform, isTouch });
      
      // Detection for virtual keyboard (simple resize detection)
      const detectKeyboard = () => {
        setIsKeyboardVisible(window.innerHeight < 500);
      };
      window.addEventListener('resize', detectKeyboard);
      return () => window.removeEventListener('resize', detectKeyboard);
    };
    checkEnv();
    const timer = setTimeout(() => setStage('landing'), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Desktop Shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            addLogToActiveTerminal('System: [MANUAL_SAVE_COMPLETE] Snapshot stored in SovereignDB.');
            break;
          case 'r':
            e.preventDefault();
            handleRunCode();
            break;
          case 'f':
            e.preventDefault();
            setActiveSidebar('pip');
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [code, isPyodideLoading, activeFileId]);

  // Terminal Execution Engine
  const executeTerminalCommand = async (cmd: string) => {
    const newTabs = [...terminalTabs];
    const tabIndex = newTabs.findIndex(t => t.id === activeTerminalId);
    if (tabIndex === -1) return;

    const history = [...newTabs[tabIndex].history];
    history.push(`$ ${cmd}`);

    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        history.push('Sovereign CLI: qamani, ls, python, save, clear, info, help');
        break;
      case 'info':
        history.push(`Platform: ${platformInfo.platform} | Engine: Pyodide WASM`);
        history.push(`Storage: IndexedDB (Persistent) | Bridge: ${isPyodideLoading ? 'Syncing' : 'Connected'}`);
        break;
      case 'ls':
        files.forEach(f => history.push(`- ${f.name} (${f.isCloned ? 'Mirror' : 'Native'})`));
        break;
      case 'clear':
        history.length = 0;
        history.push('Memory sanitized.');
        break;
      case 'python':
        if (parts[1]) {
          const targetFile = files.find(f => f.name === parts[1]);
          if (!targetFile) {
            history.push(`Error: File ${parts[1]} not found in local workspace.`);
            break;
          }
          if (isPyodideLoading || !pyodideRef.current) {
            history.push('Wait: Neural Engine is warming up...');
          } else {
            history.push(`[EXECUTE] Mirroring logic from ${targetFile.name}...`);
            try {
              pyodideRef.current.setStdout({ batched: (s: string) => addLogToActiveTerminal(s) });
              pyodideRef.current.setStderr({ batched: (s: string) => addLogToActiveTerminal(s) });
              
              let executionCode = targetFile.content;
              if (targetFile.language === 'qamani' || targetFile.name.endsWith('.qmani')) {
                 history.push('[TRANSPILER] Converting Qamani Arabic logic to Imperial Python...');
                 executionCode = transpileQamani(targetFile.content);
              }

              await pyodideRef.current.loadPackagesFromImports(executionCode);
              const result = await pyodideRef.current.runPythonAsync(executionCode);
              if (result !== undefined && result !== null) history.push(String(result));
            } catch (err: any) {
              history.push(`Logic Error: ${err.message}`);
            }
          }
        } else {
          history.push('Python 3.11.0 (QAMANI Sovereign) - WASM Core.');
        }
        break;
      case 'qamani':
        if (parts[1] === 'clone' && parts[2]) {
          const url = parts[2];
          history.push(`[MIRROR] Initiating architectural extraction of ${url}...`);
          try {
            const data = await cloneWebsite(url);
            const fileName = `cloned_${url.replace(/https?:\/\/|www\./g, '').split('/')[0]}.html`;
            const pyName = `automation_${url.replace(/https?:\/\/|www\./g, '').split('/')[0]}.py`;
            const id1 = await db.files.add({ name: fileName, language: 'html', content: data.html, isCloned: true });
            const id2 = await db.files.add({ name: pyName, language: 'python', content: data.python, isCloned: true });
            
            const newF1: ProjectFile = { id: String(id1), name: fileName, language: 'html', content: data.html, isCloned: true };
            const newF2: ProjectFile = { id: String(id2), name: pyName, language: 'python', content: data.python, isCloned: true };
            
            setFiles(prev => [...prev, newF1, newF2]);
            setActiveFileId(String(id1));
            history.push(`[SUCCESS] Architectural mirror of ${url} stored.`);
          } catch (e) {
            history.push(`[FAILURE] Link breakage during mirror process.`);
          }
        } else {
          history.push('Usage: qamani clone [URL]');
        }
        break;
      default:
        history.push(`bash: ${command}: command not found`);
    }

    newTabs[tabIndex].history = history;
    setTerminalTabs(newTabs);
    setTerminalInput("");
  };

  const handleRunCode = () => {
    const name = activeFile.name;
    executeTerminalCommand(`python ${name}`);
  };

  const handleEditorWillMount = (monaco: any) => {
    // Register Qamani language
    monaco.languages.register({ id: 'qamani' });
    monaco.languages.setMonarchTokensProvider('qamani', {
      tokenizer: {
        root: [
          [new RegExp(Object.keys(qamaniKeywords).join('|')), 'keyword'],
          [/\d+/, 'number'],
          [/"[^"]*"/, 'string'],
          [/'[^']*'/, 'string'],
          [/#.*$/, 'comment'],
        ]
      }
    });
    monaco.languages.setLanguageConfiguration('qamani', {
      comments: { lineComment: '#' },
      brackets: [['(', ')'], ['{', '}'], ['[', ']']],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ]
    });
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const text = await file.text();
      const name = file.name;
      const lang = name.endsWith('.py') ? 'python' : name.endsWith('.html') ? 'html' : 'plaintext';
      const id = await db.files.add({ name, language: lang, content: text });
      setFiles(prev => [...prev, { id: String(id), name, language: lang, content: text }]);
      setActiveFileId(String(id));
      addLogToActiveTerminal(`[IMPORT] File ${name} assimilated into workspace.`);
    }
  };

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalTabs]);

  if (stage === 'splash') return <SplashScreen />;

  if (stage === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050507] text-text font-sans p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4c1d95_0%,_transparent_70%)] opacity-20 animate-pulse"></div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center max-w-2xl px-4">
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-deep-purple via-cosmic-blue to-cyber-cyan flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.5)]">
              <Code size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black font-display text-text mb-6 tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Qamanioid3
          </h1>
          <p className="text-cyber-cyan text-xl sm:text-2xl font-display mb-12 tracking-[0.5em] uppercase opacity-90 border-b-2 border-cyber-cyan inline-block pb-2">Universal Sovereign</p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-xs uppercase tracking-widest bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-muted">
             <div className="flex items-center gap-3"><Monitor size={18} className="text-cyber-cyan"/> Windows</div>
             <div className="w-[1px] h-4 bg-white/20"></div>
             <div className="flex items-center gap-3"><Smartphone size={18} className="text-deep-purple"/> Android/iOS</div>
             <div className="w-[1px] h-4 bg-white/20"></div>
             <div className="flex items-center gap-3"><Zap size={18} className="text-matrix-green"/> Offline WASM</div>
          </div>

          <button 
            onClick={() => setStage('ide')} 
            className="group relative px-16 py-6 bg-white/5 border border-cyber-cyan/50 text-cyber-cyan rounded-full font-display text-2xl hover:bg-cyber-cyan hover:text-background transition-all duration-500 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-4">
              Enter Sovereign Base <Rocket size={32} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col bg-[#050507] text-text selection:bg-cosmic-blue/30 overflow-hidden font-sans"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/60 backdrop-blur-2xl sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setStage('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-deep-purple to-cosmic-blue flex items-center justify-center font-black text-white shadow-xl shadow-cosmic-blue/20">Q</div>
            <h1 className="text-xl font-black font-display text-text hidden sm:block uppercase tracking-tighter group-hover:text-cyber-cyan transition-colors italic">QAMANIOID3</h1>
          </div>
          <div className="flex gap-4">
             <button onClick={handleRunCode} className="flex items-center gap-3 px-5 py-2 text-xs font-black text-matrix-green bg-matrix-green/10 border border-matrix-green/20 rounded-xl hover:bg-matrix-green hover:text-black transition-all uppercase tracking-widest group shadow-lg">
               <Play size={18} fill="currentColor" className="group-active:scale-90 transition-transform" /> <span className="hidden sm:inline">Initialize Logic</span>
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {isPyodideLoading && <div className="hidden md:flex items-center gap-2 text-muted text-[10px] animate-pulse"><Zap size={14}/> Calibrating Engine...</div>}
           <button 
             onClick={async () => { 
                setIsDebugging(true); 
                const r = await debugCode(code); 
                addLogToActiveTerminal(`[NEURAL_ANALYSIS] for ${activeFile.name}:`);
                addLogToActiveTerminal(r);
                setIsDebugging(false); 
             }} 
             disabled={isDebugging}
             className="bg-cosmic-blue/10 border border-cosmic-blue/30 text-cyber-cyan px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-3 hover:bg-cosmic-blue/30 transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
           >
             <Bot size={20} className={isDebugging ? 'animate-bounce' : ''} /> <span className="hidden md:inline">{isDebugging ? 'Analyzing Stack...' : 'Neural Scan'}</span>
           </button>
        </div>
      </header>

      {/* IDE Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Mini */}
        <aside className="w-16 sm:w-20 bg-black/40 border-r border-white/5 h-full flex flex-col items-center py-8 gap-10 shrink-0 z-20">
          <button onClick={() => setActiveSidebar('files')} className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'files' ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-110' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Layers size={platformInfo.isTouch ? 28 : 24} />
          </button>
          <button onClick={() => setActiveSidebar('pip')} className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'pip' ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-110' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Search size={platformInfo.isTouch ? 28 : 24} />
          </button>
          <button onClick={() => setActiveSidebar('ai')} className={`p-4 rounded-2xl transition-all duration-300 ${activeSidebar === 'ai' ? 'bg-cyber-cyan/20 text-cyber-cyan shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-110' : 'text-muted hover:text-text hover:bg-white/5'}`}>
            <Bot size={platformInfo.isTouch ? 28 : 24} />
          </button>
          <div className="mt-auto flex flex-col gap-8 mb-8 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <button className="text-muted hover:text-cyber-cyan transition-all transform hover:scale-125"><Globe size={22}/></button>
            <button className="text-muted hover:text-cyber-cyan transition-all transform hover:scale-125"><Github size={22}/></button>
          </div>
        </aside>

        {/* Sidebar Panel */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeSidebar} 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -20, opacity: 0 }}
            className={`w-80 bg-black/20 border-r border-white/5 h-full overflow-y-auto ${platformInfo.isTouch ? 'hidden' : 'hidden lg:block'} shrink-0 z-10 backdrop-blur-lg`}
          >
            {activeSidebar === 'files' && (
              <div className="p-8 flex flex-col gap-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-muted uppercase tracking-[0.5em] font-display">Sovereign Files</h2>
                  <button className="text-muted hover:text-cyber-cyan transition-colors" onClick={async () => {
                    const name = `script_${files.length + 1}.py`;
                    const id = await db.files.add({ name, language: 'python', content: '' });
                    setFiles(prev => [...prev, { id: String(id), name, language: 'python', content: '' }]);
                    setActiveFileId(String(id));
                  }}><Plus size={20}/></button>
                </div>
                <div className="space-y-3">
                  {files.map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => setActiveFileId(f.id!)}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer border ${f.id === activeFileId ? 'bg-white/5 text-cyber-cyan border-cyber-cyan/30 shadow-xl' : 'hover:bg-white/5 text-muted border-transparent group'}`}
                    >
                      {f.language === 'python' ? <Layers size={20} className={f.id === activeFileId ? '' : 'group-hover:text-cyber-cyan'}/> : <Code size={20}/>}
                      <span className="truncate flex-1 font-mono text-sm">{f.name}</span>
                      {f.isCloned && <Zap size={14} className="text-matrix-green animate-pulse" />}
                    </div>
                  ))}
                </div>
                <div className="mt-10 p-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] text-muted leading-loose font-mono">
                   DRAG & DROP ASSIMILATION ACTIVE. DROP FILES TO MERGE WITH SOVEREIGN CORE.
                </div>
              </div>
            )}
            {activeSidebar === 'pip' && (
              <div className="p-8 flex flex-col gap-8">
                <h2 className="text-xs font-black text-muted uppercase tracking-[0.4em] font-display">Neural Index</h2>
                <div className="relative group">
                  <Search size={16} className="absolute left-4 top-4 text-muted group-focus-within:text-cyber-cyan transition-colors" />
                  <input type="text" placeholder="Scan cloud repository..." className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs focus:border-cyber-cyan outline-none transition-all" />
                </div>
              </div>
            )}
            {activeSidebar === 'ai' && (
              <div className="p-8">
                <h2 className="text-xs font-black text-muted uppercase tracking-[0.4em] font-display mb-8">Neural Assistant</h2>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden group mb-6">
                   <Bot size={54} className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity" />
                   <p className="text-xs leading-relaxed text-text relative z-10 font-mono italic">
                     Imperial network synchronized via WASM. Active project: {activeFile.name}. Suggestions will appear in the Terminal based on mirrored patterns.
                   </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0c]">
             {/* Dynamic Tab Bar */}
             <div className="h-12 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto scrollbar-hide shrink-0">
                {files.map(f => (
                  <div 
                    key={f.id}
                    onClick={() => setActiveFileId(f.id!)}
                    className={`flex items-center gap-3 h-full px-6 shrink-0 transition-opacity cursor-pointer border-b-2 font-mono text-xs ${f.id === activeFileId ? 'text-cyber-cyan border-cyber-cyan bg-white/5' : 'text-muted border-transparent hover:text-text'}`}
                  >
                    {f.id === activeFileId && <div className="w-2 h-2 rounded-full bg-cyber-cyan shadow-[0_0_10px_#22d3ee] animate-pulse"></div>}
                    {f.name}
                    {f.isCloned && <Zap size={10} className="text-matrix-green" />}
                  </div>
                ))}
             </div>
             
             <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={activeFile.language}
                  theme="vs-dark"
                  value={code}
                  beforeMount={handleEditorWillMount}
                  onChange={(v) => v !== undefined && setCode(v)}
                  options={{
                    fontFamily: activeFile.language === 'qamani' ? "'IBM Plex Sans Arabic', monospace" : "'JetBrains Mono', monospace",
                    fontSize: platformInfo.isTouch ? 18 : 16,
                    minimap: { enabled: !platformInfo.isTouch, side: 'right' },
                    cursorBlinking: 'smooth',
                    lineHeight: platformInfo.isTouch ? 36 : 28,
                    padding: { top: 30 },
                    scrollbar: { verticalSliderSize: 8, horizontalSliderSize: 8 },
                    wordWrap: 'on',
                    smoothScrolling: true,
                    mouseWheelZoom: true
                  }}
                />
             </div>

             {platformInfo.isTouch && !isKeyboardVisible && <KeyboardToolbar onInsert={(s) => setCode(p => p + s)} />}
          </div>

          {/* Hyper-Terminal */}
          <motion.div 
            initial={false}
            animate={{ height: platformInfo.isTouch ? (isKeyboardVisible ? 0 : 250) : 320 }}
            className="bg-[#050507] border-t border-white/5 relative flex flex-col overflow-hidden group"
          >
            <div className="terminal-scanline"></div>
            <div className="flex h-12 border-b border-white/5 bg-black/40 shrink-0">
               <div className="px-8 h-full flex items-center gap-4 text-matrix-green text-[10px] font-black uppercase tracking-[0.4em] bg-matrix-green/5">
                 <TerminalIcon size={16} className="animate-pulse" /> bash core
               </div>
            </div>

            <div className={`flex-1 p-8 font-mono overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 ${platformInfo.isTouch ? 'text-[11px]' : 'text-sm'}`}>
              <AnimatePresence mode="popLayout" initial={false}>
                 {terminalTabs[0].history.map((line, i) => (
                   <div key={i} className={`mb-3 leading-relaxed ${line.startsWith('$') ? 'text-matrix-green font-black' : line.startsWith('[MIRROR') || line.startsWith('[NEURAL') ? 'text-cyber-cyan italic border-l-4 border-cyber-cyan/40 pl-6 my-6 bg-cyber-cyan/5 py-4 rounded-xl' : 'text-text/80'}`}>
                     {line}
                   </div>
                 ))}
              </AnimatePresence>
              <div ref={terminalBottomRef} />
            </div>

            <div className="h-16 border-t border-white/5 bg-black/80 flex items-center px-8 gap-6 shrink-0 shadow-2xl">
               <span className="text-matrix-green font-black text-lg select-none tracking-widest italic">{" >>> "}</span>
               <input 
                 type="text" 
                 className="flex-1 bg-transparent border-none outline-none text-matrix-green font-mono text-sm caret-matrix-green placeholder:text-matrix-green/20"
                 value={terminalInput}
                 onChange={(e) => setTerminalInput(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && executeTerminalCommand(terminalInput)}
                 placeholder="Communicate with Sovereign OS..."
               />
               <div className="flex gap-4">
                 <button onClick={() => executeTerminalCommand('ls')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-matrix-green hover:border-matrix-green transition-all shadow-lg active:scale-95">ls</button>
                 <button onClick={handleRunCode} className="px-6 py-2 bg-matrix-green/10 border border-matrix-green/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-matrix-green hover:bg-matrix-green hover:text-black transition-all shadow-lg active:scale-95">run</button>
               </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
