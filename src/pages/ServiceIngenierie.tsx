import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, Database, Code, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceIngenierie: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Ingénierie IA et Data - CANTIC THINK IA" 
        description="Exploitez vos données pour une prise de décision basée sur la preuve et l'analyse prédictive."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Ingénierie IA et Data</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            La donnée est le carburant de votre entreprise. Nous concevons les systèmes qui permettent de la collecter, de la structurer et, surtout, de l'exploiter pour automatiser vos processus et prédire vos futurs succès.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Pourquoi pour un entrepreneur ?</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><Database className="text-emerald-500" /> <strong>Décisions éclairées :</strong> Passez de l'intuition à la preuve chiffrée.</li>
              <li className="flex gap-3"><Zap className="text-emerald-500" /> <strong>Efficacité opérationnelle :</strong> Automatisez les tâches répétitives pour libérer votre temps.</li>
              <li className="flex gap-3"><Code className="text-emerald-500" /> <strong>Avantage concurrentiel :</strong> Utilisez l'analyse prédictive pour anticiper les besoins de vos clients.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Notre démarche</h3>
            <p className="mb-6">De l'architecture de vos données à la mise en place d'agents IA autonomes, nous construisons des solutions techniques sur-mesure, scalables et intégrées à votre écosystème.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-emerald-500 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all">
              Déployer vos solutions IA <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceIngenierie;
