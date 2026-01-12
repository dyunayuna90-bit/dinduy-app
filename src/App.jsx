import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform } from 'framer-motion';
import { 
  Settings, Plus, Search, Moon, Sun, X, Undo2, Redo2, 
  Download, Upload, AlertCircle, Trash2, 
  CheckCircle2, Circle, AlertTriangle
} from 'lucide-react';

// --- DATA & THEMES ---

const THEMES = {
  default: { 
    light: { primary: '#000000', bg: '#F2F2F2', surface: '#FFFFFF', text: '#1C1B1F', outline: '#79747E', border: '#E0E0E0' },
    dark:  { primary: '#FFFFFF', bg: '#000000', surface: '#121212', text: '#E6E1E5', outline: '#938F99', border: '#333333' }
  },
  lavender: { 
    light: { primary: '#6750A4', bg: '#F3EDF7', surface: '#FFFFFF', text: '#1D192B', outline: '#79747E', border: '#E6E0E9' },
    dark:  { primary: '#D0BCFF', bg: '#000000', surface: '#141218', text: '#E6E1E5', outline: '#938F99', border: '#2B2930' }
  },
  royal: { 
    light: { primary: '#4169E1', bg: '#EEF2FF', surface: '#FFFFFF', text: '#0F172A', outline: '#64748B', border: '#E2E8F0' },
    dark:  { primary: '#8DA4EF', bg: '#000000', surface: '#0B1120', text: '#F1F5F9', outline: '#94A3B8', border: '#1E293B' }
  },
  mint: { 
    light: { primary: '#006C4C', bg: '#F2FDF7', surface: '#FFFFFF', text: '#002114', outline: '#707973', border: '#DAE5E0' },
    dark:  { primary: '#4CE1B6', bg: '#000000', surface: '#001510', text: '#DEE4E0', outline: '#89938D', border: '#10201A' }
  },
  sunset: { 
    light: { primary: '#E65100', bg: '#FFF3E0', surface: '#FFFFFF', text: '#3E2723', outline: '#FFCCBC', border: '#FFAB91' },
    dark:  { primary: '#FFB74D', bg: '#000000', surface: '#1A120B', text: '#FFF3E0', outline: '#D84315', border: '#3E2723' }
  },
  coffee: { 
    light: { primary: '#6D4C41', bg: '#EFEBE9', surface: '#FFFFFF', text: '#3E2723', outline: '#BCAAA4', border: '#D7CCC8' },
    dark:  { primary: '#D7CCC8', bg: '#000000', surface: '#141110', text: '#EFEBE9', outline: '#8D6E63', border: '#2D2422' }
  },
  autumn: { 
    light: { primary: '#BF360C', bg: '#FBE9E7', surface: '#FFFFFF', text: '#260E04', outline: '#FFAB91', border: '#FF8A65' },
    dark:  { primary: '#FF8A65', bg: '#000000', surface: '#1A0F0B', text: '#FBE9E7', outline: '#D84315', border: '#331B14' }
  },
  ocean: {
    light: { primary: '#006C75', bg: '#F2FBFD', surface: '#FFFFFF', text: '#001F24', outline: '#6F797A', border: '#DBE4E6' },
    dark:  { primary: '#4FD8EB', bg: '#000000', surface: '#0D1214', text: '#E0F7FA', outline: '#8E9192', border: '#1A2C30' }
  },
};

const INITIAL_NOTES = [
  { id: 1, title: 'Revisi Skripsi Sejarah', content: 'Bab 1: Perdalam lagi soal dampak sosial tanam paksa di Jawa Tengah. Cari referensi buku Ricklefs terbaru di perpus UNJ. \n\nTarget minggu ini kelar Bab 2 juga.', date: '10:30 AM', tags: ['Kuliah'] },
  { id: 2, title: 'Janji Dinda ❤️', content: 'Jumat jam 4 sore. Jemput di Fak. MIPA UNJ.\n- Bawain coklat (Silverqueen Matcha)\n- Jangan telat (Dinda gasuka nunggu)\n- Makan di Blok M Rawamangun lt 2.', date: 'Yesterday', tags: ['Love', 'Pribadi'] },
  { id: 3, title: 'Konsep Lukisan', content: 'Medium: Oil on Canvas 40x60.\nTema: "Entropi Kehidupan"\nVisual: Akar pohon beringin yang morphing jadi double helix DNA. Warna dominan hijau lumut & crimson.', date: '2 days ago', tags: ['Art', 'Hobi'] },
  { id: 4, title: 'Beli Ziga', content: 'Stok tinggal sebatang bro. Mampir warung Madura balik kuliah.', date: '1 week ago', tags: ['Misc'] },
  { id: 5, title: 'Buku Bacaan', content: '1. Sapiens - Yuval Noah Harari\n2. The Gene - Siddhartha Mukherjee', date: '1 month ago', tags: ['Hobi'] },
];

const INITIAL_TAGS = ['Kuliah', 'Pribadi', 'Love', 'Art', 'Hobi', 'Misc'];

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
        const handleScroll = () => setScrolled(window.scrollY > 60);
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#000000] bg-opacity-95" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm rounded-3xl p-6 bg-[#121212] text-white border border-white/10 shadow-2xl">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2"><AlertTriangle size={32} /></div>
                            <h3 className="text-xl font-bold">Yakin hapus {count} catatan?</h3>
                            <p className="text-sm opacity-60">Barang siapa menghapus kenangan, ga bisa dibalikin lagi loh (Permanen).</p>
                            <div className="flex items-center gap-2 py-2 cursor-pointer" onClick={() => setDontAsk(!dontAsk)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${dontAsk ? 'bg-red-500 border-red-500' : 'border-white/30'}`}>{dontAsk && <CheckCircle2 size={14} />}</div>
                                <span className="text-xs opacity-70">Jangan ingatkan lagi</span>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors">Batal</button>
                                <button onClick={handleConfirm} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">Hapus</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const NoteCard = ({ 
  note, isSelected, onClick, isAnySelected, theme, isDark, onUpdate, cardRef, availableTags, 
  isSelectionMode, isChecked, onToggleSelect, onDeleteSwipe, onClose 
}) => {
  const [noteState, setNoteState, undo, redo, canUndo, canRedo] = useUndoRedo({ title: note.title, content: note.content });
  const textAreaRef = useRef(null);
  const timerRef = useRef(null);
  
  const handlePointerDown = () => {
    if (!isSelectionMode && !isSelected) {
        timerRef.current = setTimeout(() => { onToggleSelect(note.id, true); }, 500); 
    }
  };
  const cancelTimer = () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };

  useEffect(() => { if (isSelected) onUpdate(note.id, noteState); }, [noteState, isSelected]);
  useEffect(() => { if (!isSelected) setNoteState({ title: note.title, content: note.content }); }, [note.id]);

  const handleInput = (e) => {
    const target = e.target;
    // PURE AUTO HEIGHT. NO SCROLL INTERFERENCE.
    target.style.height = 'auto'; 
    target.style.height = target.scrollHeight + 'px';
    setNoteState({ ...noteState, content: target.value });
    // DONT TOUCH SCROLL HERE! LET BROWSER HANDLE IT.
  };
  
  React.useLayoutEffect(() => {
    if (isSelected && textAreaRef.current) { 
        textAreaRef.current.style.height = 'auto'; 
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px'; 
    }
  }, [isSelected]);

  const handleTagToggle = (tag) => {
    const newTags = note.tags.includes(tag) ? note.tags.filter(t => t !== tag) : [...note.tags, tag];
    onUpdate(note.id, { ...note, tags: newTags });
  };
  const validTags = note.tags.filter(t => availableTags.includes(t));
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]); 
  
  return (
    <motion.div
      ref={cardRef}
      layout={!isSelected} 
      
      drag={!isSelected && !isSelectionMode ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={cancelTimer}
      onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 100) onDeleteSwipe(note.id); }}
      style={{ 
        x, opacity, backgroundColor: theme.surface, color: theme.text, 
        border: `1px solid ${isChecked ? theme.primary : (isSelected ? theme.primary + '40' : theme.border)}`, 
        boxShadow: 'none', 
        zIndex: isSelected ? 30 : 0 
      }}
      
      onPointerDown={handlePointerDown}
      onPointerUp={cancelTimer}
      onPointerLeave={cancelTimer}
      onContextMenu={(e) => e.preventDefault()} 
      onClick={isSelectionMode ? () => onToggleSelect(note.id) : (isSelected ? null : onClick)}

      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isChecked ? 0.95 : (isAnySelected && !isSelected ? 0.98 : 1) }}
      transition={{ layout: { duration: 0.35, type: "spring", stiffness: 250, damping: 25 } }}
      className={`relative rounded-3xl overflow-hidden flex flex-col gap-3 transition-colors duration-300 ${isSelected ? 'col-span-2 min-h-[40vh] h-auto p-6 cursor-default' : 'col-span-1 h-fit p-5 cursor-pointer touch-pan-y'}`}
    >
      <AnimatePresence>
        {(isSelectionMode || isChecked) && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute top-4 right-4 z-10">
                {isChecked ? <div className="rounded-full bg-blue-500 text-white"><CheckCircle2 size={24} fill={theme.primary} color={isDark ? "black" : "white"} /></div> : <Circle size={24} className="opacity-30" />}
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-start gap-2 relative shrink-0">
        {isSelected ? (
            <div className="w-full flex justify-between items-start">
                <input className="font-bold text-2xl bg-transparent outline-none w-full pb-2 mr-2" style={{ color: theme.text, borderBottom: `1px solid ${theme.border}` }} value={noteState.title} onChange={(e) => setNoteState({ ...noteState, title: e.target.value })} placeholder="Judul..." />
                <button 
                  className={`p-2 rounded-full transition-colors flex-shrink-0 relative z-50 ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`} 
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                >
                    <X size={20} />
                </button>
            </div>
        ) : (
            <h3 className={`font-bold text-lg leading-tight w-full break-words line-clamp-3 ${isSelectionMode ? 'pr-8' : ''}`}>{note.title || <span className="opacity-30 italic">Tanpa Judul</span>}</h3>
        )}
      </div>

      <div className="flex-1 w-full">
        {isSelected ? (
            <textarea ref={textAreaRef} className="w-full bg-transparent outline-none resize-none text-base leading-relaxed p-1 overflow-hidden" style={{ fontFamily: 'sans-serif', minHeight: '150px', color: theme.text }} value={noteState.content} onChange={handleInput} placeholder="Tulis catatan..." autoFocus={false} />
        ) : (
            <p className="text-sm opacity-80 whitespace-pre-wrap line-clamp-[6] break-words" style={{ fontFamily: 'sans-serif' }}>{note.content}</p>
        )}
      </div>

      <div className="flex flex-col mt-4 pt-3 shrink-0" style={{ borderTop: `1px solid ${theme.border}` }}>
        {isSelected && (
            <div className="flex flex-wrap gap-2 mb-4">
                {availableTags.map(tag => (
                    <button key={tag} onClick={(e) => { e.stopPropagation(); handleTagToggle(tag); }} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${note.tags.includes(tag) ? 'border-transparent' : isDark ? 'bg-transparent text-white/50 border-white/10' : 'bg-transparent text-black/50 border-black/10'}`} style={ note.tags.includes(tag) ? { backgroundColor: theme.primary, color: isDark ? '#000' : '#FFF' } : {} }>{tag}</button>
                ))}
            </div>
        )}
        <div className="flex justify-between items-center h-10">
            {isSelected ? (
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-medium opacity-50">{note.date}</span>
                    <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5'}`}>
                        <button onClick={(e) => { e.stopPropagation(); undo(); }} disabled={!canUndo} className={`p-1.5 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} ${!canUndo && 'opacity-20'}`}><Undo2 size={18} /></button>
                        <div className={`w-[1px] h-4 ${isDark ? 'bg-white/20' : 'bg-black/20'}`}></div>
                        <button onClick={(e) => { e.stopPropagation(); redo(); }} disabled={!canRedo} className={`p-1.5 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} ${!canRedo && 'opacity-20'}`}><Redo2 size={18} /></button>
                    </div>
                </div>
            ) : (
                <>
                    <span className="text-xs font-medium opacity-60">{note.date}</span>
                    {validTags.length > 0 && (
                        <div className="flex gap-1 overflow-hidden max-w-[60%] flex-wrap justify-end">
                            {validTags.map(tag => (
                                <span key={tag} className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider truncate ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/5 text-black/70'}`}>{tag}</span>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </motion.div>
  );
};

const SettingsSheet = ({ isOpen, onClose, theme, setThemeKey, currentThemeKey, isDark, toggleDark, allTags, setAllTags, notes, setNotes }) => {
    const [newTag, setNewTag] = useState('');
    const fileInputRef = useRef(null);
    const handleAddTag = () => { if (newTag && !allTags.includes(newTag)) { setAllTags([...allTags, newTag]); setNewTag(''); } };
    const handleDeleteTag = (tagToDelete) => { setAllTags(allTags.filter(t => t !== tagToDelete)); };
    const handleExport = () => { const blob = new Blob([JSON.stringify({ notes, allTags, version: '19.0' }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `dinduy-v19-${new Date().toISOString().slice(0,10)}.json`; a.click(); };
    const handleImport = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const data = JSON.parse(event.target.result); if (data.notes) { setNotes(data.notes); if (data.allTags) setAllTags(data.allTags); alert('Restored!'); } } catch (err) { alert('Error.'); } }; reader.readAsText(file); };
  
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 z-[60]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 rounded-t-[2rem] p-6 z-[70] shadow-2xl h-[85vh] overflow-y-auto" style={{ backgroundColor: isDark ? '#121212' : '#F2F2F7', color: isDark ? 'white' : 'black' }}>
              <div className="w-12 h-1.5 bg-gray-500/30 rounded-full mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Settings className="w-6 h-6" /> Pengaturan</h2>
              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4 block">Tema</label>
                  <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {['default', 'lavender', 'royal', 'mint', 'sunset', 'coffee', 'autumn', 'ocean'].map((k) => (
                      <button key={k} onClick={() => setThemeKey(k)} className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 transition-transform active:scale-90`} style={{ backgroundColor: k === 'default' ? '#333' : THEMES[k].light.primary, borderColor: currentThemeKey === k ? (isDark ? 'white' : 'black') : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <div><label className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4 block">Data</label><div className="flex gap-3"><button onClick={handleExport} className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><Download size={18} /> Export</button><button onClick={() => fileInputRef.current?.click()} className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}><Upload size={18} /> Import</button><input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} /></div></div>
                <div><label className="text-xs font-bold uppercase tracking-wider opacity-50 mb-4 block">Kelola Label</label><div className="flex gap-2 mb-4"><input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Buat label baru..." className={`flex-1 px-4 py-3 rounded-xl outline-none ${isDark ? 'bg-white/5 text-white' : 'bg-black/5 text-black'}`} /><button onClick={handleAddTag} disabled={!newTag} className="p-3 rounded-xl text-white disabled:opacity-50" style={{ backgroundColor: theme.primary }}><Plus /></button></div><div className="flex flex-wrap gap-2">{allTags.map(tag => (<div key={tag} className={`flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}><span className="text-sm font-medium">{tag}</span><button onClick={() => handleDeleteTag(tag)} className={`p-1 rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'}`}><Trash2 size={14} className="opacity-50" /></button></div>))}</div></div>
                <div className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}><div className="flex items-center gap-3">{isDark ? <Moon size={20} /> : <Sun size={20} />}<span className="font-medium">AMOLED Mode</span></div><button onClick={toggleDark} className={`w-14 h-8 rounded-full p-1 transition-colors ${isDark ? 'bg-white/20' : 'bg-gray-300'}`}><motion.div layout className="w-6 h-6 bg-white rounded-full shadow-md" animate={{ x: isDark ? 24 : 0 }} /></button></div>
              </div>
              <div className="mt-20 text-center opacity-30 text-xs font-mono">Build: Dinduy-ZenScroll-v19</div>
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
  const lastScrolledId = useRef(null); // GUARD
  const theme = useMemo(() => isDark ? THEMES[themeKey].dark : THEMES[themeKey].light, [themeKey, isDark]);

  const stateRef = useRef({ selectedId, isSettingsOpen, deleteModalOpen: deleteModal.isOpen, isSelectionMode });
  useEffect(() => { stateRef.current = { selectedId, isSettingsOpen, deleteModalOpen: deleteModal.isOpen, isSelectionMode }; }, [selectedId, isSettingsOpen, deleteModal.isOpen, isSelectionMode]);

  useEffect(() => {
    const handlePopState = () => {
        const current = stateRef.current;
        if (current.deleteModalOpen) setDeleteModal(prev => ({ ...prev, isOpen: false }));
        else if (current.isSettingsOpen) setIsSettingsOpen(false);
        else if (current.selectedId) setSelectedId(null);
        else if (current.isSelectionMode) { setIsSelectionMode(false); setSelectedIds([]); }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const pushState = () => window.history.pushState(null, '');
  const goBack = () => window.history.back();
  const openNote = (id) => { pushState(); setSelectedId(id); };
  const openSettings = () => { pushState(); setIsSettingsOpen(true); };
  const openDeleteModal = (ids) => {
     const skipConfirm = localStorage.getItem('dinduy_skip_delete_confirm') === 'true';
     if (skipConfirm) performDelete(ids);
     else { pushState(); setDeleteModal({ isOpen: true, count: ids.length, targetIds: ids }); }
  };

  // --- FIXED SCROLL LOGIC: PRECISE POSITIONING ---
  useEffect(() => {
    // Only scroll if NEW SELECTION
    if (selectedId && lastScrolledId.current !== selectedId) {
      // Small timeout to allow Framer Motion layout to settle
      setTimeout(() => {
        const el = noteRefs.current[selectedId];
        if (el) {
            // MANUAL SCROLL CALCULATION FOR PERFECT HEADER OFFSET
            const headerHeight = 100; // Approximation of header height + padding
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

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

  const updateNote = (id, updates) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  const filteredNotes = notes.filter(n => (n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())) && (activeTag === 'All' || n.tags.some(t => t === activeTag && allTags.includes(t))));

  const handleToggleSelect = (id, triggerMode = false) => {
      if (triggerMode) {
          setIsSelectionMode(true);
          setSelectedIds([id]);
          if (navigator.vibrate) navigator.vibrate(50);
          pushState(); 
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
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <h1 className={`font-black tracking-tighter transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-4xl'}`} style={{ color: theme.primary }}>Dinduy.</h1>
            <div className={`flex-1 ml-4 max-w-[200px] transition-opacity duration-300 ${isScrolled && !selectedId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`flex items-center px-3 py-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/5'}`}><Search size={14} className="opacity-40 mr-2" /><input className="bg-transparent outline-none text-sm w-full placeholder:text-current placeholder:opacity-30" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            </div>
        </div>
        <div className="flex gap-2">
            <AnimatePresence>
                {isSelectionMode && (
                    <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} onClick={() => openDeleteModal(selectedIds)} className="p-3 rounded-full bg-red-500 text-white shadow-lg"><Trash2 size={24} /></motion.button>
                )}
            </AnimatePresence>
            <button onClick={openSettings} className={`p-3 rounded-full transition-transform active:scale-95 ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}><Settings size={24} /></button>
        </div>
      </motion.header>

      {!selectedId && (<div className="px-6 mb-4 mt-2"><div className="relative group transition-opacity duration-300" style={{ opacity: isScrolled ? 0 : 1, pointerEvents: isScrolled ? 'none' : 'auto' }}><Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={20} /><input type="text" placeholder="Cari..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-14 pl-12 pr-6 rounded-full outline-none transition-all shadow-sm focus:shadow-md text-lg placeholder:text-current placeholder:opacity-30" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }} /></div></div>)}
      {!selectedId && (<div className={`px-6 mb-6 overflow-x-auto no-scrollbar pb-2 transition-opacity duration-300 ${isScrolled ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}><div className="flex gap-2">{['All', ...allTags].map(tag => (<button key={tag} onClick={() => setActiveTag(tag)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border`} style={{ backgroundColor: activeTag === tag ? theme.primary : 'transparent', color: activeTag === tag ? (isDark ? '#000' : '#FFF') : theme.text, borderColor: activeTag === tag ? 'transparent' : theme.border }}>{tag}</button>))}</div></div>)}

      <main className="px-4 max-w-2xl mx-auto">
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-2 gap-3" style={{ alignItems: 'start' }}>
            <AnimatePresence mode='popLayout'>
                {filteredNotes.map((note) => (
                    // CSS Scroll Scroll Margin for Safety
                    <div key={note.id} className={selectedId === note.id ? "col-span-2 scroll-mt-28" : "col-span-1"}> 
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
        {!selectedId && filteredNotes.length === 0 && (<div className="text-center mt-20 opacity-50 flex flex-col items-center"><AlertCircle size={48} className="mb-4 opacity-30" /><p>Kosong, Ham.</p></div>)}
      </main>

      <AnimatePresence>
        {!selectedId && !isSelectionMode && (
            <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="fixed bottom-8 right-6 w-16 h-16 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center z-30" style={{ backgroundColor: theme.primary, color: isDark ? '#000' : '#FFF' }} onClick={() => { const newId = Date.now(); const newNote = { id: newId, title: '', content: '', date: 'Just now', tags: [] }; setNotes([newNote, ...notes]); openNote(newId); setSearchQuery(''); }}>
                <Plus size={32} strokeWidth={3} />
            </motion.button>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isSelectionMode && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#121212] border border-white/10 text-white px-6 py-3 rounded-full shadow-2xl z-40 flex items-center gap-4">
                <span className="font-bold">{selectedIds.length} Dipilih</span>
                <div className="w-[1px] h-4 bg-white/20"></div>
                <button onClick={goBack} className="text-sm opacity-70 hover:opacity-100">Batal</button>
            </motion.div>
        )}
      </AnimatePresence>

      <DeleteModal 
        isOpen={deleteModal.isOpen} 
        onClose={goBack} 
        onConfirm={() => performDelete(deleteModal.targetIds)} 
        count={deleteModal.count} 
      />

      <SettingsSheet isOpen={isSettingsOpen} onClose={goBack} theme={theme} setThemeKey={setThemeKey} currentThemeKey={themeKey} isDark={isDark} toggleDark={() => setIsDark(!isDark)} allTags={allTags} setAllTags={setAllTags} notes={notes} setNotes={setNotes} />
    </div>
  );
}
