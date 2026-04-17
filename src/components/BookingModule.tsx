import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, ChevronRight, User, Mail, Building2, Loader2, Video } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

const BookingModule: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', institution: '' });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Pré-remplissage si l'utilisateur est connecté
  useEffect(() => {
    const clientEmail = localStorage.getItem('cantic_client_email');
    if (clientEmail) {
      const loadProfile = async () => {
        const profileId = clientEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const profileRef = doc(db, "clients", profileId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData({
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || '',
            email: data.email || clientEmail,
            institution: data.company || ''
          });
        } else {
          setFormData(prev => ({ ...prev, email: clientEmail }));
        }
      };
      loadProfile();
    }
  }, []);

  // Récupérer les créneaux déjà réservés pour la date sélectionnée
  useEffect(() => {
    if (!selectedDate) return;
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, "appointments"),
      where("date", ">=", startOfDay.toISOString()),
      where("date", "<=", endOfDay.toISOString()),
      where("status", "!=", "cancelled")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const slots = snapshot.docs.map(doc => doc.data().time);
      setBookedSlots(slots);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  // Génération des dates (14 prochains jours, hors WE)
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  
  useEffect(() => {
    const dates: Date[] = [];
    let current = new Date();
    let count = 0;
    
    while (count < 14) {
      current.setDate(current.getDate() + 1);
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Exclure Dimanche (0) et Samedi (6)
        dates.push(new Date(current));
        count++;
      }
    }
    setAvailableDates(dates);
  }, []);

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, "appointments"), {
        service: selectedType,
        date: selectedDate?.toISOString(),
        time: selectedSlot,
        userName: formData.name,
        userEmail: formData.email,
        clientInstitution: formData.institution,
        status: 'pending',
        createdAt: new Date().toISOString(),
        templateName: 'booking_confirmation'
      });
      setTimeout(() => {
        setLoading(false);
        setStep(4);
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Erreur de connexion au service de planning.");
    }
  };

  const interventions = [
    { title: "Audit Flash", duration: "15 min", desc: "Diagnostic rapide de vos enjeux IA." },
    { title: "Consultation Stratégique", duration: "1h", desc: "Approfondissement et feuille de route." },
    { title: "Démonstration Technique", duration: "45 min", desc: "Présentation des outils CANTIC THINK IA." },
  ];

  return (
    <div className="bg-white rounded-[3.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>

      {step === 1 && (
        <div className="animate-fade-in">
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Choisir l'intervention</h3>
          <p className="text-slate-400 font-light text-sm mb-10">Quelle expertise souhaitez-vous mobiliser ?</p>
          <div className="space-y-4">
            {interventions.map((item) => (
              <button 
                key={item.title}
                onClick={() => { setSelectedType(`${item.title} (${item.duration})`); setStep(2); }}
                className="w-full text-left p-6 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-[2rem] group transition-all duration-300 flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <Video className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold font-serif text-lg">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 font-light ml-7">{item.desc}</p>
                </div>
                <span className="px-4 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  {item.duration}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 hover:text-emerald-600">← Retour aux types</button>
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-8">Vos disponibilités</h3>
          
          <div className="mb-10">
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">1. Sélectionnez une date</p>
            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {availableDates.map((date, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedDate(date); setSelectedSlot(''); }}
                  className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    selectedDate?.toDateString() === date.toDateString() 
                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                  <span className="text-2xl font-serif font-bold my-1">{date.getDate()}</span>
                  <span className="text-[9px] font-medium">{date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="animate-scale-in">
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-4">2. Sélectionnez un créneau (GMT)</p>
              <div className="grid grid-cols-3 gap-3 mb-10">
                {timeSlots.map(slot => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <button 
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all relative overflow-hidden ${
                        selectedSlot === slot 
                        ? 'bg-emerald-500 text-white shadow-lg' 
                        : isBooked
                        ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        : 'bg-white border border-slate-100 text-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {slot}
                      {isBooked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
                           <span className="text-[8px] font-black uppercase tracking-tighter opacity-40">Indisponible</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button 
                onClick={() => setStep(3)}
                disabled={!selectedSlot}
                className="w-full py-5 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
              >
                Valider ce créneau <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-in">
          <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 hover:text-emerald-600">← Retour au planning</button>
          <div className="bg-emerald-50 p-6 rounded-3xl mb-8 flex items-center gap-4 border border-emerald-100">
             <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-center leading-none shadow-lg">
                <span className="text-[10px] block uppercase">{selectedDate?.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                <span className="text-xl block">{selectedDate?.getDate()}</span>
             </div>
             <div>
               <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Créneau Réservé</p>
               <p className="font-serif font-bold text-slate-900 text-lg">{selectedSlot} • {selectedType}</p>
             </div>
          </div>

          <form onSubmit={handleBook} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-2">Identité</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-slate-700"
                  placeholder="Votre Nom Complet"
                />
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-2">Institution</label>
               <div className="relative group">
                 <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                   required
                   value={formData.institution}
                   onChange={e => setFormData({...formData, institution: e.target.value})}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-slate-700"
                   placeholder="Entreprise / Organisme"
                 />
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-2">Contact Direct</label>
               <div className="relative group">
                 <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                   type="email"
                   required
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-slate-700"
                   placeholder="email@professionnel.ci"
                 />
               </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl flex items-center justify-center gap-3 mt-4"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              Confirmer le Rendez-vous
            </button>
          </form>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-10 animate-scale-in">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-serif font-bold text-slate-900 mb-4">Créneau Pré-réservé</h3>
          <p className="text-slate-500 font-light leading-relaxed mb-8">
            Votre demande d'intervention pour le <strong>{selectedDate?.toLocaleDateString('fr-FR')} à {selectedSlot}</strong> a été transmise.
            <br/>Un consultant senior validera la disponibilité sous 2h.
          </p>
          <button onClick={() => { setStep(1); setSelectedDate(null); setSelectedSlot(''); }} className="px-8 py-3 bg-slate-100 text-slate-600 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-slate-200">
            Nouvelle demande
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingModule;
