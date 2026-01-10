import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartPie, faUsers, faClock, faBolt, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';
import { usePlaceBet, useGetMarketData, useResolveMarket, useGetUserBets, useClaimWinnings } from 'hooks/transactions';
import { useIsAdmin } from 'hooks/useIsAdmin';
import { useMarketMetadata, useMarketRealtime } from 'hooks/supabase';
import { PeepInsights } from 'components/AI/PeepInsights';

export const MarketDetails = () => {
    const { id } = useParams();
    const [stakeAmount, setStakeAmount] = useState('1');
    const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
    const [market, setMarket] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userWinnings, setUserWinnings] = useState<string | null>(null);
    const [currentUserBet, setCurrentUserBet] = useState<{ outcome: number, amount: string } | null>(null);

    const placeBet = usePlaceBet();
    const resolveMarket = useResolveMarket();
    const claimWinnings = useClaimWinnings();
    const { getMarket, getOutcomeTotal, getParticipantCount } = useGetMarketData();
    const { getUserBetOutcome, getUserBetAmount } = useGetUserBets();
    const isAdmin = useIsAdmin();

    const { metadata, loading: metadataLoading } = useMarketMetadata(id ? parseInt(id) : undefined);

    const fetchMarket = useCallback(async () => {
        if (!id) return;
        // Keep loading true only if we don't have market data yet
        if (!market) setIsLoading(true);

        try {
            const data = await getMarket(parseInt(id));
            if (data) {
                const [totalYes, totalNo, participants] = await Promise.all([
                    getOutcomeTotal(parseInt(id), 1),
                    getOutcomeTotal(parseInt(id), 2),
                    getParticipantCount(parseInt(id))
                ]);

                const totalStakedNum = parseFloat(data.total_staked) / 10 ** 18;
                const totalYesNum = parseFloat(totalYes || '0') / 10 ** 18;
                const totalNoNum = parseFloat(totalNo || '0') / 10 ** 18;

                const oddsYes = totalYesNum > 0 ? (totalStakedNum / totalYesNum).toFixed(2) : '2.00';
                const oddsNo = totalNoNum > 0 ? (totalStakedNum / totalNoNum).toFixed(2) : '2.00';

                const winningOutcome = (data.winning_outcome?.toNumber ? data.winning_outcome.toNumber() : Number(data.winning_outcome)) || metadata?.winning_outcome || 0;

                // Check for user bets (Active or Resolved)
                const userOutcome = await getUserBetOutcome(parseInt(id));
                if (userOutcome && userOutcome > 0) {
                    const amount = await getUserBetAmount(parseInt(id), userOutcome);
                    setCurrentUserBet({
                        outcome: userOutcome,
                        amount: amount ? (parseFloat(amount) / 10 ** 18).toFixed(2) : '0'
                    });

                    // Check for user winnings if market is resolved
                    if ((data.status?.name === 'Resolved' || data.status?.toString() === 'Resolved') && winningOutcome > 0 && userOutcome === winningOutcome) {
                        const rawAmount = await getUserBetAmount(parseInt(id), winningOutcome);
                        if (parseFloat(rawAmount || '0') > 0) {
                            setUserWinnings(rawAmount || '0');
                        } else {
                            setUserWinnings(null);
                        }
                    }
                } else {
                    setCurrentUserBet(null);
                }

                setMarket({
                    id: data.id?.toNumber ? data.id.toNumber() : parseInt(id),
                    title: data.description?.toString() || 'Untitled Market',
                    category: metadata?.category || 'General',
                    totalStaked: totalStakedNum.toFixed(2),
                    totalYes: totalYesNum.toFixed(2),
                    totalNo: totalNoNum.toFixed(2),
                    participants: participants || 0,
                    endTime: data.end_time ? new Date(data.end_time * 1000).toLocaleString() : 'N/A',
                    status: data.status?.name || data.status?.toString() || 'Open',
                    winningOutcome: winningOutcome,
                    outcomes: [
                        { id: 1, name: 'YES', odds: oddsYes, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
                        { id: 2, name: 'NO', odds: oddsNo, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' }
                    ]
                });
            }
        } catch (err) {
            console.error('Failed to fetch market details', err);
        } finally {
            setIsLoading(false);
        }
    }, [id, metadata, getMarket, getOutcomeTotal, getParticipantCount, getUserBetOutcome, getUserBetAmount, market]);

    useEffect(() => {
        fetchMarket();
    }, [fetchMarket]);

    // Realtime Subscriptions
    useMarketRealtime(id ? parseInt(id) : undefined, fetchMarket);

    const handlePlaceBet = async () => {
        if (!market || selectedOutcome === null) {
            alert('Please select an outcome first!');
            return;
        }
        await placeBet(market.id, selectedOutcome, stakeAmount);
        setTimeout(fetchMarket, 3000);
    };

    const handleResolve = async (outcome: number) => {
        if (!market) return;
        if (window.confirm(`Are you sure you want to resolve this market as ${outcome === 1 ? 'YES' : 'NO'}?`)) {
            await resolveMarket(market.id, outcome);
            setTimeout(fetchMarket, 3000);
        }
    };

    const handleClaim = async () => {
        if (!market) return;
        await claimWinnings(market.id);
        setTimeout(fetchMarket, 3000);
    };

    if (isLoading) {
        return (
            <AuthRedirectWrapper requireAuth={false}>
                <PageWrapper>
                    <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
                        <FontAwesomeIcon icon={faSpinner} spin size='3x' className='text-primary' />
                        <p className='text-soft-blue/80 font-bold uppercase tracking-widest animate-pulse'>Peeping into the details...</p>
                    </div>
                </PageWrapper>
            </AuthRedirectWrapper>
        );
    }

    if (!market) {
        return (
            <AuthRedirectWrapper requireAuth={false}>
                <PageWrapper>
                    <div className='flex flex-col items-center justify-center min-h-[60vh] gap-6'>
                        <h2 className='text-2xl font-bold text-primary'>Market not found</h2>
                        <MxLink to={RouteNamesEnum.markets} className='neon-button bg-primary text-background px-6 py-2 rounded-xl font-bold uppercase tracking-widest'>
                            Back to Markets
                        </MxLink>
                    </div>
                </PageWrapper>
            </AuthRedirectWrapper>
        );
    }

    const isResolved = market.status === 'Resolved';
    const winningOutcome = market.winningOutcome;

    return (
        <AuthRedirectWrapper requireAuth={false}>
            <PageWrapper>
                <div className='flex flex-col gap-8 py-12 w-full max-w-4xl'>
                    <MxLink to={RouteNamesEnum.markets} className='text-soft-blue hover:text-primary transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest'>
                        <FontAwesomeIcon icon={faArrowLeft} />
                        Back to Markets
                    </MxLink>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Main Content */}
                        <div className='lg:col-span-2 flex flex-col gap-8'>
                            <div className='glass-panel p-8 bg-glow-primary'>

                                <div className='flex items-center gap-3 mb-4'>
                                    <span className='text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/5 px-2 py-1 rounded-md'>
                                        {market.category}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${isResolved ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>
                                        {market.status}
                                    </span>
                                </div>
                                <h1 className='text-3xl font-bold mb-6 text-primary'>{market.title}</h1>

                                <div className='grid grid-cols-3 gap-4 p-4 bg-primary/5 rounded-2xl'>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Total Staked</span>
                                        <span className='text-lg font-bold text-primary'>{market.totalStaked} EGLD</span>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Participants</span>
                                        <span className='text-lg font-bold text-primary'>{market.participants}</span>
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>End Time</span>
                                        <span className='text-sm font-bold text-primary/60'>{market.endTime}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Resolution Panel */}
                            {isAdmin && !isResolved && market.status === 'Open' && (
                                <div className='glass-panel p-8 border-warning/30 bg-warning/5'>
                                    <div className='flex items-center gap-2 mb-6'>
                                        <FontAwesomeIcon icon={faBolt} className='text-warning' />
                                        <h3 className='text-lg font-bold uppercase tracking-wider text-primary'>Admin: Resolve Market</h3>
                                    </div>
                                    <p className='text-sm text-soft-blue/80 mb-6'>
                                        As an administrator, you can resolve this market by selecting the winning outcome.
                                        This will allow participants to claim their winnings.
                                    </p>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <button
                                            onClick={() => handleResolve(1)}
                                            className='neon-button bg-primary text-background font-bold py-3 rounded-xl uppercase tracking-widest text-xs'
                                        >
                                            Resolve YES
                                        </button>
                                        <button
                                            onClick={() => handleResolve(2)}
                                            className='neon-button bg-warning text-background font-bold py-3 rounded-xl uppercase tracking-widest text-xs'
                                        >
                                            Resolve NO
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Chart Placeholder (Visible if NOT resolved) */}
                            {!isResolved && (
                                <div className='glass-panel p-8 h-64 flex flex-col items-center justify-center gap-4'>
                                    <FontAwesomeIcon icon={faChartPie} size='3x' className='text-primary/10' />
                                    <p className='text-primary/30 text-sm font-bold uppercase tracking-widest'>Odds Visualization Coming Soon</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Betting OR Results */}
                        <div className='flex flex-col gap-6'>
                            {/* AI Analyst Module */}
                            {!isResolved && (
                                <PeepInsights
                                    title={market.title}
                                    description={market.description || market.title}
                                    marketId={id || '0'}
                                />
                            )}

                            <div className='glass-panel p-6 border-primary/30'>
                                {isResolved ? (
                                    <>
                                        <h3 className='text-lg font-bold mb-6 uppercase tracking-wider text-primary'>Market Resolved</h3>

                                        <div className='flex flex-col gap-4'>
                                            {/* Winning Outcome Header */}
                                            <div className='flex flex-col items-center justify-center p-6 bg-primary/5 rounded-2xl mb-2'>
                                                <span className='text-xs font-bold text-primary/40 uppercase tracking-widest mb-2'>Winning Outcome</span>
                                                <span className={`text-4xl font-bold uppercase ${winningOutcome === 1 ? 'text-accent' : winningOutcome === 2 ? 'text-warning' : 'text-primary'}`}>
                                                    {winningOutcome === 1 ? 'YES' : winningOutcome === 2 ? 'NO' : 'N/A'}
                                                </span>
                                            </div>

                                            {/* Claim Button for Winners */}
                                            {userWinnings && (
                                                <div className='p-4 bg-accent/20 border border-accent rounded-xl text-center animate-pulse'>
                                                    <p className='text-accent font-bold text-sm mb-2'>🎉 You Won! 🎉</p>
                                                    <p className='text-xs text-primary/60 mb-4'>You have winnings available to claim.</p>
                                                    <button
                                                        onClick={handleClaim}
                                                        className='w-full neon-button bg-accent text-background font-bold py-3 rounded-xl uppercase tracking-widest hover:shadow-lg transition-all'
                                                    >
                                                        Claim Winnings
                                                    </button>
                                                </div>
                                            )}

                                            {/* Results Bars */}
                                            <div className='flex flex-col gap-4'>
                                                {/* YES Bar */}
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex justify-between items-center text-xs font-bold uppercase tracking-widest'>
                                                        <span className='text-accent'>YES</span>
                                                        <span className='text-primary'>{market.totalYes} EGLD</span>
                                                    </div>
                                                    <div className='h-4 bg-primary/10 rounded-full overflow-hidden w-full'>
                                                        <div
                                                            className={`h-full ${winningOutcome === 1 ? 'bg-accent' : 'bg-primary/20'}`}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* NO Bar */}
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex justify-between items-center text-xs font-bold uppercase tracking-widest'>
                                                        <span className='text-warning'>NO</span>
                                                        <span className='text-primary'>{market.totalNo} EGLD</span>
                                                    </div>
                                                    <div className='h-4 bg-primary/10 rounded-full overflow-hidden w-full'>
                                                        <div
                                                            className={`h-full ${winningOutcome === 2 ? 'bg-warning' : 'bg-primary/20'}`}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* User Feedback Panel */}
                                        {currentUserBet ? (
                                            <div className='mb-6 relative overflow-hidden rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-md shadow-lg group'>
                                                {/* Decorative background element */}
                                                <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none' />

                                                <div className='relative p-6 flex flex-col gap-6'>
                                                    {/* Header */}
                                                    <div className='flex items-center gap-3 border-b border-primary/10 pb-4'>
                                                        <div className='p-2 rounded-lg bg-yellow-400/10 text-yellow-400'>
                                                            <FontAwesomeIcon icon={faBolt} />
                                                        </div>
                                                        <span className='text-xs font-bold uppercase tracking-[0.2em] text-primary/90'>
                                                            Your Active Peep
                                                        </span>
                                                    </div>

                                                    {/* Main Stats Card */}
                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <div className='flex flex-col gap-1 p-4 rounded-xl bg-primary/5 border border-primary/5 transition-colors group-hover:border-primary/20'>
                                                            <span className='text-[10px] uppercase font-bold text-primary/40 tracking-wider'>Selected Outcome</span>
                                                            <span className={`text-2xl font-black uppercase tracking-tight ${currentUserBet.outcome === 1 ? 'text-accent' : 'text-warning'}`}>
                                                                {currentUserBet.outcome === 1 ? 'YES' : 'NO'}
                                                            </span>
                                                        </div>

                                                        <div className='flex flex-col gap-1 p-4 rounded-xl bg-primary/5 border border-primary/5 transition-colors group-hover:border-primary/20'>
                                                            <span className='text-[10px] uppercase font-bold text-primary/40 tracking-wider'>Staked (EGLD)</span>
                                                            <div className='flex items-baseline gap-1'>
                                                                <span className='text-2xl font-mono font-bold text-primary'>
                                                                    {currentUserBet.amount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Footer message */}
                                                    <div className='flex items-center justify-center gap-2 pt-2 opacity-50'>
                                                        <span className='w-1 h-1 rounded-full bg-primary/50' />
                                                        <p className='text-[10px] text-primary italic font-medium'>
                                                            Ticket Confirmed & Active
                                                        </p>
                                                        <span className='w-1 h-1 rounded-full bg-primary/50' />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {isAdmin ? (
                                                    <div className='flex flex-col items-center justify-center py-10 gap-4 text-center'>
                                                        <div className='w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary/20'>
                                                            <FontAwesomeIcon icon={faBolt} size='2x' />
                                                        </div>
                                                        <div>
                                                            <h3 className='text-lg font-bold text-primary mb-2 uppercase tracking-wider'>Admin View</h3>
                                                            <p className='text-xs text-soft-blue/60'>Administrators are restricted from participating in markets to ensure fair resolution.</p>
                                                        </div>
                                                        <div className='w-full h-[1px] bg-primary/5 my-4' />
                                                        <p className='text-[10px] text-primary/40 uppercase font-bold tracking-widest'>Use the Resolution Panel on the left to settle this market.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <h3 className='text-lg font-bold mb-6 uppercase tracking-wider text-primary'>Place your Peep</h3>

                                                        <div className='flex flex-col gap-4 mb-8'>
                                                            {market.outcomes.map((outcome: any) => (
                                                                <button
                                                                    key={outcome.name}
                                                                    onClick={() => setSelectedOutcome(outcome.id)}
                                                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedOutcome === outcome.id
                                                                        ? `border-primary bg-primary/10 scale-[1.05] shadow-md`
                                                                        : `border-primary/5 bg-primary/5 hover:scale-[1.02]`
                                                                        }`}
                                                                >
                                                                    <span className={`font-bold text-primary`}>{outcome.name}</span>
                                                                    <span className='text-xs font-mono text-primary/60'>Odds: {outcome.odds}x</span>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className='flex flex-col gap-2 mb-6'>
                                                            <label className='text-[10px] text-primary/40 uppercase font-bold ml-2'>Stake Amount (EGLD)</label>
                                                            <div className='relative'>
                                                                <input
                                                                    type="number"
                                                                    className='w-full bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 focus:border-primary/50 transition-colors font-mono text-primary'
                                                                    value={stakeAmount}
                                                                    onChange={(e) => setStakeAmount(e.target.value)}
                                                                />
                                                                <span className='absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/20'>EGLD</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={handlePlaceBet}
                                                            className='w-full neon-button bg-primary text-background font-bold py-4 rounded-2xl uppercase tracking-widest hover:shadow-md'
                                                        >
                                                            <FontAwesomeIcon icon={faBolt} className='mr-2' />
                                                            Confirm Peep
                                                        </button>

                                                        {stakeAmount && selectedOutcome !== null && (
                                                            <div className='mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10'>
                                                                <div className='flex justify-between items-center mb-1'>
                                                                    <span className='text-[10px] uppercase font-bold text-primary/40'>Potential Payout</span>
                                                                    <span className='text-sm font-bold text-primary'>
                                                                        {(parseFloat(stakeAmount) * (market.outcomes.find((o: any) => o.id === selectedOutcome)?.odds || 0)).toFixed(2)} EGLD
                                                                    </span>
                                                                </div>
                                                                <p className='text-[8px] text-primary/20 italic'>* Odds are dynamic and may change until the market closes.</p>
                                                            </div>
                                                        )}

                                                        <p className='text-[10px] text-primary/20 text-center mt-4'>
                                                            Network Fee: ~0.001 EGLD
                                                        </p>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


            </PageWrapper >
        </AuthRedirectWrapper >
    );
};

