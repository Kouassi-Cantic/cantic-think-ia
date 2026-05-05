import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Victory, ProjectMilestone, ProjectLaunch } from '../../types';
import { User, Award, Rocket, Clock, Trophy, Users } from 'lucide-react';
import { ActivityFeed } from '../../components/ActivityFeed';
import { Leaderboard } from '../../components/Leaderboard';
import { FriendsList } from '../../components/FriendsList';

const UserProfile: React.FC = () => {
    const [user, setUser] = useState(auth.currentUser);
    const [stats, setStats] = useState<{ totalPoints: number; badges: string[], bio?: string, title?: string } | null>(null);
    const [projects, setProjects] = useState<{ milestones: ProjectMilestone[]; launch: ProjectLaunch } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            if (u) {
                const fetchUserData = async () => {
                    const uid = u.uid;
                    // Fetch Stats
                    const statsSnap = await getDoc(doc(db, 'user_stats', uid));
                    if (statsSnap.exists()) {
                        const data = statsSnap.data() as any;
                        setStats(data);
                        setNewBio(data.bio || '');
                        setNewTitle(data.title || '');
                    }

                    // Fetch Projects
                    const projSnap = await getDoc(doc(db, 'user_projects', uid));
                    if (projSnap.exists()) setProjects(projSnap.data() as any);
                };
                fetchUserData();
            }
        });
        return unsubscribe;
    }, []);

    const saveProfile = async () => {
        if (!user) return;
        await updateDoc(doc(db, 'user_stats', user.uid), { bio: newBio, title: newTitle });
        setStats(prev => prev ? {...prev, bio: newBio, title: newTitle} : null);
        setIsEditing(false);
    };

    return (
        <div className="p-8 text-white max-w-6xl mx-auto space-y-8">
            {/* Header / Profile Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-8 rounded-3xl flex items-center gap-6 shadow-2xl relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-4 border-indigo-400 overflow-hidden">
                    {user?.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                        <User size={48} className="text-slate-400" />
                    )}
                </div>
                <div>
                    {!isEditing ? (
                        <>
                            <h1 className="text-3xl font-black">{user?.displayName || 'Jeune Talent'}</h1>
                            <p className="text-indigo-200">{stats?.title || 'Membre actif des Colibris'}</p>
                            <p className="mt-2 text-sm text-slate-300">{stats?.bio || 'Ajoute une petite bio...'}</p>
                            <button onClick={() => setIsEditing(true)} className="mt-4 text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20">Modifier</button>
                        </>
                    ) : (
                        <div className="space-y-2">
                           <input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="text-xs bg-slate-800 p-1 w-full rounded" placeholder="Titre" />
                           <textarea value={newBio} onChange={e => setNewBio(e.target.value)} className="text-xs bg-slate-800 p-1 w-full rounded" placeholder="Bio" />
                           <button onClick={saveProfile} className="text-xs bg-indigo-600 px-3 py-1 rounded">Sauvegarder</button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                {/* Progression */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="text-yellow-400" />
                        <h2 className="text-2xl font-bold">Progression & Badges</h2>
                    </div>
                    <div className="text-center p-6 bg-slate-800 rounded-2xl mb-6">
                        <p className="text-sm text-slate-400 uppercase tracking-widest">Score Total</p>
                        <p className="text-5xl font-black text-indigo-400">{stats?.totalPoints || 0}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {stats?.badges?.length 
                            ? stats.badges.map((b, i) => <span key={i} className="bg-indigo-600 px-4 py-2 rounded-full text-sm font-semibold">{b}</span>)
                            : <p className="text-slate-500 italic">Aucun badge pour l'instant...</p>
                        }
                    </div>
                </div>

                {/* Projects */}
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Rocket className="text-emerald-400" />
                        <h2 className="text-2xl font-bold">Labo Projets</h2>
                    </div>
                    {projects ? (
                        <div className="space-y-4">
                            <div className="flex justify-between p-4 bg-slate-800 rounded-lg">
                                <span className="text-slate-400">Jalons atteints :</span>
                                <span className="font-bold">{projects.milestones?.length || 0}</span>
                            </div>
                            <div className="flex justify-between p-4 bg-slate-800 rounded-lg">
                                <span className="text-slate-400">État MVP :</span>
                                <span className="font-bold text-emerald-400">{projects.launch ? 'En lancement 🚀' : 'En idéation'}</span>
                            </div>
                        </div>
                    ) : <p className="text-slate-500 italic">Aucun projet actif dans le labo...</p>}
                </div>
                <ActivityFeed />
                <Leaderboard />
                <FriendsList />
            </div>
        </div>
    );
};


export default UserProfile;
