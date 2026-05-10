import React from 'react';
import { Sparkles, Brain, Rocket, MessageSquare, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const BentoCard = ({ title, description, icon: Icon, delay, link }: { title: string, description: string, icon: any, delay: string, link: string }) => (
  <Link to={link} className={`bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 ${delay} flex flex-col`}>
    <div className="p-4 bg-indigo-50 rounded-2xl w-fit mb-6">
      <Icon className="w-8 h-8 text-indigo-600" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 flex-grow">{description}</p>
    <div className="mt-6 text-indigo-600 font-bold flex items-center gap-2">Découvrir <Target size={16} /></div>
  </Link>
);

const About: React.FC = () => {
    return (
        <div className="animate-fade-in pt-32 pb-20">
            <SEO
                title="À Propos"
                description="Découvrez l'histoire de CANTIC THINK IA, de Franconet en 1997 à l'expertise systémique d'aujourd'hui."
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

            <section className="py-24 bg-[#fcfcfd]">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-serif text-slate-900 mb-16 text-center">Les Colibris de l'IA</h2>
                    <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center mb-16">
                        CANTIC THINK IA forme les colibris de demain. Notre méthodologie accompagne chaque utilisateur, du novice curieux à l'entrepreneur, dans une montée en compétence progressive, fluide et percutante.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <BentoCard 
                            title="Novice : Eveille ta curiosité"
                            description="Tu découvres l'IA, ses enjeux et son incroyable potentiel. Nous t'offrons les clés pour comprendre les bases sans barrières techniques."
                            icon={Brain}
                            delay="delay-75"
                            link="/jeunes"
                        />
                        <BentoCard 
                            title="Explorateur : Apprends en faisant"
                            description="Mise en pratique au sein de notre communauté de partage. Tu expérimentes, tu scannes le réel et tu te formes par les échanges."
                            icon={MessageSquare}
                            delay="delay-150"
                            link="/forum"
                        />
                        <BentoCard 
                            title="Entrepreneur : Performance et impact"
                            description="Tu maîtrises l'outillage technologique, tu crées des solutions réelles et optimises ta performance métier."
                            icon={Rocket}
                            delay="delay-300"
                            link="/applications"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
