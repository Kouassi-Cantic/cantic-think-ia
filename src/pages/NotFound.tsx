import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, ArrowLeft, Search, 
  ShieldAlert, Sparkles, Zap, 
  Globe, CheckCircle2, Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/Logo';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <SEO 
        title="Page Non Trouvée - CANTIC THINK IA" 
        description="Désolé, la page que vous recherchez n'existe pas ou a été déplacée."
      />

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="relative z-10 max-w-4xl">
        <Logo variant="light" className="scale-125 mb-24 mx-auto" />
        
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 block"
        >
          Erreur de Protocole 404
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-8xl lg:text-[12rem] font-serif font-black italic text-white leading-[0.8] tracking-tighter mb-16"
        >
          HORS <br /> <span className="text-emerald-500">RÉSEAU.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl lg:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed mb-24 italic"
        >
          « La destination que vous tentez d'atteindre n'est pas répertoriée dans nos serveurs. »
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-8 justify-center"
        >
          <button 
            onClick={() => navigate('/')}
            className="px-12 py-6 bg-white text-slate-950 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
          >
            <Home className="w-5 h-5" /> Retour au QG
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="px-12 py-6 bg-slate-900 text-white border border-white/10 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
          >
            <ArrowLeft className="w-5 h-5" /> Revenir en Arrière
          </button>
        </motion.div>
      </div>

      {/* Decorative Micro-labels */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between text-white/10 text-[8px] font-black uppercase tracking-widest hidden lg:flex">
        <span>CANTIC THINK IA - System Integrity Check</span>
        <span>Error Code: 0x404_NOT_FOUND</span>
        <span>Redirecting to Main Protocol...</span>
      </div>
    </div>
  );
};

export default NotFound;
