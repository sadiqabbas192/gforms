'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    ExternalLink,
    FileText,
    Eye,
    LogOut,
    Loader2,
    Zap,
    LayoutTemplate
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Components ---

const Button = ({ children, onClick, disabled, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/20 py-3 px-6",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-3 px-6",
        ghost: "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-white py-2 px-4",
        link: "bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 py-3 px-4 w-full"
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`${baseStyle} ${variants[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </motion.button>
    );
};

// --- Main Page ---

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const auth = document.cookie.split('; ').find(row => row.startsWith('is_authenticated='));
        if (auth) setIsAuthenticated(true);
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/generate-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-app-key': process.env.NEXT_PUBLIC_APP_API_KEY || 'default_key',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await res.json();

            if (res.ok && data.status === 'success') {
                setResult(data);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#a855f7', '#6366f1', '#ec4899']
                });
            } else {
                if (res.status === 401) {
                    setIsAuthenticated(false);
                    document.cookie = "is_authenticated=; Max-Age=0; path=/;";
                }
                setError(data.message || "Failed to generate form.");
            }
        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Auth View ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full glass rounded-3xl p-8 border border-white/10 text-center shadow-2xl"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/25">
                        <LayoutTemplate className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-3">
                        Form Architect AI
                    </h1>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Transform your ideas into production-ready Google Forms instantly using advanced Gemini AI.
                    </p>

                    <Button
                        onClick={() => window.location.href = '/api/auth/google'}
                        className="w-full gap-3 group"
                    >
                        <span className="text-lg">Connect Google Account</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-center gap-6 text-slate-500 text-sm">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            <span>Instant Gen</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Auto Quiz</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- Render App View ---
    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden flex flex-col items-center">

            {/* Dynamic Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navbar/Header */}
            <header className="w-full max-w-4xl flex items-center justify-between mb-12 glass rounded-2xl px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-slate-100 tracking-tight">Form Architect</span>
                </div>
                <Button variant="ghost" className="text-xs" onClick={() => {
                    document.cookie = "is_authenticated=; Max-Age=0; path=/;";
                    window.location.reload();
                }}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </header>

            <main className="w-full max-w-3xl relative z-10 flex flex-col gap-6">

                {/* Input Card */}
                <motion.div
                    layout
                    className={`glass rounded-3xl p-1 transition-all duration-300 ${isFocused ? 'ring-2 ring-purple-500/50 shadow-2xl shadow-purple-900/20' : ''}`}
                >
                    <div className="bg-slate-950/50 rounded-[22px] p-6 md:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-400" />
                                Describe your form
                            </h2>
                            <div className="text-xs font-medium px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full border border-purple-500/20">
                                AI Powered v2.5
                            </div>
                        </div>

                        <textarea
                            className="w-full h-48 bg-transparent text-lg text-slate-200 placeholder-slate-600 resize-none outline-none leading-relaxed"
                            placeholder="e.g., Create a 10-question quiz about Renaissance Art history for college students. Make it challenging."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading}
                        />

                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt.trim()}
                                className="w-full md:w-auto relative overflow-hidden group"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating Assets...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Generate Form
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3"
                        >
                            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Card */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="glass rounded-3xl p-8 border border-emerald-500/30 relative overflow-hidden"
                        >
                            {/* Success Background Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-[60px]" />

                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-1">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                        Generation Complete
                                    </h3>
                                    <p className="text-slate-400 text-sm ml-9">Your Google Form is ready for use.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <a href={result.edit_url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <div className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <div className="font-semibold text-slate-200">Editor Mode</div>
                                        <div className="text-xs text-slate-500 mt-1">Modify questions and settings</div>
                                    </div>
                                </a>

                                <a href={result.view_url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <div className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="font-semibold text-slate-200">Responder View</div>
                                        <div className="text-xs text-slate-500 mt-1">Share this link with students</div>
                                    </div>
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>

            {/* Footer / Credits */}
            <footer className="mt-20 text-center text-slate-600 text-sm pb-8">
                <p>Built with Next.js, Tailwind & Google Gemini</p>
            </footer>
        </div>
    );
}
