import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

interface ForumPost {
  id: string;
  title: string;
  authorId: string;
  categoryId: string;
  createdAt: string;
}

export const ForumList: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'forum_posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ForumPost[];
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 pt-32 min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-2">
              Le Forum IA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">🚀</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Rejoins la conversation, partage, grandis.</p>
          </div>
          <Link 
            to="/forum/new" 
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-6 py-3 text-white transition-all hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="font-bold tracking-wide">Nouveau Sujet</span>
            <span className="text-sm">✨</span>
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link 
              key={post.id} 
              to={`/forum/post/${post.id}`} 
              className="group block p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest group-hover:bg-indigo-100 transition-colors">
                {post.categoryId}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ForumList;
