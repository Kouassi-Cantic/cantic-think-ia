import React, { useState } from 'react';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    question: "Qu'est-ce que l'IA générative ?",
    options: ["Une IA qui crée du contenu (texte, image, code)", "Une IA qui ne fait que classer des mails", "Un jeu vidéo"],
    correct: 0
  },
  {
    question: "Quel modèle d'IA a été rendu célèbre par ChatGPT ?",
    options: ["GPT (Generative Pre-trained Transformer)", "Linux", "Windows"],
    correct: 0
  },
  {
    question: "Pourquoi est-il important de vérifier les réponses d'une IA ?",
    options: ["Parce qu'elle peut parfois inventer des faits (hallucinations)", "Parce qu'elle est toujours parfaite", "Parce qu'elle est payante"],
    correct: 0
  }
];

const QuizIA: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const handleAnswer = (index: number) => {
        if (index === questions[currentQuestion].correct) {
            setScore(score + 1);
        }

        if (currentQuestion + 1 < questions.length) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowResults(false);
    };

    return (
        <div className="p-8 text-white max-w-4xl mx-auto">
            <h1 className="text-4xl font-black mb-4">Quiz IA</h1>
            <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
              <p>Teste tes connaissances et progresse...</p>
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/cantic-think-ia-491512.firebasestorage.app/o/Jeunesse.png?alt=media&token=1e92d214-9ce1-4ed0-9613-91c9691f8b90" 
                alt="Jeunesse" 
                className="rounded-xl shadow-lg w-full"
              />
            </div>
            {showResults ? (
                <div className="bg-slate-900 p-8 rounded-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Résultat : {score} / {questions.length}</h2>
                    <button onClick={resetQuiz} className="bg-indigo-600 px-6 py-2 rounded">Recommencer</button>
                </div>
            ) : (
                <div className="bg-slate-900 p-8 rounded-xl">
                    <h2 className="text-xl font-bold mb-6">{questions[currentQuestion].question}</h2>
                    <div className="grid gap-4">
                        {questions[currentQuestion].options.map((option, index) => (
                            <button 
                                key={index} 
                                onClick={() => handleAnswer(index)} 
                                className="w-full text-left p-4 bg-slate-800 rounded hover:bg-slate-700 transition"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizIA;
