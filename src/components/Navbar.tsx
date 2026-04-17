import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAVIGATION } from '../constants';
import { Menu, X, ChevronDown, Search, Command, User, AlertCircle } from 'lucide-react';
import Logo from './Logo';
import { YouthAuthModal } from './YouthAuthModal';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isYouthModalOpen, setIsYouthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check if client is logged in
    const clientEmail = localStorage.getItem('cantic_client_email');
    setIsLoggedIn(!!clientEmail);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const triggerSearch = () => {
    window.dispatchEvent(new Event('open-cantic-search'));
  };

  const isHome = location.pathname === '/';
  const navVariant = scrolled ? 'dark' : (isHome ? 'light' : 'dark');
  const textColor = scrolled ? 'text-slate-600' : (isHome ? 'text-slate-900' : 'text-slate-600');
  const hoverColor = scrolled ? 'hover:text-primary' : (isHome ? 'hover:text-primary' : 'hover:text-primary');

  return (
    <nav className={`fixed top-0 w-full z-[900] transition-all duration-500 ${scrolled || isOpen ? 'glass-nav border-b border-slate-200/50 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/90' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center">
          <Link to="/" className="relative z-[950]">
            <Logo variant={isOpen ? 'dark' : navVariant} />
          </Link>

          <div className="hidden lg:flex items-center space-x-12">
            <div className="flex items-center space-x-4">
              {/* SEARCH TRIGGER */}
              <button 
                onClick={triggerSearch}
                className={`group flex items-center gap-3 px-4 py-2 rounded-full transition-all border ${scrolled ? 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-primary/20 hover:bg-white' : (isHome ? 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-primary/20 hover:bg-white' : 'border-slate-200 text-slate-500 hover:border-primary/20')}`}
              >
                <Search className={`w-3.5 h-3.5 transition-colors ${scrolled ? 'group-hover:text-primary' : (isHome ? 'group-hover:text-primary' : 'group-hover:text-primary')}`} />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Recherche</span>
                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${scrolled ? 'bg-slate-200 text-slate-600' : (isHome ? 'bg-slate-200 text-slate-600' : 'bg-slate-100 text-slate-500')}`}>
                   <Command className="w-2.5 h-2.5" /> K
                </div>
              </button>

              {/* DIRECT MEMBER LOGIN */}
              <Link 
                to={isLoggedIn ? "/client/dashboard" : "/client/login"}
                className={`group p-2.5 rounded-full transition-all border ${scrolled ? 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-primary/20 hover:bg-white hover:text-primary' : (isHome ? 'border-slate-200 bg-slate-50/50 text-slate-500 hover:border-primary/20 hover:bg-white hover:text-primary' : 'border-slate-200 text-slate-500 hover:border-primary/20 hover:text-primary')}`}
                title={isLoggedIn ? "Mon Espace" : "Espace Membre"}
              >
                <User className={`w-4 h-4 ${isLoggedIn ? 'text-primary' : ''}`} />
              </Link>
              <button
                 onClick={() => setIsYouthModalOpen(true)}
                 className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${scrolled ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : (isHome ? 'border-white/20 bg-white/10 text-white hover:bg-white/20' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100')}`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Section Jeunes (13+)
              </button>
            </div>

            {NAVIGATION.map((item) => (
              <div 
                key={item.name} 
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.children ? (
                  <button className={`flex items-center space-x-1.5 text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${textColor} hover:text-primary`}>
                    <span>{item.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${location.pathname === item.path ? 'text-primary' : `${textColor} ${hoverColor}`}`}
                  >
                    {item.name}
                  </Link>
                )}

                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full -left-6 w-72 pt-6 transition-all duration-300 opacity-100 translate-y-0">
                    <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden p-3">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className="flex items-center space-x-4 px-5 py-4 rounded-xl hover:bg-slate-50 transition-all group"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary transition-colors">
                            <child.icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-slate-900 block">{child.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Explorer</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/contact" className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${scrolled ? 'bg-slate-900 text-white hover:bg-primary' : (isHome ? 'bg-white text-slate-900 hover:bg-primary hover:text-white' : 'bg-slate-900 text-white hover:bg-primary')}`}>
              Parlons projet
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-4 relative z-[950]">
            <Link to={isLoggedIn ? "/client/dashboard" : "/client/login"} className={`p-2 rounded-xl transition-colors ${isOpen ? 'text-slate-900 bg-slate-100' : (scrolled ? 'text-slate-900 bg-slate-100' : (isHome ? 'text-slate-900 bg-slate-100' : 'text-slate-900 bg-slate-100'))}`}>
              <User className={`w-5 h-5 ${isLoggedIn ? 'text-primary' : ''}`} />
            </Link>
            <button onClick={triggerSearch} className={`p-2 rounded-xl transition-colors ${isOpen ? 'text-slate-900 bg-slate-100' : (scrolled ? 'text-slate-900 bg-slate-100' : (isHome ? 'text-slate-900 bg-slate-100' : 'text-slate-900 bg-slate-100'))}`}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-xl transition-colors ${isOpen ? 'text-slate-900 bg-slate-100' : (scrolled ? 'text-slate-900 bg-slate-100' : (isHome ? 'text-slate-900 bg-slate-100' : 'text-slate-900 bg-slate-100'))}`}>
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[900] bg-white/95 backdrop-blur-xl transition-all duration-500 overflow-hidden flex flex-col h-screen">
          <div className="flex-grow px-8 mt-24 overflow-y-auto space-y-10 pb-32">
            {NAVIGATION.map((item) => (
              <div key={item.name} className="animate-fade-in">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">{item.name}</div>
                <div className="space-y-4">
                  {item.children ? item.children.map(child => (
                     <Link key={child.name} to={child.path} onClick={() => setIsOpen(false)} className="flex items-center space-x-4 group p-2 -mx-2 rounded-xl active:bg-slate-50">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-active:scale-95 transition-transform"><child.icon className="w-5 h-5" /></div>
                       <span className="text-lg font-serif font-bold text-slate-900 leading-tight">{child.name}</span>
                     </Link>
                  )) : (
                     <Link to={item.path} onClick={() => setIsOpen(false)} className="text-2xl font-serif font-bold text-slate-900 block leading-tight active:text-primary transition-colors">{item.name}</Link>
                  )}
                </div>
              </div>
            ))}
            <div className="pt-6">
              <Link to="/contact" onClick={() => setIsOpen(false)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-center font-black uppercase tracking-widest text-sm flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
                Parlons projet
              </Link>
            </div>
          </div>
        </div>
      )}
      <YouthAuthModal isOpen={isYouthModalOpen} onClose={() => setIsYouthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
