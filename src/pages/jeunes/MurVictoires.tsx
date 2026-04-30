import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { Victory } from '../../types';

const MurVictoires: React.FC = () => {
    const [victories, setVictories] = useState<Victory[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'IA' | 'Technique' | 'Autre'>('IA');

    useEffect(() => {
        const q = query(collection(db, 'victories'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            setVictories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Victory)));
        });
        return unsub;
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return alert('Connectez-vous pour partager.');
        
        await addDoc(collection(db, 'victories'), {
            userId: auth.currentUser.uid,
            userName: auth.currentUser.displayName || 'Anonyme',
            title,
            description,
            category,
            createdAt: new Date().toISOString()
        });
        setTitle('');
        setDescription('');
    };

    return (
        <div className="p-8 text-white max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Mur des victoires</h1>
            <p className="mb-8">Partage tes astuces IA qui ont changé la donne...</p>
            
            <div className="grid md:grid-cols-2 gap-12">
                <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-xl">
                    <input type="text" placeholder="Titre" value={title} onChange={e => setTitle(e.target.value)} className="w-full mb-4 p-2 bg-slate-800 rounded" required />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full mb-4 p-2 bg-slate-800 rounded h-32" required />
                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full mb-4 p-2 bg-slate-800 rounded">
                        <option value="IA">IA</option>
                        <option value="Technique">Technique</option>
                        <option value="Autre">Autre</option>
                    </select>
                    <button type="submit" className="bg-indigo-600 px-6 py-2 rounded w-full">Partager ma victoire</button>
                </form>
                <div className="bg-slate-800 rounded-xl overflow-hidden">
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/cantic-think-ia-491512.firebasestorage.app/o/Victoire.png?alt=media&token=ae2b14a6-7286-48a8-8851-f286283140b8" 
                      alt="Victoire" 
                      className="w-full h-full object-cover" 
                    />
                </div>
            </div>

            <div className="grid gap-6 mt-12">
                {victories.map(v => (
                    <div key={v.id} className="bg-slate-900 p-6 rounded-xl border border-slate-700">
                        <h2 className="text-xl font-bold">{v.title} <span className="text-xs bg-indigo-900 px-2 py-1 rounded">{v.category}</span></h2>
                        <p className="text-slate-400 mt-2">{v.description}</p>
                        <p className="text-sm text-slate-500 mt-4 italic">Par {v.userName}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MurVictoires;
