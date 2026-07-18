
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
    Users, ShoppingBag, BarChart3, Boxes, Truck, FileText,
    Settings, ClipboardCheck, Calculator, Briefcase,
    Warehouse, Globe, ScrollText, Hammer
} from 'lucide-react';

import hrmsImg from '../assets/hrms_crm_module.png';
import posImg from '../assets/pos_sales_module.png';
import prodImg from '../assets/production_material_module.png';
import financeImg from '../assets/finance_accounting.png';
import projectImg from '../assets/project_management.png';
import warehouseImg from '../assets/logistics_warehouse.png';
import supplyImg from '../assets/supply_chain.png';

const featuresList = [
    {
        id: 'hrms',
        title: 'Human Resource Management System (HRMS)',
        description: 'A complete suite for managing your workforce. From recruitment to retirement, handle all HR processes seamlessly.',
        need: 'Essential for automating payroll, tracking attendance, managing performance, and maintaining employee records securely.',
        image: hrmsImg,
        icon: <Users className="h-6 w-6" />
    },
    {
        id: 'pos',
        title: 'Point of Sale (POS)',
        description: 'Fast, reliable, and offline-capable POS for retail and hospitality operations.',
        need: 'Crucial for processing transactions quickly, managing cash flow, and providing a smooth checkout experience for customers.',
        image: posImg,
        icon: <ShoppingBag className="h-6 w-6" />
    },
    {
        id: 'crm',
        title: 'Customer Relationship Management (CRM)',
        description: 'Track leads, manage opportunities, and build lasting relationships with your customers.',
        need: ' vital for sales growth, customer retention, and organizing all customer interactions in one place.',
        image: hrmsImg, // Reusing relevant image style
        icon: <Users className="h-6 w-6" />
    },
    {
        id: 'production',
        title: 'Production Planning',
        description: 'Optimize your manufacturing floor with work orders, BOM management, and production scheduling.',
        need: 'Needed to minimize downtime, reduce waste, and ensure timely delivery of manufactured goods.',
        image: prodImg,
        icon: <Settings className="h-6 w-6" />
    },
    {
        id: 'sales',
        title: 'Sales Management',
        description: 'Manage quotations, sales orders, and invoices efficiently. get real-time insights into your sales pipeline.',
        need: 'Key to driving revenue, monitoring sales team performance, and accelerating the quote-to-cash cycle.',
        image: posImg,
        icon: <BarChart3 className="h-6 w-6" />
    },
    {
        id: 'purchases',
        title: 'Purchase Management',
        description: 'Streamline procurement with purchase requests, orders, and vendor management.',
        need: 'Helps in controlling costs, managing supplier relationships, and ensuring timely availability of goods.',
        image: financeImg, // Finance/money related
        icon: <ShoppingBag className="h-6 w-6" />
    },
    {
        id: 'material-requisition',
        title: 'Material Requisition',
        description: 'Internal requests for materials made simple. Track approval flows and material issuance.',
        need: 'Ensures that departments get the necessary materials on time without creating excess inventory.',
        image: prodImg,
        icon: <Boxes className="h-6 w-6" />
    },
    {
        id: 'inventory',
        title: 'Inventory Management',
        description: 'Real-time tracking of stock levels across multiple locations. diverse valuation methods supported.',
        need: 'Prevents stockouts and overstocking, reducing carrying costs and maximizing profitability.',
        image: warehouseImg,
        icon: <Boxes className="h-6 w-6" />
    },
    {
        id: 'accounting',
        title: 'Accounting & Finance',
        description: 'Double-entry general ledger, managing accounts payable/receivable, and financial reporting.',
        need: 'Fundamental for financial health, tax compliance, and understanding the profitability of the business.',
        image: financeImg,
        icon: <Calculator className="h-6 w-6" />
    },
    {
        id: 'fixed-assets',
        title: 'Fixed Assets Management',
        description: 'Track the complete lifecycle of your company\'s fixed assets, from acquisition to disposal and depreciation.',
        need: 'Crucial for accurate balance sheets, automated depreciation calculations, and tracking asset maintenance and location.',
        image: financeImg,
        icon: <LayoutDashboard className="h-6 w-6" />
    },
    {
        id: 'manufacturing',
        title: 'Manufacturing',
        description: 'End-to-end manufacturing execution system (MES) integration for shop floor control.',
        need: 'Required for quality control, machine maintenance tracking, and detailed production analytics.',
        image: prodImg,
        icon: <Hammer className="h-6 w-6" />
    },
    {
        id: 'project-management',
        title: 'Project Management',
        description: 'Plan, execute, and track projects with Gantt charts, Kanban boards, and timesheets.',
        need: 'Essential for delivering projects on time and within budget, while optimizing resource allocation.',
        image: projectImg,
        icon: <Briefcase className="h-6 w-6" />
    },
    {
        id: 'warehouse',
        title: 'Warehouse Management',
        description: 'Optimize storage, picking, packing, and dispatch processes within your warehouse.',
        need: 'improves order fulfillment speed and accuracy, reducing logistics costs.',
        image: warehouseImg,
        icon: <Warehouse className="h-6 w-6" />
    },
    {
        id: 'supplier',
        title: 'Supplier Portal',
        description: 'Collaborate directly with suppliers for orders, invoices, and performance reviews.',
        need: 'Improves supply chain transparency and strengthens partnerships with key vendors.',
        image: supplyImg,
        icon: <Globe className="h-6 w-6" />
    },
    {
        id: 'tendering',
        title: 'Tendering & Bidding',
        description: 'Manage the complete lifecycle of tenders, from publication to bid evaluation and award.',
        need: 'Crucial for transparent procurement processes and selecting the best vendors competitively.',
        image: supplyImg,
        icon: <ScrollText className="h-6 w-6" />
    },
];

const Features = () => {
    useEffect(() => {
        // Scroll to hash on load
        if (window.location.hash) {
            const id = window.location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 300);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [window.location.hash]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <header className="bg-slate-900 text-white pt-32 pb-20 rounded-b-[3rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">Enterprise Modules</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                        Explore our comprehensive suite of tools designed to streamline every aspect of your business operations.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24">
                <div className="grid gap-24">
                    {featuresList.map((feature, idx) => (
                        <div
                            key={feature.id}
                            id={feature.id}
                            className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 scroll-mt-32`}
                        >
                            <div className="w-full lg:w-1/2">
                                <div className="relative group">
                                    <div className={`absolute -inset-4 bg-gradient-to-r ${idx % 2 === 0 ? 'from-blue-100 to-indigo-100' : 'from-indigo-100 to-purple-100'} rounded-2xl opacity-50 blur-xl transition-opacity duration-500 group-hover:opacity-75`}></div>
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="relative w-full rounded-2xl shadow-2xl border border-white/20 bg-white"
                                    />
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2 space-y-6">
                                <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-[[#1a237e]] rounded-xl mb-2">
                                    {feature.icon}
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{feature.title}</h2>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="bg-white border-l-4 border-[#1a237e] p-6 rounded-r-xl shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-2">Why you need this:</h4>
                                    <p className="text-slate-600 italic">"{feature.need}"</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Features;
