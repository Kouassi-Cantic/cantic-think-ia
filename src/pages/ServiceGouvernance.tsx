import React from 'react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceGouvernance: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#fcfcfd] min-h-screen pt-32 pb-20">
      <SEO 
        title="Gouvernance et Éthique IA - CANTIC THINK IA" 
        description="Cadres de régulation pour une utilisation sécurisée, éthique et souveraine de l'IA."
      />
      <div className="container mx-auto px-6 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-serif font-black italic text-slate-950 mb-10">Gouvernance et Éthique</h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed">
            Mettez en place des cadres de régulation pour garantir une utilisation sécurisée, éthique et souveraine de l'intelligence artificielle au sein de votre organisation.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mt-20">
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-2xl font-bold mb-6">Ce que nous apportons :</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3"><CheckCircle2 className="text-amber-500" /> <strong>Audit de conformité :</strong> Assurez le respect des normes.</li>
              <li className="flex gap-3"><ShieldCheck className="text-amber-500" /> <strong>Sécurisation des données :</strong> Protégez vos actifs informationnels.</li>
              <li className="flex gap-3"><CheckCircle2 className="text-amber-500" /> <strong>Charte éthique :</strong> Définissez vos principes d'usage.</li>
            </ul>
          </div>
          <div className="bg-slate-900 p-10 rounded-3xl text-white">
            <h3 className="text-2xl font-bold mb-6">Intérêt pour l'entrepreneur</h3>
            <p className="mb-6">Anticipez les risques juridiques et réputationnels, renforcez la confiance de vos clients et partenaires.</p>
            <button onClick={() => navigate('/contact')} className="px-8 py-4 bg-amber-500 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all">
              Sécuriser votre IA <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceGouvernance;
