import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Users, UserPlus, UserMinus } from 'lucide-react';

export const FriendsList: React.FC = () => {
    const [friends, setFriends] = useState<any[]>([]);
    
    useEffect(() => {
        if (!auth.currentUser) return;
        const q = query(collection(db, 'friends'), where('userId', '==', auth.currentUser.uid));
        return onSnapshot(q, (snapshot) => {
            setFriends(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, []);

    return (
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="text-pink-400" /> Mon Réseau
            </h2>
            <div className="space-y-4">
                {friends.length === 0 ? (
                    <p className="text-slate-500 italic">Pas encore d'amis dans le club...</p>
                ) : (
                    friends.map(friend => (
                        <div key={friend.id} className="flex justify-between items-center p-4 bg-slate-800 rounded-lg text-sm">
                            <span>Utilisateur {friend.friendId.substring(0, 5)}</span>
                            <button className="text-rose-400"><UserMinus size={16}/></button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
