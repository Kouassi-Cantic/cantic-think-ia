import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, Users, Clock, 
  CheckCircle2, ArrowRight, Zap, 
  ShieldCheck, Sparkles, BookOpen,
  Target, Award, Star, Loader2,
  ChevronRight, PlayCircle, MessageSquare, Download,
  Calendar, MapPin
} from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc } from "firebase/firestore";
import SEO from '../components/SEO';
import { TrainingCourse } from '../types';

const Training: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseParam = searchParams.get('course');
  const [courses, setCourses] = useState<TrainingCourse[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    phone: '',
    specificNeeds: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "registrations"), {
        ...formData,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title_professional,
        createdAt: new Date().toISOString(),
        status: 'new',
        templateName: 'training_registration'
      });
      setRegistrationSuccess(true);
      setFormData({ name: '', email: '', institution: '', phone: '', specificNeeds: '' });
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue lors de l'inscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("📡 Training : Démarrage de l'écoute Firestore...");
    
    if (!db) {
      console.error("❌ Training : L'instance Firestore (db) n'est pas initialisée.");
      setLoading(false);
      return;
    }

    // Sécurité : Timeout de 10 secondes pour le chargement
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("⚠️ Training : Le chargement Firestore prend trop de temps, arrêt forcé.");
        setLoading(false);
      }
    }, 10000);

    try {
      const q = query(collection(db, "formations"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snapshot) => {
        clearTimeout(timeoutId);
        console.log("📥 Training : Snapshot reçu, nb docs =", snapshot.size);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainingCourse[];
        setCourses(data);
        setLoading(false);
      }, (error) => {
        clearTimeout(timeoutId);
        console.error("❌ Training : Erreur Firestore détaillée :", error);
        setLoading(false);
      });

      const unsubReg = onSnapshot(collection(db, "registrations"), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRegistrations(data);
      });

      return () => {
        clearTimeout(timeoutId);
        unsub();
        unsubReg();
      };
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("❌ Training : Erreur lors de la création de l'écouteur :", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (courseParam && courses.length > 0) {
      const course = courses.find(c => c.slug === courseParam || c.id === courseParam);
      if (course) {
        setSelectedCourse(course);
        setShowModal(true);
      }
    }
  }, [courseParam, courses]);

  return (
    <div className="bg-[#fcfcfd] overflow-x-hidden">
      <SEO 
        title="Formations IA - CANTIC THINK IA" 
        description="Programmes de formation et d'acculturation à l'Intelligence Artificielle pour les décideurs et les équipes opérationnelles."
      />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-8 block"
            >
              Académie de Haute Performance
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl lg:text-9xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-12"
            >
              FORMEZ <br /> <span className="text-emerald-500">L'AVENIR.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl lg:text-2xl text-slate-400 font-light max-w-2xl leading-relaxed"
            >
              L'IA n'est pas qu'un outil technique, c'est une <span className="text-white font-bold italic">compétence stratégique</span>. Nous préparons vos équipes à dominer l'ère de l'intelligence augmentée.
            </motion.p>
          </div>
        </div>
      </section>

      {/* --- COURSES GRID --- */}
      <section className="py-32 lg:py-48">
        <div className="container mx-auto px-6 lg:px-20">
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-6">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement du catalogue...</p>
              <button 
                onClick={async () => {
                  const { testFirestoreConnection } = await import('../firebase');
                  const ok = await testFirestoreConnection();
                  if (!ok) alert("❌ Impossible de se connecter à Firestore. Vérifiez la console.");
                  else alert("✅ Connexion Firestore OK. Si le chargement continue, vérifiez les données.");
                }}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors"
              >
                Tester la connexion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {courses.map((course, i) => {
                const courseRegs = registrations.filter(r => r.courseId === course.id || r.courseTitle === course.title_professional);
                const regCount = courseRegs.length;
                const totalSeats = course.totalSeats || 20;
                const remainingSeats = Math.max(0, totalSeats - regCount);
                const isEarlyBird = regCount < 10 && course.discountRate;
                const isSoldOut = remainingSeats === 0;

                return (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 flex flex-col relative overflow-hidden"
                  >
                    {isEarlyBird && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white px-8 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest shadow-lg z-10">
                        Early Bird -{course.discountRate}%
                      </div>
                    )}

                    {course.imageUrl && (
                      <div className="absolute top-0 left-0 w-full h-32 overflow-hidden opacity-10 group-hover:opacity-20 transition-opacity">
                        <img src={course.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="w-16 h-16 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-lg border border-emerald-100">{course.level}</span>
                        {course.totalSeats && (
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${remainingSeats <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
                            {isSoldOut ? 'Complet' : `${remainingSeats} places restantes`}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-serif font-bold text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors leading-tight">{course.title_professional}</h3>
                    <p className="text-slate-500 font-light leading-relaxed mb-10 italic">« {course.benefit_micro} »</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-12">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Durée</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Clock className="w-3 h-3 text-emerald-500" /> {course.curriculum?.duration}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Investissement</p>
                        <div className="flex flex-col">
                          {isEarlyBird ? (
                            <>
                              <p className="text-[10px] text-slate-400 line-through">{course.price}</p>
                              <p className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Zap className="w-3 h-3 text-emerald-500" /> {parseInt(course.price?.replace(/[^0-9]/g, '') || '0') * (1 - (course.discountRate || 0) / 100)} FCFA*</p>
                            </>
                          ) : (
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><Zap className="w-3 h-3 text-emerald-500" /> {course.price || 'Sur demande'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-12">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Date</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-emerald-500" /> 
                          {course.trainingDate || 'À venir'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Lieu</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-emerald-500" /> 
                          {course.location || 'En ligne / Abidjan'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button 
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowModal(true);
                          setRegistrationSuccess(false);
                        }}
                        disabled={isSoldOut}
                        className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl ${isSoldOut ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-900/10'}`}
                      >
                        {isSoldOut ? 'Session Complète' : 'Détails et Inscription'} <ArrowRight className="w-4 h-4" />
                      </button>

                      {course.brochureUrl && (
                        <a 
                          href={course.brochureUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-full py-4 rounded-2xl font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                        >
                          <Download className="w-4 h-4" /> Télécharger la plaquette
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- REGISTRATION MODAL --- */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
          <div className="w-full max-w-5xl bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative my-auto animate-scale-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-12 right-12 w-16 h-16 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all"
            >
              <Zap className="w-6 h-6 rotate-45" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div className="space-y-12">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-4 block">Programme de Formation</span>
                  <h3 className="text-4xl lg:text-6xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter">
                    {selectedCourse.title_professional.split(' ').map((word, i) => (
                      <React.Fragment key={i}>{word} {i === 1 && <br />}</React.Fragment>
                    ))}
                  </h3>
                </div>

                <div className="space-y-8">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-emerald-500" /> Curriculum
                    </h4>
                    <ul className="space-y-4">
                      {selectedCourse.curriculum?.modules.map((module, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-700 font-bold text-sm">
                          <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[10px] text-emerald-600 font-black">{i + 1}</div>
                          {module}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Niveau</p>
                      <p className="text-sm font-bold text-slate-900">{selectedCourse.level}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Durée</p>
                      <p className="text-sm font-bold text-slate-900">{selectedCourse.curriculum?.duration}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Prix</p>
                      <div className="flex flex-col">
                        {(() => {
                          const courseRegs = registrations.filter(r => r.courseId === selectedCourse.id || r.courseTitle === selectedCourse.title_professional);
                          const isEarlyBird = courseRegs.length < 10 && selectedCourse.discountRate;
                          if (isEarlyBird) {
                            const basePrice = parseInt(selectedCourse.price?.replace(/[^0-9]/g, '') || '0');
                            const discountedPrice = basePrice * (1 - (selectedCourse.discountRate || 0) / 100);
                            return (
                              <>
                                <span className="text-[10px] text-slate-400 line-through">{selectedCourse.price}</span>
                                <span className="text-sm font-bold text-emerald-600">{discountedPrice.toLocaleString()} FCFA*</span>
                              </>
                            );
                          }
                          return <span className="text-sm font-bold text-slate-900">{selectedCourse.price || 'Sur demande'}</span>;
                        })()}
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Places</p>
                      {(() => {
                        const courseRegs = registrations.filter(r => r.courseId === selectedCourse.id || r.courseTitle === selectedCourse.title_professional);
                        const remaining = Math.max(0, (selectedCourse.totalSeats || 20) - courseRegs.length);
                        return <p className={`text-sm font-bold ${remaining <= 3 ? 'text-red-500' : 'text-slate-900'}`}>{remaining} restantes</p>;
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-emerald-500" /> 
                        {selectedCourse.trainingDate || 'À venir'}
                      </p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Lieu</p>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-emerald-500" /> 
                        {selectedCourse.location || 'En ligne / Abidjan'}
                      </p>
                    </div>
                  </div>

                  {selectedCourse.brochureUrl && (
                    <a 
                      href={selectedCourse.brochureUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-4 px-8 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-200/50"
                    >
                      <Download className="w-4 h-4" /> Télécharger la plaquette complète (PDF)
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-[3rem] p-12 lg:p-16 border border-slate-100">
                {registrationSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-scale-in">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-serif font-black text-slate-950 mb-4">Demande Reçue !</h4>
                      <p className="text-slate-500 font-light leading-relaxed">
                        Votre demande de pré-inscription pour <span className="font-bold text-slate-900">"{selectedCourse.title_professional}"</span> a été enregistrée. Notre équipe vous contactera sous 24h.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="px-12 py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-8">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-serif font-black text-slate-950">Pré-inscription</h4>
                      <p className="text-xs text-slate-400 font-light">Remplissez ce formulaire pour recevoir le catalogue détaillé et les prochaines dates.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom Complet</label>
                        <input 
                          type="text" 
                          required
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all"
                          placeholder="Ex: Jean Kouassi"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Institutionnel</label>
                        <input 
                          type="email" 
                          required
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all"
                          placeholder="Ex: j.kouassi@institution.ci"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Institution / Entreprise</label>
                        <input 
                          type="text" 
                          required
                          value={formData.institution}
                          onChange={e => setFormData({...formData, institution: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all"
                          placeholder="Ex: Ministère de l'Économie Numérique"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Téléphone</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all"
                          placeholder="Ex: +225 07 00 00 00 00"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Besoins Spécifiques / Questions</label>
                        <textarea 
                          value={formData.specificNeeds}
                          onChange={e => setFormData({...formData, specificNeeds: e.target.value})}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all h-32 resize-none"
                          placeholder="Décrivez vos attentes ou posez vos questions ici..."
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-6 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl disabled:opacity-50 flex items-center justify-center gap-4"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer ma demande"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WHY CHOOSE US --- */}
      <section className="py-32 lg:py-48 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 mb-6 block">Notre Différentiel</span>
              <h2 className="text-5xl lg:text-7xl font-serif font-black italic text-slate-950 leading-[0.9] tracking-tighter mb-12">
                UNE PÉDAGOGIE <br /> DE LA PREUVE.
              </h2>
              <div className="space-y-10">
                {[
                  { icon: Zap, title: "Pragmatisme Absolu", desc: "Pas de théorie inutile. Chaque module est conçu pour être appliqué immédiatement dans votre contexte métier." },
                  { icon: ShieldCheck, title: "Expertise Souveraine", desc: "Des formations adaptées aux réalités et aux défis spécifiques du continent africain." },
                  { icon: Award, title: "Certification d'Excellence", desc: "Validez vos compétences avec une certification reconnue par les acteurs de l'écosystème IA." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                      <item.icon className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-serif font-bold text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-500 font-light leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[5rem] blur-3xl -z-10 animate-pulse"></div>
              <div className="bg-slate-900 p-12 lg:p-20 rounded-[5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <h3 className="text-3xl font-serif font-bold mb-8 italic">« L'éducation est l'arme la plus puissante pour changer le monde. L'IA est le levier qui décuple cette puissance. »</h3>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">Pôle Académique</p>
                    <p className="text-slate-400 text-sm font-light">CANTIC THINK IA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 lg:py-48 bg-slate-950 text-center">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-5xl lg:text-8xl font-serif font-black italic text-white leading-[0.85] tracking-tighter mb-16">
            INVESTISSEZ <br /> DANS VOTRE <br /> <span className="text-emerald-500">CAPITAL HUMAIN.</span>
          </h2>
          <button 
            onClick={() => navigate('/contact')}
            className="px-16 py-8 bg-white text-slate-950 rounded-3xl font-black uppercase text-[12px] tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
          >
            Demander un Catalogue Sur-Mesure
          </button>
        </div>
      </section>
    </div>
  );
};

export default Training;
