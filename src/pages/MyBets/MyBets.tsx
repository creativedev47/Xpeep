import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faSpinner, faCheckCircle, faTimesCircle, faClock } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData, useGetUserBets, useClaimWinnings } from 'hooks/transactions';
import { useMarketMetadata } from 'hooks/supabase';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';

export const MyBets = () => {
    const [myBets, setMyBets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getMarket, getMarketCount, getOutcomeTotal } = useGetMarketData();
    const { getUserBetOutcome, getUserBetAmount } = useGetUserBets();
    const { fetchAllMetadata } = useMarketMetadata();
    const claimWinnings = useClaimWinnings();

    useEffect(() => {
        const fetchMyBets = async () => {
            setIsLoading(true);
            try {
                const [count, allMetadata] = await Promise.all([
                    getMarketCount(),
                    fetchAllMetadata()
                ]);

                if (count) {
                    const fetchedBets = [];
                    for (let i = 1; i <= count; i++) {
                        const outcome = await getUserBetOutcome(i);
                        if (outcome && outcome !== 0) {
                            const metadata = allMetadata?.find((m: any) => m.market_id === i);
                            if (metadata) {
                                const market = await getMarket(i);
                                if (market) {

                                    let claimableAmount = '0.00';
                                    let winningOutcome = 0;
                                    const isResolved = market.status?.name === 'Resolved' || market.status === 'Resolved';

                                    if (isResolved) {
                                        winningOutcome = (market.winning_outcome?.toNumber ? market.winning_outcome.toNumber() : Number(market.winning_outcome)) || metadata?.winning_outcome || 0;

                                        if (winningOutcome === outcome) {
                                            const totalWinningPool = await getOutcomeTotal(i, winningOutcome);
                                            const userBetAmount = await getUserBetAmount(i, outcome);

                                            if (totalWinningPool && userBetAmount) {
                                                const totalStaked = parseFloat(market.total_staked);
                                                const winningPool = parseFloat(totalWinningPool);
                                                const userBet = parseFloat(userBetAmount);
                                                // Ensure we don't divide by zero
                                                if (winningPool > 0) {
                                                    claimableAmount = ((userBet * totalStaked) / winningPool / 10 ** 18).toFixed(2);
                                                }
                                            }
                                        }
                                    }

                                    fetchedBets.push({
                                        id: i,
                                        title: market.description?.toString() || `Market #${i}`,
                                        category: metadata?.category || 'General',
                                        outcome: outcome === 1 ? 'YES' : 'NO',
                                        status: market.status?.name || market.status?.toString() || 'Open',
                                        winningOutcome: winningOutcome,
                                        claimableAmount,
                                        // Can claim if resolved, user won, AND they have a claimable amount > 0
                                        canClaim: isResolved &&
                                            winningOutcome === outcome &&
                                            parseFloat(claimableAmount) > 0
                                    });
                                }
                            }
                        }
                    }
                    setMyBets(fetchedBets);
                }
            } catch (err) {
                console.error('Failed to fetch my bets', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyBets();
    }, []);

    const handleClaim = async (marketId: number) => {
        await claimWinnings(marketId);
    };

    return (
        <AuthRedirectWrapper requireAuth={true}>
            <PageWrapper>
                <div className='flex flex-col gap-10 py-12 w-full'>
                    <div>
                        <h1 className='text-4xl font-bold mb-2 text-primary'>My Peeps</h1>
                        <p className='text-soft-blue/80'>Track your predictions and claim your winnings.</p>
                    </div>

                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-4'>
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                            <p className='text-soft-blue/80 font-bold uppercase tracking-widest animate-pulse'>Loading your history...</p>
                        </div>
                    ) : myBets.length === 0 ? (
                        <div className='glass-panel p-20 text-center flex flex-col items-center gap-6'>
                            <FontAwesomeIcon icon={faHistory} size='3x' className='text-primary/10' />
                            <p className='text-soft-blue/80 text-lg'>You haven't placed any peeps yet.</p>
                            <MxLink to={RouteNamesEnum.markets} className='neon-button bg-primary text-background px-8 py-3 rounded-2xl font-bold uppercase tracking-widest'>
                                Explore Markets
                            </MxLink>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-6'>
                            {myBets.map((bet) => (
                                <div key={bet.id} className='glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6'>
                                    <div className='flex flex-col gap-2 flex-grow'>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40'>Market #{bet.id}</span>
                                            <span className='text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/5 px-2 py-0.5 rounded'>
                                                {bet.category}
                                            </span>
                                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${bet.status === 'Open' ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary/60'
                                                }`}>
                                                {bet.status}
                                            </span>
                                        </div>
                                        <h3 className='text-xl font-bold text-primary'>{bet.title}</h3>
                                    </div>

                                    <div className='flex items-center gap-8'>
                                        <div className='flex flex-col items-center'>
                                            <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Your Peep</span>
                                            <span className={`font-bold text-primary`}>
                                                {bet.outcome}
                                            </span>
                                        </div>

                                        <div className='flex flex-col items-center'>
                                            <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Result</span>
                                            {bet.status === 'Resolved' ? (
                                                <div className='flex items-center gap-1'>
                                                    <FontAwesomeIcon
                                                        icon={bet.winningOutcome === (bet.outcome === 'YES' ? 1 : 2) ? faCheckCircle : faTimesCircle}
                                                        className={bet.winningOutcome === (bet.outcome === 'YES' ? 1 : 2) ? 'text-primary' : 'text-warning'}
                                                    />
                                                    <span className='font-bold text-primary'>{bet.winningOutcome === 1 ? 'YES' : 'NO'}</span>
                                                </div>
                                            ) : (
                                                <span className='text-primary/20 font-bold italic'>Pending</span>
                                            )}
                                        </div>

                                        {bet.status === 'Resolved' && bet.winningOutcome === (bet.outcome === 'YES' ? 1 : 2) && (
                                            <div className='flex flex-col items-center'>
                                                <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Winnings</span>
                                                <span className='font-bold text-primary font-mono'>{bet.claimableAmount} EGLD</span>
                                            </div>
                                        )}

                                        {bet.canClaim && (
                                            <button
                                                onClick={() => handleClaim(bet.id)}
                                                className='neon-button bg-primary text-background px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-md'
                                            >
                                                Claim Winnings
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </PageWrapper>
        </AuthRedirectWrapper>
    );
};
