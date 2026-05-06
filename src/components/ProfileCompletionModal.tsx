import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Props {
  onComplete: () => void;
}

export const ProfileCompletionModal: React.FC<Props> = ({ onComplete }) => {
  const [interest, setInterest] = useState('');
  const [level, setLevel] = useState('Collège');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    await setDoc(doc(db, 'user_profiles', auth.currentUser.uid), {
      interest,
      level,
      completedAt: new Date().toISOString()
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade-in">
        <h2 className="text-2xl font-bold mb-4">Complète ton profil</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Ton domaine d'intérêt (ex: IA, Design, Coding)" 
            className="w-full border rounded-xl p-3" 
            onChange={e => setInterest(e.target.value)} 
            required 
          />
          <select 
            className="w-full border rounded-xl p-3" 
            onChange={e => setLevel(e.target.value)}
          >
            <option>Collège</option>
            <option>Lycée</option>
            <option>Supérieur</option>
          </select>
          <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700">
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};
