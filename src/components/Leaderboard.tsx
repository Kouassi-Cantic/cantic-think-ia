import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy } from 'lucide-react';

export const Leaderboard: React.FC = () => {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaders = async () => {
            const q = query(collection(db, 'user_stats'), orderBy('totalPoints', 'desc'), limit(5));
            const snapshot = await getDocs(q);
            setLeaders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchLeaders();
    }, []);

    return (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Trophy className="text-yellow-400" /> Leaderboard
            </h2>
            <div className="space-y-4">
                {leaders.map((user, i) => (
                    <div key={user.id} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                        <span className="font-bold">{i + 1}. Utilisateur {user.userId ? user.userId.substring(0, 5) : 'Anonyme'}</span>
                        <span className="text-emerald-400 font-bold">{user.totalPoints} pts</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
