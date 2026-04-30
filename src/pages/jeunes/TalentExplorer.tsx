import React from 'react';
import { TalentQuiz } from '../../components/TalentQuiz';

const TalentExplorer: React.FC = () => (
    <div className="p-8 text-white max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-4">Explorateur talents</h1>
        <p className="text-slate-400 mb-8">Découvre les métiers IA faits pour toi en répondant à notre petit quiz d'orientation.</p>
        
        <TalentQuiz />
    </div>
);

export default TalentExplorer;
