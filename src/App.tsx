import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Backtest from './pages/Backtest';
import Assets from './pages/Assets';

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded font-medium transition-colors ${isActive
                ? 'bg-amber-500 text-black'
                : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/assets"
            className={({ isActive }) =>
              `px-4 py-2 rounded font-medium transition-colors ${isActive
                ? 'bg-amber-500 text-black'
                : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            Assets
          </NavLink>
          <NavLink
            to="/backtest"
            className={({ isActive }) =>
              `px-4 py-2 rounded font-medium transition-colors ${isActive
                ? 'bg-amber-500 text-black'
                : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            Backtest
          </NavLink>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/backtest" element={<Backtest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
