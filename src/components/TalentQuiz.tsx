import React, { useState } from 'react';

type Question = {
  id: number;
  text: string;
  options: { text: string; careerType: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Qu'est-ce qui t'attire le plus dans l'IA ?",
    options: [
      { text: "Créer de nouveaux contenus (textes, images)", careerType: "creative" },
      { text: "Analyser des données complexes pour trouver des solutions", careerType: "analytical" },
      { text: "Construire les algorithmes qui font fonctionner les systèmes", careerType: "technical" },
    ],
  },
  {
    id: 2,
    text: "Comment préfères-tu travailler ?",
    options: [
      { text: "En équipe, pour échanger des idées", careerType: "creative" },
      { text: "De manière indépendante, concentré sur la logique", careerType: "technical" },
      { text: "En menant des enquêtes, pour décortiquer les faits", careerType: "analytical" },
    ],
  },
  {
    id: 3,
    text: "Quel projet te semble le plus excitant ?",
    options: [
      { text: "Développer une IA qui aide les artistes", careerType: "creative" },
      { text: "Assurer la sécurité et l'éthique des systèmes IA", careerType: "analytical" },
      { text: "Optimiser les performances d'un modèle d'IA", careerType: "technical" },
    ],
  },
];

const CAREER_OUTCOMES: Record<string, { title: string; desc: string }> = {
  creative: { title: "Artiste / Designer IA", desc: "Tu es fait pour créer des interfaces et des contenus digitaux grâce à l'IA." },
  analytical: { title: "Analyste / Éthicien IA", desc: "Ton esprit critique est essentiel pour analyser l'impact et la pertinence des systèmes." },
  technical: { title: "Développeur / Ingénieur IA", desc: "Ta logique pointue te permet de bâtir les fondations et les modèles de l'IA." },
};

export const TalentQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (careerType: string) => {
    const newScores = { ...scores, [careerType]: (scores[careerType] || 0) + 1 };
    setScores(newScores);

    if (currentQuestion + 1 < QUESTIONS.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate result
      const bestOutcome = Object.entries(newScores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      setResult(bestOutcome);
    }
  };

  if (result) {
    const outcome = CAREER_OUTCOMES[result];
    return (
      <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800 text-center">
        <h2 className="text-3xl font-bold mb-4 text-emerald-400">Ton profil : {outcome.title}</h2>
        <p className="text-slate-300 text-lg">{outcome.desc}</p>
        <button
          onClick={() => {
            setCurrentQuestion(0);
            setScores({});
            setResult(null);
          }}
          className="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
        >
          Recommencer le quiz
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];
  return (
    <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-white">{question.text}</h2>
      <div className="grid gap-4">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option.careerType)}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left text-indigo-100 transition"
          >
            {option.text}
          </button>
        ))}
      </div>
      <p className="mt-6 text-slate-500 text-sm">Question {currentQuestion + 1} sur {QUESTIONS.length}</p>
    </div>
  );
};
