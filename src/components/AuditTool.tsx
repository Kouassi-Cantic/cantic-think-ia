import React, { useState } from 'react';
import { AUDIT_QUESTIONS } from '../constants.ts';
import { CheckCircle2, ChevronRight, BarChart3, Target, Shield } from 'lucide-react';

const AuditTool: React.FC = () => {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (points: number) => {
    const nextScore = score + points;
    if (step < AUDIT_QUESTIONS.length - 1) {
      setScore(nextScore);
      setStep(step + 1);
    } else {
      setScore(nextScore);
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl text-center text-slate-900 border border-white/20 backdrop-blur-xl animate-scale-in">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h3 className="text-4xl font-serif font-bold mb-6">Diagnostic Établi</h3>
        <p className="text-slate-500 mb-10 font-light leading-relaxed max-w-md mx-auto">
          Votre organisation est en phase d'<strong>{score > 20 ? 'Intégration Stratégique' : 'Exploration Opérationnelle'}</strong>. Un plan d'action personnalisé est prêt.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <Target className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score de Maturité</span>
             <p className="text-2xl font-black text-slate-900 mt-1">{score}/30</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <Shield className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Indice de Risque</span>
             <p className="text-2xl font-black text-slate-900 mt-1">Faible</p>
          </div>
        </div>
        <button className="w-full py-5 bg-slate-900 text-white font-black rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center group shadow-xl">
          Télécharger le Rapport Stratégique (PDF)
          <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px]"></div>
      
      <div className="mb-12 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 block">Section {step + 1}</span>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{AUDIT_QUESTIONS[step].category}</h4>
        </div>
        <span className="text-2xl font-serif italic text-slate-200">0{step + 1}</span>
      </div>

      <div className="h-1.5 w-full bg-slate-200 rounded-full mb-12 overflow-hidden">
        <div 
          className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
          style={{ width: `${((step + 1) / AUDIT_QUESTIONS.length) * 100}%` }}
        ></div>
      </div>

      <h3 className="text-2xl md:text-3xl font-serif text-slate-900 mb-12 leading-snug">{AUDIT_QUESTIONS[step].text}</h3>
      
      <div className="space-y-4">
        {AUDIT_QUESTIONS[step].options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt.score)}
            className="w-full p-6 border border-slate-200 rounded-2xl text-left hover:border-emerald-500 hover:bg-emerald-500/5 transition-all group/opt relative overflow-hidden"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover/opt:bg-emerald-500 transition-all"></div>
            <p className="text-slate-600 group-hover/opt:text-slate-900 font-medium text-sm leading-relaxed">{opt.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AuditTool;
