import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ProjectIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, problem: string, solution: string) => void;
  initialTitle?: string;
  initialProblem?: string;
  initialSolution?: string;
}

export const ProjectIdeaModal: React.FC<ProjectIdeaModalProps> = ({ 
  isOpen, onClose, onSave, initialTitle = '', initialProblem = '', initialSolution = '' 
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [problem, setProblem] = useState(initialProblem);
  const [solution, setSolution] = useState(initialSolution);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim() && problem.trim() && solution.trim()) {
      onSave(title, problem, solution);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Définit ton idée</h2>
        
        <label className="block text-sm font-medium text-slate-400 mb-2">Quel est le titre de ton projet ?</label>
        <input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-4 bg-slate-900 rounded-xl text-white mb-4 border border-slate-800"
          placeholder="Mon super projet..."
        />
        
        <label className="block text-sm font-medium text-slate-400 mb-2">Quel problème veux-tu résoudre ?</label>
        <textarea 
          value={problem} 
          onChange={(e) => setProblem(e.target.value)}
          className="w-full p-4 bg-slate-900 rounded-xl text-white mb-4 border border-slate-800"
          rows={3}
          placeholder="Mon problème est..."
        />
        
        <label className="block text-sm font-medium text-slate-400 mb-2">Quelle est ta solution ?</label>
        <textarea 
          value={solution} 
          onChange={(e) => setSolution(e.target.value)}
          className="w-full p-4 bg-slate-900 rounded-xl text-white mb-6 border border-slate-800"
          rows={3}
          placeholder="Ma solution est..."
        />
        
        <button 
          onClick={handleSave}
          disabled={!title.trim() || !problem.trim() || !solution.trim()}
          className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition disabled:opacity-50"
        >
          Valider mon idée
        </button>
      </div>
    </div>
  );
};
