import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Mail, Shield, Send, CheckCircle2, Loader2, Phone } from 'lucide-react';
import Logo from './Logo';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus('idle');

    try {
      // Vérifier si déjà inscrit
      const q = query(collection(db, "subscribers"), where("email", "==", email));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        await addDoc(collection(db, "subscribers"), {
          email,
          createdAt: new Date().toISOString(),
          source: 'Footer Site Web',
          status: 'Actif'
        });
      }
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#0f172a] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1">
            <Link to="/" className="hover:opacity-80 transition-opacity inline-block">
              <Logo variant="light" className="mb-8" />
            </Link>
            <p className="text-slate-400 font-light leading-relaxed mb-8">
              Penser l'utile. Agir intelligent. Construire durable.<br/>
              Expertise senior en Afrique depuis 2014.
            </p>
            <div className="flex space-x-5">
              <a href="https://web.facebook.com/canticthinkia" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://twitter.com/CanticThinkIA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/cantic-think-ia-408a343bb/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Veille Stratégique</h4>
            <div className="space-y-6">
              <p className="text-xs text-slate-400 font-light leading-relaxed">Recevez nos notes de prospective et analyses IA directement dans votre boîte mail.</p>
              {status === 'success' ? (
                <div className="flex items-center gap-3 text-emerald-400 animate-scale-in">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Inscription validée</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative group">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@institution.ci" 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-sm outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  />
                  <button 
                    disabled={loading}
                    className="absolute right-2 top-2 w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                  {status === 'error' && <p className="text-[9px] text-red-400 mt-2 ml-1">Une erreur est survenue. Réessayez.</p>}
                </form>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Intelligence</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li><Link to="/formations" className="hover:text-emerald-500 transition-colors">Executive Education</Link></li>
              <li><Link to="/boutique" className="hover:text-emerald-500 transition-colors">Ressources stratégiques</Link></li>
              <li><Link to="/blog" className="hover:text-emerald-500 transition-colors">Veille et Réflexions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Contact</h4>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li className="flex items-start space-x-3"><Mail className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /><span className="break-all">commercial@canticthinkia.work</span></li>
              <li className="flex items-start space-x-3"><Phone className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" /><span>+225 25 22 00 12 39</span></li>
              <li className="flex items-start space-x-3">
                <svg className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>+225 05 44 86 93 13</span>
              </li>
              <li className="text-sm leading-relaxed pl-7">544, 2 Plateaux Agban — Rue 70<br/>Carrefour Kratos, Abidjan Cocody</li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} CANTIC THINK IA. Penser l'utile. Agir intelligent.
            </p>
            <Link 
              to="/admin/login" 
              className="flex items-center gap-3 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-emerald-500 transition-all group"
              title="Console de Gouvernance"
            >
              <Shield className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Accès Sécurisé</span>
            </Link>
          </div>
          <div className="flex space-x-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <Link to="/legal" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link to="/legal" className="hover:text-white transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
