import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const PostEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'forum_categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name as string
      }));
      setCategories(categoriesData);
      if (categoriesData.length > 0) setCategoryId(categoriesData[0].id);
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return alert('Vous devez être connecté pour poster.');
    if (!categoryId) return alert('Veuillez sélectionner une catégorie.');

    try {
      await addDoc(collection(db, 'forum_posts'), {
        title,
        content,
        authorId: auth.currentUser.uid,
        categoryId,
        createdAt: new Date().toISOString()
      });
      navigate('/forum');
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
      alert('Erreur lors de la publication.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-32 grid md:grid-cols-2 gap-12 items-center min-h-[80vh]">
      {/* Form Column */}
      <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-bold text-white tracking-tight">Poser une question</h2>
          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)} 
            className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            required
          >
            <option value="">Sélectionnez une catégorie</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Titre de la question" 
            className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-xl placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all" 
            required
          />
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Détails de ta question..." 
            className="w-full bg-slate-800/50 border border-slate-700 text-white p-4 rounded-xl h-48 placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all" 
            required
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-4 rounded-xl transition-all shadow-lg shadow-indigo-900/20">
            Publier la question
          </button>
        </form>
      </div>
      
      {/* Image Column */}
      <div className="hidden md:block">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/cantic-think-ia-491512.firebasestorage.app/o/Jeunes.png?alt=media&token=26c80ee1-a767-4f08-b042-b72e1b62e1eb"
          alt="Illustration Echanges Jeunes"
          className="w-full h-auto rounded-3xl shadow-2xl object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
export default PostEditor;
