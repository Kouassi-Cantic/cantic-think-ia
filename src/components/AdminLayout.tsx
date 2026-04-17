import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, 
  Users, Settings, LogOut, 
  MessageSquare, Calendar, 
  FileText, GraduationCap,
  ChevronRight, Sparkles, ShieldCheck,
  Briefcase, Banknote, Mail, Rocket
} from 'lucide-react';
import Logo from './Logo';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('cantic_admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Vue d\'ensemble', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Agenda Expert', path: '/admin/bookings' },
    { icon: Briefcase, label: 'Réalisations', path: '/admin/cases' },
    { icon: GraduationCap, label: 'Formations', path: '/admin/training' },
    { icon: ShoppingBag, label: 'Boutique', path: '/admin/shop' },
    { icon: MessageSquare, label: 'Réflexions', path: '/admin/blog' },
    { icon: Banknote, label: 'Flux Financiers', path: '/admin/transactions' },
    { icon: Rocket, label: 'Offres Directes', path: '/admin/quotes' },
    { icon: Mail, label: 'Communication', path: '/admin/contacts' },
    { icon: Users, label: 'Gouvernance', path: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-80 bg-cantic-dark text-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-8 border-b border-white/5">
          <Link to="/" className="hover:opacity-80 transition-opacity inline-block">
            <Logo variant="light" className="scale-90 origin-left" />
          </Link>
          <div className="mt-8 flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Admin Protocol</p>
              <p className="text-sm font-bold truncate">K. Ouréga Goblé</p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                  isActive 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-80 p-12">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
