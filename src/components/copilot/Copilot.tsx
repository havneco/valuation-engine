
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { useValuation } from '@/lib/state/ValuationState';
import { processCopilotCommand, callGeminiAPI, ChatMessage, ConversationState } from '@/lib/copilot/copilotLogic';

export default function Copilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', content: "Hi! I'm your Valuation Copilot. \n\nI can help you evaluate a startup step-by-step. Just say **'Evaluate an idea'** to get started, or give me a command like 'Set exit revenue to $50M'." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [conversationState, setConversationState] = useState<ConversationState>({ step: 'IDLE' });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Access global state to pass to the logic engine
    const valuationState = useValuation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");

        // 1. Process via Local Logic first
        const { text, nextState, isAsync } = processCopilotCommand(userMsg.content, valuationState, conversationState);
        setConversationState(nextState);

        if (isAsync) {
            // 2. If Local Logic says "Ask AI", show loading and call API
            const loadingId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: loadingId, role: 'assistant', content: "Thinking..." }]); // Placeholder

            const aiResponse = await callGeminiAPI(userMsg.content, valuationState);

            // Replace loading message with real response
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId
                    ? { ...msg, content: aiResponse.text, groundingMetadata: aiResponse.groundingMetadata }
                    : msg
            ));
        } else {
            // 3. If Local Logic handled it (e.g., "Sector updated"), just show that
            setTimeout(() => {
                const aiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: text
                };
                setMessages(prev => [...prev, aiMsg]);
            }, 600);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Valuation Copilot</h3>
                                <p className="text-xs text-blue-100">Powered by Gemini 1.5 Pro</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    msg.role === 'assistant' ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-600"
                                )}>
                                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <span className="text-xs font-bold">You</span>}
                                </div>
                                <div className={clsx(
                                    "p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap",
                                    msg.role === 'assistant'
                                        ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                        : "bg-blue-600 text-white rounded-tr-none"
                                )}>
                                    {msg.content}

                                    {/* Grounding Citations */}
                                    {msg.groundingMetadata?.groundingChunks && (
                                        <div className="mt-3 pt-3 border-t border-slate-200">
                                            <p className="text-xs font-semibold text-slate-500 mb-1">Sources:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                                                    chunk.web?.uri && (
                                                        <a
                                                            key={i}
                                                            href={chunk.web.uri}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md truncate max-w-[150px]"
                                                        >
                                                            {chunk.web.title || "Source"}
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask for insights..."
                                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim()}
                                className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95",
                    isOpen ? "bg-slate-800 text-white rotate-90" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </button>
        </div>
    );
}
