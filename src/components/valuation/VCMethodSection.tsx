
"use client";

import React from 'react';
import { Card } from '../ui/Primitives';
import { calculateVCValuation, VCMethodInputs, getSmartDefaults, generateSensitivityAnalysis } from '@/lib/valuation/valuationUtils';
import { formatCurrency } from '@/lib/utils';
import { clsx } from 'clsx';
import { useValuation } from '@/lib/state/ValuationState';

export default function VCMethodSection() {
    const { context, vcInputs: inputs, setVCInputs: setInputs, vcValuation: preMoney } = useValuation();
    const defaults = getSmartDefaults(context).vc;

    // We calculate terminal value and sensitivity locally for display, as they are derived
    const { terminalValue } = calculateVCValuation(inputs);
    const sensitivityMatrix = generateSensitivityAnalysis(inputs);

    const handleChange = (key: keyof VCMethodInputs, value: number) => {
        setInputs({ ...inputs, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Venture Capital Method</h2>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {context.sector} Multiples
                    </span>
                </div>
                <p className="text-slate-500">Best for Institutional VCs. Works backward from the Exit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-medium mb-4 text-slate-800">Exit Scenarios</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">Projected Exit Revenue</label>
                            <input
                                type="number"
                                value={inputs.exitRevenue}
                                onChange={(e) => handleChange('exitRevenue', Number(e.target.value))}
                                className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">Exit Multiple (x Revenue)</label>
                            <input
                                type="number"
                                value={inputs.exitMultiple}
                                onChange={(e) => handleChange('exitMultiple', Number(e.target.value))}
                                className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-slate-500">Default for {context.sector}: ~{defaults.exitMultiple}x</p>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-500">Implied Terminal Value</p>
                            <p className="text-xl font-semibold text-slate-900">{formatCurrency(terminalValue)}</p>
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-medium mb-4 text-slate-800">Investment Parameters</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-slate-700">Required ROI (x)</label>
                                <input
                                    type="number"
                                    value={inputs.requiredROI}
                                    onChange={(e) => handleChange('requiredROI', Number(e.target.value))}
                                    className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-slate-500">Target for {context.sector}: {defaults.roiTarget}x</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-slate-700">Investment Amount</label>
                                <input
                                    type="number"
                                    value={inputs.investmentAmount}
                                    onChange={(e) => handleChange('investmentAmount', Number(e.target.value))}
                                    className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <div className="text-center">
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">VC Pre-Money Valuation</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(preMoney)}</p>
                            {preMoney < 0 && <p className="text-red-500 text-sm mt-2">Warning: Negative Valuation. ROI target too high.</p>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Sensitivity Analysis Table */}
            <Card>
                <h3 className="text-lg font-medium mb-4 text-slate-800">Sensitivity Analysis (Pre-Money)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr>
                                <th className="p-2 text-left text-slate-500 font-medium">ROI \ Multiple</th>
                                <th className="p-2 font-medium text-slate-700">{(inputs.exitMultiple * 0.8).toFixed(1)}x (-20%)</th>
                                <th className="p-2 font-medium text-slate-700">{inputs.exitMultiple.toFixed(1)}x (Base)</th>
                                <th className="p-2 font-medium text-slate-700">{(inputs.exitMultiple * 1.2).toFixed(1)}x (+20%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[inputs.requiredROI * 0.8, inputs.requiredROI, inputs.requiredROI * 1.2].map((roi, rIdx) => (
                                <tr key={rIdx} className={rIdx === 1 ? "bg-blue-50/50" : ""}>
                                    <td className="p-2 text-left font-medium text-slate-700">
                                        {roi.toFixed(1)}x {rIdx === 0 ? "(-20%)" : rIdx === 2 ? "(+20%)" : "(Base)"}
                                    </td>
                                    {sensitivityMatrix[rIdx].map((val, cIdx) => (
                                        <td key={cIdx} className={clsx(
                                            "p-2 font-mono",
                                            rIdx === 1 && cIdx === 1 ? "font-bold text-blue-700" : "text-slate-600"
                                        )}>
                                            {formatCurrency(val)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
