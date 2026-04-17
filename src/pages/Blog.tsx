import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Loader2, ArrowRight, ArrowLeft, MessageSquareText, Calendar, User, X, 
  Play, Pause, Volume2, ThumbsUp, Zap, Target, Send, Shield, Download, ExternalLink
} from 'lucide-react';
import { db } from '../firebase';
import { 
  collection, onSnapshot, query, orderBy, doc, updateDoc, 
  increment, addDoc, where 
} from "firebase/firestore";
import { GoogleGenAI, Modality } from "@google/genai";
import { BlogPost, BlogComment } from '../types';
import SEO from '../components/SEO';

// Fonctions utilitaires pour le TTS (Audio Decoding)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  // Deep linking
  const [searchParams] = useSearchParams();

  // États pour les commentaires
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // États pour l'audio (TTS)
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    console.log("📡 Blog : Démarrage de l'écoute Firestore...");
    
    if (!db) {
      console.error("❌ Blog : L'instance Firestore (db) n'est pas initialisée.");
      setLoading(false);
      return;
    }

    // Sécurité : Timeout de 10 secondes pour le chargement
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Blog : Le chargement Firestore prend trop de temps, arrêt forcé.");
        setLoading(false);
      }
    }, 10000);

    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        clearTimeout(timeoutId);
        console.log("📥 Blog : Snapshot reçu, nb docs =", snapshot.size);
        const data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          reactions: doc.data().reactions || { pertinent: 0, visionnaire: 0, actionnable: 0 }
        })) as BlogPost[];
        setPosts(data);
        setLoading(false);
      }, (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Blog : Erreur Firestore détaillée :", error);
        setLoading(false);
      });
      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("❌ Blog : Erreur lors de la création de l'écouteur :", err);
      setLoading(false);
    }
  }, []);

  // Deep linking logic: watch for params and posts loaded
  useEffect(() => {
    const postId = searchParams.get('post_id');
    if (postId && posts.length > 0) {
      const targetPost = posts.find(p => p.id === postId);
      if (targetPost) setSelectedPost(targetPost);
    }
  }, [searchParams, posts]);

  // Charger les commentaires quand un article est sélectionné
  useEffect(() => {
    if (selectedPost) {
      const q = query(
        collection(db, "comments"), 
        where("postId", "==", selectedPost.id), 
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogComment[];
        setComments(data);
      });
      return () => unsubscribe();
    } else {
      stopAudio();
    }
  }, [selectedPost]);

  const handleReaction = async (type: 'pertinent' | 'visionnaire' | 'actionnable') => {
    if (!selectedPost) return;
    const postRef = doc(db, "posts", selectedPost.id);
    await updateDoc(postRef, {
      [`reactions.${type}`]: increment(1)
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedPost) return;
    setIsSubmittingComment(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId: selectedPost.id,
        author: "Expert Visiteur",
        content: newComment,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const playAudio = async () => {
    if (!selectedPost) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // On nettoie le HTML pour le TTS
      const cleanText = selectedPost.content.replace(/<[^>]*>/g, '').substring(0, 3000); 
      const prompt = `Lis cet article de blog avec une voix calme, posée et professionnelle : ${selectedPost.title}. ${cleanText}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
        
        sourceRef.current = source;
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio generation error:", err);
      alert("Impossible de générer la synthèse vocale pour le moment.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Accès aux réflexions stratégiques...</p>
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

  return (
    <div className="animate-fade-in bg-white min-h-screen pb-40">
      {/* Gestion SEO Dynamique */}
      {selectedPost ? (
        <SEO 
          title={selectedPost.title} 
          description={selectedPost.excerpt} 
          type="article"
        />
      ) : (
        <SEO 
          title="Veille Stratégique et Réflexions" 
          description="Analyses prospectives sur l'intelligence artificielle en Afrique par les experts de CANTIC THINK IA."
        />
      )}

      {/* Header */}
      <section className="bg-slate-50 pt-32 pb-24 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
            <span className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Intelligence et Prospective</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-slate-900 mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]">
            Veille et <span className="italic text-emerald-600">Réflexions</span>.
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-light leading-relaxed">
            Un espace pour penser l'IA, questionner l'entrepreneuriat et partager nos retours d'expérience sur le terrain ivoirien.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-24 md:py-32 max-w-5xl mx-auto px-6">
        {posts.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem]">
            <MessageSquareText className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 italic font-serif text-lg">Le laboratoire de pensée est en cours de configuration...</p>
          </div>
        ) : (
          <div className="space-y-24">
            {posts.map((post) => (
              <article key={post.id} className="group relative animate-fade-in">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                  <div className="md:w-1/4 space-y-4 md:space-y-6">
                    {post.imageUrl && (
                      <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-6">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-emerald-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{post.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <User className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest truncate">{post.author}</span>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <h2 className="text-2xl md:text-4xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors cursor-pointer leading-tight" onClick={() => setSelectedPost(post)}>
                      {post.title}
                    </h2>
                    <p className="text-lg md:text-xl text-slate-500 font-light leading-snug mb-10 italic">
                      « {post.excerpt} »
                    </p>
                    <button 
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex items-center text-slate-900 font-black text-xs uppercase tracking-widest border-b-2 border-slate-900 pb-2 hover:text-emerald-600 hover:border-emerald-600 transition-all group/btn"
                    >
                      Lire la réflexion <ArrowRight className="ml-3 w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* MODAL ARTICLE COMPLET */}
      {selectedPost && (
        <div className="fixed inset-0 z-[150] bg-white overflow-y-auto animate-fade-in">
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex justify-between items-center z-50 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 hidden md:block">Document Stratégique • Haute Lisibilité</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 md:hidden">Article</span>
             </div>
             <button onClick={() => setSelectedPost(null)} className="flex items-center gap-3 px-6 md:px-8 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg">
               <ArrowLeft className="w-4 h-4" /> Retour aux articles
             </button>
          </div>
          
          <div className="max-w-4xl mx-auto px-6 md:px-8 py-24">
            <header className="mb-20 text-center relative">
              <button 
                onClick={() => setSelectedPost(null)}
                className="mb-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" /> Retour à la liste
              </button>
              <span className="text-emerald-600 font-black uppercase tracking-[0.3em] text-[11px] mb-8 block">{selectedPost.date} • PAR {selectedPost.author}</span>
              <h1 className="text-2xl md:text-4xl font-serif font-black text-slate-950 mb-12 leading-tight tracking-tight">{selectedPost.title}</h1>
              
              {selectedPost.imageUrl && (
                <div className="max-w-5xl mx-auto mb-16 rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title} 
                    className="w-full h-auto object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* LECTEUR AUDIO IA */}
              <div className="flex justify-center mb-12">
                <button 
                  onClick={playAudio}
                  disabled={isAudioLoading}
                  className={`flex items-center gap-4 px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    isPlaying 
                    ? 'bg-red-50 text-red-500 border border-red-100' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100'
                  }`}
                >
                  {isAudioLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Synthèse vocale IA...
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Arrêter l'écoute
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      Écouter l'analyse (IA)
                    </>
                  )}
                </button>
              </div>

              <div className="w-24 h-1.5 bg-emerald-500 mx-auto rounded-full mb-12"></div>
              <p className="text-xl md:text-2xl font-serif italic text-slate-600 max-w-2xl mx-auto leading-snug border-l-4 border-emerald-100 text-left">
                {selectedPost.excerpt}
              </p>

              {selectedPost.ctaLink && selectedPost.ctaLabel && (
                <div className="mt-12 flex justify-center">
                  <a 
                    href={selectedPost.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-emerald-500/20"
                  >
                    {selectedPost.ctaLabel} <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </header>
            
            {/* Contenu de l'article */}
            <div className="prose prose-slate max-w-none mb-24 overflow-hidden">
              <div 
                className="text-slate-950 text-lg md:text-2xl leading-[1.6] md:leading-[1.55] font-serif space-y-8 blog-content-render break-words"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />
            </div>

            {selectedPost.ctaLink && selectedPost.ctaLabel && (
              <div className="mb-24 flex justify-center">
                <a 
                  href={selectedPost.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-12 py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-2xl"
                >
                  {selectedPost.ctaLabel} <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}

            {selectedPost.brochureUrl && (
              <div className="mb-24 p-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h4 className="text-2xl font-serif font-black text-slate-900 mb-2">Ressource Complémentaire</h4>
                  <p className="text-slate-500 font-light">Téléchargez le programme détaillé ou la brochure associée à cette réflexion.</p>
                </div>
                <a 
                  href={selectedPost.brochureUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-4 hover:bg-emerald-600 transition-all shadow-xl"
                >
                  <Download className="w-4 h-4" /> Télécharger le PDF
                </a>
              </div>
            )}

            {/* SYSTÈME DE RÉACTIONS STRATÉGIQUES */}
            <div className="py-16 border-y border-slate-100 mb-24">
              <h4 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Impact de la réflexion</h4>
              <div className="flex flex-wrap justify-center gap-6">
                <button 
                  onClick={() => handleReaction('pertinent')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all min-w-[120px]"
                >
                  <Target className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Pertinent</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedPost.reactions?.pertinent || 0}</span>
                </button>
                <button 
                  onClick={() => handleReaction('visionnaire')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 hover:bg-amber-50 border border-transparent hover:border-amber-100 transition-all min-w-[120px]"
                >
                  <Zap className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Visionnaire</span>
                  <span className="text-sm font-bold text-amber-600">{selectedPost.reactions?.visionnaire || 0}</span>
                </button>
                <button 
                  onClick={() => handleReaction('actionnable')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-slate-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all min-w-[120px]"
                >
                  <ThumbsUp className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Actionnable</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedPost.reactions?.actionnable || 0}</span>
                </button>
              </div>
            </div>

            {/* ESPACE DE DIALOGUE EXPERT */}
            <div className="mb-40">
              <div className="flex items-center gap-4 mb-12">
                <MessageSquareText className="w-6 h-6 text-emerald-500" />
                <h3 className="text-3xl font-serif font-bold text-slate-900">Prolonger la réflexion</h3>
              </div>
              
              <form onSubmit={handleCommentSubmit} className="mb-16">
                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 focus-within:border-emerald-300 transition-all shadow-sm">
                  <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partagez votre analyse ou posez une question..."
                    className="w-full bg-transparent border-none outline-none text-slate-800 text-lg font-light resize-none h-32 mb-4"
                    required
                  ></textarea>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">Espace modéré • Ton institutionnel</span>
                    <button 
                      type="submit" 
                      disabled={isSubmittingComment}
                      className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Envoyer
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-10">
                {comments.length === 0 ? (
                  <p className="text-center text-slate-400 italic font-serif">Aucune contribution pour le moment. Soyez le premier à enrichir le débat.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-6 animate-fade-in">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0 text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-serif font-bold text-slate-900">{comment.author}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-lg leading-relaxed font-light italic">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <footer className="mt-40 pt-20 border-t border-slate-200 text-center">
              <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest mb-10">Fin de la transmission</p>
              <div className="p-16 bg-slate-900 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold mb-10 relative z-10">Pensez votre futur IA <span className="italic text-emerald-400">aujourd'hui</span>.</h3>
                <Link to="/contact?subject=Audit%20Expert%20(Blog)" className="inline-flex items-center justify-center px-14 py-6 bg-white text-slate-900 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-2xl relative z-10">Engager un audit expert</Link>
              </div>
            </footer>
          </div>
        </div>
      )}
      
      {/* Styles injectés */}
      <style>{`
        .blog-content-render { overflow-wrap: break-word; word-wrap: break-word; }
        .blog-content-render * { max-width: 100%; }
        .blog-content-render p { margin-bottom: 1.5rem; }
        .blog-content-render b, .blog-content-render strong { font-weight: 800; color: #000; }
        .blog-content-render h1 { font-size: 1.45rem; font-family: 'Playfair Display', serif; font-weight: 700; color: #0f172a; margin-top: 4rem; margin-bottom: 2rem; line-height: 1.1; }
        .blog-content-render h2 { font-size: 1.35rem; font-family: 'Playfair Display', serif; font-weight: 700; color: #0f172a; margin-top: 3.5rem; margin-bottom: 1.5rem; line-height: 1.2; }
        .blog-content-render h3 { font-size: 1.25rem; font-family: 'Playfair Display', serif; font-weight: 700; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1.25rem; line-height: 1.2; }
        @media (min-width: 768px) {
          .blog-content-render h1 { font-size: 2.15rem; margin-top: 5rem; margin-bottom: 2.5rem; }
          .blog-content-render h2 { font-size: 1.95rem; margin-top: 4.5rem; margin-bottom: 2rem; }
          .blog-content-render h3 { font-size: 1.75rem; margin-top: 3.5rem; margin-bottom: 1.5rem; }
        }
        .blog-content-render ul { list-style-type: disc; padding-left: 2rem; margin-bottom: 2rem; }
        .blog-content-render li { margin-bottom: 1rem; }
        .blog-content-render img { height: auto; border-radius: 2rem; margin: 3rem auto; display: block; shadow: 0 20px 50px rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
};

export default Blog;
