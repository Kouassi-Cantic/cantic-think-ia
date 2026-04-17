import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const ROISimulatorPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    investment: '',
    hoursSaved: '',
    hourlyCost: '',
    revenueGrowth: '',
    name: '',
    email: ''
  });
  const [results, setResults] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const calculateROI = () => {
    const inv = parseFloat(formData.investment) || 0;
    const hours = parseFloat(formData.hoursSaved) || 0;
    const cost = parseFloat(formData.hourlyCost) || 0;
    const growth = parseFloat(formData.revenueGrowth) || 0;

    const annualSavings = hours * cost * 12;
    const annualGrowth = (inv * growth) / 100;
    const totalAnnualGain = annualSavings + annualGrowth;
    const roi = inv > 0 ? ((totalAnnualGain - inv) / inv) * 100 : 0;
    const paybackDays = totalAnnualGain > 0 ? (inv / totalAnnualGain) * 365 : 0;

    return { annualSavings, annualGrowth, totalAnnualGain, roi, paybackDays };
  };

  const handleSubmit = async () => {
    const calcResults = calculateROI();
    setResults(calcResults);
    try {
      await addDoc(collection(db, 'leads_roi'), { 
        ...formData, 
        ...calcResults, 
        createdAt: new Date(),
        templateName: 'roi_analysis'
      });
      setIsSubmitted(true);
      setStep(5);
    } catch (e) {
      console.error("Erreur lors de l'enregistrement du lead:", e);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-black text-slate-900 mb-2">Simulateur de Retour sur Investissement (ROI) par l'Intelligence Artificielle (IA)</h1>
        <div className="bg-emerald-50 p-6 rounded-2xl mb-8 text-sm text-slate-700 space-y-4">
          <p><strong>Qu'est-ce que le Retour sur Investissement (ROI) ?</strong> C'est la mesure de la rentabilité de votre projet. Pour chaque euro investi dans votre transformation digitale, combien d'euros gagnez-vous ou économisez-vous ? C'est votre boussole pour décider où placer vos ressources.</p>
          <p><strong>Qu'est-ce que l'Intelligence Artificielle (IA) ?</strong> Ce sont des outils technologiques capables d'automatiser des tâches complexes. Pour vous, entrepreneur, c'est l'opportunité de libérer votre équipe des tâches répétitives, d'accélérer vos processus et de prendre des décisions basées sur des données précises.</p>
          <p><strong>L'intérêt pour vous ?</strong> Passer d'une gestion subie à une gestion pilotée, pour augmenter vos marges et votre compétitivité.</p>
        </div>
        <p className="text-slate-500 mb-12">Découvrez l'impact de la transformation digitale sur votre performance.</p>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4, 5].map(s => (
              <div key={s} className={`h-2 w-full mx-1 rounded-full ${step >= s ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Étape 1 : Investissement Digital (Abonnements IA, formation, déploiement)</h2>
                <input type="number" placeholder="Coût total estimé (FCFA) (ex: 5000000)" className="w-full p-4 border rounded-xl mb-4" value={formData.investment} onChange={e => setFormData({...formData, investment: e.target.value})} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Étape 2 : Gain d'Efficacité</h2>
                <input type="number" placeholder="Heures gagnées par mois (ex: 20)" className="w-full p-4 border rounded-xl mb-4" value={formData.hoursSaved} onChange={e => setFormData({...formData, hoursSaved: e.target.value})} />
                <input type="number" placeholder="Coût horaire moyen (FCFA) (ex: 3000)" className="w-full p-4 border rounded-xl mb-4" value={formData.hourlyCost} onChange={e => setFormData({...formData, hourlyCost: e.target.value})} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Étape 3 : Croissance</h2>
                <input type="number" placeholder="Augmentation CA estimée (%) (ex: 10)" className="w-full p-4 border rounded-xl mb-4" value={formData.revenueGrowth} onChange={e => setFormData({...formData, revenueGrowth: e.target.value})} />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-6">Étape 4 : Contact</h2>
                <input type="text" placeholder="Nom" className="w-full p-4 border rounded-xl mb-4" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="email" placeholder="Email" className="w-full p-4 border rounded-xl mb-4" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </motion.div>
            )}
            {step === 5 && results && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 bg-slate-50 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CheckCircle className="text-emerald-500" /> Analyse générée !</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl">ROI Annuel: {results.roi.toFixed(1)}%</div>
                    <div className="bg-white p-4 rounded-xl">Rentabilité: {Math.round(results.paybackDays)} jours</div>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[{ name: 'Investissement', val: parseFloat(formData.investment) || 0 }, { name: 'Gain Annuel', val: results.totalAnnualGain }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="val" fill="#10b981" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="mt-6 text-sm text-slate-600">Une analyse détaillée vous a été envoyée par email à <strong>{formData.email}</strong>. Un expert vous contactera sous peu.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(prev => Math.max(prev - 1, 1))} disabled={step === 1 || step === 5} className="px-6 py-3 bg-slate-100 rounded-xl disabled:opacity-50">Précédent</button>
            <button onClick={() => step === 4 ? handleSubmit() : setStep(prev => Math.min(prev + 1, 4))} disabled={step === 5} className="px-6 py-3 bg-emerald-600 text-white rounded-xl disabled:opacity-50">{step === 4 ? 'Recevoir mon analyse' : 'Suivant'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROISimulatorPage;
