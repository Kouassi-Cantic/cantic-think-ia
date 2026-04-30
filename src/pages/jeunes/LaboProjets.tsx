import React, { useState } from 'react';
import { Rocket, Lightbulb, CheckCircle2 } from 'lucide-react';
import { ProjectIdeaModal } from '../../components/ProjectIdeaModal';

const LaboProjets: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [idea, setIdea] = useState<{ problem: string; solution: string } | null>(null);

    const handleSaveIdea = (problem: string, solution: string) => {
        setIdea({ problem, solution });
    };

    return (
        <div className="p-8 text-white max-w-5xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Labo de projets</h1>
            <p className="text-slate-400 mb-12 text-lg">Structure et transforme tes idées novatrices en projets impactants.</p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                    { icon: Lightbulb, title: "Idéation", desc: "Définit ton problème et ta solution.", action: () => setIsModalOpen(true) },
                    { icon: Rocket, title: "Planification", desc: "Structure les étapes clés.", action: undefined },
                    { icon: CheckCircle2, title: "Concrétisation", desc: "Lance ton MVP / projet.", action: undefined }
                ].map((step, idx) => (
                    <div 
                        key={idx} 
                        onClick={step.action}
                        className={`bg-slate-900/60 p-6 rounded-3xl border border-slate-800 ${step.action ? 'cursor-pointer hover:border-indigo-500 transition' : ''}`}
                    >
                        <step.icon className="w-10 h-10 text-indigo-400 mb-4" />
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-indigo-900/20 p-8 rounded-3xl border border-indigo-500/30 text-center">
                <h2 className="text-2xl font-bold mb-4">Prêt à te lancer ?</h2>
                <p className="text-slate-300 mb-6"> {idea ? "Ton idée est prête à être partagée !" : "Partage ton idée avec la communauté pour obtenir des feedbacks."}</p>
                <button 
                    disabled={!idea}
                    className={`px-8 py-3 rounded-xl font-bold transition ${idea ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                >
                    Proposer une idée
                </button>
            </div>

            <ProjectIdeaModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveIdea}
                initialProblem={idea?.problem}
                initialSolution={idea?.solution}
            />
        </div>
    );
};

export default LaboProjets;
