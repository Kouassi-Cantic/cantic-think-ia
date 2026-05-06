import React from 'react';
import { Sparkles, Target, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Challenges: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-black text-slate-950 mb-12 flex items-center gap-4">
                    <Target className="text-rose-500" size={40} />
                    Challenge : Ma "Goutte" de la Semaine
                </h1>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-rose-100 flex flex-col items-center text-center">
                        <Zap className="text-rose-500 mb-4" size={32} />
                        <h3 className="font-bold mb-2">Prompt Expert</h3>
                        <p className="text-sm text-slate-500">Partage un prompt qui t'a fait gagner du temps.</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 flex flex-col items-center text-center">
                        <Users className="text-indigo-500 mb-4" size={32} />
                        <h3 className="font-bold mb-2">Colibri Solidaire</h3>
                        <p className="text-sm text-slate-500">Réponds à une question d'un nouveau membre.</p>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex flex-col items-center text-center">
                        <Sparkles className="text-emerald-500 mb-4" size={32} />
                        <h3 className="font-bold mb-2">Super Victoire</h3>
                        <p className="text-sm text-slate-500">Partage une réussite issue d'un mini-lab.</p>
                     </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-center">
                    <h2 className="text-3xl font-bold mb-6">Prêt à déposer ta goutte ?</h2>
                    <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                        Chaque action compte. Rend-toi sur le Mur des Victoires ou le Forum pour déposer ta goutte et contribuer à la communauté !
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/mur-victoires" className="px-8 py-4 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700">
                            Mur des Victoires
                        </Link>
                        <Link to="/forum" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                            Forum
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Challenges;
