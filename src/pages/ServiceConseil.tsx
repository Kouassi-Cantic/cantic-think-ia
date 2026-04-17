import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, Target, Lightbulb, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceConseil: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Conseil Stratégique IA - CANTIC THINK IA" 
        description="Accompagnement stratégique pour définir votre vision et gouvernance IA."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Conseil Stratégique IA</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Dans un monde dominé par la donnée, l'IA n'est pas seulement un outil technique, c'est un levier de transformation profonde. Notre conseil stratégique vous aide à naviguer cette complexité pour aligner vos investissements technologiques avec vos objectifs de croissance à long terme.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Pourquoi pour un entrepreneur ?</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><Target className="text-emerald-500" /> <strong>Anticiper les ruptures :</strong> Ne subissez pas l'évolution technologique, pilotez-la.</li>
              <li className="flex gap-3"><Lightbulb className="text-emerald-500" /> <strong>Optimiser les ressources :</strong> Investissez là où l'impact sur votre ROI est maximal.</li>
              <li className="flex gap-3"><ShieldCheck className="text-emerald-500" /> <strong>Sécuriser votre croissance :</strong> Bâtissez une stratégie robuste, éthique et pérenne.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Notre démarche</h3>
            <p className="mb-6">Nous commençons par un audit approfondi de votre maturité numérique, suivi de la définition d'une feuille de route claire, pragmatique et orientée résultats.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-emerald-500 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all">
              Discuter de votre stratégie <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConseil;
