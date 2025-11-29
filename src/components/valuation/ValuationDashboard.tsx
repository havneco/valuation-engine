
"use client";

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard, Calculator, TrendingUp, ShieldAlert, DollarSign, Layers, Globe, Briefcase, Printer, BrainCircuit } from 'lucide-react';
import BerkusSection from './BerkusSection';
import ScorecardSection from './ScorecardSection';
import RiskFactorSection from './RiskFactorSection';
import VCMethodSection from './VCMethodSection';
import CostToDuplicateSection from './CostToDuplicateSection';
import GutCheckSection from './GutCheckSection';
import TriangulationChart from './TriangulationChart';
import PrintView from './PrintView';
import { Sector, Region } from '@/lib/valuation/valuationUtils';
import { ValuationProvider, useValuation } from '@/lib/state/ValuationState';
import Copilot from '../copilot/Copilot';

const TABS = [
    { id: 'berkus', label: 'Berkus Method', icon: Calculator },
    { id: 'scorecard', label: 'Scorecard', icon: LayoutDashboard },
    { id: 'risk', label: 'Risk Factor', icon: ShieldAlert },
    { id: 'vc', label: 'VC Method', icon: TrendingUp },
    { id: 'cost', label: 'Cost Base', icon: DollarSign },
    { id: 'gut', label: 'Gut Check', icon: BrainCircuit },
    { id: 'summary', label: 'Triangulation', icon: Layers },
] as const;

type TabId = typeof TABS[number]['id'];

function DashboardContent() {
    const [activeTab, setActiveTab] = useState<TabId>('berkus');
    const [isPrinting, setIsPrinting] = useState(false);

    const {
        context, setContext,
        berkusValuation, scorecardValuation, vcValuation, riskFactorValuation, costToDuplicateValuation,
        setRiskFactorValuation, setCostToDuplicateValuation,
        savedDeals, saveDeal, loadDeal
    } = useValuation();

    // Handle Print
    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    if (isPrinting) {
        return <PrintView />;
    }

    // Aggregate valuations for the chart
    const valuations = {
        berkus: berkusValuation,
        scorecard: scorecardValuation,
        riskFactor: riskFactorValuation,
        vcMethod: vcValuation,
        costToDuplicate: costToDuplicateValuation,
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                            V
                        </div>
                        <span className="font-bold text-xl tracking-tight text-slate-900">Valuation<span className="text-slate-400 font-normal">Engine</span></span>
                    </div>

                    {/* Global Context Selectors */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Save/Load Controls */}
                        <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
                            <button
                                onClick={() => {
                                    const name = prompt("Name this deal:");
                                    if (name) saveDeal(name);
                                }}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                Save Deal
                            </button>

                            <div className="relative group">
                                <button className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1">
                                    Load Deal
                                </button>
                                {/* Dropdown */}
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200">
                                    {savedDeals.length === 0 && (
                                        <div className="px-3 py-2 text-xs text-slate-400">No saved deals</div>
                                    )}
                                    {savedDeals.map(deal => (
                                        <button
                                            key={deal.id}
                                            onClick={() => loadDeal(deal.id)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex flex-col"
                                        >
                                            <span className="font-medium">{deal.name}</span>
                                            <span className="text-xs text-slate-400">{deal.date}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Export Button */}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                        >
                            <Printer className="w-4 h-4" />
                            Export PDF
                        </button>

                        <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            <select
                                value={context.sector}
                                onChange={(e) => setContext({ ...context, sector: e.target.value as Sector })}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="SaaS">SaaS</option>
                                <option value="AI/DeepTech">AI / Deep Tech</option>
                                <option value="Marketplace">Marketplace</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Consumer">Consumer App</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg border border-slate-200/50">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <select
                                value={context.region}
                                onChange={(e) => setContext({ ...context, region: e.target.value as Region })}
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                            >
                                <option value="US_Tier1">US - Tier 1 (SF/NYC)</option>
                                <option value="US_Tier2">US - Tier 2 (Austin/Miami)</option>
                                <option value="EU_Tier1">EU - Tier 1 (London/Berlin)</option>
                                <option value="Emerging">Emerging Markets</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 pb-32">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-1">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={clsx(
                                            "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                                : "text-slate-500 hover:bg-white/50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400")} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'berkus' && <BerkusSection />}
                            {activeTab === 'scorecard' && <ScorecardSection />}
                            {activeTab === 'risk' && (
                                <RiskFactorSection onValuationChange={setRiskFactorValuation} />
                            )}
                            {activeTab === 'vc' && <VCMethodSection />}
                            {activeTab === 'cost' && (
                                <CostToDuplicateSection onValuationChange={setCostToDuplicateValuation} />
                            )}
                            {activeTab === 'gut' && <GutCheckSection />}
                            {activeTab === 'summary' && (
                                <TriangulationChart valuations={valuations} />
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Copilot Overlay */}
            <Copilot />
        </div>
    );
}

export default function ValuationDashboard() {
    return (
        <ValuationProvider>
            <DashboardContent />
        </ValuationProvider>
    );
}
