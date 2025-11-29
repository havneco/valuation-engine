
"use client";

import React from 'react';
import { Card } from '../ui/Primitives';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface TriangulationChartProps {
    valuations: {
        berkus: number;
        scorecard: number;
        riskFactor: number;
        vcMethod: number;
        costToDuplicate: number;
    };
}

export default function TriangulationChart({ valuations }: TriangulationChartProps) {
    const data = [
        { name: 'Berkus', value: valuations.berkus },
        { name: 'Scorecard', value: valuations.scorecard },
        { name: 'Risk Factor', value: valuations.riskFactor },
        { name: 'VC Method', value: valuations.vcMethod },
        { name: 'Cost Base', value: valuations.costToDuplicate },
    ];

    // Calculate average excluding cost base if it's an outlier (simple logic: just average all for now or exclude cost as per prompt)
    // Prompt says: "Average (excl. Cost)"
    const validMethods = [valuations.berkus, valuations.scorecard, valuations.riskFactor, valuations.vcMethod];
    const average = validMethods.reduce((a, b) => a + b, 0) / validMethods.length;

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Valuation Triangulation</h2>
                <p className="text-slate-500">Comparing all methodologies to find the &quot;Zone of Reasonable Value&quot;.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b' }}
                                tickFormatter={(value) => `$${value / 1000000}M`}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine y={average} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Avg', fill: '#ef4444', position: 'right' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Cost Base' ? '#94a3b8' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-slate-800">
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Recommended Range</p>
                            <div className="mt-4 space-y-1">
                                <p className="text-3xl font-bold">{formatCurrency(Math.min(...validMethods))}</p>
                                <p className="text-sm text-slate-400">to</p>
                                <p className="text-3xl font-bold">{formatCurrency(Math.max(...validMethods))}</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">Strategic Insight</h3>
                        <ul className="space-y-3 text-sm text-slate-700">
                            <li className="flex justify-between">
                                <span>Floor (Cost):</span>
                                <span className="font-semibold">{formatCurrency(valuations.costToDuplicate)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Market (Scorecard):</span>
                                <span className="font-semibold">{formatCurrency(valuations.scorecard)}</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Ceiling (VC):</span>
                                <span className="font-semibold">{formatCurrency(valuations.vcMethod)}</span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
