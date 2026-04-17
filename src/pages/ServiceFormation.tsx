import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceFormation: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Acculturation et Formation IA - CANTIC THINK IA" 
        description="Programmes de montée en compétences pour les décideurs et les équipes opérationnelles."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Acculturation et Formation</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Accompagnez vos équipes dans la transition vers l'IA grâce à des programmes de montée en compétences adaptés aux décideurs et aux opérationnels.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Ce que nous apportons :</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><GraduationCap className="text-rose-500" /> <strong>Séminaires exécutifs :</strong> Comprendre les enjeux stratégiques.</li>
              <li className="flex gap-3"><Users className="text-rose-500" /> <strong>Ateliers pratiques :</strong> Maîtriser les outils au quotidien.</li>
              <li className="flex gap-3"><GraduationCap className="text-rose-500" /> <strong>Certification IA :</strong> Valoriser les compétences acquises.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Intérêt pour l'entrepreneur</h3>
            <p className="mb-6">Réduisez la résistance au changement, augmentez l'agilité de vos équipes et créez une culture d'innovation durable.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-rose-500 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-600 transition-all">
              Former vos équipes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormation;
