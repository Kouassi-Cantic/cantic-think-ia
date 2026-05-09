import React from 'react';
import ReactPlayer from 'react-player';

const VIDEOS = [
  { id: '1', title: 'Introduction à l\'IA', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }, // Placeholder
  { id: '2', title: 'Projet Colibris en action', url: 'https://www.youtube.com/watch?v=kYJv-8p487I' }, // Placeholder
];

const Videos: React.FC = () => {
    return (
        <div className="p-8 max-w-6xl mx-auto min-h-screen">
            <h1 className="text-4xl font-black mb-4 text-slate-900">Bibliothèque Vidéo</h1>
            <p className="mb-12 text-slate-600">Découvre des tutoriels, des témoignages et des projets inspirants réalisés par la communauté.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
                {VIDEOS.map((video) => (
                    <div key={video.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold mb-4 text-slate-900">{video.title}</h2>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900">
                            <ReactPlayer 
                                url={video.url} 
                                width="100%" 
                                height="100%" 
                                controls={true}
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
