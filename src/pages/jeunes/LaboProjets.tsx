import React, { useState } from 'react';
import { Rocket, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectIdeaModal } from '../../components/ProjectIdeaModal';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const LaboProjets: React.FC = () => {
    const [isIdeationModalOpen, setIsIdeationModalOpen] = useState(false);
    const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [idea, setIdea] = useState<{ title: string; problem: string; solution: string } | null>(null);
    const [milestones, setMilestones] = useState([{ title: '', dueDate: '' }]);
    const [mvpDescription, setMvpDescription] = useState('');
    const [launchDate, setLaunchDate] = useState('');
    const navigate = useNavigate();

    const savePlanning = async () => {
        if (!auth.currentUser) return;
        await setDoc(doc(db, 'user_projects', auth.currentUser.uid), { milestones }, { merge: true });
        setIsPlanningModalOpen(false);
    };

    const saveLaunch = async () => {
        if (!auth.currentUser) return;
        await setDoc(doc(db, 'user_projects', auth.currentUser.uid), { launch: { mvpDescription, launchDate } }, { merge: true });
        setIsLaunchModalOpen(false);
    };

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

            {/* Planning Modal */}
            {isPlanningModalOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 w-full max-w-lg text-white">
                  <h2 className="text-2xl font-bold mb-4">Planification</h2>
                  {milestones.map((m, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input value={m.title} onChange={e => {
                            const newM = [...milestones];
                            newM[i].title = e.target.value;
                            setMilestones(newM);
                        }} placeholder="Jalon" className="w-full p-2 bg-slate-800 rounded" />
                        <input type="date" value={m.dueDate} onChange={e => {
                           const newM = [...milestones];
                           newM[i].dueDate = e.target.value;
                           setMilestones(newM);
                        }} className="p-2 bg-slate-800 rounded" />
                      </div>
                  ))}
                  <button onClick={() => setMilestones([...milestones, {title: '', dueDate: ''}])} className="text-sm text-indigo-400 mb-4">+ Ajouter</button>
                  <div className="flex gap-4">
                    <button onClick={() => setIsPlanningModalOpen(false)} className="px-6 py-2 bg-slate-700 rounded">Fermer</button>
                    <button onClick={savePlanning} className="px-6 py-2 bg-indigo-600 rounded">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Modal */}
            {isLaunchModalOpen && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 w-full max-w-lg text-white">
                  <h2 className="text-2xl font-bold mb-4">Concrétisation</h2>
                  <textarea placeholder="Description du MVP" value={mvpDescription} onChange={e => setMvpDescription(e.target.value)} className="w-full mb-4 p-2 bg-slate-800 rounded h-24" />
                  <input type="date" value={launchDate} onChange={e => setLaunchDate(e.target.value)} className="w-full mb-4 p-2 bg-slate-800 rounded" />
                  <div className="flex gap-4">
                    <button onClick={() => setIsLaunchModalOpen(false)} className="px-6 py-2 bg-slate-700 rounded">Fermer</button>
                    <button onClick={saveLaunch} className="px-6 py-2 bg-indigo-600 rounded">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default LaboProjets;
