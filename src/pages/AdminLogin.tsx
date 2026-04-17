import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Fingerprint, Loader2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import Logo from '../components/Logo';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authentification réelle via Firebase Auth
      // Cela permet à Firestore de reconnaître l'utilisateur (request.auth != null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Vérification des privilèges dans la collection "admins"
      const q = query(collection(db, "admins"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.status === 'Suspendu') {
          alert("ACCÈS RÉVOCÉ : Votre compte a été suspendu par la direction.");
          await auth.signOut();
        } else {
          localStorage.setItem('cantic_admin_session', 'active');
          localStorage.setItem('cantic_admin_token', 'true');
          localStorage.setItem('cantic_admin_role', userData.role);
          localStorage.setItem('cantic_admin_name', userData.name);
          navigate('/admin');
        }
      } else {
        // Cas spécial pour le fondateur si non présent dans la collection mais authentifié
        if ((email === 'teletechnologyci@gmail.com' || email === 'ourega.goble@CANTIC-THINK-IA.work') && user.emailVerified) {
          localStorage.setItem('cantic_admin_session', 'active');
          localStorage.setItem('cantic_admin_token', 'true');
          localStorage.setItem('cantic_admin_role', 'Super Admin');
          localStorage.setItem('cantic_admin_name', 'Super Admin');
          navigate('/admin');
        } else if ((email === 'teletechnologyci@gmail.com' || email === 'ourega.goble@CANTIC-THINK-IA.work') && !user.emailVerified) {
          alert("ACCÈS RESTREINT : Votre email doit être vérifié pour accéder à la console de gouvernance.");
          await auth.signOut();
        } else {
          alert("ACCÈS REFUSÉ : Vous êtes authentifié mais non reconnu comme administrateur.");
          await auth.signOut();
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/operation-not-allowed') {
        const projectId = auth.app.options.projectId;
        alert(`ERREUR CRITIQUE : L'authentification par email/mot de passe n'est pas reconnue comme activée pour le projet "${projectId}". 

Vérifiez que vous êtes bien sur le bon projet dans la console Firebase (ID: ${projectId}). Si l'ID dans votre console est différent (ex: sans le suffixe numérique), contactez le support.`);
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert("ÉCHEC D'AUTHENTIFICATION : Identifiants incorrects ou compte non créé dans la console Firebase.");
      } else {
        alert("Erreur de connexion aux serveurs de sécurité : " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo variant="light" className="justify-center mb-8" />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            ENVIRONNEMENT SÉCURISÉ
          </div>
          <h2 className="text-3xl font-serif text-white tracking-tight">Console de <span className="italic text-emerald-400">Gouvernance</span></h2>
        </div>

        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Identifiant Autorisé</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  placeholder="nom@CANTIC-THINK-IA.work"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-700" 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Clé d'accès tantine</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-slate-700" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-xl disabled:opacity-50 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AUTHENTIFICATION...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">Ouvrir la session</span> 
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
