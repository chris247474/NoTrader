import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Backtest from './pages/Backtest';
import Assets from './pages/Assets';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded font-medium transition-colors ${isActive
      ? 'bg-amber-500 text-black'
      : 'text-slate-300 hover:bg-slate-800'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded font-medium transition-colors ${isActive
      ? 'bg-amber-500 text-black'
      : 'text-slate-300 hover:bg-slate-800'
    }`;

  return (
    <BrowserRouter>
      <nav className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="text-amber-500 font-bold text-lg">NoTrader</div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            <NavLink to="/" end className={navLinkClass}>
              Assets
            </NavLink>
            <NavLink to="/trend-analysis" className={navLinkClass}>
              Trend Analysis
            </NavLink>
            <NavLink to="/backtest" className={navLinkClass}>
              Backtest
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <NavLink to="/" end className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Assets
            </NavLink>
            <NavLink to="/trend-analysis" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Trend Analysis
            </NavLink>
            <NavLink to="/backtest" className={mobileNavLinkClass} onClick={() => setMobileMenuOpen(false)}>
              Backtest
            </NavLink>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Assets />} />
        <Route path="/trend-analysis" element={<Dashboard />} />
        <Route path="/backtest" element={<Backtest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
