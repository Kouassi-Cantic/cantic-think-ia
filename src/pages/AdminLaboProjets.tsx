import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ForumPost } from '../types';

export const AdminLaboProjets: React.FC = () => {
  const [projectsToReview, setProjectsToReview] = useState<ForumPost[]>([]);
  const [analysis, setAnalysis] = useState('');
  const [selectedProject, setSelectedProject] = useState<ForumPost | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'forum_posts'), where('status', '==', 'review'));
    const unsub = onSnapshot(q, (snapshot) => {
        setProjectsToReview(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost)));
    });
    return unsub;
  }, []);

  const handleAnalyze = async (post: ForumPost) => {
    if (!analysis.trim() || !post.id) return;
    try {
        await updateDoc(doc(db, 'forum_posts', post.id), {
            adminAnalysis: analysis,
            status: 'analyzed'
        });
        setAnalysis('');
        setSelectedProject(null);
        alert('Analyse soumise !');
    } catch (e) {
        console.error(e);
        alert('Erreur.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Projets en attente d'analyse</h1>
      <div className="grid gap-6">
        {projectsToReview.map(post => (
            <div key={post.id} className="bg-white p-6 rounded-xl shadow border">
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="mb-4">{post.content}</p>
                {selectedProject?.id === post.id ? (
                    <div className="space-y-4">
                        <textarea 
                            value={analysis}
                            onChange={(e) => setAnalysis(e.target.value)}
                            className="w-full border p-2 rounded"
                            placeholder="Analyse du projet..."
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleAnalyze(post)} className="bg-indigo-600 text-white px-4 py-2 rounded">Soumettre Analyse</button>
                          <button onClick={() => setSelectedProject(null)} className="bg-gray-200 px-4 py-2 rounded">Annuler</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setSelectedProject(post)} className="bg-indigo-600 text-white px-4 py-2 rounded">Analyser</button>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}
export default AdminLaboProjets;
