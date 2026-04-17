import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, User, BookOpen, Download, 
  Clock, CheckCircle2, AlertCircle, Loader2, 
  ShieldCheck, ArrowRight, ExternalLink, Mail, Phone,
  FileText, LayoutDashboard, Settings, HelpCircle,
  MessageSquare, History, Zap, Sparkles, Bot, Info, Copy, Hash,
  Gift, Image, Mic, Headphones, Video, Briefcase, Building2,
  Globe, Linkedin, Save, Calendar, GraduationCap, Newspaper,
  Rocket, Facebook, MessageCircle
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, setDoc, updateDoc, limit } from "firebase/firestore";
import { Transaction, DigitalResource, ClientProfile, BlogPost, TrainingCourse, QuoteRequest } from '../types';
import Logo from '../components/Logo';

const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const clientEmail = localStorage.getItem('cantic_client_email');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [trainings, setTrainings] = useState<TrainingCourse[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'history' | 'profile' | 'veille' | 'quotes' | 'support'>('resources');
  const [firstName, setFirstName] = useState<string | null>(null);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    industry: '',
    bio: '',
    phone: '',
    whatsapp: '',
    facebookPerso: '',
    facebookPage: '',
    linkedin: ''
  });

  useEffect(() => {
    if (!clientEmail) {
      navigate('/client/login');
      return;
    }

    // 0. Charger le profil du client
    const loadProfile = async () => {
      const profileId = clientEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const profileRef = doc(db, "clients", profileId);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as ClientProfile;
        setProfile(profileData);
        setProfileForm({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          jobTitle: profileData.jobTitle || '',
          company: profileData.company || '',
          industry: profileData.industry || '',
          bio: profileData.bio || '',
          phone: profileData.phone || '',
          whatsapp: profileData.whatsapp || '',
          facebookPerso: profileData.facebookPerso || '',
          facebookPage: profileData.facebookPage || '',
          linkedin: profileData.linkedin || ''
        });
        if (profileData.firstName) setFirstName(profileData.firstName);
      } else {
        // Créer un profil par défaut si inexistant
        const newProfile: ClientProfile = {
          id: profileId,
          email: clientEmail,
          firstName: '',
          lastName: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(profileRef, newProfile);
        setProfile(newProfile);
      }
    };

    loadProfile();

    // 1. Charger les transactions du client
    const q = query(
      collection(db, "transactions"), 
      where("userEmail", "==", clientEmail)
    );

    let transactionsLoaded = false;
    let resourcesLoaded = false;

    const unsubTransactions = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
      
      // Tri en mémoire par date décroissante
      const sortedTrans = transData.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setTransactions(sortedTrans);
      
      // Extraire le prénom de la transaction la plus récente
      if (sortedTrans.length > 0) {
        const latestWithFirstName = sortedTrans.find(t => t.firstName);
        if (latestWithFirstName) {
          setFirstName(latestWithFirstName.firstName || null);
        }
      }
      
      transactionsLoaded = true;
      setLoading(prev => resourcesLoaded ? false : prev);
    }, (error) => {
      console.error("Erreur lors du chargement des transactions:", error);
      transactionsLoaded = true; 
      setLoading(prev => resourcesLoaded ? false : prev);
    });

    // 2. Charger toutes les ressources pour faire le lien
    const unsubResources = onSnapshot(collection(db, "resources"), (resSnapshot) => {
      const resData = resSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DigitalResource[];
      setResources(resData);
      resourcesLoaded = true;
      setLoading(prev => transactionsLoaded ? false : prev);
    }, (error) => {
      console.error("Erreur lors du chargement des ressources:", error);
      resourcesLoaded = true;
      setLoading(prev => transactionsLoaded ? false : prev);
    });

    // 3. Charger les articles de blog (Veille)
    const unsubBlog = onSnapshot(query(collection(db, "blog"), orderBy("createdAt", "desc"), limit(6)), (snapshot) => {
      setBlogPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[]);
    });

    // 4. Charger les formations à venir
    const unsubTrainings = onSnapshot(query(collection(db, "trainings"), orderBy("createdAt", "desc"), limit(3)), (snapshot) => {
      setTrainings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainingCourse[]);
    });

    // 5. Charger les devis (Offres Directes)
    const unsubQuotes = onSnapshot(query(
      collection(db, "quotes"),
      where("userEmail", "==", clientEmail),
      orderBy("createdAt", "desc")
    ), (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuoteRequest[]);
    });

    // Sécurité : Timeout pour débloquer le chargement au bout de 10 secondes
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      unsubTransactions();
      unsubResources();
      unsubBlog();
      unsubTrainings();
      unsubQuotes();
      clearTimeout(timeout);
    };
  }, [clientEmail, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);

    try {
      const profileRef = doc(db, "clients", profile.id);
      await updateDoc(profileRef, {
        ...profileForm,
        updatedAt: new Date().toISOString()
      });
      setProfile({ ...profile, ...profileForm });
      if (profileForm.firstName) setFirstName(profileForm.firstName);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cantic_client_email');
    navigate('/boutique');
  };

  const getResourceById = (id: string) => resources.find(r => r.id === id);

  // Ressources débloquées (transactions complétées)
  const unlockedResources = transactions
    .filter(t => t.status === 'completed')
    .map(t => ({
      ...t,
      details: getResourceById(t.resourceId)
    }))
    .filter(item => item.details);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Initialisation de votre espace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col lg:flex-row animate-fade-in">
      {/* Sidebar Mobile / Desktop */}
      <aside className="lg:w-80 bg-slate-900 text-white p-8 lg:h-screen lg:sticky lg:top-0 flex flex-col justify-between z-50">
        <div>
          <div className="flex items-center gap-4 mb-12">
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo variant="light" className="scale-75 -ml-4" />
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Espace Membre</span>
          </div>

          <div className="mb-12 p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Session Active</p>
            <p className="text-sm font-bold text-white truncate">{clientEmail}</p>
          </div>

          <nav className="space-y-3">
            {[
              { id: 'resources', icon: BookOpen, label: 'Mes Ressources' },
              { id: 'history', icon: History, label: 'Historique Flux' },
              { id: 'quotes', icon: Rocket, label: 'Mes Devis' },
              { id: 'profile', icon: User, label: 'Mon Profil Pro' },
              { id: 'veille', icon: Newspaper, label: 'Veille Stratégique' },
              { id: 'support', icon: HelpCircle, label: 'Assistance' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${
                  activeTab === tab.id 
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button 
          onClick={handleLogout}
          className="mt-12 w-full py-4 bg-white/5 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Quitter l'espace
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 lg:p-20">
        {/* Message de Bienvenue */}
        <div className="mb-12 p-8 md:p-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[3rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Espace Privilège</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black mb-4 tracking-tight">
              Ravi de vous revoir, <span className="italic text-emerald-200">{firstName || 'Cher Client'}</span> !
            </h2>
            <p className="text-emerald-100 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
              Nous sommes honorés de vous accompagner dans votre montée en puissance stratégique. 
              <br className="hidden md:block" />
              <span className="mt-2 block opacity-90">
                <Clock className="w-4 h-4 inline-block mr-2" />
                Rappel : Vos nouvelles acquisitions sont traitées manuellement et apparaissent ici dans un <strong className="text-white">délai maximum de 1 heure</strong>.
              </span>
            </p>
          </div>
        </div>

        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
            <h1 className="text-4xl lg:text-6xl font-serif font-black text-slate-900 tracking-tighter uppercase">
              {activeTab === 'resources' ? 'MES ACTIFS' : 
               activeTab === 'history' ? 'HISTORIQUE' : 
               activeTab === 'quotes' ? 'MES DEVIS' :
               activeTab === 'profile' ? 'PROFIL PROFESSIONNEL' :
               activeTab === 'veille' ? 'VEILLE STRATÉGIQUE' :
               'ASSISTANCE'}
            </h1>
          </div>
          <p className="text-slate-400 font-light text-lg">
            {activeTab === 'resources' && 'Gérez vos acquisitions et accédez à vos documents stratégiques.'}
            {activeTab === 'history' && 'Consultez l\'historique de vos transactions et flux financiers.'}
            {activeTab === 'quotes' && 'Suivez vos demandes de devis et offres directes personnalisées.'}
            {activeTab === 'profile' && 'Enrichissez votre fiche client pour un accompagnement personnalisé.'}
            {activeTab === 'veille' && 'Accédez aux dernières analyses et insights de CANTIC THINK IA.'}
            {activeTab === 'support' && 'Besoin d\'aide ? Nos experts sont à votre disposition.'}
          </p>
        </header>

        {activeTab === 'resources' && (
          <div className="animate-fade-in">
            {unlockedResources.length === 0 ? (
              <div className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <BookOpen className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Bibliothèque Vide</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-10 font-light">Vous n'avez pas encore de ressources débloquées ou vos paiements sont en cours de validation.</p>
                <button onClick={() => navigate('/boutique')} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                  Explorer la boutique
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {unlockedResources.map((item) => (
                  <div key={item.id} className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-4 py-1.5 rounded-lg border border-emerald-100">Acquis le {new Date(item.createdAt).toLocaleDateString()}</span>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors leading-tight">{item.details?.title}</h3>
                    <p className="text-slate-500 font-light text-sm line-clamp-3 mb-10 leading-relaxed italic">« {item.details?.description} »</p>
                    
                    {/* Bonus Section */}
                    {(item.details?.bonusPdfUrl || item.details?.bonusImageUrl || item.details?.bonusVideoUrl || item.details?.bonusAudioUrl) && (
                      <div className="mb-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                          <Gift className="w-4 h-4" /> Ressources Bonus Débloquées
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {item.details?.bonusPdfUrl && (
                            <a href={item.details.bonusPdfUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group/bonus shadow-sm">
                              <FileText className="w-6 h-6 text-slate-400 group-hover/bonus:text-emerald-500 mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Résumé PDF</span>
                            </a>
                          )}
                          {item.details?.bonusImageUrl && (
                            <a href={item.details.bonusImageUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group/bonus shadow-sm">
                              <Image className="w-6 h-6 text-slate-400 group-hover/bonus:text-emerald-500 mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Résumé Image</span>
                            </a>
                          )}
                          {item.details?.bonusVideoUrl && (
                            <a href={item.details.bonusVideoUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group/bonus shadow-sm">
                              <Video className="w-6 h-6 text-slate-400 group-hover/bonus:text-emerald-500 mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Vidéo</span>
                            </a>
                          )}
                          {item.details?.bonusAudioUrl && (
                            <a href={item.details.bonusAudioUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-all group/bonus shadow-sm">
                              <Headphones className="w-6 h-6 text-slate-400 group-hover/bonus:text-emerald-500 mb-2" />
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Audio</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-8 border-t border-slate-50 flex flex-col gap-4">
                      <a 
                        href={item.details?.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                      >
                        <Download className="w-4 h-4" /> Télécharger (PDF)
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Ressource</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Référence</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                    <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-10 text-sm font-bold text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="px-10 py-10 text-sm font-bold text-slate-900">{t.resourceTitle}</td>
                      <td className="px-10 py-10">
                         <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg w-fit">
                            <Hash className="w-3 h-3" /> {t.referenceNumber || 'N/A'}
                         </div>
                      </td>
                      <td className="px-10 py-10 text-sm font-black text-slate-900">{t.amount}</td>
                      <td className="px-10 py-10">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                          t.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                          t.status === 'processing' ? 'bg-emerald-100 text-emerald-600' :
                          t.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {t.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : t.status === 'pending' ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {t.status === 'completed' ? 'Validé' : 
                           t.status === 'processing' ? 'En cours' :
                           t.status === 'pending' ? 'En attente' : 'Échoué'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {transactions.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-serif italic">Aucun flux financier enregistré.</div>
            )}
          </div>
        )}

        {activeTab === 'quotes' && (
          <div className="animate-fade-in">
            {quotes.length === 0 ? (
              <div className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-sm text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <Rocket className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Aucun Devis</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-10 font-light">Vous n'avez pas encore formulé de demande d'offre directe.</p>
                <button onClick={() => navigate('/offres-directes')} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                  Créer une offre directe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {quotes.map((quote) => (
                  <div key={quote.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${
                            quote.status === 'sent' ? 'bg-emerald-100 text-emerald-600' :
                            quote.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}>
                            {quote.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {quote.status === 'pending' ? 'En attente' : 
                             quote.status === 'sent' ? 'Devis Envoyé' : 'Traitement'}
                          </span>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Demandé le {new Date(quote.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Offre Directe #{quote.id?.slice(-6).toUpperCase()}</h3>
                        <p className="text-slate-500 font-light text-sm">Budget total estimé : <strong className="text-slate-900">{quote.totalBudget} FCFA</strong></p>
                      </div>
                      
                      {quote.status === 'sent' && quote.quoteUrl && (
                        <a 
                          href={quote.quoteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Download className="w-4 h-4" /> Télécharger mon devis
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {quote.services.map((service, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{service.serviceName}</span>
                          <p className="text-sm font-bold text-slate-900">{service.budget} FCFA</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-fade-in max-w-4xl">
            <form onSubmit={handleUpdateProfile} className="bg-white p-10 md:p-16 rounded-[4rem] border border-slate-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Prénom</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={profileForm.firstName}
                      onChange={e => setProfileForm({...profileForm, firstName: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Prénom"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={profileForm.lastName}
                      onChange={e => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Nom"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Poste / Fonction</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={profileForm.jobTitle}
                      onChange={e => setProfileForm({...profileForm, jobTitle: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Ex: Directeur Stratégie"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Institution / Entreprise</label>
                  <div className="relative group">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={profileForm.company}
                      onChange={e => setProfileForm({...profileForm, company: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Ex: Ministère de l'Économie"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Secteur d'activité</label>
                  <div className="relative group">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      value={profileForm.industry}
                      onChange={e => setProfileForm({...profileForm, industry: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Ex: Administration Publique"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Téléphone</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={profileForm.phone}
                      onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="+225 ..."
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">WhatsApp (Numéro)</label>
                  <div className="relative group">
                    <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="tel" 
                      value={profileForm.whatsapp}
                      onChange={e => setProfileForm({...profileForm, whatsapp: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                      placeholder="Ex: +225 05..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Profil Facebook Personnel</label>
                  <div className="relative group">
                    <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                    <input 
                      type="url" 
                      value={profileForm.facebookPerso}
                      onChange={e => setProfileForm({...profileForm, facebookPerso: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/5 focus:border-emerald-600 transition-all text-sm font-bold"
                      placeholder="https://facebook.com/votre.profil"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Page Facebook Professionnelle</label>
                  <div className="relative group">
                    <Facebook className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-700 transition-colors" />
                    <input 
                      type="url" 
                      value={profileForm.facebookPage}
                      onChange={e => setProfileForm({...profileForm, facebookPage: e.target.value})}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-700/5 focus:border-emerald-700 transition-all text-sm font-bold"
                      placeholder="https://facebook.com/votre.page"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Lien LinkedIn</label>
                <div className="relative group">
                  <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    type="url" 
                    value={profileForm.linkedin}
                    onChange={e => setProfileForm({...profileForm, linkedin: e.target.value})}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-bold"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Bio / Objectifs Stratégiques</label>
                <textarea 
                  value={profileForm.bio}
                  onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                  rows={4}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all text-sm font-medium leading-relaxed"
                  placeholder="Décrivez brièvement vos enjeux en matière d'IA..."
                />
              </div>

              <button 
                type="submit" 
                disabled={savingProfile}
                className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Enregistrer mon profil
              </button>
            </form>
          </div>
        )}

        {activeTab === 'veille' && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute top-4 left-4">
                      <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-8 flex flex-grow flex-col">
                    <h3 className="text-xl font-serif font-bold text-slate-900 mb-4 line-clamp-2 leading-tight">{post.title}</h3>
                    <p className="text-slate-500 text-sm font-light line-clamp-3 mb-8 flex-grow">{post.excerpt}</p>
                    <button 
                      onClick={() => navigate(`/blog`)} // Idéalement vers le post spécifique
                      className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all"
                    >
                      Lire l'analyse <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {blogPosts.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-serif italic">Aucune analyse disponible pour le moment.</div>
            )}
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
             <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Assistance Technique</h3>
                <p className="text-slate-500 font-light mb-10 leading-relaxed">Un problème avec le téléchargement ou l'accès à une ressource ? Nos experts vous répondent sous 1h.</p>
                <div className="space-y-4">
                  <a href="mailto:commercial@canticthinkia.work" className="flex items-center gap-3 text-emerald-600 font-black text-[11px] uppercase tracking-widest hover:text-emerald-800 transition-colors">
                    <Mail className="w-4 h-4" /> commercial@canticthinkia.work
                  </a>
                  <a href="https://wa.me/2250544869313" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-emerald-600 font-black text-[11px] uppercase tracking-widest hover:text-emerald-800 transition-colors">
                    <Phone className="w-4 h-4" /> +225 0544869313 (WhatsApp)
                  </a>
                  <div className="flex items-center gap-3 text-slate-600 font-black text-[11px] uppercase tracking-widest">
                    <Phone className="w-4 h-4" /> +225 25 22 00 12 39 (Tel)
                  </div>
                </div>
             </div>

             <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8">
                  <Zap className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-4">Besoin d'un Consultant ?</h3>
                <p className="text-slate-400 font-light mb-10 leading-relaxed">Passez de la théorie à la pratique avec un accompagnement sur-mesure pour votre institution.</p>
                <button onClick={() => navigate('/contact')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 hover:text-white transition-all">
                  Prendre rendez-vous
                </button>
             </div>
          </div>
        )}

        {/* Section Formations à venir (Widget en bas) */}
        {activeTab !== 'support' && activeTab !== 'profile' && (
          <div className="mt-24 pt-16 border-t border-slate-100">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight mb-2">PROCHAINES FORMATIONS</h2>
                <p className="text-slate-400 text-sm font-light">Inscrivez-vous aux prochaines sessions stratégiques.</p>
              </div>
              <button onClick={() => navigate('/formations')} className="hidden md:flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                Voir tout le catalogue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trainings.map((training) => (
                <div key={training.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{training.level}</span>
                  </div>
                  <h4 className="text-lg font-serif font-bold text-slate-900 mb-4 leading-tight">{training.title_professional}</h4>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8">
                    <Calendar className="w-3.5 h-3.5" /> {training.trainingDate || 'À venir'}
                  </div>
                  <button onClick={() => navigate('/formations')} className="w-full py-4 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all">
                    S'inscrire
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
