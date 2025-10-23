import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import AdminEntry from './admin/AdminEntry';
import PortfolioList from './admin/portfolio/PortfolioList';
import PortfolioForm from './admin/portfolio/PortfolioForm';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
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
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/portfolio" element={<PortfolioList />} />
          <Route path="/admin/portfolio/new" element={<PortfolioForm />} />
          <Route path="/admin/portfolio/:id/edit" element={<PortfolioForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
