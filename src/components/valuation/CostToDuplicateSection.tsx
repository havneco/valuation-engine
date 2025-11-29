
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Primitives';
import { calculateCostToDuplicate, CostToDuplicateInputs } from '@/lib/valuation/valuationUtils';
import { formatCurrency } from '@/lib/utils';

export default function CostToDuplicateSection({ onValuationChange }: { onValuationChange: (val: number) => void }) {
    const [inputs, setInputs] = useState<CostToDuplicateInputs>({
        laborCost: 500000,
        ipCost: 50000,
        equipmentCost: 20000,
        opportunityCostPercent: 0.20,
    });

    const valuation = calculateCostToDuplicate(inputs);

    useEffect(() => {
        onValuationChange(valuation);
    }, [valuation, onValuationChange]);

    const handleChange = (key: keyof CostToDuplicateInputs, value: number) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Cost-to-Duplicate Method</h2>
                <p className="text-slate-500">Best for Establishing a Floor. What would it cost to rebuild this today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-medium mb-4 text-slate-800">Tangible Costs</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">R&D / Engineering Salaries</label>
                            <input
                                type="number"
                                value={inputs.laborCost}
                                onChange={(e) => handleChange('laborCost', Number(e.target.value))}
                                className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">IP / Patents / Legal</label>
                            <input
                                type="number"
                                value={inputs.ipCost}
                                onChange={(e) => handleChange('ipCost', Number(e.target.value))}
                                className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-slate-700">Equipment / Infrastructure</label>
                            <input
                                type="number"
                                value={inputs.equipmentCost}
                                onChange={(e) => handleChange('equipmentCost', Number(e.target.value))}
                                className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-medium mb-4 text-slate-800">Intangible Premium</h3>
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm font-medium text-slate-700">Opportunity Cost Premium (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={inputs.opportunityCostPercent}
                                    onChange={(e) => handleChange('opportunityCostPercent', Number(e.target.value))}
                                    className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-slate-500">Premium for time saved (10-30%)</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <div className="text-center">
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Cost-Based Valuation</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(valuation)}</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
