import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Clock } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchActivities = async () => {
            const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(5));
            const snapshot = await getDocs(q);
            setActivities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchActivities();
    }, []);

    return (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock className="text-indigo-400" /> Flux d'Activité
            </h2>
            <div className="space-y-4">
                {activities.map(act => (
                    <div key={act.id} className="p-4 bg-slate-800 rounded-lg text-sm">
                        <p className="font-bold text-indigo-300">{act.type}</p>
                        <p className="text-slate-400">{act.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
