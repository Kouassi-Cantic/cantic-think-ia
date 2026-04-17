import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth } from '../firebase';
import { CaseStudy } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, CheckCircle2, ExternalLink, Loader2, CircleDashed } from 'lucide-react';
import ROISimulator from '../components/ROISimulator';

const Applications: React.FC = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  // Utilitaire pour nettoyer les signes Markdown simples (**italique**, **gras**, etc.)
  const stripMarkdown = (text: string = "") => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Gras
      .replace(/(\*|_)(.*?)\1/g, '$2')    // Italique
      .replace(/#+\s?/g, '')              // Titres
      .replace(/>\s?/g, '')               // Citations
      .replace(/`{1,3}.*?`{1,3}/g, '')    // Code
      .trim();
  };

  useEffect(() => {
    console.log("📡 Applications : Démarrage de l'écoute Firestore...");
    
    if (!db) {
      console.error("❌ Applications : L'instance Firestore (db) n'est pas initialisée.");
      setLoading(false);
      return;
    }

    // Sécurité : Timeout de 10 secondes pour le chargement
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Applications : Le chargement Firestore prend trop de temps, arrêt forcé.");
        setLoading(false);
      }
    }, 10000);

    try {
      const q = query(collection(db, "cases"));
      console.log("🔍 Applications : Requête créée pour la collection 'cases'");
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(timeoutId);
        console.log("📥 Applications : Snapshot reçu, nb docs =", snapshot.size);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CaseStudy[];
        
        data.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        console.log("🔥 Applications : Données traitées :", data);
        setCases(data);
        setLoading(false);
      }, (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Applications : Erreur Firestore détaillée :", error);
        handleFirestoreError(error, OperationType.GET, "cases");
        setLoading(false);
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("❌ Applications : Erreur lors de la création de l'écouteur :", err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfd] space-y-6">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accès aux preuves d'impact...</p>
        <button 
          onClick={async () => {
            const { testFirestoreConnection } = await import('../firebase');
            const ok = await testFirestoreConnection();
            if (!ok) alert("❌ Impossible de se connecter à Firestore. Vérifiez la console.");
            else alert("✅ Connexion Firestore OK. Si le chargement continue, vérifiez les données.");
          }}
          className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
        >
          Tester la connexion
        </button>
      </div>
    );
  }

  const existingCases = cases.filter(c => c.status === 'Existant');
  const developmentCases = cases.filter(c => c.status !== 'Existant');

  return (
    <div className="animate-fade-in">
      <section className="bg-slate-950 text-white py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">Études de cas et ROI</span>
          <h1 className="text-5xl md:text-8xl font-serif font-light mb-8 leading-[1.1] md:leading-[0.9] tracking-tighter">
            La preuve par <br/><span className="italic text-emerald-400 underline decoration-emerald-400/20 underline-offset-8">l'impact</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light">Exploration des architectures numériques déployées pour transformer le potentiel institutionnel en performance mesurable.</p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {cases.length === 0 ? (
            <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[4rem] text-slate-300">
               <CircleDashed className="w-12 h-12 mx-auto mb-6 opacity-20 animate-spin" />
               <p className="font-serif italic text-xl">Catalogue des réalisations en cours de synchronisation...</p>
            </div>
          ) : (
            <div className="space-y-32 md:space-y-48">
              {/* Projets Existants */}
              {existingCases.map((c, i) => (
                <div key={c.id} className="space-y-16">
                  {/* En-tête du cas : Titre et Client en pleine largeur */}
                  <div className="w-full">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-4 block">{stripMarkdown(c.client)}</span>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-slate-900 leading-[1.1] tracking-tighter">
                      {stripMarkdown(c.title)}
                    </h2>
                  </div>

                  <div className={`flex flex-col lg:flex-row gap-16 lg:gap-32 items-start ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                    <div className="lg:flex-1 space-y-12">
                      <div className="space-y-10">
                        <div className="flex space-x-6">
                          <FileText className="w-6 h-6 text-slate-300 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Le Défi Métier</h4>
                            <p className="text-slate-600 italic font-light leading-relaxed text-lg">« {stripMarkdown(c.challenge)} »</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-6">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">La Réponse CANTIC THINK IA</h4>
                            <p className="text-slate-800 font-medium text-lg leading-relaxed">{stripMarkdown(c.solution)}</p>
                          </div>
                        </div>

                        <div className="p-10 bg-slate-950 rounded-[2.5rem] text-white flex items-center space-x-10 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-emerald-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                          <TrendingUp className="w-10 h-10 text-emerald-400 relative z-10" />
                          <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-2 tracking-[0.2em]">Impact et ROI Stratégique</h4>
                            <p className="text-2xl font-serif font-bold italic">{stripMarkdown(c.impact)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-6">
                        {c.url && (
                          <a 
                            href={c.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-widest flex items-center hover:bg-emerald-600 transition-all shadow-xl group/link"
                          >
                            <ExternalLink className="mr-3 w-4 h-4 group-hover/link:scale-110 transition-transform" /> 
                            Ouvrir l'application
                          </a>
                        )}
                        {c.tags && c.tags.map(t => (
                          <span key={t} className="px-6 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                            {stripMarkdown(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="lg:flex-1 w-full relative">
                      <div className="aspect-square bg-[#fcfcfd] rounded-[3rem] md:rounded-[4rem] overflow-hidden flex items-center justify-center border border-slate-200 shadow-inner group transition-all duration-700">
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/5 transition-all duration-700"></div>
                        
                        {c.visualType === 'hero' ? (
                           <div className="w-full h-full p-16 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt={stripMarkdown(c.title)} className="max-w-full max-h-full object-contain" />
                              ) : (
                                <span className="text-5xl md:text-7xl font-serif font-black italic text-slate-900">{c.heroShortTitle || c.title.substring(0, 3)}</span>
                              )}
                           </div>
                        ) : (
                          <div className="text-center p-16 transition-transform duration-700 group-hover:scale-105">
                             <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300 group-hover:text-emerald-500 transition-colors">
                               <FileText className="w-12 h-12" />
                             </div>
                             <span className="text-slate-400 font-serif italic text-lg block leading-tight">Visualisation stratégique :<br/> <span className="text-slate-900 font-bold not-italic">{stripMarkdown(c.title)}</span></span>
                          </div>
                        )}

                        <div className="absolute top-10 right-10 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg animate-pulse z-20">
                          {c.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Projets en Développement */}
              {developmentCases.length > 0 && (
                <div className="pt-20 border-t border-slate-100">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-20">
                    <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Laboratoire d'<span className="italic text-emerald-600">Anticipation</span></h3>
                      <p className="text-slate-400 text-sm font-light uppercase tracking-widest">Architectures en cours de déploiement</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {developmentCases.map(c => (
                      <div key={c.id} className="p-10 md:p-12 bg-[#fcfcfd] border border-slate-100 rounded-[3rem] group hover:border-emerald-500/30 transition-all duration-500">
                        <div className="flex justify-between items-start mb-8">
                          <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                            c.status === 'Phase Pilote' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-slate-300 font-black text-[9px] uppercase tracking-widest">{stripMarkdown(c.client)}</span>
                        </div>
                        <h4 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors">{stripMarkdown(c.title)}</h4>
                        <p className="text-slate-500 font-light leading-relaxed mb-8 line-clamp-2">{stripMarkdown(c.impact)}</p>
                        <div className="flex items-center gap-3 text-emerald-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          En cours d'ingénierie <Loader2 className="w-3 h-3 animate-spin" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* SECTION SIMULATEUR ROI */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ROISimulator />
        </div>
      </section>
    </div>
  );
};

export default Applications;
