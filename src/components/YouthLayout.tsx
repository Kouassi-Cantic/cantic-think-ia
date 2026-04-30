import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { MessageSquare, Rocket, LogOut, Sparkles, HelpCircle } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const YouthLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        localStorage.removeItem('user_type');
        navigate('/');
        window.location.reload(); // Force rafraîchissement pour revenir au layout pro
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            <nav className="border-b border-indigo-900/50 bg-slate-900/50 backdrop-blur-md fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to="/jeunes" className="text-2xl font-black text-indigo-400 flex items-center gap-2">
                        <Sparkles /> CLUB JEUNES
                    </Link>
                    <div className="flex items-center gap-6 text-sm font-bold tracking-widest uppercase">
                        <Link to="/forum" className="hover:text-indigo-300 flex items-center gap-2"><MessageSquare size={16}/> Echanges</Link>
                        <Link to="/offres-directes?scope=youth" className="hover:text-indigo-300 flex items-center gap-2"><Rocket size={16}/> Offres</Link>
                        <Link to="/forum/new" className="hover:text-indigo-300 flex items-center gap-2"><HelpCircle size={16}/> Poser une question</Link>
                        <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 flex items-center gap-2"><LogOut size={16}/> Déconnexion</button>
                    </div>
                </div>
            </nav>
            <main className="flex-grow pt-24">
                <Outlet />
            </main>
        </div>
    );
};

export default YouthLayout;
