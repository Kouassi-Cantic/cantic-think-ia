import React from 'react';
import { Share2, Facebook, MessageCircle, Instagram } from 'lucide-react';

interface SocialShareProps {
  title: string;
  description: string;
  url: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, description, url }) => {
  const shareText = `${title}\n${description}\n${url}`;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have a direct share link. 
    // We copy link to clipboard and inform the user.
    navigator.clipboard.writeText(url);
    alert('Lien copié ! Tu peux maintenant le coller dans ta story Instagram.');
  };

  const shareToTikTok = () => {
    // Similar to Instagram
    navigator.clipboard.writeText(url);
    alert('Lien copié ! Tu peux maintenant le coller dans ton TikTok.');
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={shareToFacebook} className="p-2 rounded-full bg-slate-800 hover:bg-indigo-600 transition-colors" aria-label="Partager sur Facebook">
        <Facebook size={18} />
      </button>
      <button onClick={shareToWhatsApp} className="p-2 rounded-full bg-slate-800 hover:bg-emerald-600 transition-colors" aria-label="Partager sur WhatsApp">
        <MessageCircle size={18} />
      </button>
      <button onClick={shareToInstagram} className="p-2 rounded-full bg-slate-800 hover:bg-pink-600 transition-colors" aria-label="Copier pour Instagram">
        <Instagram size={18} />
      </button>
      <button onClick={shareToTikTok} className="p-2 rounded-full bg-slate-800 hover:bg-slate-950 transition-colors flex items-center justify-center w-8 h-8 font-black text-xs" aria-label="Copier pour TikTok">
        tk
      </button>
    </div>
  );
};

export default SocialShare;
