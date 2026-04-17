import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, Code, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceDeveloppement: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Développement Sur-Mesure - CANTIC THINK IA" 
        description="Conception d'applications IA spécifiques répondant à vos défis métiers uniques."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Développement Sur-Mesure</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Concevez des applications IA spécifiques, conçues pour répondre précisément à vos défis métiers uniques et à vos besoins opérationnels.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Ce que nous apportons :</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><Code className="text-slate-900" /> <strong>Modèles LLM :</strong> Personnalisés pour votre usage.</li>
              <li className="flex gap-3"><Settings className="text-slate-900" /> <strong>Intégration API :</strong> Connectez vos outils existants.</li>
              <li className="flex gap-3"><Code className="text-slate-900" /> <strong>Maintenance évolutive :</strong> Assurez la pérennité de vos solutions.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Intérêt pour l'entrepreneur</h3>
            <p className="mb-6">Bénéficiez d'outils parfaitement adaptés à vos processus, sans compromis, pour une efficacité maximale.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-slate-700 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-600 transition-all">
              Développer votre solution <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDeveloppement;
