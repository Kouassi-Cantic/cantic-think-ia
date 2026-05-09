import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

interface Video {
  id: string;
  title: string;
  url: string;
}

const ReactPlayerAny = ReactPlayer as any;

const Videos: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);

    useEffect(() => {
        const fetchVideos = async () => {
            const querySnapshot = await getDocs(collection(db, 'youtube_videos'));
            const videosData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                console.log("Video doc:", doc.id, data);
                return {
                    id: doc.id,
                    ...data
                };
            }) as Video[];
            setVideos(videosData);
        };
        fetchVideos();
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-4xl font-black mb-4 text-slate-900">Bibliothèque Vidéo</h1>
            <p className="mb-12 text-slate-600">Découvre des tutoriels, des témoignages et des projets inspirants réalisés par la communauté.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold mb-4 text-slate-900">{video.title}</h2>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
                            <ReactPlayerAny 
                                url={video.url} 
                                width="100%" 
                                height="100%" 
                                controls={true}
                                config={{ youtube: { playerVars: { origin: window.location.origin } } }}
                                onReady={() => console.log(`Player ready for: ${video.url}`)}
                                onError={(e) => console.error(`Player error for: ${video.url}`, e)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-16 bg-indigo-50 p-8 rounded-3xl text-center">
                <h3 className="text-2xl font-bold text-indigo-900 mb-4">Tu as une vidéo à partager ?</h3>
                <p className="text-indigo-700">Envoie-nous le lien sur notre groupe WhatsApp pour qu'elle soit ajoutée à cette bibliothèque !</p>
            </div>
        </div>
    );
};

export default Videos;
