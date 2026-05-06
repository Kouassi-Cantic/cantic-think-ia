import React, { useState } from 'react';
import { X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
      localStorage.setItem('user_type', 'youth');
      onClose();
      window.location.reload(); // Refresh to trigger layout switch
    } catch (err) {
      alert("Erreur : " + err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      localStorage.setItem('user_type', 'youth');
      onClose();
      window.location.reload();
    } catch (err) {
      alert("Erreur lors de la connexion avec Google : " + err);
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

        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Ou continuez avec</span>
            </div>
          </div>
          <button onClick={handleGoogleSignIn} className="mt-4 w-full flex items-center justify-center gap-2 border border-slate-300 rounded-xl py-3 font-bold hover:bg-slate-50">
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>
        </div>

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
