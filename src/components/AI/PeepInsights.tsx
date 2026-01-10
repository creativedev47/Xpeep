import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faChartPie, faThumbsUp, faThumbsDown, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { generateMarketAnalysis, MarketAnalysis } from 'utils/ai/gemini';

interface PeepInsightsProps {
    title: string;
    description: string;
    marketId: string;
}

export const PeepInsights = ({ title, description, marketId }: PeepInsightsProps) => {
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const runAnalysis = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await generateMarketAnalysis(title, description);
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze market.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-load on mount/change, but maybe we want a manual trigger to save API calls?
    // Let's do manual trigger for now to be "polite" to the API quota.
    // User clicks "Analyze with AI".

    if (loading) {
        return (
            <div className='glass-panel p-6 flex flex-col items-center justify-center gap-4 min-h-[300px] animate-pulse'>
                <div className='w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center'>
                    <FontAwesomeIcon icon={faRobot} size='2x' className='text-primary animate-bounce' />
                </div>
                <p className='text-primary/60 font-bold uppercase tracking-widest text-sm'>
                    Consulting the oracle...
                </p>
                <div className='flex gap-2 text-xs text-primary/30'>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>Crunching sentiment data</span>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className='glass-panel p-8 flex flex-col items-center text-center gap-6 bg-gradient-to-br from-primary/5 to-transparent'>
                <div className='w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2'>
                    <FontAwesomeIcon icon={faChartPie} size='3x' />
                </div>
                <div>
                    <h3 className='text-2xl font-bold text-primary mb-2'>Peep AI Analyst</h3>
                    <p className='text-soft-blue/80 text-sm max-w-xs mx-auto'>
                        Get instant research, sentiment scores, and bull/bear arguments powered by Gemini AI.
                    </p>
                </div>
                <button
                    onClick={runAnalysis}
                    className='neon-button px-8 py-3 rounded-xl bg-primary text-background font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3'
                >
                    <FontAwesomeIcon icon={faRobot} />
                    Analyze Market
                </button>
                {error && <p className='text-red-400 text-xs font-bold mt-2'>{error}</p>}
            </div>
        );
    }

    // Determine Gauge Color
    const getSentimentColor = (score: number) => {
        if (score >= 60) return 'text-green-400';
        if (score <= 40) return 'text-red-400';
        return 'text-yellow-400';
    };

    const getSentimentLabel = (score: number) => {
        if (score >= 60) return 'Bullish / Likely YES';
        if (score <= 40) return 'Bearish / Likely NO';
        return 'Neutral / Uncertain';
    };

    return (
        <div className='glass-panel p-6 flex flex-col gap-6 relative overflow-hidden'>
            {/* Background Robot Watermark */}
            <div className='absolute -top-10 -right-10 opacity-[0.03] text-primary rotate-12 pointer-events-none'>
                <FontAwesomeIcon icon={faRobot} size='10x' />
            </div>

            <div className='flex items-center justify-between border-b border-primary/10 pb-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary'>
                        <FontAwesomeIcon icon={faRobot} />
                    </div>
                    <div>
                        <h3 className='font-bold text-primary text-lg'>AI Analyst Report</h3>
                        <p className='text-[10px] uppercase tracking-widest text-primary/40'>Not Financial Advice</p>
                    </div>
                </div>
                <button onClick={runAnalysis} className='text-xs text-primary/40 hover:text-primary transition-colors'>
                    Re-Analyze
                </button>
            </div>

            {/* Score Section */}
            <div className='flex flex-col items-center py-4'>
                <div className={`text-5xl font-black mb-2 ${getSentimentColor(analysis.sentimentScore)}`}>
                    {analysis.sentimentScore}
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 ${getSentimentColor(analysis.sentimentScore)}`}>
                    {getSentimentLabel(analysis.sentimentScore)}
                </div>
                <p className='text-center text-sm text-soft-blue/80 mt-4 italic'>
                    "{analysis.summary}"
                </p>
            </div>

            {/* Arguments Section - Stacked for better readability and space */}
            <div className='flex flex-col gap-3 mt-2'>
                {/* Bull Case */}
                <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 p-4 group hover:border-green-500/30 transition-all'>
                    <div className='flex items-center gap-2 mb-2 text-green-400'>
                        <div className='p-1.5 rounded-lg bg-green-500/10'>
                            <FontAwesomeIcon icon={faThumbsUp} className='text-xs' />
                        </div>
                        <span className='font-bold uppercase text-[10px] tracking-widest'>The Bull Case (YES)</span>
                    </div>
                    <ul className='flex flex-col gap-2 pl-1'>
                        {analysis.bullishArgs.map((arg, i) => (
                            <li key={i} className='text-xs text-soft-blue/90 flex items-start gap-3 leading-relaxed'>
                                <span className='text-green-500 mt-1 text-[10px]'>●</span>
                                <span className='break-words'>{arg}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Bear Case */}
                <div className='relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 p-4 group hover:border-red-500/30 transition-all'>
                    <div className='flex items-center gap-2 mb-2 text-red-400'>
                        <div className='p-1.5 rounded-lg bg-red-500/10'>
                            <FontAwesomeIcon icon={faThumbsDown} className='text-xs' />
                        </div>
                        <span className='font-bold uppercase text-[10px] tracking-widest'>The Bear Case (NO)</span>
                    </div>
                    <ul className='flex flex-col gap-2 pl-1'>
                        {analysis.bearishArgs.map((arg, i) => (
                            <li key={i} className='text-xs text-soft-blue/90 flex items-start gap-3 leading-relaxed'>
                                <span className='text-red-500 mt-1 text-[10px]'>●</span>
                                <span className='break-words'>{arg}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className='flex items-center gap-2 justify-center mt-2 opacity-40 hover:opacity-100 transition-opacity'>
                <FontAwesomeIcon icon={faTriangleExclamation} className='text-yellow-500 text-xs' />
                <p className='text-[10px] text-soft-blue'>
                    AI generation. Not financial advice. Always DYOR.
                </p>
            </div>
        </div>
    );
};
