"use client";

import React from 'react';
import { Card, Slider } from '../ui/Primitives';
import { BerkusInputs, getSmartDefaults } from '@/lib/valuation/valuationUtils';
import { formatCurrency } from '@/lib/utils';
import { Info } from 'lucide-react';
import { useValuation } from '@/lib/state/ValuationState';

export default function BerkusSection() {
    const { context, berkusInputs: inputs, setBerkusInputs: setInputs, berkusValuation: valuation } = useValuation();
    const defaults = getSmartDefaults(context).berkus;

    const handleChange = (key: keyof BerkusInputs, value: number) => {
        setInputs({ ...inputs, [key]: value });
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">The Modernized Berkus Method</h2>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {context.sector} Mode
                    </span>
                </div>
                <p className="text-slate-500">Best for Pre-Seed/Seed. Assigns value to 5 key drivers of risk reduction.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-medium mb-4 text-slate-800">Risk Drivers</h3>
                    <div className="space-y-6">
                        <Slider
                            label="1. Sound Idea (Basic Value)"
                            min={0} max={defaults.ideaCap} step={100000}
                            value={inputs.ideaValue}
                            onChange={(e) => handleChange('ideaValue', Number(e.target.value))}
                            valueDisplay={formatCurrency(inputs.ideaValue)}
                        />
                        <Slider
                            label="2. Prototype (Technology Risk)"
                            min={0} max={defaults.techCap} step={100000}
                            value={inputs.prototypeValue}
                            onChange={(e) => handleChange('prototypeValue', Number(e.target.value))}
                            valueDisplay={formatCurrency(inputs.prototypeValue)}
                        />
                        <div className="flex items-center gap-2 text-xs text-slate-500 -mt-2">
                            <Info className="w-3 h-3" />
                            <span>Tech cap adjusted for {context.sector} complexity</span>
                        </div>

                        <Slider
                            label="3. Management Team (Execution Risk)"
                            min={0} max={defaults.teamCap} step={100000}
                            value={inputs.teamValue}
                            onChange={(e) => handleChange('teamValue', Number(e.target.value))}
                            valueDisplay={formatCurrency(inputs.teamValue)}
                        />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-medium mb-4 text-slate-800">Market & Production</h3>
                        <div className="space-y-6">
                            <Slider
                                label="4. Strategic Relationships"
                                min={0} max={1500000} step={100000}
                                value={inputs.relationshipsValue}
                                onChange={(e) => handleChange('relationshipsValue', Number(e.target.value))}
                                valueDisplay={formatCurrency(inputs.relationshipsValue)}
                            />
                            <Slider
                                label="5. Product Rollout/Sales"
                                min={0} max={2000000} step={100000}
                                value={inputs.salesValue}
                                onChange={(e) => handleChange('salesValue', Number(e.target.value))}
                                valueDisplay={formatCurrency(inputs.salesValue)}
                            />
                        </div>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <div className="text-center">
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Berkus Valuation</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(valuation)}</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
