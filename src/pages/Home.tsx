import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Zap, ShieldCheck, Globe, 
  Cpu, BarChart3, Users, Sparkles, 
  ChevronRight, PlayCircle, MessageSquare,
  Search, CheckCircle2, Star, Quote,
  GraduationCap, BookOpen, UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import ROISimulator from '../components/ROISimulator';
import AuditTool from '../components/AuditTool';
import { BRAND } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfcfd] overflow-x-hidden">
      <SEO 
        title="Intelligence Artificielle Stratégique pour l'Afrique" 
        description="CANTIC THINK IA accompagne les institutions et entreprises africaines dans leur transition vers l'IA souveraine et performante."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-slate-100 rounded-full shadow-sm mb-8"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Pionnier de l'IA Souveraine en Afrique</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl md:text-6xl lg:text-[110px] font-serif font-black italic text-slate-950 leading-[0.9] md:leading-[0.85] tracking-tighter mb-12"
            >
              L'INTELLIGENCE <br />
              <span className="text-emerald-600">AUGMENTÉE</span> <br />
              POUR L'AFRIQUE.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-500 font-light max-w-2xl mb-16 leading-relaxed"
            >
              Nous transformons la complexité technologique en <span className="font-bold text-slate-900">leviers de croissance</span> concrets pour les institutions et entreprises visionnaires du continent.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <button 
                onClick={() => navigate('/services')}
                className="px-12 py-6 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-950/20 group"
              >
                Nos Solutions <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-12 py-6 bg-white text-slate-900 border border-slate-100 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-50 transition-all shadow-lg"
              >
                Consultation Expert
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:block">
          <div className="w-px h-24 bg-gradient-to-b from-slate-200 to-transparent"></div>
        </div>
      </section>

      {/* --- SERVICES PREVIEW --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Nos Domaines d'Intervention</span>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter">
                EXPERTISE <br /> SYSTÉMIQUE.
              </h2>
            </div>
            <p className="text-slate-400 font-light max-w-sm text-lg leading-relaxed">
              De l'audit stratégique à l'implémentation technique, nous couvrons l'ensemble de la chaîne de valeur de l'IA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                icon: Cpu, 
                title: "IA et Automatisation", 
                desc: "Optimisation des processus métiers par l'intégration d'agents intelligents autonomes.",
                color: "bg-emerald-500"
              },
              { 
                icon: ShieldCheck, 
                title: "Gouvernance et Éthique", 
                desc: "Cadres de régulation et protocoles de sécurité pour une IA responsable et souveraine.",
                color: "bg-emerald-500"
              },
              { 
                icon: BarChart3, 
                title: "Data Intelligence", 
                desc: "Transformation de vos données brutes en insights stratégiques actionnables.",
                color: "bg-amber-500"
              }
            ].map((service, i) => (
              <div key={i} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-4 transition-all duration-500">
                <div className={`w-20 h-20 ${service.color} rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors">{service.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed mb-10 italic">« {service.desc} »</p>
                <button onClick={() => navigate('/services')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Détails <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- METHODOLOGY SECTION --- */}
      <section className="py-32 lg:py-48 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Notre Méthodologie</span>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-8">
              UNE APPROCHE <br /> SYSTÉMIQUE.
            </h2>
            <p className="text-slate-400 font-light text-xl leading-relaxed">
              Nous ne nous contentons pas d'installer des outils. Nous transformons votre structure de pensée.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: "01", 
                title: "Audit Stratégique", 
                desc: "Immersion dans vos processus pour identifier les goulots d'étranglement et les opportunités de croissance.",
                icon: Search 
              },
              { 
                step: "02", 
                title: "Ingénierie IA", 
                desc: "Conception et déploiement d'architectures technologiques souveraines adaptées à votre réalité.",
                icon: Cpu 
              },
              { 
                step: "03", 
                title: "Accompagnement", 
                desc: "Formation des équipes et suivi des performances pour garantir une adoption durable et un ROI maximal.",
                icon: Users 
              }
            ].map((item, i) => (
              <div key={i} className="relative p-12 bg-slate-50 rounded-[3rem] border border-slate-100 group hover:bg-slate-950 transition-all duration-500">
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

      {/* --- FLAGSHIP PROJECT SECTION --- */}
      <section className="py-32 lg:py-48 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col lg:flex-row items-stretch">
            <div className="lg:w-1/2 p-12 lg:p-24 space-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 block">Réalisation Phare • En Ligne</span>
                <h2 className="text-4xl lg:text-6xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter">
                  CERCLE <br /> CITOYEN.
                </h2>
              </div>
              <p className="text-slate-500 font-light text-lg leading-relaxed italic">
                « Digitaliser l'engagement citoyen et renforcer le lien social à travers une infrastructure souveraine et sécurisée pour la République de Côte d'Ivoire. »
              </p>
              <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Impact</span>
                  <span className="text-2xl font-serif font-bold text-emerald-600">+50k Citoyens</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Efficacité</span>
                  <span className="text-2xl font-serif font-bold text-emerald-600">-40% Délais</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <a 
                  href="https://cerclecitoyen.ci" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl group"
                >
                  Ouvrir l'application <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <button 
                  onClick={() => navigate('/applications')}
                  className="px-10 py-5 bg-white text-slate-900 border border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-lg"
                >
                  Toutes les réalisations
                </button>
              </div>
            </div>
            <div className="lg:w-1/2 bg-slate-950 relative flex items-center justify-center p-12 lg:p-24 overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981,transparent_70%)] opacity-20"></div>
              </div>
              <div className="relative z-10 w-full max-w-sm aspect-square bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 flex items-center justify-center shadow-2xl">
                <img 
                  src="https://nfsskgcpqbccnwacsplc.supabase.co/storage/v1/object/public/Logo-cercle-citoyen/logo-cercle-citoyen.png" 
                  alt="Cercle Citoyen Logo" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROI SIMULATOR SECTION --- */}
      <section className="py-32 lg:py-48 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#10b981,transparent_70%)]"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6 block">Simulateur de Performance</span>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-white leading-[0.9] tracking-tighter mb-12">
                MESUREZ VOTRE <br /> POTENTIEL.
              </h2>
              <p className="text-slate-400 font-light text-xl leading-relaxed mb-12">
                Ne devinez plus. Utilisez notre algorithme pour estimer les gains d'efficacité que l'IA peut apporter à votre organisation.
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                  <span className="font-bold text-lg">Précision algorithmique</span>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                  <span className="font-bold text-lg">Rapport détaillé exportable</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 lg:p-6 rounded-[4rem] shadow-2xl w-full max-w-2xl lg:max-w-none mx-auto">
              <ROISimulator />
            </div>
          </div>
        </div>
      </section>

      {/* --- AUDIT TOOL SECTION --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <div className="max-w-3xl mx-auto mb-24">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Diagnostic de Maturité</span>
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-8">
              ÊTES-VOUS PRÊT <br /> POUR L'IA ?
            </h2>
            <p className="text-slate-400 font-light text-xl leading-relaxed">
              Répondez à quelques questions stratégiques pour évaluer le niveau de préparation de votre institution à l'ère de l'intelligence artificielle.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto bg-white p-4 lg:p-8 rounded-[5rem] border border-slate-100 shadow-sm">
            <AuditTool />
          </div>
        </div>
      </section>

      {/* --- DIRECT OFFERS SECTION --- */}
      <section className="py-32 lg:py-48 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Solutions Accessibles</span>
              <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter">
                OFFRES <br /> DIRECTES.
              </h2>
            </div>
            <p className="text-slate-400 font-light max-w-sm text-lg leading-relaxed">
              Des packs pensés pour les particuliers, élèves et étudiants. Parce que le futur se construit dès aujourd'hui.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: UserPlus,
                title: "Particuliers",
                desc: "Soignez votre image numérique et lancez vos projets personnels avec une base solide.",
                link: "/offres-directes?category=particuliers&scope=professional"
              },
              {
                icon: GraduationCap,
                title: "Élèves",
                desc: "Prenez une longueur d'avance en maîtrisant les outils IA et la recherche numérique.",
                link: "/offres-directes?category=eleves&scope=professional"
              },
              {
                icon: BookOpen,
                title: "Étudiants",
                desc: "Optimisez votre productivité académique et construisez votre profil professionnel.",
                link: "/offres-directes?category=etudiants&scope=professional"
              }
            ].map((offer, i) => (
              <div key={i} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-4 transition-all duration-500">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-emerald-500 transition-colors">
                  <offer.icon className="w-10 h-10 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6">{offer.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed mb-10 italic">« {offer.desc} »</p>
                <button 
                  onClick={() => navigate(offer.link)}
                  className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-900 group-hover:text-emerald-600 transition-colors"
                >
                  Découvrir les packs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <button 
              onClick={() => navigate('/offres-directes?scope=professional')}
              className="px-12 py-6 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl"
            >
              Voir toutes les offres directes
            </button>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-32 lg:py-48 bg-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/10 rounded-full blur-[150px]"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-20 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-8xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-16">
            CONSTRUISONS <br /> VOTRE FUTUR.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="px-16 py-8 bg-slate-950 text-white rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] hover:bg-white hover:text-slate-950 transition-all shadow-2xl"
            >
              Démarrer un Projet
            </button>
            <button 
              onClick={() => navigate('/formations')}
              className="px-16 py-8 bg-white/10 text-white border border-white/20 rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] hover:bg-white/20 transition-all"
            >
              Nos Formations
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
