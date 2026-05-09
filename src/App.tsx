import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';

// Layouts
import Layout from './components/Layout';
import YouthLayout from './components/YouthLayout';
import AdminLayout from './components/AdminLayout';

// Protected Routes
import AdminRoute from './components/AdminRoute';
import ClientRoute from './components/ClientRoute';

// Lazy Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Services = lazy(() => import('./pages/Services'));
const Applications = lazy(() => import('./pages/Applications'));
const Training = lazy(() => import('./pages/Training'));
const Shop = lazy(() => import('./pages/Shop'));
const Blog = lazy(() => import('./pages/Blog'));
const JeunesHub = lazy(() => import('./pages/JeunesHub'));
const ForumList = lazy(() => import('./components/ForumList'));
const PostEditor = lazy(() => import('./components/PostEditor'));
const TopicDetail = lazy(() => import('./components/TopicDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Legal = lazy(() => import('./pages/Legal'));
const DirectOffers = lazy(() => import('./pages/DirectOffers'));
const ROISimulatorPage = lazy(() => import('./pages/ROISimulatorPage'));
const ServiceConseil = lazy(() => import('./pages/ServiceConseil'));
const ServiceIngenierie = lazy(() => import('./pages/ServiceIngenierie'));
const ServiceAutomatisation = lazy(() => import('./pages/ServiceAutomatisation'));
const ServiceGouvernance = lazy(() => import('./pages/ServiceGouvernance'));
const ServiceFormation = lazy(() => import('./pages/ServiceFormation'));
const ServiceDeveloppement = lazy(() => import('./pages/ServiceDeveloppement'));
const TalentExplorer = lazy(() => import('./pages/jeunes/TalentExplorer'));
const LaboProjets = lazy(() => import('./pages/jeunes/LaboProjets'));
const MurVictoires = lazy(() => import('./pages/jeunes/MurVictoires'));
const Challenges = lazy(() => import('./pages/jeunes/Challenges'));
const FormationGrandColibri = lazy(() => import('./pages/jeunes/FormationGrandColibri'));
const QuizIA = lazy(() => import('./pages/jeunes/QuizIA'));
const UserProfile = lazy(() => import('./pages/jeunes/UserProfile'));
const Videos = lazy(() => import('./pages/jeunes/Videos'));
const ManifesteColibri = lazy(() => import('./pages/ManifesteColibri'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Auth Pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const ClientLogin = lazy(() => import('./pages/ClientLogin'));

// Protected Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminLaboProjets = lazy(() => import('./pages/AdminLaboProjets'));

const App: React.FC = () => {
  const RootElement = () => {
    const isYouth = localStorage.getItem('user_type') === 'youth';
    return isYouth ? <YouthLayout /> : <Layout />;
  };

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Conditional Routes with Switchable Layout */}
              <Route path="/" element={<RootElement />}>
              <Route index element={<Home />} />
              <Route path="a-propos" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="applications" element={<Applications />} />
              <Route path="formations" element={<Training />} />
              <Route path="boutique" element={<Shop />} />
              <Route path="blog" element={<Blog />} />
              <Route path="jeunes" element={<JeunesHub />} />
              <Route path="manifeste-colibri" element={<ManifesteColibri />} />
              <Route path="forum" element={<ForumList />} />
              <Route path="forum/new" element={<PostEditor />} />
              <Route path="forum/post/:postId" element={<TopicDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="legal" element={<Legal />} />
              <Route path="offres-directes" element={<DirectOffers />} />
              <Route path="explorateur-talents" element={<TalentExplorer />} />
              <Route path="labo-projets" element={<LaboProjets />} />
              <Route path="mur-victoires" element={<MurVictoires />} />
              <Route path="challenges" element={<Challenges />} />
              <Route path="formation-grand-colibri" element={<FormationGrandColibri />} />
              <Route path="quiz-ia" element={<QuizIA />} />
              <Route path="profil" element={<UserProfile />} />
              <Route path="videos" element={<Videos />} />
              <Route path="roi-simulator" element={<ROISimulatorPage />} />
              <Route path="service-conseil" element={<ServiceConseil />} />
              <Route path="service-ingenierie" element={<ServiceIngenierie />} />
              <Route path="service-automatisation" element={<ServiceAutomatisation />} />
              <Route path="service-gouvernance" element={<ServiceGouvernance />} />
              <Route path="service-formation" element={<ServiceFormation />} />
              <Route path="service-developpement" element={<ServiceDeveloppement />} />
              
              {/* Client Auth */}
              <Route path="client/login" element={<ClientLogin />} />
            </Route>

            {/* Client Protected Routes (No Main Layout) */}
            <Route path="client/dashboard" element={
              <ClientRoute>
                <ClientDashboard />
              </ClientRoute>
            } />

            {/* Admin Auth (No Layout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Protected Routes with Admin Layout */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="shop" element={<AdminDashboard />} />
              <Route path="training" element={<AdminDashboard />} />
              <Route path="blog" element={<AdminDashboard />} />
              <Route path="labo-projets" element={<AdminLaboProjets />} />
              <Route path="bookings" element={<AdminDashboard />} />
              <Route path="cases" element={<AdminDashboard />} />
              <Route path="transactions" element={<AdminDashboard />} />
              <Route path="quotes" element={<AdminDashboard />} />
              <Route path="contacts" element={<AdminDashboard />} />
              <Route path="settings" element={<AdminDashboard />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
