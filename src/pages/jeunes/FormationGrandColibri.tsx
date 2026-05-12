import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Brain, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const FormationGrandColibri: React.FC = () => {
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkRole = async () => {
            if (!auth.currentUser) {
                setIsAuthorized(false);
                return;
            }
            // Check if user is Grand Colibri
            const statsRef = doc(db, 'user_stats', auth.currentUser.uid);
            const statsSnap = await getDoc(statsRef);
            const isGrandColibri = statsSnap.exists() && statsSnap.data()?.role === 'grand_colibri';

            // Check if user is Admin
            const adminRef = doc(db, 'admins', auth.currentUser.uid);
            const adminSnap = await getDoc(adminRef);
            const isAdmin = adminSnap.exists();

            if (isGrandColibri || isAdmin) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        };
        checkRole();
    }, []);

    if (isAuthorized === null) return <div className="pt-32 p-6">Chargement...</div>;
    if (!isAuthorized) return (
        <div className="pt-32 p-6 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Accès restreint</h2>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                Cette section est réservée aux Grands Colibris. 
                Pour accéder à ce niveau d'expertise et de formation, rejoignez notre programme Premium.
            </p>
            <Link 
                to="/offres-directes?scope=professional" 
                className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-indigo-700 transition-all shadow-xl hover:scale-105"
            >
                Découvrir les offres Premium
            </Link>
        </div>
    );
    
    return (
        <div className="min-h-screen bg-neutral-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl font-black text-slate-950 mb-12">
                    Parcours : Formation des <span className="text-indigo-600">Grands Colibris</span>
                </h1>
                
                <div className="grid gap-8">
                    {/* Module 1 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6">
                        <div className="p-4 bg-indigo-50 rounded-2xl h-fit">
                            <BookOpen className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">1. Mission & Philosophie</h2>
                            <p className="text-slate-600 mb-4">Comprendre le rôle du Grand Colibri, la mission de Cantic Think IA et comment incarner le manifeste.</p>
                        </div>
                    </div>

                    {/* Module 2 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6">
                        <div className="p-4 bg-emerald-50 rounded-2xl h-fit">
                            <Users className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">2. Community Management</h2>
                            <p className="text-slate-600 mb-4">Animer le Forum, encourager le partage des gouttes, modérer et accompagner les nouveaux talents.</p>
                        </div>
                    </div>

                    {/* Module 3 */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex gap-6">
                        <div className="p-4 bg-violet-50 rounded-2xl h-fit">
                            <Brain className="w-8 h-8 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">3. Expertise IA & Mentoring</h2>
                            <p className="text-slate-600 mb-4">Maîtriser les outils avancés, détecter les talents et offrir un mentorat technique.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormationGrandColibri;
