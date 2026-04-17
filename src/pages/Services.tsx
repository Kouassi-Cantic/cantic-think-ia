import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Cpu, ShieldCheck, BarChart3, Users, 
  Zap, Globe, Sparkles, ArrowRight, 
  CheckCircle2, ChevronRight, MessageSquare,
  Search, Settings, Database, Code,
  Lightbulb, Target, Rocket
} from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { BRAND } from '../constants';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const services = [
    {
      id: 'conseil',
      icon: Search,
      title: "Audit et Stratégie IA",
      desc: "Évaluation de la maturité technologique et définition d'une feuille de route stratégique personnalisée.",
      features: ["Diagnostic d'infrastructure", "Analyse d'opportunités ROI", "Plan de transition numérique"],
      color: "bg-emerald-500"
    },
    {
      id: 'ingenierie',
      icon: Zap,
      title: "Automatisation Intelligente",
      desc: "Déploiement d'agents IA et structuration de données (ex: Cercle Citoyen) pour automatiser vos processus et éclairer vos décisions.",
      features: ["Workflows autonomes", "Chatbots experts RAG", "Architecture de données stratégique"],
      color: "bg-emerald-500"
    },
    {
      id: 'governance',
      icon: ShieldCheck,
      title: "Gouvernance et Éthique",
      desc: "Mise en place de cadres de régulation pour une utilisation sécurisée, éthique et souveraine de l'IA.",
      features: ["Audit de conformité", "Sécurisation des données", "Charte éthique institutionnelle"],
      color: "bg-amber-500"
    },
    {
      id: 'data',
      icon: Database,
      title: "Ingénierie IA et Data",
      desc: "Exploitation avancée de vos données pour une prise de décision basée sur la preuve et l'analyse prédictive.",
      features: ["Analyse prédictive", "Tableaux de bord stratégiques", "Visualisation de données complexes"],
      color: "bg-emerald-500"
    },
    {
      id: 'formation',
      icon: Users,
      title: "Acculturation et Formation",
      desc: "Programmes de montée en compétences pour les décideurs et les équipes opérationnelles.",
      features: ["Séminaires exécutifs", "Ateliers pratiques", "Certification IA"],
      color: "bg-rose-500"
    },
    {
      id: 'custom',
      icon: Code,
      title: "Développement Sur-Mesure",
      desc: "Conception d'applications IA spécifiques répondant à vos défis métiers uniques.",
      features: ["Modèles LLM personnalisés", "Intégration API", "Maintenance évolutive"],
      color: "bg-slate-900"
    }
  ];

  return (
    <div className="bg-[#fcfcfd] overflow-x-hidden">
      <SEO 
        title="Nos Services - Expertise IA Stratégique" 
        description="Découvrez notre gamme complète de services en Intelligence Artificielle pour les institutions et entreprises africaines."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 block"
            >
              Architecture de Transformation
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-9xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-12"
            >
              NOS <br /> <span className="text-emerald-500">SERVICES.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed"
            >
              Nous ne vendons pas de technologie. Nous construisons des <span className="text-white font-bold italic">systèmes d'intelligence</span> qui propulsent votre organisation vers l'excellence opérationnelle.
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, i) => (
              <motion.div 
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 flex flex-col"
              >
                <div className={`w-20 h-20 ${service.color} rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors leading-tight">{service.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed mb-10 italic">« {service.desc} »</p>
                
                <ul className="space-y-4 mb-12 flex-grow">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => {
                    if (service.id === 'conseil') navigate('/service-conseil');
                    else if (service.id === 'ingenierie') navigate('/service-automatisation');
                    else if (service.id === 'governance') navigate('/service-gouvernance');
                    else if (service.id === 'data') navigate('/service-ingenierie');
                    else if (service.id === 'formation') navigate('/service-formation');
                    else if (service.id === 'custom') navigate('/service-developpement');
                    else navigate('/contact');
                  }}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                >
                  Démarrer <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- METHODOLOGY --- */}
      <section className="py-32 lg:py-48 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Notre Approche</span>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-8">
              LE CYCLE DE <br /> L'EXCELLENCE.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {[
              { step: "01", title: "Diagnostic", desc: "Immersion dans vos processus pour identifier les goulots d'étranglement.", icon: Search },
              { step: "02", title: "Conception", desc: "Architecture de la solution IA adaptée à vos contraintes réelles.", icon: Lightbulb },
              { step: "03", title: "Déploiement", desc: "Intégration technique et accompagnement au changement.", icon: Rocket },
              { step: "04", title: "Optimisation", desc: "Suivi des performances et ajustements continus pour maximiser le ROI.", icon: Target }
            ].map((item, i) => (
              <div key={i} className="relative p-10 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-slate-900 transition-all duration-500">
                <span className="text-6xl font-serif font-black text-slate-200 absolute top-8 right-8 group-hover:text-white/10 transition-colors">{item.step}</span>
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-emerald-500 transition-colors">
                  <item.icon className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-2xl font-serif font-bold text-slate-900 mb-4 group-hover:text-white transition-colors">{item.title}</h4>
                <p className="text-slate-500 font-light text-sm leading-relaxed group-hover:text-slate-400 transition-colors">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 lg:py-48 bg-slate-950 text-center">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-3xl md:text-5xl lg:text-8xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-16">
            PRÊT À <br /> <span className="text-emerald-500">TRANSFORMER</span> <br /> VOTRE RÉALITÉ ?
          </h2>
          <button 
            onClick={() => navigate('/contact')}
            className="px-16 py-8 bg-white text-slate-950 rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
          >
            Demander un Audit Gratuit
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
