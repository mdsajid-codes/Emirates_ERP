import React, { useState } from 'react';
import { LogIn, Sparkles, Eye, EyeOff, Loader, User, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../components/Button';
import AuthNavbar from '../components/AuthNavbar';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTenant } from '../context/TenantContext';
import { saveThemeToStorage, applyTheme } from '../utils/themeUtils';
import { getTenantFromSubdomain } from '../utils/tenantUtils';
import gtrLogo from '../assets/gtr.png';

// Module carousel data — images use new URL() so Vite resolves and fingerprints
// them at build time but keeps them out of the main JS bundle.
const modules = [
    {
        title: "HRMS & CRM",
        description: "Comprehensive Human Resource and Customer Relationship Management. Unify your team and customer interactions.",
        image: new URL('../assets/hrms_crm_module.png', import.meta.url).href,
    },
    {
        title: "POS & Sales",
        description: "Advanced Point of Sale solution. Manage sales, inventory, and customer relationships efficiently.",
        image: new URL('../assets/pos_sales_module.png', import.meta.url).href,
    },
    {
        title: "Production & Material",
        description: "Optimize manufacturing processes, track work orders, manage BOMs, and streamline material requisition.",
        image: new URL('../assets/production_material_module.png', import.meta.url).href,
    },
    {
        title: "Finance & Accounting",
        description: "Streamline procurement, track inventory, and manage financial health with precision.",
        image: new URL('../assets/finance_accounting.png', import.meta.url).href,
    },
    {
        title: "Project Management",
        description: "Plan, execute, and monitor projects with Gantt charts, Kanban boards, and resource tracking.",
        image: new URL('../assets/project_management.png', import.meta.url).href,
    },
    {
        title: "Warehouse & Logistics",
        description: "Optimize storage, streamline picking and packing, and ensure fast, accurate delivery.",
        image: new URL('../assets/logistics_warehouse.png', import.meta.url).href,
    },
    {
        title: "Supply Chain & Tendering",
        description: "Collaborate with suppliers, manage tenders, and build a resilient global supply chain.",
        image: new URL('../assets/supply_chain.png', import.meta.url).href,
    },
];

const Login = () => {
    const resolvedTenantId = getTenantFromSubdomain();

    const [showPassword, setShowPassword] = useState(false);
    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const navigate = useNavigate();
    const { refreshModules } = useTenant();

    const API_URL = import.meta.env.VITE_API_BASE_URL;

    // Module Carousel Effect
    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentModuleIndex((prevIndex) => (prevIndex + 1) % modules.length);
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setCurrentModuleIndex((prev) => (prev + 1) % modules.length);
    };

    const prevSlide = () => {
        setCurrentModuleIndex((prev) => (prev - 1 + modules.length) % modules.length);
    };

    const handleChange = (e) => {
        setLoginData({
            ...loginData, [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!API_URL) {
            setError("API URL is not configured. Please check your .env file.");
            setIsLoading(false);
            return;
        }

        try {
            let response;

            if (resolvedTenantId.toLowerCase() === "master") {
                response = await axios.post(`${API_URL}/master/auth/login`, { username: loginData.email, password: loginData.password });
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('roles', JSON.stringify(response.data.roles))
                localStorage.setItem('username', loginData.email)
                localStorage.setItem('tenantId', 'master')
                console.log(response.data)
            } else {
                response = await axios.post(`${API_URL}/auth/login`, {
                    tenantId: resolvedTenantId,
                    email: loginData.email,
                    password: loginData.password
                });
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('roles', JSON.stringify(response.data.roles))
                localStorage.setItem('username', loginData.email)
                localStorage.setItem('tenantId', resolvedTenantId)
                localStorage.setItem('modules', response.data.modules)
                
                // Handle theme logic
                if (response.data.theme) {
                    saveThemeToStorage(response.data.theme);
                    applyTheme(response.data.theme);
                } else {
                    applyTheme(null); // Reset to default
                }
            }

            // Re-read modules from localStorage into TenantContext so the
            // sidebar reflects the newly logged-in tenant without a page reload.
            refreshModules();

            const rolesString = localStorage.getItem('roles');
            if (rolesString) {
                const roles = JSON.parse(rolesString);
                if (roles.includes('SUPER_ADMIN') || (roles.includes('POS_ADMIN') && roles.includes('HRMS_ADMIN'))) {
                    navigate('/company-dashboard');
                } else if (roles.includes('MASTER_ADMIN')) {
                    navigate('/master-admin');
                } else if (roles.includes('HRMS_ADMIN') || roles.includes('HR')) {
                    navigate('/hrdashboard');
                } else if (roles.includes('POS_ADMIN') || roles.includes('POS_MANAGER') || roles.includes('POS_CASHIER')) {
                    navigate('/pos-dashboard');
                } else if (roles.includes('MANAGER') || roles.includes('EMPLOYEE')) {
                    try {
                        const token = localStorage.getItem('token');
                        const permRes = await axios.get(`${API_URL}/crm/roles/my-permissions`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const perms = permRes.data?.permissions;
                        if (perms && Object.keys(perms).length > 0) {
                            navigate('/crm-dashboard/home');
                            setIsLoading(false);
                            return;
                        }
                    } catch (permErr) {
                        console.error("Failed to check CRM roles on login:", permErr);
                    }
                    navigate('/employee-dashboard');
                } else {
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error("Error during login:", err);
            if (err.response) {
                setError(err.response.data.message || "Invalid credentials or company ID.");
            } else if (err.request) {
                setError("No response from server. Please check your network connection.");
            } else {
                setError("Failed to login. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-12 xl:p-16 relative z-10 bg-white">
                {/* Logo Area */}
                <div className="flex items-center gap-2 mb-8">
                    <Link to="/" className="flex items-center decoration-none">
                        <img src="/Logo_Name.svg" alt="GTR Services" className="h-10 w-auto" />
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <span className="text-[#2AA2A5] font-semibold tracking-wider uppercase text-sm block mb-1">Welcome Back</span>
                        <h1 className="font-heading text-3xl font-bold text-[#112D48] mb-2">LOGIN</h1>
                        <div className="w-12 h-1 bg-[#2AA2A5] rounded-full mb-4"></div>
                        <p className="text-gray-500 text-sm">
                            {resolvedTenantId !== 'master' ? `Signing into: ${resolvedTenantId}` : 'Login to take control of your success today.'}
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-[#2AA2A5]" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="text"
                                    value={loginData.email}
                                    onChange={handleChange}
                                    autoComplete="username"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA2A5] transition-all shadow-sm"
                                    placeholder="Username"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-[#2AA2A5]" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={loginData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA2A5] transition-all shadow-sm"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">{error}</p>}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-[#2AA2A5] hover:bg-[#1d8a8d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2AA2A5] disabled:opacity-50 transition-colors ${!isLoading ? 'animate-pulse-slow' : ''}`}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Submitting...
                                </span>
                            ) : (
                                'Login Now'
                            )}
                        </button>
                    </form>

                    {/* <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-[#1a237e] hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div> */}
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
                    <img src="/icon.svg" alt="Emirates ERP" className="h-4 w-4 opacity-50" />
                    <span>Powered by Emirates ERP</span>
                </div>
            </div>

            {/* Right Side - Branding/Illustration */}
            <div className="hidden lg:flex w-1/2 bg-[#112D48] relative overflow-hidden items-center justify-center transition-all duration-500 ease-in-out">
                {/* Abstract circles/waves for background effect */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#2AA2A5] opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#2AA2A5] opacity-20 blur-3xl animate-pulse delay-700"></div>

                <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center justify-center text-white text-center">

                    <div className="relative w-full flex items-center justify-center mb-8 h-[400px]">
                        {/* Left Arrow */}
                        <button onClick={prevSlide} className="absolute left-0 p-2 rounded-full hover:bg-[#2AA2A5]/20 transition-colors z-20 focus:outline-none">
                            <ChevronLeft className="h-10 w-10 text-white/70 hover:text-white transition-colors" />
                        </button>

                        {/* Module Image */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <img
                                key={currentModuleIndex}
                                src={modules[currentModuleIndex].image}
                                alt={modules[currentModuleIndex].title}
                                className="max-h-full max-w-full object-contain drop-shadow-2xl animate-fade-in transition-all duration-500"
                            />
                        </div>

                        {/* Right Arrow */}
                        <button onClick={nextSlide} className="absolute right-0 p-2 rounded-full hover:bg-[#2AA2A5]/20 transition-colors z-20 focus:outline-none">
                            <ChevronRight className="h-10 w-10 text-white/70 hover:text-white transition-colors" />
                        </button>
                    </div>

                    <div className="font-heading text-3xl font-bold tracking-wider uppercase mb-4 animate-fade-in-up">
                        {modules[currentModuleIndex].title}
                    </div>

                    <p className="text-blue-100 text-lg leading-relaxed animate-fade-in-up animation-delay-200 h-20 px-8">
                        {modules[currentModuleIndex].description}
                    </p>

                    {/* Carousel Indicators */}
                    <div className="flex gap-2 mt-4">
                        {modules.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentModuleIndex(idx)}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentModuleIndex ? 'w-8 bg-[#2AA2A5]' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
