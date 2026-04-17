import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const YouthAuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      alert("Erreur : " + err);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
        <h2 className="text-2xl font-bold mb-1">Section Jeunes (13+)</h2>
        <p className="text-slate-500 mb-6 font-medium">L'IA pour booster ton futur</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full border rounded-xl p-3" onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Mot de passe" className="w-full border rounded-xl p-3" onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3 font-bold hover:bg-indigo-700">
            {isLogin ? "Se connecter" : "Créer mon profil"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          {isLogin ? "Nouveau ici ? " : "Déjà un profil ? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold hover:underline">
            {isLogin ? "Crée ton profil" : "Connecte-toi"}
          </button>
        </p>
      </div>
    </div>
  );
};
