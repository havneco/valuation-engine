
import React, { useState } from 'react';
import { useValuation } from '@/lib/state/ValuationState';
import { BrainCircuit, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { clsx } from 'clsx';

export default function GutCheckSection() {
    const {
        context,
        gutCheckModifier, setGutCheckModifier,
        gutCheckAnalysis, setGutCheckAnalysis
    } = useValuation();

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputText,
                    context: context,
                    mode: 'gut_check'
                })
            });

            const data = await response.json();

            // Update State
            setGutCheckModifier(data.suggestedAdjustment);
            setGutCheckAnalysis(data.reasoning);

        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl shadow-purple-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                        <BrainCircuit className="w-8 h-8 text-purple-100" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">The Founder's Gut Check</h2>
                        <p className="text-purple-100 max-w-2xl leading-relaxed">
                            Valuation isn't just math; it's about the story. Tell us what you know that the spreadsheets don't.
                            Do you have a handshake deal? A rockstar co-founder? A worry about a competitor?
                            <br /><br />
                            <span className="font-semibold text-white">Our AI will analyze your conviction and translate it into value.</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
                    <label className="block text-sm font-bold text-slate-700 mb-3">
                        Your Context & Intuition
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="e.g., 'I just had coffee with the VP of Sales at Salesforce and they want to pilot our tech. But I'm worried that our lead engineer might leave for Google soon...'"
                        className="flex-1 w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder:text-slate-400 transition-all text-base leading-relaxed min-h-[200px]"
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !inputText.trim()}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg",
                                isLoading
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-purple-600 hover:bg-purple-700 hover:scale-[1.02] shadow-purple-500/30"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Analyze & Adjust Valuation
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-center items-center text-center h-full min-h-[300px]">
                    {gutCheckAnalysis ? (
                        <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={clsx(
                                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                                    gutCheckModifier >= 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                )}>
                                    {gutCheckModifier >= 0 ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">AI Analysis Complete</h3>
                                    <p className="text-sm text-slate-500">Based on your input</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">AI Reasoning</h4>
                                <p className="text-slate-700 leading-relaxed italic">
                                    "{gutCheckAnalysis}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500">Valuation Adjustment</h4>
                                    <p className="text-xs text-slate-400">Added to final calculation</p>
                                </div>
                                <div className={clsx(
                                    "text-3xl font-bold tracking-tight",
                                    gutCheckModifier >= 0 ? "text-green-600" : "text-red-600"
                                )}>
                                    {gutCheckModifier > 0 ? "+" : ""}{formatCurrency(gutCheckModifier)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-400 max-w-xs">
                            <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Ready to analyze.</p>
                            <p className="text-sm mt-2">Share your context on the left to see how it impacts your valuation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
