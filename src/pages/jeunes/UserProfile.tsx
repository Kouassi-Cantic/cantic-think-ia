import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Victory, ProjectMilestone, ProjectLaunch } from '../types';

const UserProfile: React.FC = () => {
    const [stats, setStats] = useState<{ totalPoints: number; badges: string[] } | null>(null);
    const [victories, setVictories] = useState<Victory[]>([]);
    const [projects, setProjects] = useState<{ milestones: ProjectMilestone[]; launch: ProjectLaunch } | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) return;
            const uid = auth.currentUser.uid;

            // Fetch Stats
            const statsSnap = await getDoc(doc(db, 'user_stats', uid));
            if (statsSnap.exists()) setStats(statsSnap.data() as any);

            // Fetch Projects
            const projSnap = await getDoc(doc(db, 'user_projects', uid));
            if (projSnap.exists()) setProjects(projSnap.data() as any);
            
            // Note: Victories would require a query filtering by userId.
        };
        fetchUserData();
    }, []);

    return (
        <div className="p-8 text-white max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-8">Mon Profil</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">Progression</h2>
                    <p>Points totaux : {stats?.totalPoints || 0}</p>
                    <div className="mt-4">
                        <h3 className="font-bold">Badges :</h3>
                        {stats?.badges.map((b, i) => <span key={i} className="bg-indigo-900 px-2 py-1 rounded mr-2">{b}</span>)}
                    </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">Mes Projets</h2>
                    {projects ? (
                        <div>
                            <p>Étapes : {projects.milestones?.length || 0}</p>
                            <p>Statut MVP : {projects.launch ? 'Planifié' : 'Non planifié'}</p>
                        </div>
                    ) : <p>Aucun projet en cours.</p>}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
