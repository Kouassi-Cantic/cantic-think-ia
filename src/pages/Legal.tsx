import React from 'react';
import { 
  ShieldCheck, FileText, Scale, 
  Lock, Globe, Mail, MapPin, 
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import SEO from '../components/SEO';
import { BRAND } from '../constants';

const Legal: React.FC = () => {
  const sections = [
    {
      id: 'mentions',
      icon: FileText,
      title: "Mentions Légales",
      content: `
        CANTIC THINK IA est une société de conseil stratégique en Intelligence Artificielle.
        Siège Social : 544, 2 Plateaux Agban — Rue 70, Carrefour Kratos, Abidjan Cocody.
        Directeur de la Publication : Kouassi Ouréga Goblé.
        Hébergement : Services Cloud Souverains.
      `
    },
    {
      id: 'privacy',
      icon: Lock,
      title: "Politique de Confidentialité",
      content: `
        Nous accordons une importance capitale à la souveraineté de vos données. 
        Toutes les informations collectées via nos audits ou formulaires sont traitées 
        avec le plus haut niveau de cryptage et ne sont jamais partagées avec des tiers 
        sans consentement explicite.
      `
    },
    {
      id: 'terms',
      icon: Scale,
      title: "Conditions d'Utilisation",
      content: `
        L'utilisation de nos outils (Simulateur ROI, Audit Tool) est fournie à titre 
        indicatif. Les résultats ne constituent pas un engagement contractuel ferme 
        mais une base de discussion stratégique.
      `
    },
    {
      id: 'ethics',
      icon: ShieldCheck,
      title: "Charte Éthique",
      content: `
        CANTIC THINK IA s'engage pour une IA utile, transparente et responsable. 
        Nous refusons tout projet dont les finalités seraient contraires à l'éthique 
        humaine ou à la sécurité des populations.
      `
    }
  ];

  return (
    <div className="bg-[#fcfcfd] overflow-x-hidden">
      <SEO 
        title="Mentions Légales et Confidentialité - CANTIC THINK IA" 
        description="Consultez les mentions légales, la politique de confidentialité et les conditions d'utilisation de CANTIC THINK IA."
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
              Cadre Réglementaire et Éthique
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl lg:text-9xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-12"
            >
              LEGAL <br /> <span className="text-emerald-500">PROTOCOLS.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed"
            >
              La transparence est le socle de la confiance. Nous opérons dans un cadre <span className="text-white font-bold italic">strict et éthique</span> pour garantir votre sécurité juridique.
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {sections.map((section, i) => (
              <motion.div 
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-10 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <section.icon className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-slate-900 mb-8 group-hover:text-emerald-600 transition-colors leading-tight">{section.title}</h3>
                <div className="text-slate-500 font-light leading-relaxed italic space-y-4 whitespace-pre-line">
                  « {section.content.trim()} »
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT CTA --- */}
      <section className="py-32 lg:py-48 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6 lg:px-20 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-500/10">
              <Mail className="w-10 h-10" />
            </div>
            <h2 className="text-4xl lg:text-6xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-8">
              BESOIN DE <br /> PRÉCISIONS ?
            </h2>
            <p className="text-slate-400 font-light text-xl leading-relaxed mb-12">
              Pour toute question relative à nos protocoles légaux ou à la gestion de vos données, contactez notre département conformité.
            </p>
            <a href="mailto:commercial@canticthinkia.work" className="inline-flex items-center gap-4 px-12 py-6 bg-slate-950 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl">
              commercial@canticthinkia.work
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Legal;
