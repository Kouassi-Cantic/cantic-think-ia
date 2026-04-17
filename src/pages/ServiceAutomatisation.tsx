import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, Zap, Workflow, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceAutomatisation: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Automatisation Intelligente - CANTIC THINK IA" 
        description="Déploiement d'agents IA et structuration de données pour automatiser vos processus."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Automatisation Intelligente</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Déployez des agents IA et structurez vos données pour automatiser vos processus métiers et éclairer vos décisions stratégiques.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Ce que nous apportons :</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><Zap className="text-emerald-500" /> <strong>Workflows autonomes :</strong> Automatisez les tâches répétitives.</li>
              <li className="flex gap-3"><Workflow className="text-emerald-500" /> <strong>Chatbots experts RAG :</strong> Accédez à vos connaissances internes instantanément.</li>
              <li className="flex gap-3"><Database className="text-emerald-500" /> <strong>Architecture de données :</strong> Structurez vos données pour l'IA.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Intérêt pour l'entrepreneur</h3>
            <p className="mb-6">Gagnez en productivité, réduisez les erreurs humaines et libérez du temps pour les tâches à haute valeur ajoutée.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-emerald-500 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all">
              Automatiser vos processus <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceAutomatisation;
