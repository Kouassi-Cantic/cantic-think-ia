import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    let detailedInfo = '';
    try {
      // Tenter de parser si c'est notre format JSON Firestore
      const parsed = JSON.parse(error.message);
      detailedInfo = JSON.stringify(parsed, null, 2);
    } catch (e) {
      detailedInfo = error.stack || error.message;
    }
    
    this.setState({ errorInfo: detailedInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl border border-red-100 overflow-hidden">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
                <ShieldAlert className="w-12 h-12" />
              </div>
              
              <h1 className="text-3xl font-serif font-black text-slate-900 mb-4">
                Une erreur inattendue est survenue
              </h1>
              
              <p className="text-slate-500 mb-10 leading-relaxed">
                Le système a rencontré une anomalie technique. Nos équipes de gouvernance numérique ont été alertées.
              </p>

              {this.state.errorInfo && (
                <div className="mb-10 text-left bg-slate-900 rounded-2xl p-6 overflow-auto max-h-60 border border-slate-800 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Rapport d'incident technique
                  </p>
                  <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {this.state.errorInfo}
                  </pre>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg"
                >
                  <RefreshCcw className="w-4 h-4" /> Recharger l'application
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
                >
                  <Home className="w-4 h-4" /> Retour à l'accueil
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 px-12 py-6 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                CANTIC THINK-IA &copy; 2026 &bull; Système de Gouvernance Sécurisé
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
