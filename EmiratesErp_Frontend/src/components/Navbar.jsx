import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import gtrLogo from '../assets/gtr.png';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const modules = [
    { name: 'HRMS', path: '/features#hrms' },
    { name: 'POS', path: '/features#pos' },
    { name: 'CRM', path: '/features#crm' },
    { name: 'Production', path: '/features#production' },
    { name: 'Sales', path: '/features#sales' },
    { name: 'Purchases', path: '/features#purchases' },
    { name: 'Material Requisition', path: '/features#material-requisition' },
    { name: 'Inventory', path: '/features#inventory' },
    { name: 'Accounting', path: '/features#accounting' },
    { name: 'Manufacturing', path: '/features#manufacturing' },
    { name: 'Project Management', path: '/features#project-management' },
    { name: 'Warehouse', path: '/features#warehouse' },
    { name: 'Supplier', path: '/features#supplier' },
    { name: 'Tendering', path: '/features#tendering' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFeaturesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigate = (path) => {
    setFeaturesDropdownOpen(false);
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      // Check if we are already home
      if (window.location.pathname === '/') {
        const element = document.querySelector(path.replace('/', ''));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(path.replace('/', ''));
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white/80 backdrop-blur-sm py-4 border-b border-gray-100'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <img src={gtrLogo} alt="GTR Services" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            GTR <span className="text-[#1a237e]">Services</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {/* Features Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#1a237e] transition-colors focus:outline-none"
            >
              Features <ChevronDown className={`h-4 w-4 transition-transform ${featuresDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {featuresDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[600px] bg-white rounded-xl shadow-2xl border border-slate-100 p-6 grid grid-cols-2 gap-x-8 gap-y-2 animate-fade-in-up z-50 before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:w-4 before:h-4 before:bg-white before:rotate-45 before:border-l before:border-t before:border-slate-100">
                {modules.map((mod, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(mod.path)}
                    className="text-left px-4 py-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-[#1a237e] text-sm font-medium transition-colors flex items-center justify-between group"
                  >
                    {mod.name}
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="/#benefits" className="text-sm font-medium text-slate-600 hover:text-[#1a237e] transition-colors">Benefits</a>
          <a href="/#pricing" className="text-sm font-medium text-slate-600 hover:text-[#1a237e] transition-colors">Pricing</a>
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-[#1a237e] transition-colors">Login</Link>
          <Link to="/register" className="px-5 py-2.5 rounded-full bg-[#1a237e] text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200">
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6 text-slate-900" /> : <Menu className="h-6 w-6 text-slate-900" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-lg h-[calc(100vh-80px)] overflow-y-auto p-6 flex flex-col gap-6 animate-fade-in-up">
          <div>
            <div className="text-xs font-bold uppercase text-slate-400 mb-2">Features</div>
            <div className="grid grid-cols-1 gap-2 pl-2">
              {modules.map((mod, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNavigate(mod.path)}
                  className="text-left py-2 text-slate-600 hover:text-[#1a237e] text-base font-medium border-b border-slate-50 last:border-none"
                >
                  {mod.name}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100"></div>
          <a href="/#benefits" className="text-base font-medium text-slate-600" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
          <a href="/#pricing" className="text-base font-medium text-slate-600" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <Link to="/login" className="text-base font-medium text-blue-600" onClick={() => setMobileMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn-primary w-full text-center" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;