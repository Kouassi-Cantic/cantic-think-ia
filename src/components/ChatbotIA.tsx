import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

const ChatbotIA: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Bonjour. Je suis l'assistant IA de CANTIC THINK IA. Comment puis-je vous accompagner dans votre réflexion stratégique aujourd'hui ?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [siteContext, setSiteContext] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // CHARGEMENT DU CONTEXTE RAG (Retrieval-Augmented Generation)
  useEffect(() => {
    const loadContext = async () => {
      try {
        console.log("🔄 Chatbot : Chargement du contexte RAG...");
        
        // 1. Récupération des articles de blog (Derniers 5)
        let postsContext = "";
        try {
          const postsSnap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(5)));
          postsContext = postsSnap.docs.map(d => {
              const data = d.data();
              return `ARTICLE "${data.title}" (${data.date}): ${data.excerpt}`;
          }).join('\n');
          console.log("✅ Chatbot : Articles chargés.");
        } catch (e) {
          console.warn("⚠️ Chatbot : Impossible de charger les articles (posts).", e);
        }

        // 2. Récupération des formations (Actives)
        let trainContext = "";
        try {
          const trainSnap = await getDocs(query(collection(db, "formations")));
          trainContext = trainSnap.docs
              .map(d => d.data())
              .filter(d => d.is_active !== false)
              .map(d => `FORMATION "${d.title_professional || d.title}" (${d.level || 'Expert'}) : ${d.benefit_micro || d.desc}`)
              .join('\n');
          console.log("✅ Chatbot : Formations chargées.");
        } catch (e) {
          console.warn("⚠️ Chatbot : Impossible de charger les formations.", e);
        }

        // 3. Récupération des cas clients (Top 3)
        let caseContext = "";
        try {
          const caseSnap = await getDocs(query(collection(db, "cases"), limit(3)));
          caseContext = caseSnap.docs.map(d => {
              const data = d.data();
              return `CAS CLIENT "${data.title}" pour ${data.client} : ${data.impact}`;
          }).join('\n');
          console.log("✅ Chatbot : Cas clients chargés.");
        } catch (e) {
          console.warn("⚠️ Chatbot : Impossible de charger les cas clients.", e);
        }

        // Construction du prompt contextuel
        const context = `
        DONNÉES STRATÉGIQUES DU CABINET (RAG - À UTILISER POUR RÉPONDRE) :
        
        [DERNIÈRES ANALYSES et ARTICLES]
        ${postsContext || "Aucun article disponible."}

        [CATALOGUE FORMATIONS]
        ${trainContext || "Aucune formation disponible."}

        [RÉFÉRENCES CLIENTS]
        ${caseContext || "Aucune référence disponible."}
        `;
        
        setSiteContext(context);
        console.log("🚀 Chatbot : Contexte RAG prêt.");
      } catch (e) {
        console.error("❌ Erreur critique chargement contexte RAG:", e);
      }
    };

    loadContext();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `Tu es l'Expert Stratégique de CANTIC THINK IA, cabinet fondé en 2014 en Côte d'Ivoire.
      
      MISSION : Assister les décideurs en t'appuyant PRIORITAIREMENT sur ta base de connaissance interne ci-dessous.
      
      ${siteContext}
      
      CONSIGNES :
      1. Ton ton est institutionnel, expert, calme et rassurant.
      2. Utilise EXPLICITEMENT les infos ci-dessus pour répondre (ex: "Comme détaillé dans notre formation...", "Selon notre article sur...").
      3. Si l'info n'est pas dans la base, réponds avec ton expertise générale mais invite à contacter un consultant.
      4. Sois concis (3-4 phrases max).
      5. Piliers : Penser utile, Agir intelligent, Construire durable.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.5,
        }
      });
      
      const responseText = response.text || "Désolé, je ne parviens pas à formuler une analyse pour le moment.";
      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (err) {
      console.error("Gemini API Error:", err);
      setMessages(prev => [...prev, { role: 'ai', text: "Une interruption technique temporaire m'empêche de répondre." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen ? (
        <div className="w-[380px] md:w-[420px] bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden flex flex-col h-[550px] animate-fade-in">
          <div className="p-6 bg-[#0f172a] text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-black text-sm block tracking-tight">Expert CANTIC THINK IA</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Stratégie en direct</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
          </div>
          
          <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-700 shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-emerald-600/50 animate-pulse">
                <Bot className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-widest">Analyse de la base de connaissance...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex space-x-3 items-center">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-grow bg-slate-100 rounded-xl px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button type="submit" className="bg-[#0f172a] text-white p-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#0f172a] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
          <MessageSquare className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default ChatbotIA;
