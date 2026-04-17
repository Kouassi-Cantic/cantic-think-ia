import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface ForumPost {
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

interface ForumComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

const TopicDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!postId) return;

    // Récupérer le post
    const postRef = doc(db, 'forum_posts', postId);
    const unsubPost = onSnapshot(postRef, (doc) => {
      if (doc.exists()) {
        setPost(doc.data() as ForumPost);
      } else {
        navigate('/forum');
      }
    });

    // Récupérer les commentaires
    const commentsQuery = query(
      collection(db, 'forum_comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ForumComment[]);
    });

    return () => {
      unsubPost();
      unsubComments();
    };
  }, [postId, navigate]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !postId) return alert('Vous devez être connecté.');

    try {
      await addDoc(collection(db, 'forum_comments'), {
        content: newComment,
        authorId: auth.currentUser.uid,
        postId: postId,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l’ajout du commentaire.');
    }
  };

  if (!post) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-600 mb-6">{post.content}</p>

      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold">Commentaires</h2>
        {comments.map(comment => (
          <div key={comment.id} className="border-b p-2">
            <p>{comment.content}</p>
            <p className="text-xs text-gray-400">Posté le {new Date(comment.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea 
          value={newComment} 
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Votre réponse..."
          className="w-full border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Répondre
        </button>
      </form>
    </div>
  );
};

export default TopicDetail;
