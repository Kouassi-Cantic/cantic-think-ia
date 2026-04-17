import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, Clock, ArrowRight, Banknote, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROISimulator: React.FC = () => {
  const [employees, setEmployees] = useState(10);
  const [salary, setSalary] = useState(500000); // FCFA
  const [hours, setHours] = useState(5); // Heures perdues/semaine

  const calculate = () => {
    // 160h / mois (base légale)
    // 47 semaines / an (approx 52 - 5 semaines congés)
    const hourlyRate = salary / 160;
    const weeklyLoss = employees * hourlyRate * hours;
    const annualLoss = weeklyLoss * 47;
    const savings = annualLoss * 0.40; // 40% optimization Cantic hypothesis
    return { annualLoss, savings };
  };

  const { annualLoss, savings } = calculate();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-slate-950 rounded-[3.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800 w-full">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-16 relative z-10">
        {/* Colonne Contrôles */}
        <div className="space-y-12">
          <div>
            <span className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">Simulateur de Performance</span>
            <h2 className="text-xl md:text-3xl font-serif font-light leading-tight">Calculez votre gisement de <span className="italic text-emerald-400">productivité</span>.</h2>
            <p className="text-slate-400 mt-3 font-light text-xs leading-relaxed">Estimez les pertes liées aux tâches à faible valeur ajoutée (saisie, recherche, reporting manuel).</p>
          </div>

          <div className="space-y-8">
            {/* Slider 1 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-emerald-500" /> Collaborateurs
                </label>
                <span className="text-lg font-serif font-bold">{employees}</span>
              </div>
              <input 
                type="range" 
                min="1" max="100" step="1" 
                value={employees} 
                onChange={(e) => setEmployees(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Slider 2 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <Banknote className="w-3.5 h-3.5 text-emerald-500" /> Salaire Moyen
                </label>
                <span className="text-lg font-serif font-bold">{salary.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="100000" max="2000000" step="50000" 
                value={salary} 
                onChange={(e) => setSalary(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Slider 3 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" /> Heures perdues / sem.
                </label>
                <span className="text-lg font-serif font-bold">{hours}h</span>
              </div>
              <input 
                type="range" 
                min="1" max="20" step="0.5" 
                value={hours} 
                onChange={(e) => setHours(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Colonne Résultats */}
        <div className="bg-slate-900/50 rounded-[2.5rem] p-6 md:p-8 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 mb-1 truncate">Coût annuel de l'inefficacité</p>
                <p className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight break-words">{formatCurrency(annualLoss)}</p>
                <p className="text-slate-500 text-[10px] mt-1 font-light">Budget "invisible" perdu chaque année.</p>
              </div>
            </div>

            <div className="w-full h-px bg-slate-800"></div>

            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                 <TrendingUp className="w-5 h-5" />
               </div>
               <div className="overflow-hidden">
                 <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500 mb-1 truncate">Gain net projeté avec Cantic</p>
                 <p className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight break-words">{formatCurrency(savings)}</p>
                 <p className="text-slate-500 text-[10px] mt-1 font-light">Basé sur une automatisation de 40% des tâches.</p>
               </div>
            </div>
          </div>

          <div className="mt-12">
            <Link 
              to={`/contact?subject=${encodeURIComponent('Audit ROI et Productivité')}&message=${encodeURIComponent(`D'après le simulateur, je perds environ ${formatCurrency(annualLoss)} par an. Je souhaite lancer un audit pour récupérer ce budget.`)}`}
              className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-xl group"
            >
              Récupérer ce budget
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROISimulator;
