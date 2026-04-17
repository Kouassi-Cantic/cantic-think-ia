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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Forum Étudiants</h1>
      <Link to="/forum/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
        Nouveau Sujet
      </Link>
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="border p-4 rounded shadow">
            <Link to={`/forum/post/${post.id}`} className="text-xl font-semibold hover:text-blue-600">
              {post.title}
            </Link>
            <p className="text-sm text-gray-500">Créé le {new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ForumList;
