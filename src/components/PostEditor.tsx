import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export const PostEditor: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('general'); // À remplacer par une vraie liste de catégories
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return alert('Vous devez être connecté pour poster.');

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
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Nouveau Sujet</h2>
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
