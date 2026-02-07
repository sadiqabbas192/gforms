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
    LayoutTemplate,
    Moon,
    Sun
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

// --- Components ---

const Button = ({ children, onClick, disabled, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-[var(--primary)] hover:bg-[#EAB308] text-black shadow-glow-primary py-3 px-6 font-bold",
        secondary: "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm py-3 px-6",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 py-2 px-4",
        link: "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 py-3 px-4 w-full"
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

// --- Main Page ---

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Theme state removed - forcing dark mode by default
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0); // 0: Idle, 1: Start AI, 2: Questions, 3: Form, 4: Adding, 5: Done
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // UI State for dropdowns
    const [showCopyOptions, setShowCopyOptions] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    useEffect(() => {
        const auth = document.cookie.split('; ').find(row => row.startsWith('is_authenticated='));
        if (auth) setIsAuthenticated(true);
    }, []);



    const simulateLoading = () => {
        setLoadingStep(1);
        const times = [1000, 2500, 4500, 6500]; // approximate timings

        times.forEach((time, index) => {
            setTimeout(() => {
                if (isLoading) setLoadingStep(index + 2);
            }, time);
        });
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setLoadingStep(1);
        setError('');
        setResult(null);

        // Start the fake progress steps
        const stepInterval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev < 4) return prev + 1;
                return prev;
            });
        }, 1500);

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
                clearInterval(stepInterval);
                setLoadingStep(5);
                setTimeout(() => {
                    setResult(data);
                    setIsLoading(false);
                    setLoadingStep(0);
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#0A1F44', '#6366F1', '#EC4899', '#10B981']
                    });
                }, 800);
            } else {
                clearInterval(stepInterval);
                if (res.status === 401) {
                    setIsAuthenticated(false);
                    document.cookie = "is_authenticated=; Max-Age=0; path=/;";
                }
                setError(data.message || "Failed to generate form.");
                setIsLoading(false);
                setLoadingStep(0);
            }
        } catch (err) {
            clearInterval(stepInterval);
            console.error(err);
            setError("An unexpected error occurred.");
            setIsLoading(false);
            setLoadingStep(0);
        }
    };

    // --- Helpers for Copy/Download ---

    const formatQuestionsText = (withAnswers) => {
        if (!result || !result.questions) return '';
        return result.questions.map((q, i) => {
            let text = `Q.${i + 1} ${q.question} [${q.type}]\n`;

            if (q.type === 'text') {
                text += `[Short Answer Space]\n`;
            } else if (q.type === 'paragraph') {
                text += `[Long Answer Space]\n`;
            } else if ((q.type === 'radio' || q.type === 'checkbox') && q.options) {
                q.options.forEach((opt, idx) => {
                    const label = String.fromCharCode(65 + idx); // A, B, C...
                    text += `${label}. ${opt}\n`;
                });
            }

            if (withAnswers && (q.type === 'radio') && typeof q.correct_option_index === 'number') {
                const correctOpt = q.options[q.correct_option_index];
                const correctLabel = String.fromCharCode(65 + q.correct_option_index);
                text += `Correct Answer - <${correctLabel}> ${correctOpt}\n`;
            }
            return text;
        }).join('\n');
    };

    const handleCopy = (withAnswers) => {
        const text = formatQuestionsText(withAnswers);
        navigator.clipboard.writeText(text);
        setShowCopyOptions(false);
        // Simple alert or toast could be added here
        alert("Copied to clipboard!");
    };

    const handleDownloadPDF = async (withAnswers) => {
        // Dynamic import to avoid SSR issues if any, though here it's client side
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        const title = result.form_title || "Generated Questions";
        doc.setFontSize(16);
        doc.text(title, 10, 10);

        doc.setFontSize(12);
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;

        result.questions.forEach((q, i) => {
            // Check for page break
            if (y > pageHeight - 30) {
                doc.addPage();
                y = 10;
            }

            const questionLine = `Q.${i + 1} ${q.question} [${q.type}]`;
            const splitQuestion = doc.splitTextToSize(questionLine, 180);
            doc.text(splitQuestion, 10, y);
            y += (splitQuestion.length * 7);

            if (q.type === 'text') {
                doc.text("[Short Answer Space]", 15, y);
                y += 10;
            } else if (q.type === 'paragraph') {
                doc.text("[Long Answer Space]", 15, y);
                y += 15;
            } else if ((q.type === 'radio' || q.type === 'checkbox') && q.options) {
                q.options.forEach((opt, idx) => {
                    if (y > pageHeight - 20) { doc.addPage(); y = 10; }
                    const label = String.fromCharCode(65 + idx);
                    doc.text(`${label}. ${opt}`, 15, y);
                    y += 6;
                });
            }

            if (withAnswers && (q.type === 'radio') && typeof q.correct_option_index === 'number') {
                if (y > pageHeight - 20) { doc.addPage(); y = 10; }
                const correctOpt = q.options[q.correct_option_index];
                const correctLabel = String.fromCharCode(65 + q.correct_option_index);
                doc.setFont(undefined, 'bold');
                doc.text(`Correct Answer - <${correctLabel}> ${correctOpt}`, 15, y);
                doc.setFont(undefined, 'normal');
                y += 10;
            } else {
                y += 5;
            }
        });

        const safeTitle = (result.form_title || "questions").replace(/[^a-z0-9\s-_]/gi, '').trim();
        doc.save(`${safeTitle}.pdf`);
        setShowDownloadOptions(false);
    };


    const loadingMessages = [
        "Starting AI to make questions... 🤖",
        "Questions generated... 📝",
        "Making Google Form... 🏗️",
        "Adding questions to form... ✍️",
        "Done! 🎉"
    ];

    const samplePrompts = [
        "Create a 10 question MCQ quiz on Python basics",
        "Create a 15 question quiz on DBMS with easy to medium difficulty",
        "Create 50 MCQ questions on Operating Systems and add 30 randomly",
        "Create a quiz with exactly 20 MCQs on Data Structures"
    ];

    // --- Render Auth View ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[var(--background)] transition-colors duration-300">

                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[rgba(250,204,21,0.1)] rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full modern-card rounded-3xl p-10 text-center"
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0A1F44] to-indigo-900 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-900/50 p-4">
                        <div className="relative w-full h-full">
                            <Image
                                src="/logo.png"
                                alt="Form Architect Logo"
                                fill
                                className="object-contain drop-shadow-lg"
                                priority
                            />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
                        Form Architect AI
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-normal">
                        Transform your ideas into production-ready Google Forms instantly using advanced Gemini AI.
                    </p>

                    <Button
                        onClick={() => window.location.href = '/api/auth/google'}
                        className="w-full gap-3 group rounded-full"
                    >
                        <span className="text-lg font-medium">Connect Google Account</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center gap-8 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span>Instant Gen</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Auto Quiz</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- Render App View ---
    return (
        <div className="min-h-screen p-4 md:p-8 relative overflow-hidden flex flex-col items-center transition-colors duration-300">

            {/* Dynamic Background */}
            {/* Dynamic Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none transition-colors duration-500" />

            {/* Navbar/Header */}
            <header className="w-full max-w-5xl flex items-center justify-between mb-12 bg-slate-900/80 backdrop-blur-md border border-slate-800/60 rounded-2xl px-8 py-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="font-bold text-slate-100 text-xl tracking-tight">Form Architect</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-xl" onClick={() => {
                        document.cookie = "is_authenticated=; Max-Age=0; path=/;";
                        window.location.reload();
                    }}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </header>


            <main className="w-full max-w-3xl relative z-10 flex flex-col gap-6">

                {/* Input Card */}
                <motion.div
                    layout
                    className={`modern-card rounded-3xl p-1 transition-all duration-300 ${isFocused ? 'ring-2 ring-indigo-500/20 dark:ring-indigo-500/40 shadow-xl' : ''}`}
                >
                    <div className="bg-slate-900/50 rounded-[22px] p-8 md:p-10 border border-transparent">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-[var(--foreground)] flex items-center gap-3">
                                <FileText className="w-6 h-6 text-indigo-400" />
                                <span>Describe your form</span>
                            </h2>
                            <div className="text-xs font-semibold px-3 py-1 bg-yellow-900/30 text-[var(--primary)] rounded-full border border-yellow-800/50">
                                AI Powered v2.5
                            </div>
                        </div>

                        {/* Sample Prompts Grid - Moved Top */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                            {[
                                "Create a customer feedback survey for a coffee shop",
                                "Generate a 10-question hard quiz on World War II",
                                "Create a registration form for a coding workshop",
                                "Make a satisfaction survey for a hotel stay (Likert scale)"
                            ].map((sample, index) => (
                                <button
                                    key={index}
                                    onClick={() => setPrompt(sample)}
                                    className="text-left p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-600 hover:bg-slate-900 transition-all duration-200 text-sm text-slate-400 hover:text-slate-200 group flex flex-col justify-between h-32"
                                >
                                    <span className="line-clamp-3 leading-relaxed">{sample}</span>
                                </button>
                            ))}
                        </div>

                        <textarea
                            className="w-full h-40 bg-slate-950/50 rounded-xl p-4 text-lg text-slate-200 placeholder-slate-500 resize-none outline-none leading-relaxed border border-transparent focus:bg-slate-900 focus:border-indigo-900 transition-colors"
                            placeholder="e.g., Create a 10-question quiz about Renaissance Art history for college students. Make it challenging."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={isLoading}
                        />

                        {/* Center Button and Loading State */}
                        <div className="mt-8 flex flex-col items-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={loadingStep}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-slate-500 dark:text-slate-400 font-medium"
                                        >
                                            {loadingMessages[loadingStep - 1] || "Processing..."}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim()}
                                    className="w-full md:w-auto px-10 py-4 text-lg rounded-full shadow-xl shadow-blue-900/10 dark:shadow-indigo-900/20 hover:shadow-blue-900/20"
                                >
                                    <span className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Generate Form
                                    </span>
                                </Button>
                            )}
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
                        <>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="modern-card rounded-3xl p-8 border-t-4 border-t-emerald-500 relative overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-3 mb-1">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            Generation Complete
                                        </h3>
                                        <p className="text-slate-500 text-sm ml-9">Your Google Form is ready for use.</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="group bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 hover:shadow-md rounded-2xl p-5 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <a href={result.edit_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                                            </a>
                                        </div>
                                        <div className="font-semibold text-[var(--foreground)]">Editor Mode</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Modify form settings & questions</div>
                                        <a href={result.edit_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline break-all block truncate">
                                            {result.edit_url}
                                        </a>
                                    </div>

                                    <div className="group bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-md rounded-2xl p-5 transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-emerald-50 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                            <a href={result.view_url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                            </a>
                                        </div>
                                        <div className="font-semibold text-[var(--foreground)]">Responder View</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">Share to collect responses</div>
                                        <a href={result.view_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline break-all block truncate">
                                            {result.view_url}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Questions Display Section */}
                            {result.questions && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="modern-card rounded-3xl p-8"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-[var(--foreground)]">Generated Questions</h3>

                                        <div className="flex gap-2">
                                            {/* Copy Dropdown */}
                                            <div className="relative">
                                                <Button variant="secondary" onClick={() => setShowCopyOptions(!showCopyOptions)} className="text-xs py-2 px-4 h-auto rounded-lg">
                                                    Copy
                                                </Button>
                                                {showCopyOptions && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                                        <button onClick={() => handleCopy(true)} className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                            With Answers
                                                        </button>
                                                        <button onClick={() => handleCopy(false)} className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors border-t border-slate-100 dark:border-slate-700">
                                                            Without Answers
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Download Dropdown */}
                                            <div className="relative">
                                                <Button variant="secondary" onClick={() => setShowDownloadOptions(!showDownloadOptions)} className="text-xs py-2 px-4 h-auto rounded-lg">
                                                    Download PDF
                                                </Button>
                                                {showDownloadOptions && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                                        <button onClick={() => handleDownloadPDF(true)} className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                            With Answers
                                                        </button>
                                                        <button onClick={() => handleDownloadPDF(false)} className="w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors border-t border-slate-100 dark:border-slate-700">
                                                            Without Answers
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 font-mono text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-slate-800 overflow-x-auto max-h-[500px] overflow-y-auto">
                                        {formatQuestionsText(true)}
                                    </div>
                                </motion.div>
                            )}
                        </>
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
