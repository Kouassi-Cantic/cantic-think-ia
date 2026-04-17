import React from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { BRANDING } from '../constants';
import SEO from '../components/SEO';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <SEO 
        title="À Propos et Manifeste" 
        description="Découvrez l'histoire de CANTIC THINK IA, de Franconet en 1997 à l'expertise systémique d'aujourd'hui. Une vision ivoirienne de l'intelligence artificielle."
      />
      <section className="bg-slate-900 text-white py-24 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
          <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] mb-8 block">Manifeste et vision</span>
          <h1 className="text-3xl md:text-8xl font-serif font-light mb-8 leading-[1.1] md:leading-tight">L'héritage de la <br/><span className="italic">transmission</span>.</h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed font-light">
            De la vulgarisation citoyenne à l'ingénierie de haut niveau, découvrez le parcours d'une expertise forgée sur le terrain ivoirien.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-24">
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-8 leading-tight">Notre trajectoire historique</h2>
              <div className="w-20 h-1 bg-emerald-500"></div>
          </div>
          <div className="space-y-16 border-l-2 border-slate-100 pl-8 md:pl-12 relative ml-2 md:ml-4">
            <div className="relative">
              <div className="absolute -left-[41px] md:-left-[57px] top-1 w-6 h-6 rounded-full bg-white border-4 border-emerald-500 shadow-sm z-10"></div>
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">1997 : FRANCONET</span>
              <p className="text-slate-500 mt-2 text-sm md:text-base">Démocratisation technologique pour briser les barrières d'accès au savoir numérique en Côte d'Ivoire.</p>
            </div>
            <div className="relative">
               <div className="absolute -left-[41px] md:-left-[57px] top-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-100 shadow-sm z-10"></div>
               <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">2014 : Projet APB</span>
               <p className="text-slate-600 mt-2 italic text-sm md:text-base">"Aider les artisans de la beauté à devenir de vrais chefs d'entreprise."</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[41px] md:-left-[57px] top-1 w-6 h-6 rounded-full bg-slate-900 border-4 border-emerald-500 shadow-sm z-10"></div>
              <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">Aujourd'hui : CANTIC THINK IA</span>
              <p className="text-slate-500 mt-2 text-sm md:text-base">L'évolution vers la haute consultance systémique et l'intelligence hybride.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-[#fcfcfd] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-slate-900 mb-12">Nos fondamentaux</h2>
              <div className="space-y-8">
                {[
                  { t: "Souveraineté", d: "L'Afrique doit concevoir ses propres modèles d'intelligence." },
                  { t: "Utilité réelle", d: "L'IA doit résoudre un problème humain ou économique concret." },
                  { t: "Éthique de la preuve", d: "Chaque recommandation s'appuie sur une donnée vérifiable." }
                ].map((item, i) => (
                  <div key={i} className="flex space-x-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0"></div>
                    <div><h4 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-widest">{item.t}</h4><p className="text-slate-500 text-sm font-light">{item.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-10 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl border border-slate-100 relative overflow-hidden">
              <Quote className="text-slate-100 w-20 h-20 absolute top-10 left-10 -z-0" />
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-serif text-slate-900 mb-8 italic">« L'informatique n'est pas une affaire de machines, c'est une affaire de structures de pensée. »</h3>
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden grayscale"><img src={BRANDING.founderImageUrl} alt="Founder" className="w-full h-full object-cover" /></div>
                  <div><h4 className="font-bold text-slate-900">Kouassi Ouréga Goblé</h4><p className="text-emerald-600 font-black text-[10px] uppercase tracking-widest mt-1">Fondateur • Expert Stratégique</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
