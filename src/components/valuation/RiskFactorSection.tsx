
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Primitives';
import { calculateRiskFactorValuation, RiskFactorInputs, RISK_CATEGORIES } from '@/lib/valuation/valuationUtils';
import { formatCurrency } from '@/lib/utils';
import { clsx } from 'clsx';

export default function RiskFactorSection({ onValuationChange }: { onValuationChange: (val: number) => void }) {
    const [baseValuation, setBaseValuation] = useState(10000000);
    const [riskScores, setRiskScores] = useState<number[]>(new Array(12).fill(0));

    const valuation = calculateRiskFactorValuation({
        baseValuation,
        riskScores,
        adjustmentPerPoint: 250000
    });

    useEffect(() => {
        onValuationChange(valuation);
    }, [valuation, onValuationChange]);

    const handleScoreChange = (index: number, score: number) => {
        const newScores = [...riskScores];
        newScores[index] = score;
        setRiskScores(newScores);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Risk Factor Summation</h2>
                <p className="text-slate-500">Best for Risk Management. Adjusts the median valuation based on 12 specific risk categories.</p>
            </div>

            <Card className="mb-6">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-slate-700">Base Valuation (Median)</label>
                    <input
                        type="number"
                        value={baseValuation}
                        onChange={(e) => setBaseValuation(Number(e.target.value))}
                        className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {RISK_CATEGORIES.map((category, index) => (
                    <Card key={index} className="p-4 flex flex-col justify-between">
                        <label className="text-sm font-medium text-slate-700 mb-2">{category}</label>
                        <div className="flex justify-between bg-slate-100 rounded-lg p-1">
                            {[-2, -1, 0, 1, 2].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleScoreChange(index, val)}
                                    className={clsx(
                                        "w-8 h-8 rounded-md text-sm font-medium transition-all",
                                        riskScores[index] === val
                                            ? val < 0 ? "bg-red-500 text-white shadow-sm" : val > 0 ? "bg-green-500 text-white shadow-sm" : "bg-slate-500 text-white"
                                            : "text-slate-500 hover:bg-white"
                                    )}
                                >
                                    {val > 0 ? `+${val}` : val}
                                </button>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="bg-blue-50/50 border-blue-100 mt-6">
                <div className="text-center">
                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Risk Factor Valuation</p>
                    <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(valuation)}</p>
                    <p className="text-sm text-slate-500 mt-1">
                        Adjustment: {formatCurrency(riskScores.reduce((a, b) => a + b, 0) * 250000)}
                    </p>
                </div>
            </Card>
        </div>
    );
}
