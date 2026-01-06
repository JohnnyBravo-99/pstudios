import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { DataCacheProvider, useDataCache } from './context/DataCacheContext';
import { RoutePrefetcher } from './components/RoutePrefetcher';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './admin/Login';
import AdminEntry from './admin/AdminEntry';
import PasswordReset from './admin/PasswordReset';
import PasswordSetup from './admin/PasswordSetup';
import PortfolioList from './admin/portfolio/PortfolioList';
import PortfolioForm from './admin/portfolio/PortfolioForm';
import BlogList from './admin/blog/BlogList';
import BlogForm from './admin/blog/BlogForm';

// Component to handle background prefetching
function PrefetchManager() {
  const { prefetchPortfolio } = useDataCache();
  const location = useLocation();

  useEffect(() => {
    // Prefetch portfolio data after a short delay (don't block initial render)
    const timer = setTimeout(() => {
      if (location.pathname !== '/portfolio') {
        prefetchPortfolio();
      }
    }, 2000); // Wait 2 seconds after app load

    return () => clearTimeout(timer);
  }, [prefetchPortfolio, location.pathname]);

  return null;
}

function AppContent() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <PrefetchManager />
      <RoutePrefetcher />
      <div className="App">
        <Routes>
          {/* Main Site Routes with Header */}
          <Route path="/" element={
            <>
              <Header />
              <main className="main-content">
                <Home />
              </main>
            </>
          } />
          <Route path="/about" element={
            <>
              <Header />
              <main className="main-content">
                <About />
              </main>
            </>
          } />
          <Route path="/portfolio" element={
            <>
              <Header />
              <main className="main-content">
                <Portfolio />
              </main>
            </>
          } />
          <Route path="/services" element={
            <>
              <Header />
              <main className="main-content">
                <Services />
              </main>
            </>
          } />
          <Route path="/contact" element={
            <>
              <Header />
              <main className="main-content">
                <Contact />
              </main>
            </>
          } />

          {/* Admin Routes */}
          <Route path="/cp-admin" element={<AdminEntry />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminEntry />} />
          <Route path="/admin/reset-password" element={<PasswordReset />} />
          <Route path="/admin/setup-password" element={<PasswordSetup />} />
          <Route path="/admin/portfolio" element={<PortfolioList />} />
          <Route path="/admin/portfolio/new" element={<PortfolioForm />} />
          <Route path="/admin/portfolio/:id/edit" element={<PortfolioForm />} />
          <Route path="/admin/blog" element={<BlogList />} />
          <Route path="/admin/blog/new" element={<BlogForm />} />
          <Route path="/admin/blog/:id/edit" element={<BlogForm />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <DataCacheProvider>
      <AppContent />
    </DataCacheProvider>
  );
}

export default App;
