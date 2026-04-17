import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, ArrowRight, 
  ShieldCheck, Loader2, Lock,
  Sparkles, Zap, Globe, CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

const ClientLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulation simple pour l'instant : on stocke l'email
      // Dans une version réelle, on pourrait envoyer un lien magique ou vérifier un code
      localStorage.setItem('cantic_client_email', email);
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 1500);
    } catch (err) {
      setError("Erreur d'accès. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row overflow-hidden">
      <SEO 
        title="Connexion Client - CANTIC THINK IA" 
        description="Accédez à votre espace membre pour gérer vos ressources et vos formations."
      />

      {/* Left Side: Visual/Branding */}
      <div className="lg:w-1/2 relative hidden lg:flex flex-col justify-between p-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]"></div>
        </div>

        <div className="relative z-10">
          <Logo variant="light" className="scale-125 origin-left mb-24" />
          <h1 className="text-7xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-12">
            VOTRE <br /> <span className="text-emerald-500">ESPACE</span> <br /> STRATÉGIQUE.
          </h1>
          <p className="text-slate-400 font-light text-xl max-w-md leading-relaxed">
            Accédez à vos actifs numériques, vos certificats de formation et votre historique de collaboration.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
          <div className="flex items-center gap-4 text-white/40">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sécurisé</span>
          </div>
          <div className="flex items-center gap-4 text-white/40">
            <Lock className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">Confidentialité Totale</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-grow flex items-center justify-center p-6 lg:p-20 bg-white relative">
        <div className="absolute top-10 right-10 lg:hidden">
          <Logo variant="dark" className="scale-75" />
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-4 block">Authentification Membre</span>
            <h2 className="text-5xl font-serif font-black italic text-slate-950 tracking-tighter">ACCÈS CLIENT.</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Institutionnel</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                  placeholder="votre@email.ci"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-3 animate-shake">
                <ShieldCheck className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full py-8 bg-slate-950 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] flex items-center justify-center gap-5 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />} Accéder à mon Espace
            </button>
          </form>

          <div className="mt-16 pt-12 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm font-light mb-6 italic">« Pas encore de compte ? »</p>
            <button 
              onClick={() => navigate('/boutique')}
              className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:text-emerald-800 transition-colors"
            >
              Découvrir nos ressources <ChevronRight className="w-4 h-4 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
