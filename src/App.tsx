import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Protected Routes
import AdminRoute from './components/AdminRoute';
import ClientRoute from './components/ClientRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Applications from './pages/Applications';
import Training from './pages/Training';
import Shop from './pages/Shop';
import Blog from './pages/Blog';
import JeunesHub from './pages/JeunesHub';
import ForumList from './components/ForumList';
import PostEditor from './components/PostEditor';
import TopicDetail from './components/TopicDetail';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import DirectOffers from './pages/DirectOffers';
import ROISimulatorPage from './pages/ROISimulatorPage';
import ServiceConseil from './pages/ServiceConseil';
import ServiceIngenierie from './pages/ServiceIngenierie';
import ServiceAutomatisation from './pages/ServiceAutomatisation';
import ServiceGouvernance from './pages/ServiceGouvernance';
import ServiceFormation from './pages/ServiceFormation';
import ServiceDeveloppement from './pages/ServiceDeveloppement';
import NotFound from './pages/NotFound';

// Auth Pages
import AdminLogin from './pages/AdminLogin';
import ClientLogin from './pages/ClientLogin';

// Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            {/* Public Routes with Main Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="a-propos" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="applications" element={<Applications />} />
              <Route path="formations" element={<Training />} />
              <Route path="boutique" element={<Shop />} />
              <Route path="blog" element={<Blog />} />
              <Route path="jeunes" element={<JeunesHub />} />
              <Route path="forum" element={<ForumList />} />
              <Route path="forum/new" element={<PostEditor />} />
              <Route path="forum/post/:postId" element={<TopicDetail />} />
              <Route path="contact" element={<Contact />} />
              <Route path="legal" element={<Legal />} />
              <Route path="offres-directes" element={<DirectOffers />} />
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
        </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
