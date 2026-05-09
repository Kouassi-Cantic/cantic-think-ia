import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Trash2, Plus, Loader2 } from 'lucide-react';

const AdminVideoManager: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'youtube_videos'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVideos(data);
        });
        return unsub;
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            await addDoc(collection(db, 'youtube_videos'), {
                title: newTitle,
                url: newUrl,
                createdAt: serverTimestamp()
            });
            setNewTitle('');
            setNewUrl('');
        } catch (error) {
            console.error("Error adding video:", error);
            alert("Erreur lors de l'ajout.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cette vidéo ?")) return;
        try {
            await deleteDoc(doc(db, 'youtube_videos', id));
        } catch (error) {
            console.error("Error deleting video:", error);
            alert("Erreur lors de la suppression.");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Gestion des Vidéos YouTube</h1>
            
            <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border mb-8 space-y-4">
                <input type="text" placeholder="Titre" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border rounded-xl p-3" required />
                <input type="text" placeholder="URL YouTube" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="w-full border rounded-xl p-3" required />
                <button disabled={isProcessing} className="bg-indigo-600 text-white rounded-xl px-6 py-3 font-bold hover:bg-indigo-700">
                    {isProcessing ? <Loader2 className="animate-spin" /> : <><Plus className="w-5 h-5 inline mr-2" /> Ajouter</>}
                </button>
            </form>

            <div className="grid gap-4">
                {videos.map(v => (
                    <div key={v.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{v.title}</h3>
                            <p className="text-xs text-slate-500">{v.url}</p>
                        </div>
                        <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminVideoManager;
