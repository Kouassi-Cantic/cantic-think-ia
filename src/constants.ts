import { Building2, GraduationCap, Landmark, Workflow, Lightbulb, BookOpen, Rocket, Scale, User, Calculator, MessageSquare, Users } from 'lucide-react';
import { Persona, DigitalResource } from './types';

export const BRAND = {
  name: "CANTIC THINK IA",
  tagline: "L'Intelligence Artificielle au service de votre croissance",
  email: "commercial@canticthinkia.work",
  phone: "+225 25 22 00 12 39",
  whatsapp: "+225 05 44 86 93 13",
  address: "544, 2 Plateaux Agban — Rue 70, Carrefour Kratos, Abidjan Cocody",
  social: {
    linkedin: "https://www.linkedin.com/in/cantic-think-ia-408a343bb/",
    twitter: "https://twitter.com/canticthinkia",
    facebook: "https://facebook.com/canticthinkia"
  }
};

export const BRANDING = {
  name: "CANTIC THINK IA",
  slogan: "Penser l'utile",
  logoUrl: "/favicon.png", 
  founderImageUrl: "https://firebasestorage.googleapis.com/v0/b/cantic-think-ia.firebasestorage.app/o/kouassi-ourega-goble-fondateur-cantic-think-ia.jpg?alt=media&token=4eb730a3-7a1b-4e98-a20c-da82afcedc41",
};

export const NAVIGATION = [
  { name: 'Manifeste', path: '/a-propos' },
  { 
    name: 'Expertise', 
    path: '/services',
    children: [
      { name: 'Conseil stratégique', path: '/services?section=conseil', icon: Landmark },
      { name: 'Ingénierie IA et Data', path: '/services?section=data', icon: Workflow },
      { name: 'Offres Directes', path: '/offres-directes', icon: Package },
      { name: 'Réalisations (ROI)', path: '/applications', icon: Lightbulb },
      { name: 'Simulateur ROI IA', path: '/roi-simulator', icon: Calculator },
    ]
  },
  { 
    name: 'Intelligence', 
    path: '/formations',
    children: [
      { name: 'Executive Education', path: '/formations', icon: GraduationCap },
      { name: 'Ressources stratégiques', path: '/boutique', icon: BookOpen },
      { name: 'Veille et réflexions', path: '/blog', icon: Rocket },
      { name: 'Espace Membre', path: '/client/login', icon: User },
    ]
  },
  { name: 'Contact', path: '/contact' }
];

export const PERSONAS: Persona[] = [
  {
    id: 'decisionnaire',
    role: "Décisionnaire privé",
    goal: "Souveraineté et performance",
    description: "Architecturer vos flux de données pour transformer l'IA en levier de croissance mesurable et durable.",
    icon: Building2,
    color: "bg-slate-900",
    targetSection: "ingenierie"
  },
  {
    id: 'institutionnel',
    role: "Acteur institutionnel",
    goal: "Modernisation et éthique",
    description: "Digitaliser l'action publique avec une gouvernance IA robuste, responsable et centrée sur le citoyen.",
    icon: Scale,
    color: "bg-emerald-900",
    targetSection: "conseil"
  },
  {
    id: 'educateur',
    role: "Élite pédagogique",
    goal: "Transmission et futur",
    description: "Adaptation des structures d'apprentissage aux nouveaux paradigmes de l'intelligence hybride.",
    icon: GraduationCap,
    color: "bg-indigo-900",
    targetSection: "formation"
  }
];

// La liste est désormais vide dans le code car elle est gérée dynamiquement par Firebase
export const INITIAL_RESOURCES: DigitalResource[] = [];

export const AUDIT_QUESTIONS = [
  {
    id: 1,
    category: "Culture data",
    text: "Quelle est la place de la donnée dans votre processus de prise de décision actuel ?",
    options: [
      { text: "Intuitive : basée sur l'expérience terrain sans support numérique systématique.", score: 0 },
      { text: "Hybride : rapports Excel ponctuels utilisés par la direction.", score: 5 },
      { text: "Data-driven : tableaux de bord en temps réel et culture de la preuve chiffrée.", score: 10 }
    ]
  },
  {
    id: 2,
    category: "Infrastructures",
    text: "Comment vos processus métiers sont-ils actuellement documentés et outillés ?",
    options: [
      { text: "Silos : l'information réside dans la tête des collaborateurs ou sur papier.", score: 0 },
      { text: "Partiel : utilisation de solutions cloud génériques (Drive, Office 365).", score: 5 },
      { text: "Intégré : système d'information unifié avec des API interconnectées.", score: 10 }
    ]
  },
  {
    id: 3,
    category: "Vision IA",
    text: "Quel est le niveau d'investissement stratégique prévu pour l'IA dans les 24 prochains mois ?",
    options: [
      { text: "Observateur : veille technologique sans budget dédié.", score: 0 },
      { text: "Explorateur : projets pilotes (PoC) en cours de déploiement.", score: 5 },
      { text: "Engagé : budget structurel et équipe dédiée à la transformation IA.", score: 10 }
    ]
  }
];
