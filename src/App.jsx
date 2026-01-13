import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform } from 'framer-motion';
import { 
  Settings, Plus, Search, Moon, Sun, X, Undo2, Redo2, 
  Download, Upload, AlertCircle, Trash2, Copy,
  CheckCircle2, Circle, AlertTriangle
} from 'lucide-react';

// --- GOOGLE MATERIAL YOU INSPIRED THEMES (CREAMY) ---

const THEMES = {
  default: { 
    name: 'Classic',
    light: { primary: '#444746', bg: '#F0F2F5', surface: '#FFFFFF', text: '#1F1F1F', outline: '#747775', border: '#C4C7C5' },
    dark:  { primary: '#C4C7C5', bg: '#111114', surface: '#1E1F20', text: '#E3E3E3', outline: '#8E918F', border: '#444746' }
  },
  matcha: { 
    name: 'Matcha',
    light: { primary: '#4C662B', bg: '#F5F7ED', surface: '#FFFFFF', text: '#191C16', outline: '#75796C', border: '#C5C8BA' },
    dark:  { primary: '#B1D18A', bg: '#12150E', surface: '#1A1D17', text: '#E4E7DB', outline: '#8F9285', border: '#40443A' }
  },
  ocean: {
    name: 'Ocean',
    light: { primary: '#006689', bg: '#F2F8FB', surface: '#FFFFFF', text: '#001E2B', outline: '#71787D', border: '#C0C8CC' },
    dark:  { primary: '#79D1FF', bg: '#0D1418', surface: '#151D22', text: '#E0F3FF', outline: '#8A9296', border: '#3C474C' }
  },
  rose: {
    name: 'Rose',
    light: { primary: '#9C4146', bg: '#FFF8F7', surface: '#FFFFFF', text: '#410006', outline: '#857373', border: '#F4DDDD' },
    dark:  { primary: '#FFB3B4', bg: '#200F10', surface: '#281819', text: '#FFDAD9', outline: '#A08C8C', border: '#534344' }
  },
  sand: {
    name: 'Sand',
    light: { primary: '#765A2C', bg: '#FFFBFF', surface: '#FFF9EF', text: '#261900', outline: '#7E7667', border: '#EBE1CF' },
    dark:  { primary: '#E7C26C', bg: '#181308', surface: '#201B10', text: '#FFEFD4', outline: '#989080', border: '#4D4638' }
  },
};

// --- PROFESSIONAL DATA ---

const INITIAL_NOTES = [
  { id: 1, title: 'Q3 Product Roadmap', content: 'Objectives:\n- Improve mobile retention by 15%\n- Launch Dark Mode for web dashboard\n- Optimise API response time (Target: <200ms)\n\nKey Dates:\n- Aug 15: Beta Release\n- Sept 1: Full Rollout', date: '10:30 AM', tags: ['Work', 'Strategy'] },
  { id: 2, title: 'Meeting Minutes - Design Sync', content: 'Attendees: Sarah, John, Mike\n\nDiscussion Points:\n1. Icon consistency across platforms\n2. Typography scale for mobile\n3. New color palette approval\n\nAction Items:\n- Sarah to update Figma library by Friday.\n- Mike to review accessibility contrast.', date: 'Yesterday', tags: ['Work', 'Meeting'] },
  { id: 3, title: 'Backend Architecture Refactor', content: 'Proposal to switch from Monolith to Microservices for the payment gateway.\n\nBenefits:\n- Isolated failures\n- Independent scaling\n\nRisks:\n- Complexity in deployment\n- Data consistency challenges', date: '2 days ago', tags: ['Dev', 'Tech'] },
  { id: 4, title: 'Grocery List', content: '- Oat Milk\n- Sourdough Bread\n- Eggs (Organic)\n- Greek Yogurt\n- Blueberries\n- Coffee Beans', date: '1 week ago', tags: ['Personal'] },
  { id: 5, title: 'Book Recommendations', content: '1. "Thinking, Fast and Slow" - Daniel Kahneman\n2. "Deep Work" - Cal Newport\n3. "The Design of Everyday Things" - Don Norman', date: '1 month ago', tags: ['Personal', 'Reading'] },
];

const INITIAL_TAGS = ['Work', 'Personal', 'Dev', 'Strategy', 'Meeting', 'Reading'];

// --- CUSTOM HOOKS ---

const useUndoRedo = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  const setState = (newState) => {
    const currentState = history[index];
    if (JSON.stringify(currentState) === JSON.stringify(newState)) return;
    const nextHistory = [...history.slice(0, index + 1), newState];
    if (nextHistory.length > 20) nextHistory.shift(); 
    setHistory(nextHistory);
    setIndex(nextHistory.length - 1);
  };
  const undo = () => { if (index > 0) setIndex(index - 1); };
  const redo = () => { if (index < history.length - 1) setIndex(index + 1); };
  return [history[index], setState, undo, redo, index > 0, index < history.length - 1];
};

const useScroll = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return scrolled;
};

// --- COMPONENTS ---

const DeleteModal = ({ isOpen, onClose, onConfirm, count }) => {
    const [dontAsk, setDontAsk] = useState(false);
    const handleConfirm = () => {
        if (dontAsk) localStorage.setItem('dinduy_skip_delete_confirm', 'true');
        onConfirm(); 
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    {/* KEY ADDED TO PREVENT CRASH */}
                    <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#000000] bg-opacity-80 backdrop-blur-none" onClick={onClose} />
                    <motion.div key="modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-xs rounded-2xl p-6 bg-white dark:bg-[#1E1E1E] shadow-xl overflow-hidden">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1"><AlertTriangle size={24} /></div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete {count} notes?</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Permanently remove these items.</p>
                            </div>
                            <div className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setDontAsk(!dontAsk)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${dontAsk ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 dark:border-gray-600'}`}>{dontAsk && <CheckCircle2 size={14} />}</div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Don't ask again</span>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">Cancel</button>
                                <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold">Delete</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// --- NOTE CARD (STRICT HEIGHT CONTROL) ---
const NoteCard = React.memo(({ 
  note, isSelected, onClick, isAnySelected, theme, isDark, onUpdate, cardRef, availableTags, 
  isSelectionMode, isChecked, onToggleSelect, onDeleteSwipe, onClose 
}) => {
  const [noteState, setNoteState, undo, redo, canUndo, canRedo] = useUndoRedo({ title: note.title, content: note.content });
  const textAreaRef = useRef(null);
  const timerRef = useRef(null);
  
  // Disable layout animation completely when selected to prevent any jump
  const shouldAnimateLayout = !isSelected; 

  const handlePointerDown = () => { if (!isSelectionMode && !isSelected) timerRef.current = setTimeout(() => onToggleSelect(note.id, true), 500); };
  const cancelTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  useEffect(() => { if (isSelected && (note.title !== noteState.title || note.content !== noteState.content)) { onUpdate(note.id, noteState); } }, [noteState, isSelected, note.id]);
  useEffect(() => { if (!isSelected) setNoteState({ title: note.title, content: note.content }); }, [note.title, note.content, isSelected]);

  // --- STRICT HEIGHT LOGIC ---
  const handleInput = (e) => {
    const target = e.target;
    // Set to auto first
    target.style.height = 'auto';
    
    // Check height limits (Max 55vh)
    // If content exceeds limit, we cap height and enable internal scroll
    // This PREVENTS the window from growing and scrolling down
    const maxHeight = window.innerHeight * 0.55; 
    
    if (target.scrollHeight > maxHeight) {
        target.style.height = `${maxHeight}px`;
        target.style.overflowY = 'auto'; // Enable internal scroll
    } else {
        target.style.height = `${target.scrollHeight}px`;
        target.style.overflowY = 'hidden'; // Hide internal scroll
    }
    
    setNoteState({ ...noteState, content: target.value });
  };
  
  React.useLayoutEffect(() => {
    if (isSelected && textAreaRef.current) { 
        const target = textAreaRef.current;
        const maxHeight = window.innerHeight * 0.55;
        target.style.height = 'auto';
        if (target.scrollHeight > maxHeight) {
            target.style.height = `${maxHeight}px`;
            target.style.overflowY = 'auto';
        } else {
            target.style.height = `${target.scrollHeight}px`;
            target.style.overflowY = 'hidden';
        }
    }
  }, [isSelected]);

  const handleTagToggle = (tag) => {
    const newTags = note.tags.includes(tag) ? note.tags.filter(t => t !== tag) : [...note.tags, tag];
    onUpdate(note.id, { ...note, tags: newTags });
  };
  const validTags = note.tags.filter(t => availableTags.includes(t));
  
  return (
    <motion.div
      ref={cardRef}
      layout={shouldAnimateLayout} // Only animate layout when NOT expanding
      
      drag={!isSelected && !isSelectionMode ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={cancelTimer}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 100) onDeleteSwipe(note.id); }}
      
      style={{ 
        backgroundColor: theme.surface, color: theme.text, 
        border: `1px solid ${isChecked ? theme.primary : (isSelected ? 'transparent' : theme.border)}`,
        boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
        zIndex: isSelected ? 30 : 0 
      }}
      
      onPointerDown={handlePointerDown}
      onPointerUp={cancelTimer}
      onPointerLeave={cancelTimer}
      onContextMenu={(e) => e.preventDefault()} 
      onClick={isSelectionMode ? () => onToggleSelect(note.id) : (isSelected ? null : onClick)}

      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: isChecked ? 0.95 : 1 }}
      transition={{ layout: { duration: 0.3, ease: "circOut" } }}
      
      className={`relative rounded-2xl overflow-hidden flex flex-col gap-2 transition-colors duration-300 ${isSelected ? 'col-span-2 h-auto py-6 cursor-default' : 'col-span-1 h-fit p-4 cursor-pointer touch-pan-y active:scale-98'}`}
    >
      <AnimatePresence>
        {(isSelectionMode || isChecked) && (
            <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-3 right-3 z-10">
                {isChecked ? <div className="rounded-full bg-blue-500 text-white"><CheckCircle2 size={22} fill={theme.primary} color={isDark ? "black" : "white"} /></div> : <Circle size={22} className="opacity-30" />}
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start gap-2 relative shrink-0">
        {isSelected ? (
            <div className="w-full flex justify-between items-start">
                <input 
                    className="font-bold text-2xl bg-transparent outline-none w-full pb-2 mr-2 select-text" 
                    style={{ color: theme.text }} 
                    value={noteState.title} 
                    onChange={(e) => setNoteState({ ...noteState, title: e.target.value })} 
                    placeholder="Title" 
                />
                <button 
                  className={`p-2 rounded-full transition-colors flex-shrink-0 relative z-50 ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`} 
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <X size={20} />
                </button>
            </div>
        ) : (
            <h3 className={`font-semibold text-base leading-snug w-full break-words line-clamp-3 ${isSelectionMode ? 'pr-6' : ''}`}>{note.title || <span className="opacity-40 italic">Untitled</span>}</h3>
        )}
      </div>

      <div className="flex-1 w-full">
        {isSelected ? (
            <textarea 
                ref={textAreaRef} 
                className="w-full bg-transparent outline-none resize-none text-base leading-relaxed p-0 select-text" 
                // Initial min-height
                style={{ fontFamily: 'sans-serif', minHeight: '300px', color: theme.text }} 
                value={noteState.content} 
                onChange={handleInput} 
                placeholder="Type something..." 
                autoFocus={false} 
            />
        ) : (
            <p className="text-sm opacity-70 whitespace-pre-wrap line-clamp-5 break-words" style={{ fontFamily: 'sans-serif', lineHeight: '1.6' }}>{note.content}</p>
        )}
      </div>

      <div className="flex flex-col mt-2 pt-2 shrink-0 border-t border-dashed" style={{ borderColor: isSelected ? theme.border : 'transparent' }}>
        {isSelected && (
            <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map(tag => (
                    <button key={tag} onClick={(e) => { e.stopPropagation(); handleTagToggle(tag); }} className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${note.tags.includes(tag) ? 'border-transparent font-medium' : isDark ? 'bg-transparent text-white/50 border-white/10' : 'bg-transparent text-black/50 border-black/10'}`} style={ note.tags.includes(tag) ? { backgroundColor: theme.primary, color: isDark ? '#000' : '#FFF' } : {} }>{tag}</button>
                ))}
            </div>
        )}
        <div className="flex justify-between items-center h-8">
            {isSelected ? (
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium opacity-40">{note.date}</span>
                    <div className={`flex items-center gap-1 rounded-lg px-2 py-1 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <button onClick={(e) => { e.stopPropagation(); undo(); }} disabled={!canUndo} className="p-1 opacity-50 disabled:opacity-20"><Undo2 size={16} /></button>
                        <div className={`w-[1px] h-3 ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <button onClick={(e) => { e.stopPropagation(); redo(); }} disabled={!canRedo} className="p-1 opacity-50 disabled:opacity-20"><Redo2 size={16} /></button>
                    </div>
                </div>
            ) : (
                <>
                    <span className="text-[10px] font-medium opacity-40">{note.date}</span>
                    {validTags.length > 0 && (
                        <div className="flex gap-1 overflow-hidden max-w-[60%] flex-wrap justify-end">
                            {validTags.slice(0,2).map(tag => (
                                <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider truncate ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/60'}`}>{tag}</span>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </motion.div>
  );
});

const SettingsSheet = ({ isOpen, onClose, theme, setThemeKey, currentThemeKey, isDark, toggleDark, allTags, setAllTags, notes, setNotes }) => {
    const [newTag, setNewTag] = useState('');
    const fileInputRef = useRef(null);
    const handleAddTag = () => { if (newTag && !allTags.includes(newTag)) { setAllTags([...allTags, newTag]); setNewTag(''); } };
    const handleDeleteTag = (tagToDelete) => { setAllTags(allTags.filter(t => t !== tagToDelete)); };
    const handleExport = () => { const blob = new Blob([JSON.stringify({ notes, allTags, version: '28.0' }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dinduy-v28-backup.json`; a.click(); };
    const handleImport = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target.result); if (data.notes) { setNotes(data.notes); if (data.allTags) setAllTags(data.allTags); alert('Backup restored!'); } } catch (err) { alert('Invalid file.'); } }; reader.readAsText(file); };
  
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <motion.div key="sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 rounded-t-3xl p-6 z-[70] shadow-2xl h-[85vh] overflow-y-auto" style={{ backgroundColor: isDark ? '#121212' : '#FFFFFF', color: isDark ? 'white' : 'black' }}>
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-8" />
              <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: theme.primary }}>Dinduy.</h1><p className="text-sm opacity-50">Logical & Emotional Notes.</p></div>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-3 opacity-80"><Settings className="w-5 h-5" /> Settings</h2>
              <div className="space-y-8">
                <div><label className="text-xs font-bold uppercase tracking-wider opacity-40 mb-4 block">Appearance</label><div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">{Object.keys(THEMES).map((k) => (<button key={k} onClick={() => setThemeKey(k)} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0 transition-transform active:scale-90`} style={{ backgroundColor: k === 'default' ? '#333' : THEMES[k].light.primary, borderColor: currentThemeKey === k ? (isDark ? 'white' : 'black') : 'transparent' }} />))}</div></div>
                <div><label className="text-xs font-bold uppercase tracking-wider opacity-40 mb-4 block">Data</label><div className="flex gap-3"><button onClick={handleExport} className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><Download size={16} /> Export</button><button onClick={() => fileInputRef.current?.click()} className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><Upload size={16} /> Import</button><input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} /></div></div>
                <div><label className="text-xs font-bold uppercase tracking-wider opacity-40 mb-4 block">Manage Tags</label><div className="flex gap-2 mb-4"><input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag..." className={`flex-1 px-4 py-3 rounded-xl outline-none text-sm ${isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`} /><button onClick={handleAddTag} disabled={!newTag} className="p-3 rounded-xl text-white disabled:opacity-50" style={{ backgroundColor: theme.primary }}><Plus size={20} /></button></div><div className="flex flex-wrap gap-2">{allTags.map(tag => (<div key={tag} className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}><span className="text-xs font-medium">{tag}</span><button onClick={() => handleDeleteTag(tag)} className={`p-1 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}><Trash2 size={12} className="opacity-50" /></button></div>))}</div></div>
                <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}><div className="flex items-center gap-3">{isDark ? <Moon size={20} /> : <Sun size={20} />}<span className="font-medium text-sm">Dark Mode</span></div><button onClick={toggleDark} className={`w-12 h-7 rounded-full p-1 transition-colors ${isDark ? 'bg-white/20' : 'bg-black/20'}`}><motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: isDark ? 20 : 0 }} /></button></div>
              </div>
              <div className="mt-12 text-center opacity-20 text-[10px] font-mono">v29.0.0-Fixed</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  };

// --- MAIN APP ---

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeKey, setThemeKey] = useState('default');
  const [isDark, setIsDark] = useState(false);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [allTags, setAllTags] = useState(INITIAL_TAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, count: 0, targetIds: [] });

  const isScrolled = useScroll();
  const noteRefs = useRef({});
  const lastScrolledId = useRef(null); 
  const theme = useMemo(() => isDark ? THEMES[themeKey].dark : THEMES[themeKey].light, [themeKey, isDark]);

  // --- SAFE HASH NAVIGATION ---
  const stateRef = useRef({ selectedId, isSettingsOpen, deleteModalOpen: deleteModal.isOpen, isSelectionMode });
  useEffect(() => { stateRef.current = { selectedId, isSettingsOpen, deleteModalOpen: deleteModal.isOpen, isSelectionMode }; }, [selectedId, isSettingsOpen, deleteModal.isOpen, isSelectionMode]);

  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash;
        const current = stateRef.current;
        if (!hash) {
            if (current.deleteModalOpen) setDeleteModal(prev => ({ ...prev, isOpen: false }));
            if (current.isSettingsOpen) setIsSettingsOpen(false);
            if (current.selectedId) setSelectedId(null);
            if (current.isSelectionMode) { setIsSelectionMode(false); setSelectedIds([]); }
        } else if (hash === '#settings') {
            setIsSettingsOpen(true);
            setSelectedId(null);
        }
    };
    window.location.hash = '';
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openNote = (id) => { setSelectedId(id); window.location.hash = 'note'; };
  const openSettings = () => { setIsSettingsOpen(true); window.location.hash = 'settings'; };
  const openDeleteModal = (ids) => {
     const skipConfirm = localStorage.getItem('dinduy_skip_delete_confirm') === 'true';
     if (skipConfirm) performDelete(ids);
     else { setDeleteModal({ isOpen: true, count: ids.length, targetIds: ids }); window.location.hash = 'modal'; }
  };

  const goBack = () => {
      if (window.location.hash) window.history.back();
      else { setSelectedId(null); setIsSettingsOpen(false); }
  };

  useEffect(() => {
    if (selectedId && lastScrolledId.current !== selectedId) {
      setTimeout(() => {
        if (noteRefs.current[selectedId]) {
            const offset = 80; 
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = noteRefs.current[selectedId].getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
      }, 400); 
      lastScrolledId.current = selectedId;
    } else if (!selectedId) {
        lastScrolledId.current = null;
    }
  }, [selectedId]);

  const updateNote = useCallback((id, updates) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const filteredNotes = notes.filter(n => (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())) && (activeTag === 'All' || n.tags.some(t => t === activeTag && allTags.includes(t))));

  const handleToggleSelect = (id, triggerMode = false) => {
      if (triggerMode) {
          setIsSelectionMode(true);
          setSelectedIds([id]);
          if (navigator.vibrate) navigator.vibrate(50);
          window.location.hash = 'select'; 
      } else {
          if (selectedIds.includes(id)) {
              const newIds = selectedIds.filter(sid => sid !== id);
              setSelectedIds(newIds);
              if (newIds.length === 0) goBack(); 
          } else {
              setSelectedIds([...selectedIds, id]);
          }
      }
  };

  const handleDuplicate = () => {
      const selectedNotes = notes.filter(n => selectedIds.includes(n.id));
      const newDuplicates = selectedNotes.map(n => ({
          ...n,
          id: Date.now() + Math.random(),
          title: `${n.title} (Copy)`,
          date: 'Just now'
      }));
      setNotes(prev => [...newDuplicates, ...prev]);
      setIsSelectionMode(false);
      setSelectedIds([]);
      if (window.location.hash === '#select') window.history.back();
  };

  const performDelete = (ids) => {
      setNotes(prev => prev.filter(n => !ids.includes(n.id)));
      if (deleteModal.isOpen) goBack(); 
      setIsSelectionMode(false);
      setSelectedIds([]);
      if (selectedId && ids.includes(selectedId)) setSelectedId(null);
  };

  return (
    <div className="min-h-screen w-full transition-colors duration-300 ease-in-out font-sans selection:bg-black/20 pb-40" style={{ backgroundColor: theme.bg, color: theme.text }}>
      <motion.header className="sticky top-0 z-50 px-6 pt-6 pb-4 flex items-center justify-between transition-all duration-300" style={{ backgroundColor: theme.bg, borderBottom: isScrolled ? `1px solid ${theme.border}` : '1px solid transparent' }}>
        <div className={`flex-1 mr-4`}>
            <div className={`flex items-center px-4 py-3 rounded-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                <Search size={18} className="opacity-40 mr-3" />
                <input className="bg-transparent outline-none text-base w-full placeholder:text-current placeholder:opacity-30" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>
        <div className="flex gap-2">
            <AnimatePresence>
                {isSelectionMode && (
                    <motion.div key="action-bar" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex gap-2">
                        <button onClick={handleDuplicate} className="p-3 rounded-full bg-blue-500 text-white shadow-lg"><Copy size={22} /></button>
                        <button onClick={() => openDeleteModal(selectedIds)} className="p-3 rounded-full bg-red-500 text-white shadow-lg"><Trash2 size={22} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
            <button onClick={openSettings} className={`p-3 rounded-full transition-transform active:scale-95 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}><Settings size={24} /></button>
        </div>
      </motion.header>

      {!selectedId && (<div className={`px-6 mb-6 overflow-x-auto no-scrollbar pb-2 transition-opacity duration-300`}><div className="flex gap-2">{['All', ...allTags].map(tag => (<button key={tag} onClick={() => setActiveTag(tag)} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors border`} style={{ backgroundColor: activeTag === tag ? theme.primary : 'transparent', color: activeTag === tag ? (isDark ? '#000' : '#FFF') : theme.text, borderColor: activeTag === tag ? 'transparent' : theme.border }}>{tag}</button>))}</div></div>)}

      <main className="px-4 max-w-2xl mx-auto">
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-2 gap-3" style={{ alignItems: 'start' }}>
            <AnimatePresence mode='popLayout'>
                {filteredNotes.map((note) => (
                    <div key={note.id} className={`${selectedId === note.id ? "col-span-2 scroll-mt-24" : "col-span-1"}`}> 
                        <NoteCard
                        cardRef={(el) => (noteRefs.current[note.id] = el)} 
                        note={note}
                        isSelected={selectedId === note.id}
                        isAnySelected={selectedId !== null}
                        onClick={() => openNote(note.id)}
                        onUpdate={updateNote}
                        theme={theme}
                        isDark={isDark}
                        availableTags={allTags}
                        isSelectionMode={isSelectionMode}
                        isChecked={selectedIds.includes(note.id)}
                        onToggleSelect={handleToggleSelect}
                        onDeleteSwipe={(id) => openDeleteModal([id])}
                        onClose={goBack} 
                        />
                    </div>
                ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        
        {!selectedId && filteredNotes.length === 0 && (
            <div className="text-center mt-32 opacity-30 flex flex-col items-center">
                <h1 className="text-6xl font-black tracking-tighter mb-4" style={{ color: theme.primary }}>Dinduy.</h1>
                <p>No notes found.</p>
            </div>
        )}
      </main>

      <AnimatePresence>
        {!selectedId && !isSelectionMode && (
            <motion.button key="fab" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-8 right-6 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center z-30" style={{ backgroundColor: theme.primary, color: isDark ? '#000' : '#FFF' }} onClick={() => { const newId = Date.now(); const newNote = { id: newId, title: '', content: '', date: 'Just now', tags: [] }; setNotes([newNote, ...notes]); openNote(newId); setSearchQuery(''); }}>
                <Plus size={32} strokeWidth={3} />
            </motion.button>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isSelectionMode && (
            <motion.div key="selection-bar" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#121212] border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl z-40 flex items-center gap-4">
                <span className="font-bold">{selectedIds.length} Selected</span>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button onClick={goBack} className="text-sm opacity-70 hover:opacity-100">Cancel</button>
            </motion.div>
        )}
      </AnimatePresence>

      <DeleteModal isOpen={deleteModal.isOpen} onClose={goBack} onConfirm={() => performDelete(deleteModal.targetIds)} count={deleteModal.count} />
      <SettingsSheet isOpen={isSettingsOpen} onClose={goBack} theme={theme} setThemeKey={setThemeKey} currentThemeKey={themeKey} isDark={isDark} toggleDark={() => setIsDark(!isDark)} allTags={allTags} setAllTags={setAllTags} notes={notes} setNotes={setNotes} />
    </div>
  );
}
