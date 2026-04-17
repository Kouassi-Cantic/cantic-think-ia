import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, MessageSquare, Sparkles } from 'lucide-react';

const JeunesHub: React.FC = () => {
    return (
        <div className="pt-32 p-6 min-h-screen bg-neutral-50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-4">
                        Bienvenue dans ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">univers IA</span> ✨
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                        Explore, apprends et construis le futur avec Cantic Think IA. Tout est là, rien que pour toi.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <Link to="/offres-directes" className="group p-10 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-indigo-50 mb-6 group-hover:bg-indigo-600 transition-colors">
                            <Rocket className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Offres Étudiants</h2>
                        <p className="text-slate-500 font-medium">Booste tes projets avec nos solutions IA créées spécialement pour toi.</p>
                        <span className="mt-6 inline-flex items-center text-indigo-600 font-bold group-hover:underline">Découvrir →</span>
                    </Link>
                    
                    <Link to="/forum" className="group p-10 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-violet-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-violet-50 mb-6 group-hover:bg-violet-600 transition-colors">
                            <MessageSquare className="w-10 h-10 text-violet-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Forum Étudiants</h2>
                        <p className="text-slate-500 font-medium">Une communauté active pour échanger, t'entraider et grandir ensemble.</p>
                        <span className="mt-6 inline-flex items-center text-violet-600 font-bold group-hover:underline">Rejoindre la discussion →</span>
                    </Link>
                </div>

                <div className="mt-12 p-8 bg-gradient-to-r from-indigo-900 to-violet-900 rounded-3xl text-white shadow-xl text-center">
                    <Sparkles className="w-10 h-10 mx-auto text-yellow-400 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Prêt à transformer ta vision ?</h3>
                    <p className="text-indigo-100 opacity-90">L'aventure commence maintenant. Explore chaque section !</p>
                </div>
            </div>
        </div>
    );
};

export default JeunesHub;
