import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManifesteColibri: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
                <Link to="/jeunes" className="inline-flex items-center gap-2 text-indigo-600 font-bold mb-8 hover:text-indigo-800">
                    <ArrowLeft size={16} /> Retour au Hub
                </Link>
                
                <h1 className="text-5xl font-black text-slate-950 mb-8 flex items-center gap-4">
                    <Sparkles className="text-emerald-500" size={40} />
                    Le Manifeste du Colibri
                </h1>

                <div className="prose prose-slate max-w-none text-slate-700 space-y-6">
                    <p className="text-xl leading-relaxed italic">
                        « Un immense feu de forêt ravageait tout. Alors que les autres animaux fuyaient, impuissants, un petit colibri faisait des allers-retours, transportant des gouttes d'eau dans son minuscule bec pour éteindre le feu. À un éléphant qui se moquait de lui, il répondit : <strong>"Je sais, mais je fais ma part."</strong> »
                    </p>
                    
                    <h2 className="text-3xl font-bold text-slate-900 mt-12">Pourquoi être un Colibri des IA ?</h2>
                    <p>
                        Le monde de l'intelligence artificielle avance à une vitesse fulgurante. Face à l'ampleur des défis — manque d'opportunités, fracture numérique, peur de l'inconnu — il est facile de se sentir impuissant.
                    </p>
                    <p>
                        Chez CANTIC THINK IA, nous croyons que chaque jeune est un maillon essentiel. Chaque prompt partagé, chaque question répondue, chaque projet documenté est une "goutte" dans notre lutte collective contre l'ignorance.
                    </p>
                    <p>
                        En rejoignant notre communauté, vous ne faites pas que vous former, <strong>vous faites votre part.</strong>
                    </p>

                    <h3 className="text-2xl font-bold text-indigo-900 mt-10">La Goutte de Savoir</h3>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Partagez :</strong> Un outil, un prompt, une technique.</li>
                        <li><strong>Aidez :</strong> Un membre en difficulté.</li>
                        <li><strong>Construisez :</strong> Le futur de l'IA en Afrique, brique après brique.</li>
                    </ul>

                    <div className="bg-indigo-50 p-8 rounded-2xl mt-12 text-indigo-900">
                        <p className="font-bold text-lg">Prêt à déposer votre première goutte ?</p>
                        <p className="mt-2">Rejoignez le Hub, participez aux challenges hebdomadaires et grimpez dans le cercle des Colibris.</p>
                        <Link to="/jeunes" className="inline-block mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-emerald-600">
                            Rejoindre la communauté
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManifesteColibri;
