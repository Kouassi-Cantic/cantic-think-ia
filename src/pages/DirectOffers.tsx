import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Rocket, CheckCircle2, ShieldCheck, 
  Globe, Mail, Share2, Layout, 
  Target, Package, MessageSquare, 
  ArrowRight, Calculator, AlertCircle,
  Sparkles, Zap, Info, UserPlus,
  GraduationCap, BookOpen
} from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { QuoteRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { 
    id: 'visibilite', 
    name: 'Visibilité', 
    description: 'Packs essentiels pour exister, être trouvé et inspirer confiance.',
    icon: Sparkles
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Boostez vos ventes et votre trafic avec des stratégies ciblées.',
    icon: Zap
  },
  {
    id: 'particuliers',
    name: 'Particuliers',
    description: 'Soignez votre image et lancez vos projets personnels.',
    icon: UserPlus
  },
  {
    id: 'eleves',
    name: 'Élèves',
    description: 'Préparez votre futur avec les meilleurs outils numériques.',
    icon: GraduationCap
  },
  {
    id: 'etudiants',
    name: 'Étudiants',
    description: 'Boostez votre profil pro et votre productivité académique.',
    icon: BookOpen
  }
];

const PACKS = [
  {
    id: 'starter-ci',
    categoryId: 'visibilite',
    name: 'Pack Starter (.ci)',
    tagline: "J'existe sur le web",
    description: "L'essentiel pour paraître sérieux dès le premier contact client en Côte d'Ivoire.",
    features: [
      'Nom de domaine .ci (1 an)',
      'Email professionnel (ex: contact@votreentreprise.ci)',
      'Fiche Google Business configurée et optimisée',
      'Lien de paiement mobile money intégré'
    ],
    price: 45000,
    icon: Globe,
    color: 'from-slate-50 to-slate-100',
    accent: 'bg-emerald-500'
  },
  {
    id: 'starter-com',
    categoryId: 'visibilite',
    name: 'Pack Starter (.com)',
    tagline: "J'existe sur le web",
    description: "L'essentiel pour paraître sérieux dès le premier contact client à l'international.",
    features: [
      'Nom de domaine .com (1 an)',
      'Email professionnel (ex: contact@votreentreprise.com)',
      'Fiche Google Business configurée et optimisée',
      'Support technique par WhatsApp'
    ],
    price: 35000,
    icon: Globe,
    color: 'from-slate-50 to-slate-100',
    accent: 'bg-slate-900'
  },
  {
    id: 'visibilite-full',
    categoryId: 'visibilite',
    name: 'Pack Visibilité',
    tagline: "On me trouve, on me contacte",
    description: "Pour l'entrepreneur qui veut être présent partout où son client peut le chercher.",
    features: [
      'Nom de domaine + Email pro',
      'Configuration 3 Réseaux Sociaux (FB, IG, LinkedIn)',
      'Fiche Google Business Premium',
      'Audit de présence numérique initial'
    ],
    price: 85000,
    icon: Share2,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600',
    popular: true
  },
  {
    id: 'vitrine',
    categoryId: 'visibilite',
    name: 'Pack Vitrine',
    tagline: "J'ai un vrai bureau sur internet",
    description: "La solution pour les indépendants qui veulent inspirer confiance immédiatement.",
    features: [
      'Site web vitrine (One-page premium)',
      'Email pro institutionnel',
      'Fiche Google Business + Réseaux Sociaux',
      'Optimisation SEO locale (Abidjan/Intérieur)'
    ],
    price: 250000,
    icon: Layout,
    color: 'from-slate-900 to-slate-800',
    accent: 'bg-white',
    dark: true
  },
  {
    id: 'croissance',
    categoryId: 'visibilite',
    name: 'Pack Croissance',
    tagline: "Je veux vendre plus",
    description: "Pour la TPE qui a déjà une base et veut passer à la vitesse supérieure.",
    features: [
      'Site web multi-pages optimisé conversion',
      'Stratégie commerciale et marketing digitale',
      'Gestion publicitaire initiale (Ads)',
      'Tableau de bord de suivi des performances'
    ],
    price: 450000,
    icon: Target,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600'
  },
  {
    id: 'tout-en-un',
    categoryId: 'visibilite',
    name: 'Pack Tout-en-Un',
    tagline: "Je pars de zéro, je veux tout bien faire",
    description: "Le package complet pour un lancement solide, structuré et ambitieux.",
    features: [
      'Écosystème complet (Domaine, Email, Site, Réseaux)',
      'Stratégie de marque et Identité visuelle',
      'Conseil stratégique mensuel (3 mois)',
      'Formation à la gestion autonome des outils'
    ],
    price: 650000,
    icon: Rocket,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600'
  },
  {
    id: 'seo-local',
    categoryId: 'performance',
    name: 'Pack SEO Local',
    tagline: "Dominez votre quartier",
    description: "Optimisez votre référencement pour apparaître en tête des recherches locales.",
    features: [
      'Optimisation Fiche Google Business Premium',
      'Référencement sur les annuaires locaux',
      '3 Articles de blog optimisés SEO local',
      'Rapport mensuel de visibilité'
    ],
    price: 120000,
    icon: Target,
    color: 'from-orange-50 to-orange-100/50',
    accent: 'bg-orange-500'
  },
  {
    id: 'ads-boost',
    categoryId: 'performance',
    name: 'Pack Publicité (Ads)',
    tagline: "Vendez tout de suite",
    description: "Lancez des campagnes publicitaires performantes sur Google et Facebook.",
    features: [
      'Gestion Google Ads et Facebook Ads',
      'Création de 5 visuels publicitaires',
      'Ciblage précis par zone géographique',
      'Suivi quotidien des conversions'
    ],
    price: 180000,
    icon: Zap,
    color: 'from-red-50 to-red-100/50',
    accent: 'bg-red-500'
  },
  // Particuliers
  {
    id: 'pack-image-perso',
    categoryId: 'particuliers',
    name: 'Pack Image Personnelle',
    tagline: "Je soigne mon e-réputation",
    description: "Pour être pris au sérieux dans vos démarches professionnelles et sociales.",
    features: [
      'Email professionnel (nom@prenom.me ou .com)',
      'Configuration Facebook Pro et LinkedIn',
      'Audit de votre e-réputation actuelle',
      'Guide de gestion d\'image en ligne'
    ],
    price: 25000,
    icon: UserPlus,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-500'
  },
  {
    id: 'pack-projet-perso',
    categoryId: 'particuliers',
    name: 'Pack Projet Personnel',
    tagline: "J'ai une idée, je la lance",
    description: "Testez votre activité sans encore créer une entreprise formelle.",
    features: [
      'Nom de domaine (.com ou .ci)',
      'Email professionnel institutionnel',
      'Fiche Google Business configurée',
      '2 Réseaux Sociaux + Landing page de lancement'
    ],
    price: 55000,
    icon: Rocket,
    color: 'from-slate-50 to-slate-100',
    accent: 'bg-slate-900'
  },
  // Élèves
  {
    id: 'pack-avenir',
    categoryId: 'eleves',
    name: 'Pack Avenir',
    tagline: "Je prépare mon futur",
    description: "Misez tôt sur les bons outils pour avoir une longueur d'avance.",
    features: [
      'Email pro (nom.prenom@...)',
      'LinkedIn étudiant configuré',
      'Initiation IA (ChatGPT, Gemini)',
      'Guide "Recherche Intelligente"'
    ],
    price: 15000,
    icon: GraduationCap,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600'
  },
  {
    id: 'pack-projet-scolaire',
    categoryId: 'eleves',
    name: 'Pack Projet Scolaire',
    tagline: "Mon exposé fait la différence",
    description: "Maîtrisez les outils de présentation et de recherche numérique.",
    features: [
      'Formation outils de présentation IA',
      'Initiation à la recherche en ligne',
      'Création de contenu numérique',
      'Support technique pour exposé'
    ],
    price: 10000,
    icon: Sparkles,
    color: 'from-amber-50 to-amber-100/50',
    accent: 'bg-amber-500'
  },
  // Étudiants
  {
    id: 'pack-etudiant-pro',
    categoryId: 'etudiants',
    name: 'Pack Étudiant Pro',
    tagline: "Je construis mon profil dès aujourd'hui",
    description: "Parce que les recruteurs vous googlisent avant l'entretien.",
    features: [
      'Email pro institutionnel',
      'LinkedIn optimisé Premium',
      'CV Numérique interactif',
      'Coaching Personal Branding'
    ],
    price: 20000,
    icon: BookOpen,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600'
  },
  {
    id: 'pack-freelance-etudiant',
    categoryId: 'etudiants',
    name: 'Pack Freelance Étudiant',
    tagline: "Je génère des revenus",
    description: "Proposez vos compétences de façon professionnelle.",
    features: [
      'Nom de domaine + Email pro',
      'Site Portfolio One-page premium',
      'Fiche Google Business + Paiement Mobile',
      'Conseil stratégie de services'
    ],
    price: 75000,
    icon: Zap,
    color: 'from-slate-900 to-slate-800',
    accent: 'bg-white',
    dark: true
  },
  {
    id: 'pack-ia-productivite',
    categoryId: 'etudiants',
    name: 'Pack IA et Productivité',
    tagline: "Je travaille 2x plus vite",
    description: "Un atout massif pour vos mémoires et projets universitaires.",
    features: [
      'Formation Gemini/ChatGPT avancée',
      'Outils de synthèse et recherche IA',
      'Organisation via Notion AI',
      'Méthodologie de projet universitaire'
    ],
    price: 30000,
    icon: Target,
    color: 'from-emerald-50 to-emerald-100/50',
    accent: 'bg-emerald-600'
  }
];

const SERVICES = [
  { 
    id: 'domaine', 
    name: 'Réservation de Nom de Domaine', 
    min: 15000, 
    max: 35000, 
    icon: Globe,
    description: 'Enregistrement de votre adresse web en .ci ou .com.'
  },
  { 
    id: 'email', 
    name: 'Création d’Email Professionnel', 
    min: 20000, 
    max: 45000, 
    icon: Mail,
    description: 'Mise en place d’un email @votreentreprise.ci connecté à Gmail.'
  },
  { 
    id: 'social', 
    name: 'Création de Comptes Réseaux Sociaux', 
    min: 25000, 
    max: 60000, 
    icon: Share2,
    description: 'Facebook, Instagram, LinkedIn, TikTok avec nom cohérent.'
  },
  { 
    id: 'web', 
    name: 'Création de Site Web', 
    min: 150000, 
    max: 500000, 
    icon: Layout,
    description: 'Site vitrine ou e-commerce responsive et optimisé SEO.'
  },
  { 
    id: 'pack-id', 
    name: 'Identité Numérique Complète', 
    min: 75000, 
    max: 120000, 
    icon: Package,
    description: 'Domaine + Email pro + Réseaux sociaux + Audit.'
  },
  { 
    id: 'strategie', 
    name: 'Stratégie Commerciale et Marketing', 
    min: 100000, 
    max: 1000000, 
    icon: Target,
    description: 'Analyse de marché, positionnement et plan d’action.'
  },
  { 
    id: 'conseil', 
    name: 'Accompagnement et Conseil Numérique', 
    min: 50000, 
    max: 250000, 
    icon: MessageSquare,
    description: 'Session stratégique individuelle pour guider votre posture digitale.'
  }
];

const DirectOffers: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const clientEmail = localStorage.getItem('cantic_client_email');
  
  const params = new URLSearchParams(location.search);
  const scope = params.get('scope'); // 'youth' or 'professional' (or all if undefined)
  
  const filteredCategories = CATEGORIES.filter(cat => {
    if (scope === 'youth') return cat.id === 'eleves' || cat.id === 'etudiants';
    if (scope === 'professional') return cat.id !== 'eleves' && cat.id !== 'etudiants';
    return true;
  });

  const [activeCategory, setActiveCategory] = useState(filteredCategories[0]?.id || 'visibilite');

  useEffect(() => {
    const category = params.get('category');
    if (category && CATEGORIES.some(cat => cat.id === category)) {
      setActiveCategory(category);
    } else if (filteredCategories.length > 0 && !filteredCategories.some(cat => cat.id === activeCategory)) {
        setActiveCategory(filteredCategories[0].id);
    }
  }, [location, scope]);
  
  // Need to update the rendering to use filteredCategories and filtered packs
  const filteredPacks = PACKS.filter(p => {
    const isYouth = p.categoryId === 'eleves' || p.categoryId === 'etudiants';
    if (scope === 'youth') return isYouth;
    if (scope === 'professional') return !isYouth;
    return true;
  });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleService = (id: string) => {
    setSelectedPack(null); // Reset pack if manual selection starts
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
      const newBudgets = { ...budgets };
      delete newBudgets[id];
      setBudgets(newBudgets);
    } else {
      setSelectedServices([...selectedServices, id]);
      const service = SERVICES.find(s => s.id === id);
      if (service) {
        setBudgets({ ...budgets, [id]: service.min });
      }
    }
  };

  const selectPack = (packId: string) => {
    const pack = PACKS.find(p => p.id === packId);
    if (!pack) return;

    setSelectedPack(packId);
    setSelectedServices([]); // Clear manual services
    setBudgets({ [packId]: pack.price });
  };

  const updateBudget = (id: string, value: number) => {
    setBudgets({ ...budgets, [id]: value });
  };

  const totalBudget = Object.values(budgets).reduce((acc, curr) => acc + curr, 0);

  const handleSubmit = async () => {
    if (!clientEmail) {
      setShowLoginModal(true);
      return;
    }

    if (selectedServices.length === 0 && !selectedPack) {
      alert("Veuillez sélectionner un pack ou des services.");
      return;
    }

    setIsSubmitting(true);
    try {
      let servicesToSubmit = [];
      
      if (selectedPack) {
        const pack = PACKS.find(p => p.id === selectedPack);
        servicesToSubmit = [{
          serviceId: pack?.id || '',
          serviceName: `Pack: ${pack?.name}`,
          budget: pack?.price || 0
        }];
      } else {
        servicesToSubmit = selectedServices.map(id => ({
          serviceId: id,
          serviceName: SERVICES.find(s => s.id === id)?.name || '',
          budget: budgets[id]
        }));
      }

      const quoteData: Omit<QuoteRequest, 'id'> = {
        userEmail: clientEmail,
        services: servicesToSubmit,
        totalBudget,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: selectedPack ? `Pack sélectionné: ${PACKS.find(p => p.id === selectedPack)?.name}` : 'Services à la carte'
      };

      await addDoc(collection(db, 'quotes'), quoteData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 3000);
    } catch (error) {
      console.error("Erreur lors de la demande de devis:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBudgetStatus = (id: string, budget: number) => {
    if (selectedPack) return { label: 'Tarif Pack Fixe', color: 'text-emerald-400', icon: ShieldCheck };
    const service = SERVICES.find(s => s.id === id);
    if (!service) return null;
    if (budget < service.min) return { label: 'Budget trop bas', color: 'text-red-500', icon: AlertCircle };
    if (budget > service.max) return { label: 'Budget premium', color: 'text-emerald-500', icon: Sparkles };
    return { label: 'Budget réaliste', color: 'text-emerald-500', icon: CheckCircle2 };
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
            <h1 className="text-5xl lg:text-7xl font-serif font-black text-slate-900 tracking-tighter uppercase">
              OFFRES DIRECTES <span className="italic text-emerald-500">CANTIC THINK IA</span>
            </h1>
          </div>
          <p className="text-slate-400 font-light text-xl max-w-3xl leading-relaxed">
            Des solutions packagées pour chaque étape de votre croissance, 
            ou une configuration sur-mesure selon vos besoins spécifiques.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 max-w-4xl"
          >
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900 mb-2 italic">Notre Vision : Accompagner le cycle de vie du succès</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Nous croyons que <span className="font-bold text-emerald-600">l'élève d'aujourd'hui est l'entrepreneur de demain</span>. 
                  C'est pourquoi nous proposons des offres accessibles dès le cursus scolaire, afin de créer une relation de confiance durable. 
                  Miser sur les bons outils numériques dès maintenant, c'est s'assurer une longueur d'avance pour vos futurs projets professionnels.
                </p>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Categories Navigation */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 ${
                activeCategory === cat.id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
          {scope !== 'youth' && (
          <button
            onClick={() => setActiveCategory('custom')}
            className={`px-8 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all whitespace-nowrap flex items-center gap-3 ${
              activeCategory === 'custom' 
              ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
              : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Sur-Mesure
          </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeCategory !== 'custom' ? (
                <motion.div 
                  key={`category-${activeCategory}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                  {filteredPacks.filter(p => p.categoryId === activeCategory).map((pack) => (
                    <motion.div
                      key={pack.id}
                      whileHover={{ y: -8 }}
                      onClick={() => selectPack(pack.id)}
                      className={`relative p-10 rounded-[3rem] border transition-all cursor-pointer overflow-hidden group ${
                        selectedPack === pack.id 
                        ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-2xl' 
                        : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                      } ${pack.dark ? 'bg-slate-900 text-white' : ''}`}
                    >
                      {pack.popular && (
                        <div className="absolute top-6 right-6 px-4 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                          Plus Populaire
                        </div>
                      )}

                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 ${
                        pack.dark ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-900'
                      }`}>
                        <pack.icon className="w-7 h-7" />
                      </div>

                      <div className="mb-8">
                        <h3 className={`text-2xl font-serif font-bold mb-2 ${pack.dark ? 'text-white' : 'text-slate-900'}`}>
                          {pack.name}
                        </h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${pack.dark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          {pack.tagline}
                        </p>
                        <p className={`text-sm font-light leading-relaxed ${pack.dark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {pack.description}
                        </p>
                      </div>

                      <ul className="space-y-4 mb-10">
                        {pack.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs font-medium">
                            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pack.dark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                            <span className={pack.dark ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-serif font-black ${pack.dark ? 'text-white' : 'text-slate-900'}`}>
                          {pack.price.toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${pack.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                          FCFA
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="custom-grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] mb-10 flex items-center gap-6">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                      <Info className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-1">Mode Sur-Mesure</h4>
                      <p className="text-xs text-slate-500 font-light">Composez votre propre pack en sélectionnant les services ci-dessous.</p>
                    </div>
                  </div>
                  
                  {SERVICES.map((service) => (
                    <motion.div 
                      key={service.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => toggleService(service.id)}
                      className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer flex flex-col md:flex-row md:items-center gap-8 ${
                        selectedServices.includes(service.id) 
                        ? 'bg-white border-emerald-500 shadow-2xl shadow-emerald-500/10' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedServices.includes(service.id) ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <service.icon className="w-8 h-8" />
                      </div>
                      
                      <div className="flex-grow">
                        <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{service.name}</h3>
                        <p className="text-slate-400 text-sm font-light">{service.description}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fourchette indicative</div>
                        <div className="text-sm font-bold text-slate-900">
                          {service.min.toLocaleString()} - {service.max.toLocaleString()} FCFA
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: Summary & CTA */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-serif font-bold uppercase tracking-tight">RÉCAPITULATIF</h2>
              </div>

              <div className="space-y-8 mb-12">
                {selectedPack ? (
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Pack Sélectionné</div>
                    <h4 className="text-lg font-serif font-bold mb-4">{PACKS.find(p => p.id === selectedPack)?.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Tarif Unique</span>
                      <span className="text-sm font-black text-white">{PACKS.find(p => p.id === selectedPack)?.price.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                ) : selectedServices.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 italic text-sm font-light">Aucune sélection en cours.</p>
                  </div>
                ) : (
                  selectedServices.map(id => {
                    const service = SERVICES.find(s => s.id === id);
                    const status = getBudgetStatus(id, budgets[id] || 0);
                    return (
                      <div key={id} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-300">{service?.name}</span>
                          <span className="text-xs font-black text-emerald-400">{(budgets[id] || 0).toLocaleString()} FCFA</span>
                        </div>
                        <input 
                          type="range" 
                          min={Math.max(0, (service?.min || 0) * 0.5)}
                          max={(service?.max || 0) * 2}
                          step={5000}
                          value={budgets[id] || 0}
                          onChange={(e) => updateBudget(id, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        {status && (
                          <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                            <status.icon className="w-3 h-3" /> {status.label}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-8 border-t border-white/10 mb-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Estimé</span>
                  <span className="text-3xl font-serif font-black text-white">{totalBudget.toLocaleString()} FCFA</span>
                </div>
                <p className="text-[9px] text-slate-500 italic">Prix indicatif sujet à validation stratégique.</p>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || (selectedServices.length === 0 && !selectedPack)}
                className="w-full py-6 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-4 hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Traitement...' : success ? 'Demande Envoyée !' : 'Valider ma demande'}
                {!isSubmitting && !success && <ArrowRight className="w-4 h-4" />}
                {success && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-8 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">Accompagnement Garanti</h4>
                <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                  Chaque pack inclut une session de prise en main pour vous rendre autonome.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals & Overlays ... */}

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] p-12 max-w-md w-full relative z-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <UserPlus className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Compte Requis</h3>
              <p className="text-slate-400 font-light mb-10 leading-relaxed">
                Pour recevoir votre devis dans votre espace membre et bénéficier de notre suivi, vous devez être connecté.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => navigate('/client/login')}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all"
                >
                  Se connecter / S'inscrire
                </button>
                <button 
                  onClick={() => setShowLoginModal(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Continuer plus tard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-emerald-500 flex flex-col items-center justify-center text-white p-10 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8"
            >
              <CheckCircle2 className="w-16 h-16" />
            </motion.div>
            <h2 className="text-4xl font-serif font-black mb-4">DEMANDE ENREGISTRÉE</h2>
            <p className="text-emerald-100 text-xl font-light max-w-md">
              Votre demande de devis a été transmise. Vous allez être redirigé vers votre espace membre.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectOffers;
