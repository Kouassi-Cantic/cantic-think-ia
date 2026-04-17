import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, ShieldCheck, ArrowRight, ArrowLeft, Loader2, Eye, X, BookOpen, FileText, Info, Lock, AlertCircle, Download, ExternalLink, Terminal, Copy, CheckCircle2, Phone, CreditCard, Mail, Hash, Gift, Image, Mic, Headphones, Video, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, addDoc, doc } from "firebase/firestore";
import { DigitalResource, Transaction } from '../types';
import SEO from '../components/SEO';

// @ts-ignore
import * as pdfjsLib from 'https://esm.sh/pdfjs-dist@4.0.379?bundle';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.mjs`;

const LimitedPdfViewer: React.FC<{ url: string; price: number; onAcquire: () => void; onClose: () => void; maxPages?: number }> = ({ url, price, onAcquire, onClose, maxPages = 5 }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalDocumentPages, setTotalDocumentPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);
        setPages([]);
        
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          cMapUrl: 'https://esm.sh/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
        });
        
        const pdf = await loadingTask.promise;
        if (isMounted) setTotalDocumentPages(pdf.numPages);
        
        const pageCount = Math.min(pdf.numPages, maxPages);
        
        for (let i = 1; i <= pageCount; i++) {
          if (!isMounted) break;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if (context) {
            await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
            const pageData = canvas.toDataURL('image/jpeg', 0.85);
            if (isMounted) {
              setPages(prev => [...prev, pageData]);
              if (i === 1) setLoading(false);
            }
          }
        }
        if (isMounted) setLoading(false);
      } catch (err: any) {
        if (isMounted) {
          const isCors = err.name === "UnexpectedResponseException" || err.message?.includes("fetch");
          setError(isCors ? "CORS" : err.message || "Erreur inconnue");
          setLoading(false);
        }
      }
    };
    loadPdf();
    return () => { isMounted = false; };
  }, [url, maxPages]);

  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6 py-48">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Accès au serveur de documents...</p>
        <button 
          onClick={onClose}
          className="px-8 py-3 border border-slate-800 text-slate-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:text-white hover:border-white transition-all"
        >
          Annuler et retourner
        </button>
      </div>
    );
  }

  if (error === "CORS") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-12 text-center max-w-2xl mx-auto py-24 animate-fade-in">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-10 text-emerald-500 border border-emerald-500/20 shadow-2xl relative">
          <ShieldCheck className="w-10 h-10" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Lock className="w-3 h-3 text-white" /></div>
        </div>
        <h4 className="text-4xl font-serif mb-6 leading-tight">Sécurité de Données <span className="italic text-emerald-400">Activée</span></h4>
        <p className="text-slate-400 text-lg font-light leading-relaxed mb-12">La politique de sécurité bloque le rendu. Accédez à la source.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={url} target="_blank" rel="noopener noreferrer" className="px-12 py-5 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">Ouvrir la source</a>
          <button onClick={onClose} className="px-12 py-5 border border-white/10 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all">Retour boutique</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-12 space-y-12 max-w-4xl mx-auto pb-64 pt-6">
      {pages.map((pageData, index) => (
        <div key={index} className="relative group animate-fade-in shadow-2xl rounded-sm overflow-hidden border border-white/5 bg-white">
          <img src={pageData} alt={`Page ${index + 1}`} className="w-full object-contain" />
          <div className="absolute top-6 right-6 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-white/10">Extrait • Page {index + 1}</div>
        </div>
      ))}
      <div className="relative pt-24 pb-40 text-center">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative z-10"><Lock className="text-white w-8 h-8" /></div>
        <h5 className="text-3xl font-serif text-white mb-6 relative z-10">Fin de l'Aperçu Stratégique</h5>
        <p className="text-slate-400 text-base max-w-md mx-auto mb-12 font-light relative z-10">Acquérez la ressource pour débloquer l'intégralité du savoir.</p>
        <div className="flex flex-col items-center gap-6 relative z-20">
          <button 
            onClick={onAcquire}
            className="px-12 py-6 bg-white text-slate-950 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-2xl flex items-center gap-4"
          >
            <ShoppingCart className="w-5 h-5" /> Débloquer pour {price}
          </button>
          <button 
            onClick={onClose}
            className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    </div>
  );
};

const Shop: React.FC = () => {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<DigitalResource | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const categories = ['Tous', 'Solutions Opérationnelles', 'Veille et Prospective', 'Évasions et Récits'];
  
  // Deep linking
  const [searchParams] = useSearchParams();

  // Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log("📡 Shop : Démarrage de l'écoute Firestore...");
    
    if (!db) {
      console.error("❌ Shop : L'instance Firestore (db) n'est pas initialisée.");
      setLoading(false);
      return;
    }

    // Sécurité : Timeout de 10 secondes pour le chargement
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Shop : Le chargement Firestore prend trop de temps, arrêt forcé.");
        setLoading(false);
      }
    }, 10000);

    try {
      const q = query(collection(db, "resources"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(timeoutId);
        console.log("📥 Shop : Snapshot reçu, nb docs =", snapshot.size);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DigitalResource[];
        // Sort by order if available
        const sortedData = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setResources(sortedData);
        setLoading(false);
      }, (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Shop : Erreur Firestore détaillée :", error);
        setLoading(false);
      });
      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("❌ Shop : Erreur lors de la création de l'écouteur :", err);
      setLoading(false);
    }
  }, []);

  // Deep linking logic
  useEffect(() => {
    const resourceId = searchParams.get('resource_id') || searchParams.get('resource');
    if (resourceId && resources.length > 0) {
      const target = resources.find(r => r.id === resourceId || r.slug === resourceId);
      if (target) {
        setSelectedResource(target);
        setIsPreviewOpen(false);
      }
    }
  }, [searchParams, resources]);

  // Forcer le scroll en haut quand on ouvre la preview
  useEffect(() => {
    if (isPreviewOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isPreviewOpen]);

  // Écouter les changements de la transaction en cours
  useEffect(() => {
    if (!transactionId) return;
    const unsubscribe = onSnapshot(doc(db, "transactions", transactionId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Transaction;
        setTransactionStatus(data.status);
      }
    });
    return () => unsubscribe();
  }, [transactionId]);

  const initiatePayment = async (resource: DigitalResource) => {
    setSelectedResource(resource);
    setIsPreviewOpen(false);
    setIsPaymentModalOpen(true);
    setTransactionStatus('idle');
    setUserPhone('');
    setUserEmail('');
    setFirstName('');
    setReferenceNumber('');
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("0544869313");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmTransfer = async () => {
    if (!userPhone || !userEmail || !firstName || !selectedResource) return;
    
    setTransactionStatus('pending');
    try {
      // Générer une référence automatique
      const autoRef = `TX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setReferenceNumber(autoRef);
      
      const docRef = await addDoc(collection(db, "transactions"), {
        resourceId: selectedResource.id,
        resourceTitle: selectedResource.title,
        amount: selectedResource.price,
        userPhone: userPhone,
        userEmail: userEmail,
        firstName: firstName,
        referenceNumber: autoRef,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setTransactionId(docRef.id);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Une erreur technique empêche l'initiation du paiement.");
      setTransactionStatus('idle');
    }
  };

  const openPreview = (resource: DigitalResource) => { setSelectedResource(resource); setIsPreviewOpen(true); };
  const openDetails = (resource: DigitalResource) => { setSelectedResource(resource); setIsPreviewOpen(false); };
  const closeModals = () => { 
    setSelectedResource(null); 
    setIsPreviewOpen(false); 
    setIsPaymentModalOpen(false); 
    setTransactionId(null);
    setTransactionStatus('idle');
  };

  return (
    <div className="animate-fade-in bg-slate-50 min-h-screen pb-40">
      {/* SEO Dynamique */}
      {selectedResource ? (
        <SEO 
          title={`${selectedResource.title} | Boutique Stratégique`}
          description={selectedResource.description}
        />
      ) : (
        <SEO 
          title="Boutique et Ressources Stratégiques" 
          description="Guides, modèles et outils d'intelligence artificielle pour les décideurs."
        />
      )}

      <section className="bg-[#0f172a] text-white pt-32 md:pt-48 pb-48 md:pb-64 relative overflow-hidden text-center lg:text-left">
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-10 pointer-events-none">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-10 block">Bibliothèque de Savoir</span>
          <h1 className="text-5xl md:text-[10rem] font-serif font-light mb-14 tracking-tighter leading-[0.9] md:leading-[0.85]">Le Hub <span className="italic text-emerald-400">Digital</span>.</h1>
          
          {/* CATEGORY FILTERING */}
          <div className="flex flex-wrap gap-4 mt-8">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-20">
        {loading ? (
          <div className="py-32 bg-white rounded-[4rem] flex flex-col items-center justify-center border border-slate-100 shadow-2xl">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Chargement du catalogue...</p>
          </div>
        ) : (
          /* GRILLE RESPONSIVE : 2 colonnes serrées sur mobile, 3 colonnes larges sur desktop */
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-12">
            {resources
              .filter(r => activeCategory === 'Tous' || r.category === activeCategory)
              .map((item) => (
              <div key={item.id} className="group flex flex-col h-full bg-white rounded-3xl md:rounded-[3rem] shadow-sm md:shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-700">
                <div onClick={() => openDetails(item)} className="relative aspect-[3/4] p-4 md:p-12 flex flex-col justify-center items-center text-center cursor-pointer overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradientFrom || 'from-slate-100'} ${item.gradientTo || 'to-slate-200'} opacity-70 group-hover:scale-110 transition-transform duration-[2000ms]`}></div>
                  <div className="relative z-10 space-y-2 md:space-y-8 group-hover:-translate-y-10 transition-transform duration-700">
                    <h2 className="text-sm md:text-4xl font-serif text-slate-900 leading-tight line-clamp-3 md:line-clamp-none">{item.title}</h2>
                    <span className="text-[8px] md:text-[11px] font-black text-emerald-600 uppercase tracking-widest block">{item.typeLabel}</span>
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8 md:pb-20">
                    <div className="bg-white text-slate-900 px-5 py-2.5 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest shadow-2xl flex items-center gap-2 md:gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                      <Info className="w-3 h-3 md:w-4 md:h-4" /> Détails
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-12 flex-grow flex flex-col justify-between border-t border-slate-50">
                  <div className="mb-4 md:mb-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-2 md:mb-8 gap-1">
                      <span className="text-[8px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.pagesCount} PAGES</span>
                      <span className="text-base md:text-3xl font-serif font-bold text-slate-900">
                        {typeof item.price === 'number' ? `${item.price.toLocaleString('fr-FR')} FCFA` : item.price}
                      </span>
                    </div>
                    <div className="relative hidden md:block">
                      <p className="text-slate-500 font-light text-base leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                      <button 
                        onClick={() => openDetails(item)}
                        className="text-emerald-600 font-bold text-[11px] uppercase tracking-widest mt-3 hover:text-emerald-400 transition-colors flex items-center gap-2 group/more"
                      >
                        Lire plus <ArrowRight className="w-3 h-3 group-hover/more:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <button onClick={() => initiatePayment(item)} className="w-full py-3 md:py-6 bg-slate-950 text-white rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-4 hover:bg-emerald-600 transition-all shadow-xl">
                      <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> <span className="md:inline">Acquérir</span><span className="md:hidden">Acheter</span>
                    </button>
                    {item.fileUrl && (
                      <button onClick={() => openPreview(item)} className="w-full py-2 md:py-5 border border-slate-200 text-slate-600 rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3 hover:bg-slate-50 transition-all hidden md:flex">
                        <Eye className="w-3 h-3 md:w-4 md:h-4" /> Lire l'extrait
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODALE DE PAIEMENT */}
      {isPaymentModalOpen && selectedResource && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in relative">
            {/* Bouton Retour Mobile */}
            <button 
              onClick={closeModals}
              className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all md:hidden"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>

            <button onClick={closeModals} className="absolute top-6 right-6 z-30 p-2 rounded-full hover:bg-slate-100 transition-colors hidden md:block">
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="bg-slate-50 p-8 pt-20 md:pt-8 border-b border-slate-100 flex-shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">Acquisition sécurisée</span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight line-clamp-2">{selectedResource.title}</h3>
              <p className="text-2xl md:text-3xl font-black text-slate-900 mt-4">{selectedResource.price.toLocaleString()} FCFA</p>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
              {transactionStatus === 'idle' && (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Votre Prénom</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                placeholder="Jean" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Numéro Mobile Money</label>
                        <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="tel" 
                                value={userPhone}
                                onChange={e => setUserPhone(e.target.value)}
                                placeholder="07 00 00 00 00" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Email de réception</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                value={userEmail}
                                onChange={e => setUserEmail(e.target.value)}
                                placeholder="votre@email.com" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 ml-3 font-medium leading-tight">Ce mail servira d'identifiant pour votre espace membre.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50 rounded-2xl flex flex-col gap-2 border border-emerald-100">
                    <div className="flex gap-3 items-start">
                      <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Après validation, effectuez le transfert Wave au numéro unique :
                      </p>
                    </div>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 ml-0 md:ml-8">
                      <strong className="text-base font-black text-emerald-900 tracking-wider">+225 05 44 86 93 13</strong>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText("+2250544869313");
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copié !" : "Copier"}
                      </button>
                    </div>
                    <p className="text-[10px] text-emerald-600/70 ml-0 md:ml-8">
                      Votre ressource sera débloquée instantanément après réception.
                    </p>
                  </div>

                  <button onClick={handleConfirmTransfer} className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5" /> Confirmer le transfert
                  </button>
                </>
              )}

              {transactionStatus === 'pending' && (
                <div className="text-center py-8 animate-fade-in">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-serif font-black text-slate-900 mb-4 tracking-tight">Vérification en cours, <span className="italic text-emerald-600">{firstName}</span>...</h4>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed mb-10 font-medium">
                    Un administrateur valide actuellement votre accès. <br />
                    <span className="text-emerald-600 font-bold">Connectez-vous à votre compte avec votre email</span> pour accéder à vos ressources. <br />
                    Votre achat et ses bonus y seront déposés dans un <span className="text-emerald-600 font-bold">délai maximum de 1h</span> après réception du paiement. <br />
                    <span className="text-[10px] text-slate-400 mt-2 block italic">Référence : {referenceNumber}</span>
                  </p>
                  <div className="flex flex-col gap-3">
                    <a 
                      href="/#/client/login"
                      className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 text-center"
                    >
                      Accéder à mon compte
                    </a>
                    <button 
                      onClick={closeModals}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}

              {transactionStatus === 'completed' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Paiement Validé !</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">Votre ressource est débloquée. Connectez-vous à votre espace client pour y accéder.</p>
                  <div className="flex flex-col gap-3">
                    <a href="/#/client/login" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3">
                      <User className="w-4 h-4" /> Accéder à mon compte
                    </a>
                    <a href={selectedResource.fileUrl} target="_blank" rel="noopener noreferrer" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3">
                      <Download className="w-4 h-4" /> Télécharger maintenant
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* MODALE DETAILS */}
      {selectedResource && !isPaymentModalOpen && !isPreviewOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-6 bg-slate-900/95 backdrop-blur-md animate-fade-in">
           <div className="w-full max-w-5xl bg-white rounded-t-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row h-[92vh] md:h-[85vh] max-h-[92vh] md:max-h-[85vh] animate-slide-up">
              {/* BOUTON RETOUR */}
              <button 
                onClick={closeModals} 
                className="absolute top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-slate-900 hover:bg-white hover:text-emerald-600 transition-all shadow-lg border border-slate-100 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Retour</span>
              </button>

              <button onClick={closeModals} className="absolute top-6 right-6 z-30 p-2 md:p-3 bg-white/50 md:bg-white/20 backdrop-blur-md rounded-full text-slate-900 hover:bg-white hover:text-red-500 transition-all shadow-sm md:hidden"><X className="w-5 h-5 md:w-6 md:h-6" /></button>
              
              <div className="h-1/3 md:h-auto md:w-2/5 bg-slate-100 relative group overflow-hidden shrink-0">
                 <div className={`absolute inset-0 bg-gradient-to-br ${selectedResource.gradientFrom} ${selectedResource.gradientTo} opacity-80`}></div>
                 <div className="relative z-10 h-full flex flex-col justify-center items-center p-6 md:p-12 text-center">
                    <BookOpen className="w-10 h-10 md:w-20 md:h-20 text-slate-900 mb-4 md:mb-8 opacity-20" />
                    <h2 className="text-xl md:text-4xl font-serif text-slate-900 leading-tight mb-2 md:mb-4">{selectedResource.title}</h2>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-600">{selectedResource.typeLabel}</span>
                 </div>
              </div>

              <div className="h-2/3 md:h-auto md:w-3/5 p-6 md:p-16 flex flex-col overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200">
                 <div className="flex justify-between items-start mb-6 md:mb-8">
                    <div>
                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1 md:mb-2 block">{selectedResource.badge}</span>
                       <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                         {typeof selectedResource.price === 'number' ? `${selectedResource.price.toLocaleString('fr-FR')} FCFA` : selectedResource.price}
                       </h3>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 md:mb-2 block">Volume</span>
                       <p className="text-sm md:text-base font-bold text-slate-700">{selectedResource.pagesCount} PAGES</p>
                    </div>
                 </div>
                 
                 <div className="mb-8 md:mb-12 text-slate-600 font-light leading-relaxed">
                    {selectedResource.description.split('\n').map((line, i) => {
                      if (!line.trim()) return <br key={i} className="my-2" />;
                      
                      // Détection simple de motif "Titre : Description" pour mettre en gras le titre
                      const colonIndex = line.indexOf(':');
                      if (colonIndex > 0 && colonIndex < 40) {
                          const title = line.substring(0, colonIndex + 1);
                          const content = line.substring(colonIndex + 1);
                          return (
                              <p key={i} className="mb-3">
                                  <strong className="font-serif font-bold text-slate-900 block md:inline md:mr-2">{title}</strong>
                                  {content}
                              </p>
                          );
                      }
                      
                      return <p key={i} className="mb-3">{line}</p>;
                    })}
                 </div>

                  {selectedResource.targetAudience && (
                    <div className="mb-8">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Public Cible</h4>
                        <p className="text-slate-700 font-medium">{selectedResource.targetAudience}</p>
                    </div>
                  )}

                  {selectedResource.keyBenefits && selectedResource.keyBenefits.length > 0 && (
                    <div className="mb-12">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Bénéfices Stratégiques</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {selectedResource.keyBenefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-start gap-3 group/item">
                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-emerald-500 transition-colors">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 group-hover/item:text-white transition-colors" />
                                    </div>
                                    <span className="text-slate-600 text-sm leading-tight">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* Bonus Section */}
                  {(selectedResource.bonusPdfUrl || selectedResource.bonusImageUrl || selectedResource.bonusVideoUrl || selectedResource.bonusAudioUrl) && (
                    <div className="mb-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                            <Gift className="w-4 h-4" /> Bonus Inclus avec votre achat
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedResource.bonusPdfUrl && (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Résumé PDF</span>
                                </div>
                            )}
                            {selectedResource.bonusImageUrl && (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Image className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Résumé Image</span>
                                </div>
                            )}
                            {selectedResource.bonusVideoUrl && (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Video className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Vidéo Exclusive</span>
                                </div>
                            )}
                            {selectedResource.bonusAudioUrl && (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <Headphones className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">Version Audio</span>
                                </div>
                            )}
                        </div>
                    </div>
                  )}

                 <div className="mt-auto space-y-3 md:space-y-4 pt-4">
                    <button onClick={() => initiatePayment(selectedResource)} className="w-full py-4 md:py-6 bg-slate-900 text-white rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-[12px] tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:bg-emerald-600 transition-all shadow-xl">
                       <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" /> Acquérir la ressource
                    </button>
                    {selectedResource.fileUrl && (
                       <button onClick={() => openPreview(selectedResource)} className="w-full py-3 md:py-5 border-2 border-slate-100 text-slate-600 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-[12px] tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:border-slate-900 hover:text-slate-900 transition-all">
                          <Eye className="w-4 h-4 md:w-5 md:h-5" /> Lire l'extrait gratuit
                       </button>
                    )}
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}/#/boutique?resource=${selectedResource.slug || selectedResource.id}`;
                        navigator.clipboard.writeText(link);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full py-3 md:py-5 border-2 border-slate-100 text-slate-600 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase text-[10px] md:text-[12px] tracking-widest flex items-center justify-center gap-3 md:gap-4 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <Copy className="w-4 h-4 md:w-5 md:h-5" />}
                      {copied ? "Lien copié !" : "Partager cette ressource"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODALE PREVIEW */}
      {isPreviewOpen && selectedResource && selectedResource.fileUrl && (
        <div className="fixed inset-0 z-[1100] bg-slate-950 flex flex-col animate-fade-in">
           <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-4">
                 <button onClick={closeModals} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Retour à la boutique</span>
                 </button>
                 <span className="text-white font-bold text-sm truncate max-w-[200px] md:max-w-md">Extrait : {selectedResource.title}</span>
              </div>
              <button onClick={() => initiatePayment(selectedResource)} className="px-6 py-2 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                 Acheter {selectedResource.price}
              </button>
           </div>
           <div className="flex-grow overflow-y-auto bg-slate-950" ref={scrollContainerRef}>
              <LimitedPdfViewer 
                url={selectedResource.fileUrl} 
                price={selectedResource.price}
                onAcquire={() => initiatePayment(selectedResource)}
                onClose={closeModals}
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
