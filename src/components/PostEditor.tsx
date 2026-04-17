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
    <form onSubmit={handleSubmit} className="p-6 pt-32 space-y-4">
      <h2 className="text-xl font-bold">Nouveau Sujet</h2>
      <select 
        value={categoryId} 
        onChange={(e) => setCategoryId(e.target.value)} 
        className="w-full border p-2 rounded"
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
        placeholder="Titre" 
        className="w-full border p-2 rounded" 
        required
      />
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
        placeholder="Contenu" 
        className="w-full border p-2 rounded h-32" 
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Publier
      </button>
    </form>
  );
};
export default PostEditor;
