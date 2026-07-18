
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Users,
    BarChart3,
    Boxes,
    ShieldCheck,
    ArrowRight,
    Menu,
    X,
    CheckCircle2,
    Globe2,
    Zap
} from 'lucide-react';
import Navbar from '../components/Navbar';

import gtrLogo from '../assets/gtr.png';
import hrmsImg from '../assets/hrms_crm_module.png';
import posImg from '../assets/pos_sales_module.png';
import prodImg from '../assets/production_material_module.png';



const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-6 flex flex-col items-center text-center z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-[#1a237e] text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Introducing Enterprise 2.0
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl animate-fade-in-up animation-delay-200 leading-tight">
                    Empower Your Workforce at <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a237e] to-indigo-600">Enterprise Scale</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl animate-fade-in-up animation-delay-400 leading-relaxed">
                    Simplify operations with our unified platform for HRMS, POS, and Production. Secure, compliant, and scalable for modern businesses.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-400">
                    <Link to="/register" className="px-8 py-4 rounded-full bg-[#1a237e] text-white font-semibold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-300 hover:-translate-y-1 flex items-center gap-2">
                        Start for Free <ArrowRight className="h-5 w-5" />
                    </Link>
                    <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full bg-white text-slate-700 border border-slate-200 font-semibold text-lg hover:bg-slate-50 transition-all hover:border-slate-300 flex items-center gap-2">
                        Explore Features
                    </button>
                </div>

                {/* Dashboard Preview / Abstract Graphic */}
                <div className="mt-16 relative w-full max-w-5xl animate-fade-in-up animation-delay-400">
                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white/50 backdrop-blur-sm p-4">
                        <img src={hrmsImg} alt="Dashboard Preview" className="w-full h-auto rounded-lg shadow-inner" />

                        {/* Floating elements */}
                        <div className="absolute -right-8 -bottom-8 w-48 bg-white p-4 rounded-lg shadow-xl border border-slate-100 animate-float hidden md:block">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-md">
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500">Growth</div>
                                    <div className="text-sm font-bold text-slate-800">+24.5%</div>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
                            </div>
                        </div>

                        <div className="absolute -left-8 top-1/2 w-56 bg-white p-4 rounded-lg shadow-xl border border-slate-100 animate-float animation-delay-200 hidden md:block">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Users className="h-5 w-5 text-[#1a237e]" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800">New Onboarding</div>
                                    <div className="text-xs text-slate-500">Alex Johnson joined design team</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            title: "HRMS & CRM",
            description: "Unified platform for employee lifecycle, payroll, attendance, and customer relationship management.",
            image: hrmsImg,
            color: "bg-blue-50 text-[#1a237e]"
        },
        {
            title: "POS & Sales",
            description: "Streamline retail operations with advanced Point of Sale, inventory tracking, and sales analytics.",
            image: posImg,
            color: "bg-indigo-50 text-indigo-600"
        },
        {
            title: "Production & Material",
            description: "Control your manufacturing floor. Manage BOMs, work orders, and supply chain logistics efficiently.",
            image: prodImg,
            color: "bg-emerald-50 text-emerald-600"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Powerful Features for Modern Enterprises</h2>
                    <p className="text-lg text-slate-600">
                        Everything you need to manage your business, from people to products, in one cohesive ecosystem.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    {features.map((feature, idx) => (
                        <div key={idx} className="group relative rounded-2xl border border-slate-100 bg-white p-2 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                            <div className="relative h-48 overflow-hidden rounded-xl bg-slate-50">
                                <img src={feature.image} alt={feature.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-6">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.color}`}>
                                    {idx === 0 && <Users className="h-6 w-6" />}
                                    {idx === 1 && <BarChart3 className="h-6 w-6" />}
                                    {idx === 2 && <Boxes className="h-6 w-6" />}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-600 mb-4">{feature.description}</p>
                                <Link to="/register" className="inline-flex items-center text-[#1a237e] font-medium hover:text-blue-700">
                                    Learn more <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Benefits = () => {
    return (
        <section id="benefits" className="py-24 bg-slate-50">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Why Industry Leaders Choose GTR</h2>
                        <div className="space-y-8">
                            {[
                                { title: "Global Scalability", desc: "Designed to grow with you. Handle multi-location, multi-currency operations effortlessly.", icon: <Globe2 className="h-6 w-6" /> },
                                { title: "Enterprise Security", desc: "Bank-grade data encryption, role-based access control, and full audit logs.", icon: <ShieldCheck className="h-6 w-6" /> },
                                { title: "Real-time Analytics", desc: "Make data-driven decisions with instant insights into every aspect of your business.", icon: <Zap className="h-6 w-6" /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 text-[#1a237e] flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 absolute -z-10 top-0 right-0 w-full h-full blur-3xl opacity-50"></div>
                        <img src={prodImg} alt="Analytics" className="relative z-10 w-full rounded-2xl shadow-2xl bg-white/50 backdrop-blur-sm p-4 border border-white/50" />
                    </div>
                </div>
            </div>
        </section>
    );
}

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl font-bold text-white">GTR Services</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Empowering businesses with next-generation enterprise resource planning solutions.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} GTR Services. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Benefits />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
