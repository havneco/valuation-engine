
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/20 bg-white/50 backdrop-blur-xl shadow-sm p-6 transition-all hover:shadow-md",
                className
            )}
            {...props}
        />
    );
}

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    valueDisplay?: string | number;
}

export function Slider({ label, valueDisplay, className, ...props }: SliderProps) {
    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-center">
                {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
                {valueDisplay !== undefined && (
                    <span className="text-sm font-semibold text-slate-900 bg-white/60 px-2 py-1 rounded-md shadow-sm border border-white/20">
                        {valueDisplay}
                    </span>
                )}
            </div>
            <input
                type="range"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                {...props}
            />
        </div>
    );
}
