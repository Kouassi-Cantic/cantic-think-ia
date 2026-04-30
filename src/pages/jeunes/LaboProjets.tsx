import React from 'react';
import { Rocket, Lightbulb, CheckCircle2 } from 'lucide-react';

const LaboProjets: React.FC = () => (
    <div className="p-8 text-white max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-4">Labo de projets</h1>
        <p className="text-slate-400 mb-12 text-lg">Structure et transforme tes idées novatrices en projets impactants.</p>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
                { icon: Lightbulb, title: "Idéation", desc: "Définit ton problème et ta solution." },
                { icon: Rocket, title: "Planification", desc: "Structure les étapes clés." },
                { icon: CheckCircle2, title: "Concrétisation", desc: "Lance ton MVP / projet." }
            ].map((step, idx) => (
                <div key={idx} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
                    <step.icon className="w-10 h-10 text-indigo-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
            ))}
        </div>

        <div className="bg-indigo-900/20 p-8 rounded-3xl border border-indigo-500/30 text-center">
            <h2 className="text-2xl font-bold mb-4">Prêt à te lancer ?</h2>
            <p className="text-slate-300 mb-6">Partage ton idée avec la communauté pour obtenir des feedbacks.</p>
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition">
                Proposer une idée
            </button>
        </div>
    </div>
);

export default LaboProjets;
