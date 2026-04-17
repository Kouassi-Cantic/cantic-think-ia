import React, { useState } from 'react';
import { 
  Mail, Phone, MapPin, Send, 
  MessageSquare, Clock, Globe, 
  CheckCircle2, Loader2, ArrowRight,
  ShieldCheck, Zap, Users, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import SEO from '../components/SEO';
import { BRAND } from '../constants';
import BookingModule from '../components/BookingModule';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: 'Consultation Stratégique',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pré-remplissage si l'utilisateur est connecté
  React.useEffect(() => {
    const clientEmail = localStorage.getItem('cantic_client_email');
    if (clientEmail) {
      const loadProfile = async () => {
        const profileId = clientEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const profileRef = doc(db, "clients", profileId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData(prev => ({
            ...prev,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || '',
            email: data.email || clientEmail,
            institution: data.company || ''
          }));
        } else {
          setFormData(prev => ({ ...prev, email: clientEmail }));
        }
      };
      loadProfile();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'new',
        templateName: 'contact_confirmation'
      });
      setIsSuccess(true);
      setFormData({ name: '', email: '', institution: '', subject: 'Consultation Stratégique', message: '' });
    } catch (error) {
      console.error("Erreur envoi contact:", error);
      alert("Une erreur est survenue lors de l'envoi de votre message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfd] overflow-x-hidden">
      <SEO 
        title="Contactez-nous - CANTIC THINK IA" 
        description="Prenez contact avec nos experts pour discuter de vos projets d'Intelligence Artificielle et de transformation numérique."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 block"
            >
              Ligne de Communication Directe
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl lg:text-9xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-12"
            >
              ENTRONS EN <br /> <span className="text-emerald-500">DIALOGUE.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed"
            >
              Chaque grand projet commence par une conversation. Nos experts sont à votre disposition pour analyser vos besoins et <span className="text-white font-bold italic">concevoir votre futur.</span>
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- CONTACT INFO BAR --- */}
      <section className="py-12 bg-white border-b border-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Mail, label: "Email", value: "commercial@canticthinkia.work", href: "mailto:commercial@canticthinkia.work" },
              { icon: Phone, label: "Ligne Directe", value: "+225 25 22 00 12 39", href: "tel:+2252522001239" },
              { icon: Phone, label: "WhatsApp", value: "+225 05 44 86 93 13", href: "https://wa.me/2250544869313" },
              { icon: MapPin, label: "Siège Social", value: "Abidjan Cocody", href: "#" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                  <item.icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <a href={item.href} className="text-xs font-bold text-slate-900 hover:text-emerald-600 transition-colors truncate block max-w-[180px]">{item.value}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- MAIN INTERACTION GRID --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            {/* Left Column: Agenda Expert */}
            <div className="space-y-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">Planification Directe</span>
                <h2 className="text-4xl lg:text-6xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-8">
                  AGENDA <br /> <span className="text-emerald-500">EXPERT.</span>
                </h2>
                <p className="text-slate-400 font-light italic leading-relaxed max-w-md">
                  « Réservez votre session stratégique directement dans notre planning. Pas d'attente, pas d'intermédiaire. »
                </p>
              </div>
              <BookingModule />
            </div>

            {/* Right Column: Contact Form */}
            <div className="bg-white p-12 lg:p-20 rounded-[5rem] border border-slate-100 shadow-sm relative">
              <div className="mb-12">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">Messagerie Classique</span>
                <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter">ÉCRIRE AU <br /> <span className="text-emerald-500">SUPPORT.</span></h2>
              </div>

              {isSuccess ? (
                <div className="text-center py-20 animate-fade-in">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-serif font-black text-slate-900 mb-6">MESSAGE TRANSMIS.</h3>
                  <p className="text-slate-500 font-light mb-12 leading-relaxed italic">« Votre demande a été enregistrée dans nos protocoles. Un expert reviendra vers vous incessamment. »</p>
                  <button onClick={() => setIsSuccess(false)} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom Complet</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email</label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                        placeholder="jean@institution.ci"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Institution / Entreprise</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.institution}
                      onChange={e => setFormData({...formData, institution: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Ministère de la Technologie..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Objet</label>
                    <select 
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold appearance-none"
                    >
                      <option>Consultation Stratégique</option>
                      <option>Demande d'Audit</option>
                      <option>Formation et Acculturation</option>
                      <option>Développement Sur-Mesure</option>
                      <option>Partenariat</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Message</label>
                    <textarea 
                      required 
                      rows={6}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold resize-none"
                      placeholder="Décrivez brièvement votre projet ou votre besoin..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-8 bg-slate-950 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-950/20"
                  >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />} Expédier la Demande
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ PREVIEW --- */}
      <section className="py-32 lg:py-48 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <h2 className="text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-24">
            QUESTIONS <br /> FRÉQUENTES.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-5xl mx-auto">
            {[
              { q: "Comment se déroule un premier audit ?", a: "Nous commençons par une immersion de 48h dans vos processus clés pour identifier les leviers de croissance immédiats." },
              { q: "Proposez-vous des solutions souveraines ?", a: "Absolument. Nous privilégions l'hébergement local et les modèles open-source adaptés pour garantir votre indépendance." },
              { q: "Quels sont les délais d'implémentation ?", a: "Un prototype fonctionnel (MVP) est généralement déployé sous 4 à 6 semaines après validation stratégique." },
              { q: "Accompagnez-vous le changement ?", a: "Oui, l'acculturation des équipes est au cœur de notre méthodologie pour garantir l'adoption réelle des outils." }
            ].map((faq, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                <h4 className="text-xl font-serif font-bold text-slate-900 mb-4">{faq.q}</h4>
                <p className="text-slate-500 font-light text-sm leading-relaxed italic">« {faq.a} »</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
