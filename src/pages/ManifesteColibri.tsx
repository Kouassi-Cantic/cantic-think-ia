import React from 'react';
import { Quote } from 'lucide-react';
import SEO from '../components/SEO';

const ManifesteColibri = () => {
    return (
        <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
            <SEO title="Manifeste du Colibri" description="Le manifeste des jeunes colibris de l'IA." />
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl md:text-6xl font-serif font-light mb-12 text-slate-900">Le Manifeste du Colibri</h1>
                <div className="prose prose-lg text-slate-600">
                    <p>Un immense feu de forêt ravageait tout. Alors que les autres animaux fuyaient, impuissants, un petit colibri faisait des allers-retours, transportant des gouttes d'eau dans son minuscule bec pour éteindre le feu. À un éléphant qui se moquait de lui, il répondit : "Je sais, mais je fais ma part."</p>
                    <p>Ici, chaque question, chaque partage, chaque projet est ton goutte d'eau. Rejoins la communauté.</p>
                </div>
            </div>
        </div>
    );
};

export default ManifesteColibri;
