import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, MessageSquare, Sparkles, Brain } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ProfileCompletionModal } from '../components/ProfileCompletionModal';

const JeunesHub: React.FC = () => {
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            if (!auth.currentUser) return;
            const profileSnap = await getDoc(doc(db, 'user_profiles', auth.currentUser.uid));
            if (!profileSnap.exists()) {
                setShowProfileModal(true);
            }
        };
        checkProfile();
    }, []);

    return (
        <div className="pt-32 p-6 min-h-screen bg-neutral-50">
            {showProfileModal && <ProfileCompletionModal onComplete={() => setShowProfileModal(false)} />}
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-4">
                        Bienvenue chez les <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Colibris des IA</span> ✨
                    </h1>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-indigo-50 border-emerald-100 max-w-3xl mx-auto">
                        <p className="text-lg text-slate-600 italic leading-relaxed">
                            « Un immense feu de forêt ravageait tout. Alors que les autres animaux fuyaient, impuissants, un petit colibri faisait des allers-retours, transportant des gouttes d'eau dans son minuscule bec pour éteindre le feu. À un éléphant qui se moquait de lui, il répondit : <strong>"Je sais, mais je fais ma part."</strong> »
                        </p>
                        <p className="text-indigo-900 font-bold mt-6">
                            Ici, chaque question, chaque partage, chaque projet est ton goutte d'eau. <strong>Rejoins la communauté et fais ta part.</strong>
                            <br /><Link to="/manifeste-colibri" className="text-indigo-700 underline text-sm hover:text-emerald-700">Lire le manifeste complet</Link>
                        </p>
                    </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <Link to="/offres-directes?scope=youth" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-indigo-50 mb-6 group-hover:bg-indigo-600 transition-colors">
                            <Rocket className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Offres Étudiants</h2>
                        <p className="text-slate-500 text-sm font-medium">Booste tes projets avec nos solutions IA.</p>
                    </Link>
                    
                    <Link to="/forum" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-violet-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-violet-50 mb-6 group-hover:bg-violet-600 transition-colors">
                            <MessageSquare className="w-8 h-8 text-violet-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Echanges Étudiants</h2>
                        <p className="text-slate-500 text-sm font-medium">Échange, t'entraide et grandis avec la communauté.</p>
                    </Link>

                    <Link to="/explorateur-talents" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-emerald-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-emerald-50 mb-6 group-hover:bg-emerald-600 transition-colors">
                            <Rocket className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Explorateur Talents</h2>
                        <p className="text-slate-500 text-sm font-medium">Découvre les métiers IA faits pour toi.</p>
                    </Link>

                    <Link to="/labo-projets" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-amber-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-amber-50 mb-6 group-hover:bg-amber-600 transition-colors">
                            <Sparkles className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Labo de Projets</h2>
                        <p className="text-slate-500 text-sm font-medium">Structure tes idées en projets concrets.</p>
                    </Link>

                    <Link to="/mur-victoires" className="relative group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-rose-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2 border-2 border-rose-200 ring-2 ring-rose-100 ring-offset-2">
                        <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                            DÉPOSE TA GOUTTE !
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-50 mb-6 group-hover:bg-rose-600 transition-colors">
                            <MessageSquare className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Mur des victoires</h2>
                        <p className="text-slate-500 text-sm font-medium">Partage tes astuces IA, dépose ta goutte et inspire la communauté.</p>
                    </Link>

                    <Link to="/quiz-ia" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-blue-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-blue-50 mb-6 group-hover:bg-blue-600 transition-colors">
                            <Sparkles className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Quiz IA</h2>
                        <p className="text-slate-500 text-sm font-medium">Teste tes connaissances et progresse.</p>
                    </Link>
                    
                    <Link to="/formation-grand-colibri" className="group p-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center hover:-translate-y-2">
                        <div className="p-4 rounded-2xl bg-indigo-50 mb-6 group-hover:bg-indigo-600 transition-colors">
                            <Brain className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Formation Grands Colibris</h2>
                        <p className="text-slate-500 text-sm font-medium">Accéder au parcours de formation exclusif.</p>
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
