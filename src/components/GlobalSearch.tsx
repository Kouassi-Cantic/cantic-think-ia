import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, ShoppingCart, GraduationCap, ArrowRight, Command, X, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";

interface SearchResult {
  id: string;
  type: 'formation' | 'ressource' | 'article';
  title: string;
  description: string;
  path: string;
  icon: any;
  color: string;
}

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Gestion de l'ouverture/fermeture et indexation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-cantic-search', handleOpenEvent);

    // Pré-chargement de l'index au montage
    const buildIndex = async () => {
      try {
        const [postsSnap, resourcesSnap, trainingSnap] = await Promise.all([
          getDocs(collection(db, "posts")),
          getDocs(collection(db, "resources")),
          getDocs(collection(db, "formations"))
        ]);

        const idx: SearchResult[] = [];

        postsSnap.forEach(doc => {
          const d = doc.data();
          idx.push({
            id: doc.id,
            type: 'article',
            title: d.title,
            description: d.excerpt || '',
            path: `/blog?post_id=${doc.id}`,
            icon: FileText,
            color: 'text-emerald-500'
          });
        });

        resourcesSnap.forEach(doc => {
          const d = doc.data();
          idx.push({
            id: doc.id,
            type: 'ressource',
            title: d.title,
            description: d.typeLabel || '',
            path: `/boutique?resource_id=${doc.id}`,
            icon: ShoppingCart,
            color: 'text-emerald-500'
          });
        });

        trainingSnap.forEach(doc => {
          const d = doc.data();
          if (d.is_active !== false) {
            idx.push({
              id: doc.id,
              type: 'formation',
              title: d.title_professional || d.title,
              description: d.benefit_micro || '',
              path: `/formations`, // Pas de lien profond pour l'instant sur formations
              icon: GraduationCap,
              color: 'text-amber-500'
            });
          }
        });

        setIndex(idx);
      } catch (e) {
        console.error("Indexation failed", e);
      }
    };

    buildIndex();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-cantic-search', handleOpenEvent);
    };
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Filtrage
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const timeoutId = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = index.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q)
      ).slice(0, 5); // Max 5 résultats
      
      setResults(filtered);
      setSelectedIndex(0);
      setLoading(false);
    }, 150); // Debounce léger

    return () => clearTimeout(timeoutId);
  }, [query, index]);

  // Navigation Clavier dans la liste
  const handleListNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const handleSelect = (item: SearchResult) => {
    setIsOpen(false);
    navigate(item.path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl transition-opacity animate-fade-in"
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-scale-in flex flex-col">
        {/* Header / Input */}
        <div className="flex items-center px-6 py-6 border-b border-slate-100 bg-white/50 relative">
          <Search className="w-6 h-6 text-slate-400 mr-4" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleListNavigation}
            placeholder="Quelle expertise recherchez-vous ?" 
            className="flex-grow bg-transparent text-2xl font-serif text-slate-900 placeholder:text-slate-300 outline-none h-full"
          />
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Results */}
        <div className="bg-slate-50/50 min-h-[100px] max-h-[60vh] overflow-y-auto">
          {loading ? (
             <div className="flex items-center justify-center py-10 text-slate-400 gap-3">
               <Loader2 className="w-5 h-5 animate-spin" />
               <span className="text-[10px] font-black uppercase tracking-widest">Recherche neurale...</span>
             </div>
          ) : results.length > 0 ? (
            <div className="py-2" ref={listRef}>
               <p className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Meilleurs résultats</p>
               {results.map((res, i) => (
                 <div 
                   key={res.id}
                   onClick={() => handleSelect(res)}
                   className={`px-6 py-4 flex items-center gap-5 cursor-pointer transition-all ${
                     i === selectedIndex ? 'bg-white shadow-lg scale-[1.02] border-y border-slate-50 z-10' : 'hover:bg-slate-100/50 border-y border-transparent'
                   }`}
                 >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      i === selectedIndex ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 ' + res.color
                    }`}>
                      <res.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                       <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-serif font-bold truncate ${i === selectedIndex ? 'text-slate-900' : 'text-slate-700'}`}>{res.title}</h4>
                          {i === selectedIndex && <ArrowRight className="w-4 h-4 text-slate-400" />}
                       </div>
                       <p className="text-xs text-slate-500 truncate font-light">{res.description}</p>
                    </div>
                 </div>
               ))}
            </div>
          ) : query ? (
            <div className="py-12 text-center">
               <p className="text-slate-400 font-serif italic mb-2">Aucun résultat pour "{query}"</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Essayez "Data", "IA", ou "Audit"</p>
            </div>
          ) : (
            <div className="py-12 text-center opacity-50">
               <div className="flex justify-center gap-8 mb-4">
                 <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Blog</span></div>
                 <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Formation</span></div>
                 <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /><span className="text-[10px] font-black uppercase">Boutique</span></div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
           <span>Moteur CANTIC THINK IA Neural™</span>
           <div className="flex gap-4">
             <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-sans">↑↓</kbd> Naviguer</span>
             <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-sans">↵</kbd> Ouvrir</span>
             <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-sans">Esc</kbd> Fermer</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
