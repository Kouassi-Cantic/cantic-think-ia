import React, { useState } from 'react';
import { Rocket, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectIdeaModal } from '../../components/ProjectIdeaModal';

const LaboProjets: React.FC = () => {
    const [isIdeationModalOpen, setIsIdeationModalOpen] = useState(false);
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [idea, setIdea] = useState<{ title: string; problem: string; solution: string } | null>(null);
    const navigate = useNavigate();

    const handleSaveIdea = (title: string, problem: string, solution: string) => {
        setIdea({ title, problem, solution });
    };

    return (
        <div className="p-8 text-white max-w-5xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Labo de projets</h1>
            <p className="text-slate-400 mb-12 text-lg">Structure et transforme tes idées novatrices en projets impactants.</p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                    { icon: Lightbulb, title: "Idéation", desc: "Définit ton problème et ta solution.", action: () => setIsIdeationModalOpen(true) },
                    { icon: Rocket, title: "Planification", desc: "Structure les étapes clés.", action: () => setIsPlanningModalOpen(true) },
                    { icon: CheckCircle2, title: "Concrétisation", desc: "Lance ton MVP / projet.", action: () => setIsLaunchModalOpen(true) }
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
                    onClick={() => navigate('/forum/new', { state: { idea } })}
                    className={`px-8 py-3 rounded-xl font-bold transition ${idea ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                >
                    Proposer une idée
                </button>
            </div>

            <ProjectIdeaModal 
                isOpen={isIdeationModalOpen} 
                onClose={() => setIsIdeationModalOpen(false)}
                onSave={handleSaveIdea}
                initialTitle={idea?.title}
                initialProblem={idea?.problem}
                initialSolution={idea?.solution}
            />

            {/* Placeholder for planning modal */}
            {isPlanningModalOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 w-full max-w-lg text-white">
                  <h2 className="text-2xl font-bold mb-4">Planification (à venir)</h2>
                  <button onClick={() => setIsPlanningModalOpen(false)} className="px-6 py-2 bg-indigo-600 rounded">Fermer</button>
                </div>
              </div>
            )}

            {/* Placeholder for launch modal */}
            {isLaunchModalOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 w-full max-w-lg text-white">
                  <h2 className="text-2xl font-bold mb-4">Concrétisation (à venir)</h2>
                  <button onClick={() => setIsLaunchModalOpen(false)} className="px-6 py-2 bg-indigo-600 rounded">Fermer</button>
                </div>
              </div>
            )}
        </div>
    );
};

export default LaboProjets;
