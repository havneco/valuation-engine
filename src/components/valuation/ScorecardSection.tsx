
"use client";

import React from 'react';
import { Card, Slider } from '../ui/Primitives';
import { ScorecardInputs, getSmartDefaults, calculateScorecardValuation } from '@/lib/valuation/valuationUtils';
import { formatCurrency } from '@/lib/utils';
import { useValuation } from '@/lib/state/ValuationState';

export default function ScorecardSection() {
    const { context, scorecardInputs: inputs, setScorecardInputs: setInputs, scorecardValuation: valuation } = useValuation();
    const defaults = getSmartDefaults(context).scorecard.weights;

    const handleChange = (key: keyof ScorecardInputs, value: number) => {
        setInputs({ ...inputs, [key]: value });
    };

    const formatPercent = (val: number) => `${Math.round(val * 100)}%`;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Scorecard Valuation Method</h2>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        {context.sector} Weights
                    </span>
                </div>
                <p className="text-slate-500">Best for Family Offices. Compares the target against the market median using weighted factors.</p>
            </div>

            <Card className="mb-6">
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-slate-700">Market Median Pre-Money Valuation</label>
                    <input
                        type="number"
                        value={inputs.marketAverage}
                        onChange={(e) => handleChange('marketAverage', Number(e.target.value))}
                        className="p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <p className="text-xs text-slate-500">Default is ~$10M for US Seed.</p>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-medium mb-4 text-slate-800">Core Factors</h3>
                    <div className="space-y-6">
                        <Slider
                            label={`Management Team (${Math.round(defaults.team * 100)}% Weight)`}
                            min={0} max={2} step={0.05}
                            value={inputs.teamScore}
                            onChange={(e) => handleChange('teamScore', Number(e.target.value))}
                            valueDisplay={formatPercent(inputs.teamScore)}
                        />
                        <Slider
                            label={`Size of Opportunity (${Math.round(defaults.opportunity * 100)}% Weight)`}
                            min={0} max={2} step={0.05}
                            value={inputs.opportunityScore}
                            onChange={(e) => handleChange('opportunityScore', Number(e.target.value))}
                            valueDisplay={formatPercent(inputs.opportunityScore)}
                        />
                        <Slider
                            label={`Product/Technology (${Math.round(defaults.product * 100)}% Weight)`}
                            min={0} max={2} step={0.05}
                            value={inputs.productScore}
                            onChange={(e) => handleChange('productScore', Number(e.target.value))}
                            valueDisplay={formatPercent(inputs.productScore)}
                        />
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-medium mb-4 text-slate-800">Market & Other</h3>
                        <div className="space-y-6">
                            <Slider
                                label={`Competition (${Math.round(defaults.competition * 100)}% Weight)`}
                                min={0} max={2} step={0.05}
                                value={inputs.competitionScore}
                                onChange={(e) => handleChange('competitionScore', Number(e.target.value))}
                                valueDisplay={formatPercent(inputs.competitionScore)}
                            />
                            <Slider
                                label={`Marketing/Sales (${Math.round(defaults.marketing * 100)}% Weight)`}
                                min={0} max={2} step={0.05}
                                value={inputs.marketingScore}
                                onChange={(e) => handleChange('marketingScore', Number(e.target.value))}
                                valueDisplay={formatPercent(inputs.marketingScore)}
                            />
                            <Slider
                                label={`Inv. Need (${Math.round(defaults.investmentNeed * 100)}% Weight)`}
                                min={0} max={2} step={0.05}
                                value={inputs.investmentNeedScore}
                                onChange={(e) => handleChange('investmentNeedScore', Number(e.target.value))}
                                valueDisplay={formatPercent(inputs.investmentNeedScore)}
                            />
                            <Slider
                                label={`Other (${Math.round(defaults.other * 100)}% Weight)`}
                                min={0} max={2} step={0.05}
                                value={inputs.otherScore}
                                onChange={(e) => handleChange('otherScore', Number(e.target.value))}
                                valueDisplay={formatPercent(inputs.otherScore)}
                            />
                        </div>
                    </Card>

                    <Card className="bg-blue-50/50 border-blue-100">
                        <div className="text-center">
                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider">Scorecard Valuation</p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">{formatCurrency(valuation)}</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
