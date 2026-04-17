import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Trash2, Pencil, X, Save, 
  GraduationCap, BookOpen, MessageSquareText, ShieldCheck, 
  Briefcase, TrendingUp, Search, Layers, Filter, Bell,
  Clock, Target, Banknote, Eye, EyeOff, Loader2,
  Phone, CheckCircle2, AlertCircle, Mail, UserPlus, LogOut, Download, Users, Database, Image as ImageIcon,
  History, FileText, UploadCloud, Activity, Zap, CreditCard, ArrowUpRight, Signal, Wifi, WifiOff,
  UserCheck, UserMinus, Globe, Send, Sparkles, Bot, Shield, User, Calendar, Video, Terminal, Info, Copy, Settings2, Hash, Settings, ExternalLink, LayoutDashboard, Rocket
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { db, storage, auth } from '../firebase';
import { 
  collection, onSnapshot, addDoc, deleteDoc, 
  doc, updateDoc, query, orderBy, where, getDocs, limit, setDoc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GoogleGenAI } from "@google/genai";
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import { logAdminAction } from '../services/AuditService';
import { CaseStudy, TrainingCourse, DigitalResource, BlogPost, Transaction, Subscriber, AdminUser, Appointment, QuoteRequest, ContactMessage, AuditLog } from '../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('cantic_admin_role') || 'Analyste';
  const userName = localStorage.getItem('cantic_admin_name') || 'Admin';
  const isSuperAdmin = userRole === 'Super Admin' || userRole === 'Souverain';

  const activeTab = useMemo(() => {
    const path = location.pathname.split('/').pop();
    switch (path) {
      case 'shop': return 'library';
      case 'training': return 'training';
      case 'blog': return 'blog';
      case 'bookings': return 'agenda';
      case 'contacts': return 'newsletter';
      case 'settings': return 'gouvernance';
      case 'cases': return 'cases';
      case 'transactions': return 'transactions';
      case 'quotes': return 'quotes';
      case 'dashboard': return 'overview';
      default: return 'overview';
    }
  }, [location.pathname]);

  const setActiveTab = (tab: string) => {
    switch (tab) {
      case 'library': navigate('/admin/shop'); break;
      case 'training': navigate('/admin/training'); break;
      case 'blog': navigate('/admin/blog'); break;
      case 'agenda': navigate('/admin/bookings'); break;
      case 'newsletter': navigate('/admin/contacts'); break;
      case 'gouvernance': navigate('/admin/settings'); break;
      case 'cases': navigate('/admin/cases'); break;
      case 'transactions': navigate('/admin/transactions'); break;
      case 'quotes': navigate('/admin/quotes'); break;
      case 'overview': navigate('/admin/dashboard'); break;
      default: navigate('/admin/dashboard'); break;
    }
  };
  const [newsletterSubTab, setNewsletterSubTab] = useState<'audience' | 'compose' | 'history' | 'messages'>('audience');
  const [trainingSubTab, setTrainingSubTab] = useState<'courses' | 'registrations'>('courses');
  const [transactionSubTab, setTransactionSubTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [agendaSubTab, setAgendaSubTab] = useState<'pending' | 'confirmed' | 'cancelled'>('pending');
  const [governanceSubTab, setGovernanceSubTab] = useState<'admins' | 'audit'>('admins');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // États de données
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [trainings, setTrainings] = useState<TrainingCourse[]>([]);
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<{ id: string, title: string, message: string, type: 'info' | 'success' | 'warning', createdAt: string, read: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Données pour les graphiques
  const revenueData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.createdAt.startsWith(date) && t.status === 'completed'
      );
      const amount = dayTransactions.reduce((acc, t) => acc + t.amount, 0);
      return {
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        amount
      };
    });
  }, [transactions]);

  const appointmentsByStatus = useMemo(() => {
    const counts = {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };
    return [
      { name: 'En attente', value: counts.pending, color: '#f59e0b' },
      { name: 'Confirmés', value: counts.confirmed, color: '#10b981' },
      { name: 'Annulés', value: counts.cancelled, color: '#ef4444' },
    ];
  }, [appointments]);

  // Newsletter Composition
  const [newsletterForm, setNewsletterForm] = useState({ subject: '', content: '' });

  // Modaux
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  // File upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [trainingImageFile, setTrainingImageFile] = useState<File | null>(null);
  const [trainingImagePreview, setTrainingImagePreview] = useState<string | null>(null);
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [blogBrochureFile, setBlogBrochureFile] = useState<File | null>(null);
  const [bonusPdfFile, setBonusPdfFile] = useState<File | null>(null);
  const [bonusImageFile, setBonusImageFile] = useState<File | null>(null);
  const [bonusVideoFile, setBonusVideoFile] = useState<File | null>(null);
  const [bonusAudioFile, setBonusAudioFile] = useState<File | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribes: (() => void)[] = [];

    const collectionsConfig = [
      { name: "cases", setter: setCases, order: "order" },
      { name: "formations", setter: setTrainings },
      { name: "resources", setter: setResources },
      { name: "posts", setter: setPosts },
      { name: "transactions", setter: setTransactions },
      { name: "subscribers", setter: setSubscribers },
      { name: "campaigns", setter: setCampaigns },
      { name: "admins", setter: setAdmins, order: "name" },
      { name: "appointments", setter: setAppointments },
      { name: "registrations", setter: setRegistrations },
      { name: "quotes", setter: setQuotes },
      { name: "contacts", setter: setContacts },
      { name: "auditLogs", setter: setAuditLogs }
    ];

    collectionsConfig.forEach(col => {
      const q = col.order 
        ? query(collection(db, col.name), orderBy(col.order, "asc"))
        : query(collection(db, col.name));

      const unsub = onSnapshot(q, (snap) => {
        let items = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        
        if (!col.order) {
          items.sort((a, b) => {
            const dateA = a.createdAt || a.date || '0000-00-00';
            const dateB = b.createdAt || b.date || '0000-00-00';
            if (col.name === "appointments") {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
            return dateB.localeCompare(dateA);
          });
        }
        
        col.setter(items);
        if (col.name === "admins") setLoading(false);

        // Détection de nouveaux éléments pour les notifications (sauf au premier chargement)
        if (!loading) {
          const lastItem = items[0];
          if (lastItem && lastItem.createdAt && new Date(lastItem.createdAt).getTime() > Date.now() - 10000) {
            let title = "Nouvel événement";
            let message = "Un nouvel élément a été ajouté.";
            let type: 'info' | 'success' | 'warning' = 'info';

            if (col.name === 'transactions') {
              title = "Nouvelle Transaction";
              message = `Achat de ${lastItem.resourceTitle} par ${lastItem.userEmail}`;
              type = 'success';
            } else if (col.name === 'appointments') {
              title = "Nouveau Rendez-vous";
              message = `Session demandée par ${lastItem.userName}`;
              type = 'info';
            } else if (col.name === 'contacts') {
              title = "Nouveau Message";
              message = `Message de ${lastItem.name} : ${lastItem.subject}`;
              type = 'warning';
            }

            if (col.name === 'transactions' || col.name === 'appointments' || col.name === 'contacts') {
              setNotifications(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                title,
                message,
                type,
                createdAt: new Date().toISOString(),
                read: false
              }, ...prev]);
            }
          }
        }
      }, (error) => {
        console.error(`❌ Firestore Error in collection ${col.name}:`, error);
        if (col.name === "admins") setLoading(false);
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach(u => u());
  }, []);

  const revenue = useMemo(() => {
    return transactions
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'pending' || t.status === 'processing').length, [transactions]);

  const filteredData = useMemo(() => {
    let data: any[] = [];
    switch (activeTab) {
      case 'cases': data = cases; break;
      case 'training': data = trainings; break;
      case 'library': data = resources; break;
      case 'blog': data = posts; break;
      case 'transactions': 
        data = transactionSubTab === 'all' ? transactions : 
               transactionSubTab === 'pending' ? transactions.filter(t => t.status === 'pending' || t.status === 'processing') :
               transactions.filter(t => t.status === 'completed');
        break;
      case 'quotes': data = quotes; break;
      case 'newsletter': 
        data = newsletterSubTab === 'messages' ? contacts : subscribers; 
        break;
      case 'gouvernance': data = admins; break;
      case 'agenda': 
        data = appointments.filter(a => a.status === agendaSubTab);
        break;
    }

    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((item: any) => 
      (item.title || item.clientName || item.clientInstitution || item.title_professional || item.client || item.name || item.email || item.userPhone || item.referenceNumber || '').toLowerCase().includes(q)
    );
  }, [activeTab, cases, trainings, resources, posts, transactions, subscribers, admins, appointments, searchQuery, transactionSubTab, agendaSubTab]);

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterForm.subject || !newsletterForm.content) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "campaigns"), {
        subject: newsletterForm.subject,
        content: newsletterForm.content,
        sentAt: new Date().toISOString(),
        recipientsCount: subscribers.length,
        author: userName
      });
      alert(`NOTE DE VEILLE EXPÉDIÉE.`);
      setNewsletterForm({ subject: '', content: '' });
      setNewsletterSubTab('history');
    } catch (e) {
      alert("ERREUR D'EXPÉDITION.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptimizeWithAI = async () => {
    const contentToOptimize = activeTab === 'blog' ? formData.content : newsletterForm.content;
    if (!contentToOptimize) return;
    
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Optimise ce texte pour une publication stratégique professionnelle (HTML si nécessaire) : ${contentToOptimize}`,
      });
      
      const newContent = response.text || contentToOptimize;
      if (activeTab === 'blog') {
        setFormData(prev => ({ ...prev, content: newContent }));
      } else {
        setNewsletterForm(prev => ({ ...prev, content: newContent }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBlogFromTraining = async (training: TrainingCourse) => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: "GÉNÉRATION DE L'ARTICLE EN COURS..." });
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Génère un article de blog professionnel et captivant basé sur cette formation :
      Titre : ${training.title_professional}
      Bénéfice : ${training.benefit_micro}
      Niveau : ${training.level}
      Cible : ${training.target}
      Modules : ${training.curriculum?.modules?.join(', ') || 'Non spécifiés'}
      
      L'article doit être structuré en HTML (h2, h3, p, ul, li).
      Inclus une section "Pourquoi suivre cette formation ?" et un appel à l'action.
      
      Réponds uniquement au format JSON avec les clés suivantes :
      - title : Le titre de l'article
      - excerpt : Un court résumé accrocheur
      - content : Le contenu HTML complet
      - tags : Un tableau de 3-5 mots-clés pertinents
      - category : Une catégorie appropriée (ex: IA, Productivité, Data Science, Gouvernance)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const blogData = JSON.parse(response.text);
      
      // Switch to blog tab and open modal with pre-filled data
      setActiveTab('blog');
      setModalMode('add');
      setTargetId(null);
      setFormData({
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        date: new Date().toLocaleDateString('fr-FR'),
        author: userName,
        tags: blogData.tags || [],
        category: blogData.category || 'Formation',
        imageUrl: training.imageUrl || '',
        ctaLink: `/training?course=${training.slug || training.id}`,
        ctaLabel: "S'inscrire à la formation",
        reactions: { like: 0, insightful: 0, love: 0 },
        comments: []
      });
      
      setStatusMessage({ type: 'success', text: "ARTICLE GÉNÉRÉ AVEC SUCCÈS. VOUS POUVEZ LE MODIFIER AVANT D'ENREGISTRER." });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "ERREUR LORS DE LA GÉNÉRATION DE L'ARTICLE." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleEbookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setEbookFile(e.target.files[0]);
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBrochureFile(e.target.files[0]);
  };

  const handleTrainingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTrainingImageFile(file);
      setTrainingImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBlogImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBlogImageFile(file);
      setBlogImagePreview(URL.createObjectURL(file));
    }
  };

  const handleBlogBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBlogBrochureFile(e.target.files[0]);
  };

  const handleBonusPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBonusPdfFile(e.target.files[0]);
  };

  const handleBonusImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBonusImageFile(e.target.files[0]);
  };

  const handleBonusVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBonusVideoFile(e.target.files[0]);
  };

  const handleBonusAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setBonusAudioFile(e.target.files[0]);
  };

  const handleOpenModal = (mode: 'add' | 'edit', item?: any) => {
    if (!isSuperAdmin && !['blog', 'cases'].includes(activeTab)) {
      return alert("ACCÈS RÉSERVÉ");
    }
    setModalMode(mode);
    setTargetId(item?.id || null);
    setLogoFile(null);
    setLogoPreview(null);
    setEbookFile(null);
    setBrochureFile(null);
    setTrainingImageFile(null);
    setTrainingImagePreview(null);
    setBlogImageFile(null);
    setBlogImagePreview(null);
    setBlogBrochureFile(null);
    setBonusPdfFile(null);
    setBonusImageFile(null);
    setBonusVideoFile(null);
    setBonusAudioFile(null);
    setStatusMessage(null);
    
    const defaults: any = {
      cases: { title: '', client: '', challenge: '', solution: '', impact: '', status: 'Existant', tags: '', visualType: 'hero', logoUrl: '', order: 0, url: '' },
      training: { title_professional: '', title_simple: '', benefit_micro: '', level: 'Coaching', target: 'Décideurs', is_active: true, curriculum: { duration: '2 Jours' }, price: 'Sur demande', discountRate: 0, totalSeats: 20, brochureUrl: '', imageUrl: '', trainingDate: '', location: '', slug: '' },
      library: { title: '', badge: 'INDISPENSABLE', typeLabel: 'GUIDE STRATÉGIQUE', price: '9 900 FCFA', pagesCount: '120', description: '', targetAudience: '', keyBenefits: '', gradientFrom: 'from-slate-900', gradientTo: 'to-cantic-dark', fileUrl: '', slug: '', order: 0 },
      blog: { title: '', excerpt: '', content: '', date: new Date().toLocaleDateString('fr-FR'), author: userName, tags: [], seoKeywords: '', metaDescription: '', ctaLink: '', ctaLabel: '' },
      gouvernance: { name: '', email: '', role: 'Analyste', status: 'Actif', password: '' },
      agenda: {}
    };

    let initialData = item ? { ...item } : { ...defaults[activeTab] };
    if (activeTab === 'training') {
      if (!initialData.curriculum) initialData.curriculum = { duration: initialData.duration || 'À préciser' };
    }
    setFormData(initialData);
  };

  const handleSeed = async () => {
    if (!window.confirm("Voulez-vous générer des données d'exemple pour cette collection ?")) return;
    setIsProcessing(true);
    try {
      await logAdminAction('SEED', activeTab, 'Génération massive de données d\'exemple');
      if (activeTab === 'cases') {
        await addDoc(collection(db, "cases"), {
          title: "Optimisation des Flux Logistiques via IA Prédictive",
          client: "Port Autonome d'Abidjan",
          challenge: "Réduire les temps d'attente des navires et optimiser l'allocation des quais.",
          solution: "Déploiement d'un modèle de Machine Learning prédisant les arrivées avec 94% de précision.",
          impact: "Réduction de 22% des coûts opérationnels et gain de 15% en fluidité portuaire.",
          status: "Existant",
          tags: ["Logistique", "IA Prédictive", "ROI"],
          order: 1,
          visualType: "hero",
          createdAt: new Date().toISOString()
        });
        
        await addDoc(collection(db, "cases"), {
          title: "Cercle Citoyen - Plateforme de Cohésion Sociale",
          client: "République de Côte d'Ivoire",
          challenge: "Digitaliser l'engagement citoyen et renforcer le lien social à travers une infrastructure souveraine et sécurisée.",
          solution: "Déploiement d'une plateforme d'action citoyenne permettant la remontée d'informations et la gestion de projets communautaires.",
          impact: "Plus de 50 000 citoyens engagés et réduction des délais de réponse aux alertes communautaires de 40%.",
          status: "Existant",
          tags: ["Gouvernance", "Souveraineté Numérique", "Engagement"],
          order: 2,
          visualType: "hero",
          url: "https://cerclecitoyen.ci",
          logoUrl: "https://nfsskgcpqbccnwacsplc.supabase.co/storage/v1/object/public/Logo-cercle-citoyen/logo-cercle-citoyen.png",
          createdAt: new Date().toISOString()
        });
      }

      if (activeTab === 'training') {
        await addDoc(collection(db, "formations"), {
          title_professional: "IA Générative pour Décideurs Publics",
          benefit_micro: "Maîtriser les enjeux de souveraineté et d'efficacité administrative.",
          level: "Expert",
          target: "Ministres, Directeurs Généraux, Hauts Fonctionnaires",
          price: "Sur demande",
          imageUrl: "https://picsum.photos/seed/gov/800/600",
          trainingDate: "12 Mai 2026",
          location: "Hôtel Ivoire, Abidjan",
          curriculum: {
            duration: "2 jours intensifs",
            modules: [
              "Fondamentaux de l'IA Générative",
              "Cadre réglementaire et éthique en Afrique",
              "Cas d'usage : Administration 4.0",
              "Atelier : Définir sa feuille de route IA"
            ]
          },
          createdAt: new Date().toISOString()
        });

        await addDoc(collection(db, "formations"), {
          title_professional: "Prompt Engineering et Productivité",
          benefit_micro: "Gagner 2h par jour sur vos tâches administratives et rédactionnelles.",
          level: "Débutant",
          target: "Cadres, Analystes, Secrétaires de direction",
          price: "150 000 FCFA",
          imageUrl: "https://picsum.photos/seed/prompt/800/600",
          trainingDate: "20 Avril 2026",
          location: "Cantic Hub, Cocody",
          curriculum: {
            duration: "1 jour",
            modules: [
              "L'art de parler aux machines",
              "Automatisation de la veille stratégique",
              "Rédaction assistée par IA",
              "Sécurisation des prompts"
            ]
          },
          createdAt: new Date().toISOString()
        });
      }

      if (activeTab === 'library') {
        const resourcesToAdd = [
          {
            title: "AGRITECH et IA : MODERNISER LA FILIÈRE AGRICOLE IVOIRIENNE",
            badge: "INDISPENSABLE",
            type: "ebook",
            typeLabel: "GUIDE STRATÉGIQUE",
            price: 9900,
            pagesCount: 65,
            description: "Un manifeste complet pour une Côte d'Ivoire qui maîtrise la donnée de sa production. Ce guide explore quatre révolutions technologiques : l'agriculture de précision, la traçabilité blockchain, l'analyse prédictive des marchés et l'inclusion financière par la data.",
            targetAudience: "Présidents de coopératives, Entrepreneurs agro-industriels, Investisseurs, Décideurs politiques",
            keyBenefits: [
              "Augmentation du rendement (jusqu'à +50% de revenus)",
              "Conformité EUDR (Zéro déforestation)",
              "Anticipation des cours mondiaux",
              "Accès facilité au crédit agricole"
            ],
            gradientFrom: "from-emerald-900",
            gradientTo: "to-cantic-dark",
            slug: "agritech-ia-cote-ivoire",
            order: 1,
            fileUrl: "",
            createdAt: new Date().toISOString()
          },
          {
            title: "LE LEADER AUGMENTÉ",
            badge: "NOUVEAU",
            type: "ebook",
            typeLabel: "GUIDE STRATÉGIQUE",
            price: 9900,
            pagesCount: 57,
            description: "Manager à l'ère de l'Intelligence Hybride. Devenez l'architecte des systèmes où l'humain et l'IA créent de la valeur ensemble. Ce guide explore la transition du manager contrôleur au manager architecte, la prise de décision assistée par l'IA, la gestion d'équipes hybrides et le prompt engineering pour dirigeants.",
            targetAudience: "Dirigeants, DRH, Managers, Entrepreneurs",
            keyBenefits: [
              "Passer du manager contrôleur au manager architecte",
              "Décider avec une clarté augmentée face à l'incertitude",
              "Désamorcer la peur et construire une culture de collaboration",
              "Maîtriser le Prompt Engineering comme compétence de leadership",
              "Recruter et fidéliser les talents de l'ère hybride"
            ],
            gradientFrom: "from-slate-900",
            gradientTo: "to-cantic-dark",
            slug: "le-leader-augmente",
            order: 2,
            fileUrl: "",
            createdAt: new Date().toISOString()
          },
          {
            title: "AGIR INTELLIGENT",
            badge: "BEST-SELLER",
            type: "ebook",
            typeLabel: "GUIDE STRATÉGIQUE",
            price: 9900,
            pagesCount: 86,
            description: "Comment les patrons ivoiriens utilisent l'IA pour passer de pompier à capitaine d'industrie. Ce guide n'est pas un manuel technique pour informaticiens. C'est une méthode de gestionnaire conçue pour le terrain, d'Abidjan à San-Pédro. Apprenez à automatiser vos tâches répétitives, à vendre plus sur WhatsApp et à sécuriser votre trésorerie grâce à l'IA.",
            targetAudience: "Dirigeants de PME, Managers, Entrepreneurs, Commerçants",
            keyBenefits: [
              "Gagner 10 heures par semaine en déléguant vos tâches répétitives à un 'apprenti virtuel'",
              "Vendre plus sur WhatsApp grâce à des offres irrésistibles rédigées en 2 minutes",
              "Sécuriser votre cash avec des prévisions de trésorerie à 6 mois",
              "Zéro budget technique : Apprenez à utiliser les outils gratuits déjà disponibles dans votre poche"
            ],
            gradientFrom: "from-slate-900",
            gradientTo: "to-emerald-900",
            slug: "agir-intelligent-ia-pme",
            order: 3,
            fileUrl: "",
            createdAt: new Date().toISOString()
          },
          {
            title: "FRAMEWORK KITA",
            badge: "PROTOCOLE",
            type: "ebook",
            typeLabel: "PROTOCOLE STRATÉGIQUE",
            price: 9900,
            pagesCount: 77,
            description: "Le protocole de transformation digitale pas-à-pas. Fruit de 14 ans d'interventions terrain, ce framework immunise les organisations contre l'échec numérique. Il structure votre transformation autour de quatre phases non-négociables : Knowledge (Audit), Innovation (Usage utile), Transformation (Déploiement humain) et Adaptation (Boucle du ROI).",
            targetAudience: "Consultants, Directeurs de l'Innovation, Entrepreneurs Tech, Chefs de Projet",
            keyBenefits: [
              "Diagnostic de maturité digitale sur six dimensions fondamentales",
              "Conception de solutions sur-mesure basées sur le 'Job to be Done'",
              "Gestion du changement humain via le modèle ARIA",
              "Pilotage par la valeur et mesure rigoureuse du ROI"
            ],
            gradientFrom: "from-slate-900",
            gradientTo: "to-emerald-900",
            slug: "framework-kita-transformation-digitale",
            order: 4,
            fileUrl: "",
            createdAt: new Date().toISOString()
          },
          {
            title: "SOUVERAINETÉ NUMÉRIQUE EN CÔTE D'IVOIRE",
            badge: "INSTITUTIONNEL",
            type: "ebook",
            typeLabel: "GUIDE STRATÉGIQUE",
            price: 9900,
            pagesCount: 116,
            description: "Enjeux et protocoles pour les institutions. Un manifeste et un guide opérationnel pour les décideurs publics qui refusent que la Côte d'Ivoire devienne un simple terrain d'extraction de données. Ce guide explore le cadre légal ARTCI, les risques de la dépendance technologique et l'architecture d'une IA souveraine.",
            targetAudience: "Décideurs publics, Directeurs de cabinets, Responsables d'institutions étatiques",
            keyBenefits: [
              "Analyse des risques de la dépendance technologique",
              "Protocole d'audit algorithmique adapté au contexte africain (GNA-CI)",
              "Architecture technique détaillée pour déployer des IA souveraines",
              "10 actions prioritaires pour transformer la stratégie en résultats concrets"
            ],
            gradientFrom: "from-orange-900",
            gradientTo: "to-emerald-900",
            slug: "souverainete-numerique-cote-ivoire",
            order: 5,
            fileUrl: "",
            createdAt: new Date().toISOString()
          }
        ];

        for (const res of resourcesToAdd) {
          await addDoc(collection(db, "resources"), res);
        }
      }

      if (activeTab === 'blog') {
        await addDoc(collection(db, "posts"), {
          title: "L'IA Générative : Un levier de souveraineté pour l'administration ivoirienne",
          excerpt: "Découvrez comment l'IA transforme la gestion publique et renforce l'efficacité de nos institutions.",
          content: `
            <h2>L'IA au service de l'État</h2>
            <p>L'intégration de l'intelligence artificielle dans l'administration publique n'est plus une option, mais une nécessité pour répondre aux défis de la modernité et de la souveraineté numérique.</p>
          `,
          author: userName,
          category: "Gouvernance",
          imageUrl: "https://picsum.photos/seed/blog-gov/1200/600",
          tags: ["IA", "Gouvernance", "Souveraineté"],
          reactions: { like: 12, insightful: 8, love: 5 },
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      if (activeTab === 'gouvernance') {
        const adminsToAdd = [
          {
            name: "Ourega GOBLE",
            email: "ourega.goble@CANTIC-THINK-IA.work",
            role: "Souverain",
            status: "Actif",
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            name: "Admin Stratégique",
            email: "teletechnologyci@gmail.com",
            role: "Super Admin",
            status: "Actif",
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            name: "Analyste Data",
            email: "analyste@CANTIC-THINK-IA.work",
            role: "Analyste",
            status: "Actif",
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        ];

        for (const admin of adminsToAdd) {
          await addDoc(collection(db, "admins"), admin);
        }
      }
      setStatusMessage({ type: 'success', text: "Données d'exemple générées avec succès !" });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "Erreur lors de la génération." });
    } finally {
      setIsProcessing(false);
    }
  };

  const seedSecondEbook = async () => {
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "resources"), {
        title: "LE LEADER AUGMENTÉ",
        badge: "NOUVEAU",
        type: "ebook",
        typeLabel: "GUIDE STRATÉGIQUE",
        price: 9900,
        pagesCount: 57,
        description: "Manager à l'ère de l'Intelligence Hybride. Devenez l'architecte des systèmes où l'humain et l'IA créent de la valeur ensemble. Ce guide explore la transition du manager contrôleur au manager architecte, la prise de décision assistée par l'IA, la gestion d'équipes hybrides et le prompt engineering pour dirigeants.",
        targetAudience: "Dirigeants, DRH, Managers, Entrepreneurs",
        keyBenefits: [
          "Passer du manager contrôleur au manager architecte",
          "Décider avec une clarté augmentée face à l'incertitude",
          "Désamorcer la peur et construire une culture de collaboration",
          "Maîtriser le Prompt Engineering comme compétence de leadership",
          "Recruter et fidéliser les talents de l'ère hybride"
        ],
        gradientFrom: "from-slate-900",
        gradientTo: "to-cantic-dark",
        slug: "le-leader-augmente",
        order: 2,
        fileUrl: "",
        createdAt: new Date().toISOString()
      });
      setStatusMessage({ type: 'success', text: "L'ebook 'Le Leader Augmenté' a été ajouté à la boutique !" });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "Erreur lors de l'ajout de l'ebook 2." });
    } finally {
      setIsProcessing(false);
    }
  };

  const seedThirdEbook = async () => {
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "resources"), {
        title: "AGIR INTELLIGENT",
        badge: "BEST-SELLER",
        type: "ebook",
        typeLabel: "GUIDE STRATÉGIQUE",
        price: 9900,
        pagesCount: 86,
        description: "Comment les patrons ivoiriens utilisent l'IA pour passer de pompier à capitaine d'industrie. Ce guide n'est pas un manuel technique pour informaticiens. C'est une méthode de gestionnaire conçue pour le terrain, d'Abidjan à San-Pédro. Apprenez à automatiser vos tâches répétitives, à vendre plus sur WhatsApp et à sécuriser votre trésorerie grâce à l'IA.",
        targetAudience: "Dirigeants de PME, Managers, Entrepreneurs, Commerçants",
        keyBenefits: [
          "Gagner 10 heures par semaine en déléguant vos tâches répétitives à un 'apprenti virtuel'",
          "Vendre plus sur WhatsApp grâce à des offres irrésistibles rédigées en 2 minutes",
          "Sécuriser votre cash avec des prévisions de trésorerie à 6 mois",
          "Zéro budget technique : Apprenez à utiliser les outils gratuits déjà disponibles dans votre poche"
        ],
        gradientFrom: "from-slate-900",
        gradientTo: "to-emerald-900",
        slug: "agir-intelligent-ia-pme",
        order: 3,
        fileUrl: "",
        createdAt: new Date().toISOString()
      });
      setStatusMessage({ type: 'success', text: "L'ebook 'Agir Intelligent' a été ajouté à la boutique !" });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "Erreur lors de l'ajout de l'ebook 3." });
    } finally {
      setIsProcessing(false);
    }
  };

  const seedFourthEbook = async () => {
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "resources"), {
        title: "FRAMEWORK KITA",
        badge: "PROTOCOLE",
        type: "ebook",
        typeLabel: "PROTOCOLE STRATÉGIQUE",
        price: 9900,
        pagesCount: 77,
        description: "Le protocole de transformation digitale pas-à-pas. Fruit de 14 ans d'interventions terrain, ce framework immunise les organisations contre l'échec numérique. Il structure votre transformation autour de quatre phases non-négociables : Knowledge (Audit), Innovation (Usage utile), Transformation (Déploiement humain) et Adaptation (Boucle du ROI).",
        targetAudience: "Consultants, Directeurs de l'Innovation, Entrepreneurs Tech, Chefs de Projet",
        keyBenefits: [
          "Diagnostic de maturité digitale sur six dimensions fondamentales",
          "Conception de solutions sur-mesure basées sur le 'Job to be Done'",
          "Gestion du changement humain via le modèle ARIA",
          "Pilotage par la valeur et mesure rigoureuse du ROI"
        ],
        gradientFrom: "from-slate-900",
        gradientTo: "to-emerald-900",
        slug: "framework-kita-transformation-digitale",
        order: 4,
        fileUrl: "",
        createdAt: new Date().toISOString()
      });
      setStatusMessage({ type: 'success', text: "L'ebook 'Framework KITA' a été ajouté à la boutique !" });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "Erreur lors de l'ajout de l'ebook 4." });
    } finally {
      setIsProcessing(false);
    }
  };

  const seedFifthEbook = async () => {
    setIsProcessing(true);
    try {
      await addDoc(collection(db, "resources"), {
        title: "SOUVERAINETÉ NUMÉRIQUE EN CÔTE D'IVOIRE",
        badge: "INSTITUTIONNEL",
        type: "ebook",
        typeLabel: "GUIDE STRATÉGIQUE",
        price: 9900,
        pagesCount: 116,
        description: "Enjeux et protocoles pour les institutions. Un manifeste et un guide opérationnel pour les décideurs publics qui refusent que la Côte d'Ivoire devienne un simple terrain d'extraction de données. Ce guide explore le cadre légal ARTCI, les risques de la dépendance technologique et l'architecture d'une IA souveraine.",
        targetAudience: "Décideurs publics, Directeurs de cabinets, Responsables d'institutions étatiques",
        keyBenefits: [
          "Analyse des risques de la dépendance technologique",
          "Protocole d'audit algorithmique adapté au contexte africain (GNA-CI)",
          "Architecture technique détaillée pour déployer des IA souveraines",
          "10 actions prioritaires pour transformer la stratégie en résultats concrets"
        ],
        gradientFrom: "from-orange-900",
        gradientTo: "to-emerald-900",
        slug: "souverainete-numerique-cote-ivoire",
        order: 5,
        fileUrl: "",
        createdAt: new Date().toISOString()
      });
      setStatusMessage({ type: 'success', text: "L'ebook 'Souveraineté Numérique' a été ajouté à la boutique !" });
    } catch (e) {
      console.error(e);
      setStatusMessage({ type: 'error', text: "Erreur lors de l'ajout de l'ebook 5." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionMap: any = { cases: 'cases', training: 'formations', library: 'resources', blog: 'posts', gouvernance: 'admins' };
    const colName = collectionMap[activeTab];
    setIsProcessing(true);
    
    console.log("Début de l'enregistrement dans :", colName);
    
    // Création d'un timeout pour éviter le chargement infini (3 minutes pour les uploads multiples)
    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("DÉLAI D'EXPIRATION : Le serveur Firebase met trop de temps à répondre (180s). Cela peut arriver avec des fichiers volumineux ou une connexion lente. Vérifiez si l'enregistrement a quand même été effectué dans la liste.")), 180000);
    });
    
    try {
      const saveOperation = (async () => {
        let finalData = { ...formData };
        if (!finalData.createdAt) finalData.createdAt = new Date().toISOString();

        // Upload du logo si présent
        if (activeTab === 'cases' && logoFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU LOGO EN COURS..." });
          console.log("Upload du logo en cours...");
          try {
            // Nettoyage du nom de fichier par précaution
            const cleanFileName = logoFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
            const storageRef = ref(storage, `cases_logos/${Date.now()}_${cleanFileName}`);
            const snapshot = await uploadBytes(storageRef, logoFile);
            finalData.logoUrl = await getDownloadURL(snapshot.ref);
            console.log("Logo uploadé avec succès :", finalData.logoUrl);
          } catch (uploadError: any) {
            console.error("Erreur lors de l'upload du logo :", uploadError);
            
            const isCorsError = uploadError.code === 'storage/unauthorized' || 
                               uploadError.message?.includes('CORS') || 
                               uploadError.name === 'FirebaseError';

            if (isCorsError) {
              const confirmTextOnly = window.confirm(
                "ERREUR CORS : L'image n'a pas pu être envoyée car votre domaine n'est pas autorisé sur Firebase.\n\n" +
                "Voulez-vous quand même enregistrer les modifications de texte (sans l'image) ?"
              );
              
              if (!confirmTextOnly) {
                throw new Error("Enregistrement annulé par l'utilisateur (Erreur CORS).");
              }
              // Si l'utilisateur accepte, on continue sans mettre à jour logoUrl
              console.warn("Poursuite de l'enregistrement sans l'image (CORS bypass).");
            } else {
              throw uploadError;
            }
          }
        }

        if (activeTab === 'library' && ebookFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU PDF PRINCIPAL EN COURS..." });
          console.log("Upload du fichier PDF en cours...");
          const storageRef = ref(storage, `library_files/${Date.now()}_${ebookFile.name}`);
          const snapshot = await uploadBytes(storageRef, ebookFile);
          finalData.fileUrl = await getDownloadURL(snapshot.ref);
          console.log("Fichier PDF uploadé avec succès");
        }

        if (activeTab === 'library' && bonusPdfFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU BONUS PDF EN COURS..." });
          console.log("Upload du bonus PDF en cours...");
          const storageRef = ref(storage, `bonus_files/${Date.now()}_${bonusPdfFile.name}`);
          const snapshot = await uploadBytes(storageRef, bonusPdfFile);
          finalData.bonusPdfUrl = await getDownloadURL(snapshot.ref);
        }

        if (activeTab === 'library' && bonusImageFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU BONUS IMAGE EN COURS..." });
          console.log("Upload du bonus Image en cours...");
          const storageRef = ref(storage, `bonus_files/${Date.now()}_${bonusImageFile.name}`);
          const snapshot = await uploadBytes(storageRef, bonusImageFile);
          finalData.bonusImageUrl = await getDownloadURL(snapshot.ref);
        }

        if (activeTab === 'library' && bonusVideoFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU BONUS VIDÉO EN COURS..." });
          console.log("Upload du bonus Vidéo en cours...");
          const storageRef = ref(storage, `bonus_files/${Date.now()}_${bonusVideoFile.name}`);
          const snapshot = await uploadBytes(storageRef, bonusVideoFile);
          finalData.bonusVideoUrl = await getDownloadURL(snapshot.ref);
        }

        if (activeTab === 'library' && bonusAudioFile) {
          setStatusMessage({ type: 'info', text: "UPLOAD DU BONUS AUDIO EN COURS..." });
          console.log("Upload du bonus Audio en cours...");
          const storageRef = ref(storage, `bonus_files/${Date.now()}_${bonusAudioFile.name}`);
          const snapshot = await uploadBytes(storageRef, bonusAudioFile);
          finalData.bonusAudioUrl = await getDownloadURL(snapshot.ref);
        }

        if (activeTab === 'library') {
          if (typeof finalData.keyBenefits === 'string') {
            finalData.keyBenefits = finalData.keyBenefits.split(',').map((b: string) => b.trim()).filter((b: string) => b !== '');
          }
          finalData.order = Number(finalData.order) || 0;
        }

        if (activeTab === 'training') {
          if (brochureFile) {
            setStatusMessage({ type: 'info', text: "UPLOAD DE LA PLAQUETTE EN COURS..." });
            console.log("Upload de la plaquette PDF en cours...");
            const storageRef = ref(storage, `training_brochures/${Date.now()}_${brochureFile.name}`);
            const snapshot = await uploadBytes(storageRef, brochureFile);
            finalData.brochureUrl = await getDownloadURL(snapshot.ref);
            console.log("Plaquette PDF uploadée avec succès");
          }
          if (trainingImageFile) {
            setStatusMessage({ type: 'info', text: "UPLOAD DE L'ILLUSTRATION EN COURS..." });
            console.log("Upload de l'illustration en cours...");
            const storageRef = ref(storage, `training_images/${Date.now()}_${trainingImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, trainingImageFile);
            finalData.imageUrl = await getDownloadURL(snapshot.ref);
            console.log("Illustration uploadée avec succès");
          }
        }

        if (activeTab === 'blog') {
          if (blogImageFile) {
            setStatusMessage({ type: 'info', text: "UPLOAD DE L'IMAGE BLOG EN COURS..." });
            console.log("Upload de la photo de couverture du blog en cours...");
            const storageRef = ref(storage, `blog_images/${Date.now()}_${blogImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, blogImageFile);
            finalData.imageUrl = await getDownloadURL(snapshot.ref);
            console.log("Photo de couverture du blog uploadée avec succès");
          }
          if (blogBrochureFile) {
            setStatusMessage({ type: 'info', text: "UPLOAD DE LA BROCHURE BLOG EN COURS..." });
            console.log("Upload de la brochure du blog en cours...");
            const storageRef = ref(storage, `blog_brochures/${Date.now()}_${blogBrochureFile.name}`);
            const snapshot = await uploadBytes(storageRef, blogBrochureFile);
            finalData.brochureUrl = await getDownloadURL(snapshot.ref);
            console.log("Brochure du blog uploadée avec succès");
          }
        }

        if (activeTab === 'cases') {
          finalData.visualType = 'hero';
          if (typeof finalData.tags === 'string') {
            finalData.tags = finalData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '');
          }
          // Sécurité pour le champ order
          finalData.order = Number(finalData.order) || 0;
        }

        // Nettoyage des données avant sauvegarde
        setStatusMessage({ type: 'info', text: "FINALISATION DE L'ENREGISTREMENT..." });
        console.log("Données avant nettoyage (finalData) :", finalData);
        const { id, ...dataToSave } = finalData;
        console.log("ID extrait :", id, "| targetId actuel :", targetId);
        console.log("Données finales prêtes pour Firestore (sans ID) :", dataToSave);

        if (modalMode === 'edit' && targetId) {
          console.log("Tentative de mise à jour (setDoc merge) du document :", targetId, "dans la collection :", colName);
          try {
            const docRef = doc(db, colName, targetId);
            const updatePayload = { ...dataToSave, updatedAt: new Date().toISOString() };
            console.log("Payload de mise à jour :", updatePayload);
            
            // Utilisation de setDoc avec merge: true pour plus de robustesse
            await setDoc(docRef, updatePayload, { merge: true });
            await logAdminAction('UPDATE', colName, `Modification de l'actif : ${targetId}`);
            
            console.log("Mise à jour réussie pour :", targetId);
          } catch (updateError: any) {
            console.error("Erreur spécifique lors de la mise à jour :", updateError);
            throw updateError;
          }
        } else {
          console.log("Tentative de création d'un nouveau document dans la collection :", colName);
          try {
            const docRef = await addDoc(collection(db, colName), dataToSave);
            await logAdminAction('CREATE', colName, `Création d'un nouvel actif : ${docRef.id}`);
            console.log("Création réussie, nouvel ID :", docRef.id);
          } catch (addError: any) {
            console.error("Erreur spécifique lors de addDoc :", addError);
            throw addError;
          }
        }
        
        console.log("Enregistrement réussi !");
        return true;
      })();

      // On attend soit l'opération, soit le timeout
      await Promise.race([saveOperation, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      
      setStatusMessage({ type: 'success', text: "ACTIF ENREGISTRÉ AVEC SUCCÈS." });
      setTimeout(() => setModalMode(null), 1500);
    } catch (error: any) { 
      if (timeoutId) clearTimeout(timeoutId);
      console.error("Erreur complète lors de l'enregistrement :", error);
      
      let errorMessage = "ERREUR LORS DE L'ENREGISTREMENT.";
      if (error.code === 'permission-denied') {
        errorMessage = "ACCÈS REFUSÉ : Vos privilèges ne permettent pas d'écrire dans cette collection.";
      } else if (error.message && error.message.includes('offline')) {
        errorMessage = "ERREUR RÉSEAU : Impossible de contacter les serveurs Firebase.";
      } else if (error.message && error.message.includes('DÉLAI')) {
        errorMessage = error.message;
      }
      
      setStatusMessage({ type: 'error', text: errorMessage });
    } finally { 
      setIsProcessing(false); 
    }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!isSuperAdmin) return alert("ACTION RÉSERVÉE");
    if (window.confirm("CONFIRMER ?")) {
      await deleteDoc(doc(db, col, id));
      await logAdminAction('DELETE', col, `Suppression de l'actif : ${id}`);
    }
  };

  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [adminNote, setAdminNote] = useState('');

  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [quoteUrl, setQuoteUrl] = useState('');

  const handleUpdateQuoteStatus = async (id: string, newStatus: 'pending' | 'sent' | 'rejected', url?: string) => {
    setIsProcessing(true);
    try {
      const quoteRef = doc(db, "quotes", id);
      const updateData: any = { status: newStatus, updatedAt: new Date().toISOString() };
      if (url) updateData.quoteUrl = url;
      
      await updateDoc(quoteRef, updateData);
      
      setSelectedQuote(null);
      setQuoteUrl('');
      setStatusMessage({ type: 'success', text: `DEVIS MIS À JOUR : ${newStatus.toUpperCase()}` });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      console.error("Erreur mise à jour devis:", error);
      setStatusMessage({ type: 'error', text: "ERREUR LORS DE LA MISE À JOUR DU DEVIS." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTransactionStatus = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    console.log("Mise à jour transaction :", id, "vers le statut :", newStatus);
    try {
      if (newStatus === 'failed') {
        if (window.confirm("Êtes-vous sûr de vouloir REJETER et SUPPRIMER cette transaction ?")) {
          await deleteDoc(doc(db, "transactions", id));
          await logAdminAction('REJECT_TRANSACTION', 'transactions', `Rejet et suppression de la transaction : ${id}`);
          setSelectedTransaction(null);
          setStatusMessage({ type: 'success', text: "TRANSACTION REJETÉE ET SUPPRIMÉE." });
          setTimeout(() => setStatusMessage(null), 5000);
        }
        return;
      }

      const transRef = doc(db, "transactions", id);
      await updateDoc(transRef, { 
        status: newStatus,
        adminNote: adminNote,
        updatedAt: new Date().toISOString()
      });
      await logAdminAction('UPDATE_TRANSACTION', 'transactions', `Mise à jour du statut : ${newStatus} pour la transaction : ${id}`);
      
      // Mise à jour de l'accès client
      if (newStatus === 'completed' && selectedTransaction) {
        console.log("Accès client débloqué pour :", selectedTransaction.userEmail);
        // On pourrait ici notifier le système interne si nécessaire
      }

      console.log("Transaction mise à jour avec succès !");
      setSelectedTransaction(null);
      setAdminNote('');
      
      const statusLabel = newStatus === 'completed' ? 'VALIDÉE' : newStatus === 'processing' ? 'MISE EN COURS' : 'MISE EN ATTENTE';
      const message = newStatus === 'completed' 
        ? "TRANSACTION VALIDÉE ! L'ACCÈS DU CLIENT EST DÉBLOQUÉ." 
        : `TRANSACTION ${statusLabel}.`;
        
      setStatusMessage({ type: 'success', text: message });
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      console.error("Erreur mise à jour transaction:", error);
      alert("ERREUR LORS DE LA MISE À JOUR DE LA TRANSACTION.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulation d'envoi d'email (À remplacer par un service réel comme SendGrid ou Firebase Functions)
  const sendConfirmationEmail = async (transaction: any) => {
    console.log("--- SIMULATION ENVOI EMAIL ---");
    console.log(`Destinataire : ${transaction.userEmail}`);
    console.log(`Sujet : Confirmation de votre acquisition - ${transaction.resourceTitle}`);
    console.log(`Corps du mail :
      Bonjour,
      
      Nous avons le plaisir de vous confirmer que votre paiement pour la ressource "${transaction.resourceTitle}" a été validé avec succès.
      
      Vous pouvez dès à présent télécharger votre document depuis votre espace client sur notre plateforme.
      
      BONUS EXCLUSIF :
      En tant que client privilégié, vous avez désormais accès à des documents bonus liés à votre achat directement dans votre compte. Ces ressources complémentaires ont été sélectionnées pour maximiser l'impact de votre acquisition.
      
      Merci de votre confiance.
      
      Note : Si vous rencontrez un problème d'accès, n'hésitez pas à contacter notre service client (réponse sous 1h).
      
      CONTACTS SUPPORT :
      Email : COMMERCIAL@CANTIC-THINK-IA.work
      WhatsApp/Wave : +225 0544869313
      Tel : +225 25 22 00 12 39
      
      L'équipe Stratégique CANTIC
    `);
    console.log("------------------------------");
    
    // Dans une implémentation réelle, on appellerait une API ici
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled', link?: string) => {
     const data: any = { status };
     if (link) data.meetingLink = link;
     await updateDoc(doc(db, "appointments", id), data);
     await logAdminAction('UPDATE_APPOINTMENT', 'appointments', `Mise à jour du statut : ${status} pour le rendez-vous : ${id}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': case 'Souverain': return 'bg-amber-500 text-white border-amber-400 shadow-amber-500/20';
      case 'Consultant': return 'bg-emerald-500 text-white border-emerald-400 shadow-amber-500/20';
      default: return 'bg-slate-700 text-slate-300 border-slate-600 shadow-slate-900/20';
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-16 h-16 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/50">Synchronisation des protocoles...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header Unifié */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <h1 className="text-4xl font-serif font-black italic text-slate-950 tracking-tighter">
            {activeTab === 'overview' ? 'Vue d\'ensemble' : 
             activeTab === 'agenda' ? 'Agenda Expert' :
             activeTab === 'cases' ? 'Réalisations' :
             activeTab === 'training' ? 'Formations' :
             activeTab === 'library' ? 'Boutique' :
             activeTab === 'blog' ? 'Réflexions' :
             activeTab === 'transactions' ? 'Flux Financiers' :
             activeTab === 'newsletter' ? 'Communication' :
             activeTab === 'gouvernance' ? 'Gouvernance' : 'Administration'}
          </h1>
          <p className="text-slate-400 text-sm font-light mt-2 italic">« Gestion des protocoles et actifs numériques. »</p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center relative hover:bg-slate-50 transition-all shadow-sm"
            >
              <Bell className="w-6 h-6 text-slate-400" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl z-[110] overflow-hidden"
                >
                  <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Alertes Stratégiques</h4>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center text-slate-400 italic text-sm">
                        Aucune alerte pour le moment.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer ${!n.read ? 'bg-emerald-50/30' : ''}`}
                            onClick={() => {
                              setNotifications(notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif));
                            }}
                          >
                            <div className="flex gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-emerald-100 text-primary'
                              }`}>
                                {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                                 n.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 mb-1">{n.title}</p>
                                <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{n.message}</p>
                                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                                  {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => setNotifications([])}
                      className="w-full p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border-t border-slate-50"
                    >
                      Effacer tout l'historique
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher un actif..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] outline-none text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 transition-all" 
            />
          </div>

          {['cases', 'training', 'library', 'blog', 'gouvernance'].includes(activeTab) && (
            <div className="flex items-center gap-4 w-full md:w-auto">
              {activeTab === 'library' && (
                <>
                  <button 
                    onClick={seedSecondEbook}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none px-8 py-5 bg-emerald-50 border border-emerald-100 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                    Ebook 2
                  </button>
                  <button 
                    onClick={seedThirdEbook}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none px-8 py-5 bg-emerald-50 border border-emerald-100 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                    Ebook 3
                  </button>
                  <button 
                    onClick={seedFourthEbook}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none px-8 py-5 bg-emerald-50 border border-emerald-100 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                    Ebook 4
                  </button>
                  <button 
                    onClick={seedFifthEbook}
                    disabled={isProcessing}
                    className="flex-1 md:flex-none px-8 py-5 bg-emerald-50 border border-emerald-100 text-primary rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-100 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                    Ebook 5
                  </button>
                </>
              )}
                <button 
                  onClick={handleSeed}
                  disabled={isProcessing}
                  className="flex-1 md:flex-none px-8 py-5 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                  Générer
                </button>
              <button 
                onClick={() => handleOpenModal('add')} 
                className="flex-1 md:flex-none px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-primary transition-all shadow-xl shadow-slate-950/20"
              >
                <Plus className="w-5 h-5" /> Nouveau
              </button>
            </div>
          )}
        </div>
      </div>

      {statusMessage && !modalMode && (
        <div className={`mb-12 p-8 rounded-[2.5rem] text-sm font-bold flex items-center gap-6 animate-fade-in shadow-xl shadow-slate-200/20 ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
          'bg-emerald-50 text-primary border border-emerald-100'
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : 
             statusMessage.type === 'error' ? <AlertCircle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <p className="uppercase tracking-widest text-[10px] opacity-60 mb-1">
              {statusMessage.type === 'success' ? 'Succès' : 
               statusMessage.type === 'error' ? 'Erreur' : 'Information'}
            </p>
            <p className="text-base font-serif italic">{statusMessage.text}</p>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-4 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {activeTab === 'newsletter' && (
        <div className="flex flex-wrap gap-4 mb-12">
          <button onClick={() => setNewsletterSubTab('audience')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newsletterSubTab === 'audience' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Audience</button>
          <button onClick={() => setNewsletterSubTab('messages')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newsletterSubTab === 'messages' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>
            Messages {contacts.filter((m: any) => m.status === 'new').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[8px]">
                {contacts.filter((m: any) => m.status === 'new').length}
              </span>
            )}
          </button>
          <button onClick={() => setNewsletterSubTab('compose')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newsletterSubTab === 'compose' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Rédiger une Note</button>
          <button onClick={() => setNewsletterSubTab('history')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newsletterSubTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Historique des Envois</button>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="flex flex-wrap gap-4 mb-12">
          <button onClick={() => setTrainingSubTab('courses')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${trainingSubTab === 'courses' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Catalogue</button>
          <button onClick={() => setTrainingSubTab('registrations')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${trainingSubTab === 'registrations' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}>Pré-inscriptions ({registrations.length})</button>
        </div>
      )}

      {activeTab === 'overview' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-cantic-dark p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl font-light tracking-tight mb-4">
                Ravi de vous revoir, <span className="font-semibold text-primary">{userName}</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Votre plateforme est à jour. Voici un aperçu rapide de l'activité stratégique de votre écosystème digital aujourd'hui.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveTab('blog')}
                  className="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all"
                >
                  Publier un article
                </button>
                <button 
                  onClick={() => setActiveTab('training')}
                  className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all"
                >
                  Nouvelle formation
                </button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mb-12" />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Revenus (Est.)', value: `${revenue.toLocaleString()} FCFA`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Rendez-vous', value: `${appointments.filter(a => a.status === 'pending').length} en attente`, icon: Clock, color: 'text-primary', bg: 'bg-emerald-50' },
              { label: 'Audience Communication', value: `${subscribers.length} abonnés`, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Inscriptions Formations', value: `${registrations.length} ce mois`, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-serif font-black italic text-slate-900">Flux de Revenus (7j)</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl">
                    <TrendingUp className="w-3 h-3" /> +12% vs semaine dernière
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                        tickFormatter={(value) => `${value / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-serif font-black italic text-slate-900 mb-10">Répartition Agenda</h3>
                <div className="h-[300px] w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={appointmentsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {appointmentsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-4 w-full mt-6">
                    {appointmentsByStatus.map((s, i) => (
                      <div key={i} className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.name}</p>
                        <p className="text-lg font-bold text-slate-900">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Latest Transactions */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif font-black italic text-slate-900">Dernières Transactions</h3>
                <button onClick={() => setActiveTab('transactions')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Tout voir</button>
              </div>
              <div className="space-y-6">
                {transactions.slice(0, 5).map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => {
                      if (isSuperAdmin) {
                        setSelectedTransaction(t);
                        setAdminNote(t.adminNote || '');
                      }
                    }}
                    className={`flex items-center justify-between p-6 rounded-3xl transition-all border border-transparent ${isSuperAdmin ? 'cursor-pointer hover:bg-slate-50 hover:border-slate-100' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t.resourceTitle || t.userEmail}</p>
                        <p className="text-xs text-slate-500 font-medium">{new Date(t.createdAt).toLocaleDateString()} • {t.status}</p>
                      </div>
                    </div>
                    <p className="font-bold text-emerald-600">+{t.amount.toLocaleString()} FCFA</p>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-center text-slate-400 py-10 italic">Aucune transaction récente.</p>}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-serif font-black italic text-slate-900">Prochains Rendez-vous</h3>
                <button onClick={() => setActiveTab('agenda')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Agenda complet</button>
              </div>
              <div className="space-y-6">
                {appointments.filter(a => a.status === 'confirmed').slice(0, 5).map((rdv) => {
                  const d = new Date(rdv.date);
                  return (
                    <div key={rdv.id} className="flex items-center gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex flex-col items-center justify-center border border-emerald-100">
                        <span className="text-[10px] font-black uppercase text-primary">{d.toLocaleDateString('fr-FR', { day: 'numeric' })}</span>
                        <span className="text-xs font-serif font-bold text-cantic-dark">{d.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{rdv.userName}</p>
                        <p className="text-xs text-slate-500 font-medium">{rdv.time} • {rdv.service.split('(')[0]}</p>
                      </div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                  );
                })}
                {appointments.filter(a => a.status === 'confirmed').length === 0 && (
                  <p className="text-center text-slate-400 py-10 italic">Aucun rendez-vous confirmé.</p>
                )}
              </div>
            </div>
          </div>

          {/* Strategic Actions Section */}
          <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-slate-900 to-slate-950 p-16 text-white shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl text-center md:text-left">
                <h3 className="text-4xl font-serif font-black italic mb-6">Actions Stratégiques</h3>
                <p className="text-slate-400 text-lg font-light leading-relaxed mb-10">
                  Optimisez votre impact en publiant du contenu frais ou en lançant de nouveaux programmes de formation.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <button onClick={() => setActiveTab('blog')} className="px-10 py-5 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary/80 transition-all shadow-xl shadow-primary/20">Publier un Article</button>
                  <button onClick={() => setActiveTab('training')} className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Nouvelle Formation</button>
                </div>
              </div>
              <div className="w-48 h-48 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <Activity className="w-24 h-24 text-primary" />
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'agenda' ? (
           <div className="space-y-12 animate-fade-in">
              <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                 <div className="relative z-10">
                    <h3 className="text-3xl font-serif font-black italic text-white mb-2">Expert Agenda</h3>
                    <p className="text-slate-400 font-light text-sm">Gestionnaire de sessions stratégiques pour : <span className="text-primary font-bold">CANTIC-THINK-IA@gmail.com</span></p>
                 </div>
                 <div className="flex gap-4 relative z-10">
                    {['pending', 'confirmed', 'cancelled'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setAgendaSubTab(tab as any)}
                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${agendaSubTab === tab ? 'bg-primary text-white shadow-lg' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                      >
                        {tab === 'pending' ? 'En attente' : tab === 'confirmed' ? 'Confirmés' : 'Annulés'}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredData.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-serif italic">Aucune session dans cette catégorie.</p>
                  </div>
                ) : filteredData.map((rdv: any) => {
                  const dateObj = new Date(rdv.date);
                  const isPending = rdv.status === 'pending';
                  return (
                    <div key={rdv.id} className={`p-10 rounded-[3rem] border shadow-sm relative group overflow-hidden ${
                      isPending ? 'bg-amber-50 border-amber-100' : rdv.status === 'confirmed' ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-100 opacity-60'
                    }`}>
                       <div className="flex justify-between items-start mb-8">
                          <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {rdv.service.split('(')[0]}
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            isPending ? 'bg-amber-100 text-amber-600' : rdv.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {rdv.status}
                          </span>
                       </div>
                       
                       <div className="flex items-center gap-4 mb-6">
                         <div className="w-16 h-16 rounded-2xl bg-white flex flex-col items-center justify-center shadow-md border border-slate-100">
                            <span className="text-[9px] font-black uppercase text-slate-400">{dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                            <span className="text-xl font-serif font-bold text-slate-900">{dateObj.getDate()}</span>
                         </div>
                         <div>
                            <p className="text-2xl font-serif font-bold text-slate-900">{rdv.time}</p>
                            <p className="text-xs text-slate-500 font-medium">{dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
                         </div>
                       </div>

                       <div className="space-y-3 mb-8 pb-8 border-b border-slate-200/50">
                          <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                            <User className="w-4 h-4 text-primary" /> {rdv.userName}
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 text-sm">
                            <Briefcase className="w-4 h-4 text-primary" /> {rdv.clientInstitution}
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 text-sm">
                            <Mail className="w-4 h-4 text-primary" /> {rdv.userEmail}
                          </div>
                       </div>

                       {isPending ? (
                         <div className="space-y-3">
                            <input 
                              placeholder="Lien Google Meet / Zoom..." 
                              className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20"
                              id={`link-${rdv.id}`}
                            />
                            <div className="flex gap-2">
                               <button 
                                onClick={() => {
                                  const linkInput = document.getElementById(`link-${rdv.id}`) as HTMLInputElement;
                                  updateAppointmentStatus(rdv.id, 'confirmed', linkInput.value || 'https://meet.google.com/new');
                                }}
                                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                               >
                                 Confirmer
                               </button>
                               <button 
                                onClick={() => updateAppointmentStatus(rdv.id, 'cancelled')}
                                className="px-4 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500 hover:border-red-200 transition-colors"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                       ) : rdv.status === 'confirmed' ? (
                          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                             <p className="text-[9px] font-black uppercase text-emerald-600 mb-2">Lien de connexion</p>
                             <a href={rdv.meetingLink} target="_blank" className="text-xs font-bold text-slate-700 truncate block hover:text-emerald-600 hover:underline">{rdv.meetingLink || 'Non défini'}</a>
                          </div>
                       ) : null}
                    </div>
                  );
                })}
              </div>
           </div>
        ) : activeTab === 'cases' ? (
          <div className="space-y-12 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-black italic text-slate-900">Réalisations Stratégiques</h3>
              <button 
                onClick={() => { setModalMode('add'); setFormData({}); }}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-primary transition-all shadow-xl"
              >
                Nouvelle Réalisation
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredData.map((item: any) => (
                <div key={item.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    {item.logoUrl ? (
                      <img src={item.logoUrl} alt={item.client} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Briefcase className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button onClick={() => { setModalMode('edit'); setTargetId(item.id); setFormData(item); setLogoPreview(item.logoUrl); }} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-primary shadow-lg transition-all">
                        <User className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteItem('cases', item.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-slate-600 hover:text-red-500 shadow-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-10">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block">{item.sector}</span>
                    <h4 className="text-xl font-serif font-bold text-slate-900 mb-4 leading-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 italic">« {item.description} »</p>
                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.client}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'newsletter' && newsletterSubTab === 'compose' ? (
           <div className="max-w-4xl animate-fade-in">
             <div className="bg-white p-12 md:p-20 rounded-[4rem] border border-slate-100 shadow-2xl">
                <div className="mb-12">
                   <h3 className="text-3xl font-serif font-black italic text-slate-900 mb-4">Composition Stratégique</h3>
                   <p className="text-sm text-slate-400 font-light">Destinataires : {subscribers.length} contacts.</p>
                </div>
                <form onSubmit={handleSendNewsletter} className="space-y-10">
                   <div className="space-y-3">
                      <label className="label-admin">Sujet</label>
                      <input type="text" value={newsletterForm.subject} onChange={e => setNewsletterForm({...newsletterForm, subject: e.target.value})} className="input-admin" required />
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end mb-1">
                        <label className="label-admin">Contenu</label>
                        <button type="button" onClick={handleOptimizeWithAI} disabled={isProcessing || !newsletterForm.content} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all mb-2 mr-4">
                          <Zap className="w-3 h-3" /> Optimiser IA
                        </button>
                      </div>
                      <div className="h-96 mb-12">
                         <ReactQuill 
                            theme="snow"
                            value={newsletterForm.content} 
                            onChange={(value) => setNewsletterForm({...newsletterForm, content: value})}
                            modules={quillModules}
                            className="h-full bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 quill-custom"
                         />
                      </div>
                   </div>
                   <button type="submit" disabled={isProcessing} className="w-full py-8 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-5 hover:bg-primary transition-all shadow-xl">
                     {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />} Expédier
                   </button>
                </form>
             </div>
           </div>
        ) : activeTab === 'newsletter' && newsletterSubTab === 'messages' ? (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Messages de Contact</h3>
                    <span className="px-4 py-2 bg-emerald-50 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{contacts.length} Messages au total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Expéditeur</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Institution</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Message</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {contacts.map((msg: any) => (
                                <tr 
                                    key={msg.id} 
                                    onClick={async () => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'new') {
                                            await updateDoc(doc(db, "contacts", msg.id), { status: 'read' });
                                        }
                                    }}
                                    className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${msg.status === 'new' ? 'bg-emerald-50/30' : ''}`}
                                >
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-slate-900">{msg.name}</p>
                                        <a 
                                            href={`mailto:${msg.email}`} 
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[10px] text-primary hover:underline"
                                        >
                                            {msg.email}
                                        </a>
                                        <p className="text-[9px] text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-10 py-8 text-sm font-bold text-slate-700">{msg.subject}</td>
                                    <td className="px-10 py-8 text-sm text-slate-500 font-medium">{msg.institution || '-'}</td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs text-slate-500 font-light italic max-w-xs truncate" title={msg.message}>
                                            {msg.message}
                                        </p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            msg.status === 'new' ? 'bg-amber-100 text-amber-600' :
                                            msg.status === 'read' ? 'bg-emerald-100 text-primary' :
                                            'bg-emerald-100 text-emerald-600'
                                        }`}>
                                            {msg.status === 'new' ? 'Nouveau' : 
                                             msg.status === 'read' ? 'Lu' : 'Répondu'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            {msg.status === 'new' && (
                                                <button 
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        await updateDoc(doc(db, "contacts", msg.id), { status: 'read' });
                                                    }}
                                                    className="p-2 bg-emerald-50 text-primary rounded-lg hover:bg-emerald-100 transition-all"
                                                    title="Marquer comme lu"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.confirm("Supprimer ce message ?")) {
                                                        deleteDoc(doc(db, "contacts", msg.id));
                                                    }
                                                }} 
                                                className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-10 py-20 text-center text-slate-400 italic">Aucun message reçu.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'training' && trainingSubTab === 'registrations' ? (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Pré-inscriptions Académie</h3>
                    <span className="px-4 py-2 bg-emerald-50 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{registrations.length} Demandes</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidat</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Formation</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Institution</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Besoins</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {registrations.map((reg: any) => (
                                <tr key={reg.id} className="hover:bg-slate-50/50">
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-slate-900">{reg.name}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(reg.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{reg.courseTitle}</span>
                                    </td>
                                    <td className="px-10 py-8 text-sm font-medium text-slate-600">{reg.institution}</td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-1">
                                            <a href={`mailto:${reg.email}`} className="text-xs text-primary hover:underline flex items-center gap-2"><Mail className="w-3 h-3" /> {reg.email}</a>
                                            <a href={`tel:${reg.phone}`} className="text-xs text-slate-400 flex items-center gap-2"><Phone className="w-3 h-3" /> {reg.phone}</a>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-xs text-slate-500 font-light italic max-w-xs truncate" title={reg.specificNeeds}>
                                            {reg.specificNeeds || 'Aucun besoin spécifié'}
                                        </p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <button onClick={() => deleteDoc(doc(db, "registrations", reg.id))} className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'newsletter' && newsletterSubTab === 'history' ? (
            <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-100">
                    <h3 className="text-2xl font-serif font-bold text-slate-900">Historique des Campagnes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sujet</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Audience</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Auteur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {campaigns.map((camp: any) => (
                                <tr key={camp.id} className="hover:bg-slate-50/50">
                                    <td className="px-10 py-8 text-sm font-bold">{new Date(camp.sentAt).toLocaleDateString()}</td>
                                    <td className="px-10 py-8 text-sm font-bold">{camp.subject}</td>
                                    <td className="px-10 py-8 text-sm">{camp.recipientsCount} abonnés</td>
                                    <td className="px-10 py-8 text-sm">{camp.author}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : activeTab === 'transactions' || (activeTab === 'newsletter' && newsletterSubTab === 'audience') ? (
          <div className="space-y-12 animate-fade-in">
             {activeTab === 'transactions' && (
               <div className="flex gap-4 mb-8">
                 {['all', 'pending', 'completed'].map((tab) => (
                   <button 
                     key={tab}
                     onClick={() => setTransactionSubTab(tab as any)}
                     className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${transactionSubTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                   >
                     {tab === 'all' ? 'Toutes' : tab === 'pending' ? 'En attente' : 'Validées'}
                   </button>
                 ))}
               </div>
             )}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {activeTab === 'transactions' ? (
                 <>
                   <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Volume Total</p>
                      <p className="text-4xl font-serif font-black text-slate-900">{transactions.length}</p>
                   </div>
                   <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                        <Banknote className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chiffre d'Affaires</p>
                      <p className="text-4xl font-serif font-black text-slate-900">{revenue.toLocaleString()} FCFA</p>
                   </div>
                   <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                        <Clock className="w-6 h-6" />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">En Attente</p>
                      <p className="text-4xl font-serif font-black text-slate-900">{pendingTransactions}</p>
                   </div>
                 </>
               ) : (
                 <div className="p-12 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm group hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mb-8 group-hover:bg-emerald-50 group-hover:text-primary transition-all">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Audience Totale</p>
                    <p className="text-5xl font-serif font-black text-slate-900 tracking-tighter">{subscribers.length}</p>
                 </div>
               )}
             </div>
             
             <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50/50 border-b border-slate-100">
                     <tr>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                       {activeTab === 'transactions' && <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Référence</th>}
                       {activeTab === 'transactions' && <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Ressource</th>}
                       {activeTab === 'transactions' && <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>}
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                       <th className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {filteredData.map((item: any) => (
                       <tr key={item.id} className="hover:bg-slate-50/50">
                         <td className="px-10 py-10 text-sm font-bold text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                         <td className="px-10 py-10">
                            <div className="text-sm font-bold text-slate-900">
                              {item.firstName && <span className="text-primary mr-2">{item.firstName}</span>}
                              {item.userEmail || item.email}
                            </div>
                            {item.userPhone && <div className="text-xs text-slate-400 font-mono mt-1">{item.userPhone}</div>}
                         </td>
                         {activeTab === 'transactions' && (
                           <td className="px-10 py-10">
                             <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary bg-emerald-50 px-3 py-1 rounded-lg w-fit">
                               <Hash className="w-3 h-3" /> {item.referenceNumber || 'N/A'}
                             </div>
                           </td>
                         )}
                         {activeTab === 'transactions' && <td className="px-10 py-10 text-sm font-medium text-slate-600">{item.resourceTitle || item.source}</td>}
                         {activeTab === 'transactions' && <td className="px-10 py-10 text-sm font-bold text-slate-900">{item.amount}</td>}
                         
                         <td className="px-10 py-10">
                            {activeTab === 'transactions' ? (
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                    item.status === 'processing' ? 'bg-emerald-100 text-primary' :
                                    item.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                    {item.status === 'completed' ? 'Validé' : 
                                     item.status === 'processing' ? 'En cours' :
                                     item.status === 'pending' ? 'En attente' : 'Échoué'}
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-600">Actif</span>
                            )}
                         </td>
                         
                         <td className="px-10 py-10">
                            <div className="flex items-center gap-3">
                                {activeTab === 'transactions' && isSuperAdmin && (
                                    <button 
                                      onClick={() => {
                                        setSelectedTransaction(item);
                                        setAdminNote(item.adminNote || '');
                                      }}
                                      className="p-2 bg-slate-900 text-white rounded-lg hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
                                      title="Gérer la transaction"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => deleteItem(activeTab === 'newsletter' ? 'subscribers' : 'transactions', item.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        ) : activeTab === 'quotes' ? (
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Demandes de Devis (Offres Directes)</h3>
              <span className="px-4 py-2 bg-emerald-50 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest">{quotes.length} Demandes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Services</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Budget Total</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50/50">
                      <td className="px-10 py-8">
                        <p className="text-sm font-bold text-slate-900">{quote.userEmail}</p>
                        <p className="text-[10px] text-slate-400">{new Date(quote.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-wrap gap-2">
                          {quote.services.map((s, idx) => (
                            <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">
                              {s.serviceName} ({s.budget}€)
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-sm font-bold text-slate-900">
                        {quote.services.reduce((acc, s) => acc + s.budget, 0)} €
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                          quote.status === 'sent' ? 'bg-emerald-100 text-emerald-600' :
                          quote.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {quote.status === 'sent' ? 'Envoyé' : 
                           quote.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              setSelectedQuote(quote);
                              setQuoteUrl(quote.quoteUrl || '');
                            }}
                            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-primary transition-all shadow-lg shadow-slate-900/10"
                            title="Gérer le devis"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteDoc(doc(db, "quotes", quote.id!))} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic">Aucune demande de devis pour le moment.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'gouvernance' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 p-10 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif font-black italic text-white">Protocole de Gouvernance</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Souverain</p>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Contrôle total de l'infrastructure. Capacité de révocation des accès et gestion des paramètres critiques du système.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Super Admin</p>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Gestion complète des actifs (Réalisations, Formations, Boutique) et des flux financiers. Supervision opérationnelle.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyste</p>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">Accès en lecture et gestion limitée des contenus. Analyse des performances et remontée d'informations stratégiques.</p>
                    </div>
                  </div>

                  <div className="mt-10 pt-10 border-t border-slate-800 flex gap-4">
                    <button 
                      onClick={() => setGovernanceSubTab('admins')}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${governanceSubTab === 'admins' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      Administrateurs
                    </button>
                    <button 
                      onClick={() => setGovernanceSubTab('audit')}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${governanceSubTab === 'audit' ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      Journal d'Audit
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'gouvernance' && governanceSubTab === 'audit' ? (
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">Journal d'Audit Stratégique</h3>
                  <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">{auditLogs.length} Entrées</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date et Heure</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrateur</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Cible</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-10 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-slate-900">{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <p className="text-xs font-bold text-slate-900">{log.adminName}</p>
                            <p className="text-[10px] text-slate-400">{log.adminEmail}</p>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-600' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                              log.action === 'UPDATE' ? 'bg-emerald-100 text-primary' :
                              log.action === 'SEED' ? 'bg-purple-100 text-purple-600' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {log.action === 'CREATE' ? 'Création' : 
                               log.action === 'UPDATE' ? 'Modification' : 
                               log.action === 'DELETE' ? 'Suppression' : 
                               log.action === 'SEED' ? 'Génération' : log.action}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-xs font-medium text-slate-600 uppercase tracking-wider">
                            {log.target === 'cases' ? 'Réalisations' :
                             log.target === 'formations' ? 'Formations' :
                             log.target === 'resources' ? 'Boutique' :
                             log.target === 'posts' ? 'Blog' :
                             log.target === 'admins' ? 'Administrateurs' :
                             log.target === 'appointments' ? 'Rendez-vous' :
                             log.target === 'transactions' ? 'Transactions' : log.target}
                          </td>
                          <td className="px-10 py-6 text-xs text-slate-500 italic font-light">
                            {log.details || '-'}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic">Aucun journal d'audit disponible.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredData.map((item: any) => (
              <div key={item.id} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm group relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="flex justify-between items-start mb-10">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{item.badge || item.level || item.date || item.client || item.email}</span>
                  <div className="flex gap-3">
                    {activeTab === 'training' && (
                      <button 
                        onClick={() => handleGenerateBlogFromTraining(item)} 
                        disabled={isProcessing}
                        className="p-4 bg-emerald-50 text-primary hover:bg-emerald-100 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Générer un article de blog"
                      >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    )}
                    {activeTab === 'library' && (
                      <button 
                        onClick={() => {
                          const link = `${window.location.origin}/#/boutique?resource=${item.slug || item.id}`;
                          navigator.clipboard.writeText(link);
                          setStatusMessage({ type: 'success', text: "LIEN COPIÉ DANS LE PRESSE-PAPIER !" });
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="p-4 bg-emerald-50 text-primary hover:bg-emerald-100 rounded-2xl transition-all"
                        title="Copier le lien direct"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleOpenModal('edit', item)} className="p-4 bg-slate-50 text-slate-400 hover:text-primary hover:bg-emerald-50 rounded-2xl transition-all"><Pencil className="w-4 h-4" /></button>
                    {isSuperAdmin && <button onClick={() => deleteItem(activeTab === 'library' ? 'resources' : activeTab === 'training' ? 'formations' : activeTab === 'blog' ? 'posts' : activeTab === 'gouvernance' ? 'admins' : 'cases', item.id)} className="p-4 bg-red-50 text-slate-400 hover:text-red-600 rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>}
                  </div>
                </div>
                <h4 className="text-2xl font-serif font-black text-slate-900 mb-6 group-hover:text-primary transition-colors">{item.title_professional || item.title || item.name || item.email}</h4>
                <p className="text-sm text-slate-500 font-light line-clamp-3 mb-10 leading-relaxed italic">{item.description ? `« ${item.description.slice(0, 100)}... »` : item.excerpt || item.benefit_micro || item.impact || item.source || item.role}</p>
                <div className="pt-8 border-t border-slate-50 flex justify-between items-center text-primary font-serif font-bold italic">
                  {item.price || item.typeLabel || item.target || item.status || item.source}
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

      {modalMode && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
            <div className="w-full max-w-5xl bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative my-auto animate-scale-in">
               <div className="flex justify-between items-center mb-20">
                  <h3 className="text-5xl font-serif font-black italic text-slate-950">
                    Configuration {
                      activeTab === 'cases' ? 'Réalisations' :
                      activeTab === 'training' ? 'Formations' :
                      activeTab === 'library' ? 'Boutique' :
                      activeTab === 'blog' ? 'Blog' :
                      activeTab === 'gouvernance' ? 'Gouvernance' :
                      activeTab.toUpperCase()
                    }
                  </h3>
                  <button onClick={() => setModalMode(null)} className="w-20 h-20 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all"><X className="w-8 h-8" /></button>
               </div>
               <form onSubmit={handleSave} className="space-y-16">
                 {statusMessage && (
                   <div className={`p-6 rounded-2xl text-sm font-bold flex items-center gap-4 animate-fade-in ${
                     statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                     statusMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' :
                     'bg-emerald-50 text-primary border border-emerald-100'
                   }`}>
                     {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                      statusMessage.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                     {statusMessage.text}
                   </div>
                 )}
                 {activeTab === 'gouvernance' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4"><label className="label-admin">Nom</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-admin" required /></div>
                        <div className="space-y-4"><label className="label-admin">Email</label><input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-admin" required /></div>
                        <div className="space-y-4"><label className="label-admin">Rôle</label><select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input-admin"><option value="Analyste">Analyste</option><option value="Consultant">Consultant</option><option value="Super Admin">Super Admin</option></select></div>
                        <div className="space-y-4"><label className="label-admin">Mot de passe</label><input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-admin" required /></div>
                     </div>
                 )}

                 {activeTab === 'blog' && (
                    <div className="space-y-4">
                      <label className="label-admin">Titre</label>
                      <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-admin" required />
                      <div className="flex justify-between items-end mb-1 mt-4">
                        <label className="label-admin">Contenu (Éditeur Riche)</label>
                        <button type="button" onClick={handleOptimizeWithAI} disabled={isProcessing} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all mb-2 mr-4">
                          <Zap className="w-3 h-3" /> Optimiser IA
                        </button>
                      </div>
                      <div className="h-96 mb-12">
                         <ReactQuill 
                            theme="snow"
                            value={formData.content} 
                            onChange={(value) => setFormData({...formData, content: value})}
                            modules={quillModules}
                            className="h-full bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 quill-custom"
                         />
                      </div>
                      <label className="label-admin mt-4">Extrait (Court)</label>
                      <input value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="input-admin" required />
                      
                      <div className="space-y-2 mt-6">
                          <label className="label-admin">Photo de Couverture</label>
                          <div className="relative overflow-hidden w-full">
                              <input type="file" onChange={handleBlogImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                              <div className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                                  {blogImagePreview || formData.imageUrl ? (
                                      <img src={blogImagePreview || formData.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                  ) : (
                                      <>
                                          <ImageIcon className="w-8 h-8 text-primary" />
                                          <span>Téléverser une photo de couverture</span>
                                      </>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2 mt-6">
                          <label className="label-admin">Brochure et Programme (PDF)</label>
                          <div className="relative overflow-hidden w-full">
                              <input type="file" onChange={handleBlogBrochureChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                              <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
                                  <UploadCloud className="w-8 h-8 text-primary" />
                                  <span className="text-center px-4">
                                      {blogBrochureFile ? blogBrochureFile.name : (formData.brochureUrl ? "Remplacer la brochure PDF" : "Téléverser une brochure PDF")}
                                  </span>
                              </div>
                          </div>
                          {formData.brochureUrl && !blogBrochureFile && <p className="text-xs text-emerald-500 font-bold mt-2 ml-4">✓ Brochure actuelle disponible</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="space-y-2">
                          <label className="label-admin">Lien d'Action (CTA)</label>
                          <input value={formData.ctaLink || ''} onChange={e => setFormData({...formData, ctaLink: e.target.value})} className="input-admin" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                          <label className="label-admin">Nom du Lien (CTA)</label>
                          <input value={formData.ctaLabel || ''} onChange={e => setFormData({...formData, ctaLabel: e.target.value})} className="input-admin" placeholder="S'inscrire à la formation" />
                        </div>
                      </div>
                    </div>
                 )}

                 {activeTab === 'cases' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Titre du Cas</label>
                                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-admin" required />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Client</label>
                                <input value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="input-admin" required />
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="label-admin">Logo Client / Visuel Hero</label>
                             <div className="flex items-center gap-4">
                                <div className="relative overflow-hidden w-full">
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" id="logo-upload" />
                                    <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-400 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
                                        <UploadCloud className="w-5 h-5" />
                                        {logoFile ? logoFile.name : (formData.logoUrl ? "Changer le visuel" : "Téléverser un visuel")}
                                    </div>
                                </div>
                                {(logoPreview || formData.logoUrl) && (
                                    <div className="w-20 h-20 bg-slate-50 rounded-xl border border-slate-100 p-2 flex-shrink-0">
                                        <img src={logoPreview || formData.logoUrl} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                             </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-admin">Défi (Challenge)</label>
                            <textarea value={formData.challenge} onChange={e => setFormData({...formData, challenge: e.target.value})} className="textarea-admin h-32" required />
                        </div>
                        <div className="space-y-2">
                            <label className="label-admin">Solution Apportée</label>
                            <textarea value={formData.solution} onChange={e => setFormData({...formData, solution: e.target.value})} className="textarea-admin h-32" required />
                        </div>
                        <div className="space-y-2">
                            <label className="label-admin">Impact (ROI)</label>
                            <textarea value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} className="textarea-admin h-32" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                             <div className="space-y-2">
                                <label className="label-admin">Statut</label>
                                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-admin">
                                    <option value="Existant">Existant</option>
                                    <option value="En développement">En développement</option>
                                    <option value="Phase Pilote">Phase Pilote</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="label-admin">URL Application</label>
                                <input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="input-admin" placeholder="https://..." />
                             </div>
                             <div className="space-y-2">
                                <label className="label-admin">Tags (séparés par virgules)</label>
                                <input value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="input-admin" placeholder="IA, Data, Web..." />
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="label-admin">Ordre d'affichage</label>
                             <input 
                               type="number" 
                               value={formData.order || 0} 
                               onChange={e => {
                                 const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                 setFormData({...formData, order: isNaN(val) ? 0 : val});
                               }} 
                               className="input-admin" 
                             />
                        </div>
                    </div>
                 )}

                 {activeTab === 'library' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Titre de la Ressource</label>
                                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-admin" required />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Lien Personnalisé (Slug)</label>
                                <input value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="input-admin" placeholder="ex: mon-guide-ia" />
                                {formData.slug && <p className="text-[10px] text-primary font-bold ml-4">Lien : /boutique?resource={formData.slug}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Catégorie</label>
                                <select value={formData.category || 'Solutions Opérationnelles'} onChange={e => setFormData({...formData, category: e.target.value})} className="input-admin">
                                    <option value="Solutions Opérationnelles">Solutions Opérationnelles</option>
                                    <option value="Veille et Prospective">Veille et Prospective</option>
                                    <option value="Évasions et Récits">Évasions et Récits</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             <label className="label-admin">Fichier PDF (Ebook / Guide)</label>
                             <div className="relative overflow-hidden w-full">
                                <input type="file" onChange={handleEbookChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                                <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-center gap-3 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
                                    <UploadCloud className="w-6 h-6 text-primary" />
                                    {ebookFile ? ebookFile.name : (formData.fileUrl ? "Remplacer le fichier PDF" : "Téléverser le fichier PDF")}
                                </div>
                             </div>
                             {formData.fileUrl && !ebookFile && <p className="text-xs text-emerald-500 font-bold mt-2 ml-4">✓ Fichier actuel disponible</p>}
                        </div>

                        {/* Bonus Section */}
                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
                            <h5 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <div className="w-8 h-[1px] bg-slate-200"></div>
                                Ressources Bonus Incluses
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="label-admin text-[10px]">Bonus PDF (Résumé)</label>
                                    <div className="relative overflow-hidden w-full">
                                        <input type="file" onChange={handleBonusPdfChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                                        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer">
                                            <UploadCloud className="w-4 h-4 text-primary" />
                                            {bonusPdfFile ? bonusPdfFile.name : (formData.bonusPdfUrl ? "Remplacer PDF Bonus" : "Téléverser le PDF Bonus")}
                                        </div>
                                    </div>
                                    {formData.bonusPdfUrl && !bonusPdfFile && <p className="text-[10px] text-emerald-500 font-bold ml-2">✓ Actuel</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="label-admin text-[10px]">Bonus Image (Résumé)</label>
                                    <div className="relative overflow-hidden w-full">
                                        <input type="file" onChange={handleBonusImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer">
                                            <UploadCloud className="w-4 h-4 text-primary" />
                                            {bonusImageFile ? bonusImageFile.name : (formData.bonusImageUrl ? "Remplacer Image Bonus" : "Téléverser l'image Bonus")}
                                        </div>
                                    </div>
                                    {formData.bonusImageUrl && !bonusImageFile && <p className="text-[10px] text-emerald-500 font-bold ml-2">✓ Actuel</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="label-admin text-[10px]">Bonus Vidéo</label>
                                    <div className="relative overflow-hidden w-full">
                                        <input type="file" onChange={handleBonusVideoChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
                                        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer">
                                            <Video className="w-4 h-4 text-primary" />
                                            {bonusVideoFile ? bonusVideoFile.name : (formData.bonusVideoUrl ? "Remplacer Vidéo Bonus" : "Téléverser la vidéo Bonus")}
                                        </div>
                                    </div>
                                    {formData.bonusVideoUrl && !bonusVideoFile && <p className="text-[10px] text-emerald-500 font-bold ml-2">✓ Actuel</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="label-admin text-[10px]">Bonus Audio</label>
                                    <div className="relative overflow-hidden w-full">
                                        <input type="file" onChange={handleBonusAudioChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="audio/*" />
                                        <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 text-slate-500 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer">
                                            <UploadCloud className="w-4 h-4 text-primary" />
                                            {bonusAudioFile ? bonusAudioFile.name : (formData.bonusAudioUrl ? "Remplacer Audio Bonus" : "Téléverser l'audio Bonus")}
                                        </div>
                                    </div>
                                    {formData.bonusAudioUrl && !bonusAudioFile && <p className="text-[10px] text-emerald-500 font-bold ml-2">✓ Actuel</p>}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Prix (ex: 9 900 FCFA)</label>
                                <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-admin" required />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Nombre de pages</label>
                                <input value={formData.pagesCount} onChange={e => setFormData({...formData, pagesCount: e.target.value})} className="input-admin" />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Ordre d'affichage</label>
                                <input type="number" value={formData.order || 0} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="input-admin" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-admin">Description Stratégique</label>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="textarea-admin h-32" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Public Cible (ex: Décideurs, Coopératives)</label>
                                <input value={formData.targetAudience} onChange={e => setFormData({...formData, targetAudience: e.target.value})} className="input-admin" />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Bénéfices Clés (séparés par virgules)</label>
                                <input value={Array.isArray(formData.keyBenefits) ? formData.keyBenefits.join(', ') : formData.keyBenefits} onChange={e => setFormData({...formData, keyBenefits: e.target.value})} className="input-admin" placeholder="Gain de productivité, Traçabilité..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Badge (ex: INDISPENSABLE)</label>
                                <input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="input-admin" />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Type (ex: GUIDE STRATÉGIQUE)</label>
                                <input value={formData.typeLabel} onChange={e => setFormData({...formData, typeLabel: e.target.value})} className="input-admin" />
                            </div>
                        </div>
                    </div>
                 )}
                 
                  {activeTab === 'training' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Titre Professionnel</label>
                                <input value={formData.title_professional} onChange={e => setFormData({...formData, title_professional: e.target.value})} className="input-admin" required />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Lien Personnalisé (Slug)</label>
                                <input value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="input-admin" placeholder="ex: formation-ia-decideurs" />
                                {formData.slug && <p className="text-[10px] text-primary font-bold ml-4">Lien : /training?course={formData.slug}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="label-admin">Bénéfice Micro (Accroche)</label>
                            <input value={formData.benefit_micro} onChange={e => setFormData({...formData, benefit_micro: e.target.value})} className="input-admin" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Niveau</label>
                                <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="input-admin">
                                    <option value="Débutant">Débutant</option>
                                    <option value="Intermédiaire">Intermédiaire</option>
                                    <option value="Avancé">Avancé</option>
                                    <option value="Expert">Expert</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Prix (ex: 150 000 FCFA)</label>
                                <input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-admin" required />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Durée</label>
                                <input value={formData.curriculum?.duration} onChange={e => setFormData({...formData, curriculum: { ...formData.curriculum, duration: e.target.value }})} className="input-admin" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Places Totales</label>
                                <input 
                                  type="number" 
                                  value={formData.totalSeats || 0} 
                                  onChange={e => setFormData({...formData, totalSeats: parseInt(e.target.value) || 0})} 
                                  className="input-admin" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Taux de Réduction Early Bird (%)</label>
                                <input 
                                  type="number" 
                                  value={formData.discountRate || 0} 
                                  onChange={e => setFormData({...formData, discountRate: parseInt(e.target.value) || 0})} 
                                  className="input-admin" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Date de la formation (ex: 15 Avril 2026)</label>
                                <input value={formData.trainingDate || ''} onChange={e => setFormData({...formData, trainingDate: e.target.value})} className="input-admin" placeholder="Laisser vide pour 'À venir'" />
                            </div>
                            <div className="space-y-2">
                                <label className="label-admin">Lieu (ex: Abidjan, Plateau)</label>
                                <input value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="input-admin" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="label-admin">Cible</label>
                            <input value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="input-admin" required />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="label-admin">Illustration (Visuel)</label>
                                <div className="relative overflow-hidden w-full">
                                    <input type="file" onChange={handleTrainingImageChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer overflow-hidden">
                                        {trainingImagePreview || formData.imageUrl ? (
                                            <img src={trainingImagePreview || formData.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 text-primary" />
                                                <span>Téléverser une illustration</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="label-admin">Plaquette (PDF)</label>
                                <div className="relative overflow-hidden w-full">
                                    <input type="file" onChange={handleBrochureChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                                    <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all cursor-pointer">
                                        <UploadCloud className="w-8 h-8 text-primary" />
                                        <span className="text-center px-4">
                                            {brochureFile ? brochureFile.name : (formData.brochureUrl ? "Remplacer la plaquette PDF" : "Téléverser la plaquette PDF")}
                                        </span>
                                    </div>
                                </div>
                                {formData.brochureUrl && !brochureFile && <p className="text-xs text-emerald-500 font-bold mt-2 ml-4">✓ Plaquette actuelle disponible</p>}
                            </div>
                        </div>
                    </div>
                  )}
                  
                 {!['gouvernance', 'blog', 'cases', 'library', 'training'].includes(activeTab) && (
                   <div className="space-y-4">
                      {Object.keys(formData).map(key => {
                        if (['id', 'createdAt', 'updatedAt', 'logoUrl', 'fileUrl', 'visualType', 'curriculum', 'reactions'].includes(key)) return null;
                         return (
                           <div key={key} className="space-y-2">
                             <label className="label-admin">{key}</label>
                             <input value={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.value})} className="input-admin" />
                           </div>
                         )
                      })}
                   </div>
                 )}

                 <button type="submit" disabled={isProcessing} className="w-full py-10 bg-slate-950 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-6 hover:bg-primary transition-all shadow-2xl">{isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Save className="w-8 h-8" />} Enregistrer</button>
               </form>
            </div>
         </div>
      )}

      <style>{`
        .input-admin { width: 100%; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 2rem; padding: 1.8rem 2.5rem; font-weight: 800; outline: none; transition: all 0.3s; }
        .input-admin:focus { border-color: var(--color-primary); background: #fff; box-shadow: 0 10px 40px -10px rgba(0, 104, 55, 0.1); }
        .textarea-admin { width: 100%; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 2.5rem; padding: 2rem 2.5rem; outline: none; line-height: 1.6; font-weight: 500; }
        .textarea-admin:focus { border-color: var(--color-primary); background: #fff; }
        .label-admin { font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.3em; margin-left: 1.5rem; }
        .quill-custom .ql-toolbar { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background: #fff; padding: 1rem !important; }
        .quill-custom .ql-container { border: none !important; font-family: 'Inter', sans-serif; font-size: 1rem; }
        .quill-custom .ql-editor { padding: 2rem !important; min-height: 200px; }
      `}</style>
      {/* Modal de Gestion de Devis */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-scale-in my-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Gestion de Devis</span>
                <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter">Offre Directe</h2>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Client</p>
                <p className="text-lg font-bold text-slate-900">{selectedQuote.userEmail}</p>
                <p className="text-xs text-slate-500 mt-1">Demandé le {new Date(selectedQuote.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Services Demandés</p>
                <div className="space-y-3">
                  {selectedQuote.services.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700">{s.serviceName}</span>
                      <span className="font-bold text-slate-900">{s.budget} €</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center font-black">
                    <span>TOTAL ESTIMÉ</span>
                    <span className="text-primary">{selectedQuote.services.reduce((acc, s) => acc + s.budget, 0)} €</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Lien du Devis PDF (Google Drive / Dropbox / Firebase Storage)</p>
                <input 
                  type="url"
                  value={quoteUrl}
                  onChange={(e) => setQuoteUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleUpdateQuoteStatus(selectedQuote.id!, 'sent', quoteUrl)}
                  disabled={!quoteUrl || isProcessing}
                  className="py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Envoyer le devis
                </button>
                <button 
                  onClick={() => handleUpdateQuoteStatus(selectedQuote.id!, 'rejected')}
                  disabled={isProcessing}
                  className="py-5 bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-3"
                >
                  <X className="w-4 h-4" /> Rejeter la demande
                </button>
                <button 
                  onClick={() => setSelectedQuote(null)}
                  className="col-span-2 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Message de Contact */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedMessage(null)}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-10 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">{selectedMessage.subject}</h3>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-slate-900">{selectedMessage.name}</p>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <p className="text-xs text-slate-400">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-3 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-sm font-bold text-primary hover:underline">{selectedMessage.email}</a>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Institution</p>
                  <p className="text-sm font-bold text-slate-900">{selectedMessage.institution || 'Non spécifiée'}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Message</p>
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
              >
                Fermer
              </button>
              <a 
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
              >
                <Mail className="w-4 h-4" /> Répondre
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Validation de Transaction */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-scale-in my-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">Validation Manuelle</span>
                <h2 className="text-4xl font-serif font-black text-slate-900 tracking-tighter">Flux Financier</h2>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Client</p>
                <p className="text-lg font-bold text-slate-900">
                  {selectedTransaction.firstName && <span className="text-primary mr-2">{selectedTransaction.firstName}</span>}
                  {selectedTransaction.userEmail}
                </p>
                {selectedTransaction.userPhone && <p className="text-xs text-slate-500 font-mono mt-1">{selectedTransaction.userPhone}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Référence Client</p>
                  <p className="text-lg font-bold text-slate-900 font-mono">{selectedTransaction.referenceNumber || 'N/A'}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Montant</p>
                  <p className="text-lg font-black text-slate-900">{selectedTransaction.amount}</p>
                </div>
              </div>

              {selectedTransaction.paymentProofUrl && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Preuve de Paiement</p>
                  <a href={selectedTransaction.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block group relative rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                    <img src={selectedTransaction.paymentProofUrl} alt="Preuve" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  </a>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Note Administrative (Interne)</p>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ex: Reçu vérifié sur le portail Orange Money..."
                  className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'processing')}
                  className="py-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-primary/80 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <Clock className="w-4 h-4" /> Marquer "En cours"
                </button>
                <button 
                  onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'completed')}
                  className="py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4" /> Valider l'accès
                </button>
                <button 
                  onClick={() => handleUpdateTransactionStatus(selectedTransaction.id, 'failed')}
                  className="py-5 bg-red-500 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-3"
                >
                  <AlertCircle className="w-4 h-4" /> Rejeter
                </button>
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
