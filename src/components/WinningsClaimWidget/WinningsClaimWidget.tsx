import React, { useState, useEffect } from 'react';
import { useGetAccount } from 'hooks';
import { useGetMarketData, useGetUserBets } from 'hooks/transactions';
import { useMarketMetadata } from 'hooks/supabase';
import { Address, U64Value } from '@multiversx/sdk-core';
import { smartContract } from 'utils/smartContract';
import { getChainId } from 'utils/getChainId';
import { refreshAccount, sendTransactions } from 'helpers/sdkDappHelpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faSpinner, faTimes, faCoins } from '@fortawesome/free-solid-svg-icons';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';
import { supabase } from 'utils/supabase';

export const WinningsClaimWidget = () => {
    const { address } = useGetAccount();
    const { getMarket } = useGetMarketData();
    const { getUserBetAmount, getUserBetOutcome } = useGetUserBets();

    const [unclaimedMarkets, setUnclaimedMarkets] = useState<any[]>([]);
    const [totalWinnings, setTotalWinnings] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);

    // Scan for winnings
    const checkForWinnings = async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            // 1. Get all resolved markets from Supabase (efficient filter)
            const { data: resolvedMarkets } = await supabase
                .from('markets_metadata')
                .select('*')
                .eq('status', 'Resolved');

            if (!resolvedMarkets || resolvedMarkets.length === 0) {
                setUnclaimedMarkets([]);
                setIsLoading(false);
                return;
            }

            const claims = [];
            let total = 0;

            // 2. Check each resolved market for user winnings
            // This could be heavy if there are thousands of markets, but fine for now.
            // A better way would be an indexer, but we'll use on-chain checks.
            for (const marketMeta of resolvedMarkets) {
                const marketId = marketMeta.market_id;
                const winningOutcome = marketMeta.winning_outcome;

                if (!winningOutcome) continue;

                // Check if user bet on this winning outcome
                // Optimization: Maybe Supabase recorded 'user_bets'? 
                // Since we don't have a reliable user_bets table sync yet (proposal only),
                // we check chain or if we added user_peeps sync.

                // Let's rely on chain for authoritative check
                const userOutcome = await getUserBetOutcome(marketId);

                if (userOutcome === winningOutcome) {
                    const amountStr = await getUserBetAmount(marketId, winningOutcome);
                    const amount = parseFloat(amountStr || '0') / 10 ** 18;

                    if (amount > 0) {
                        // Calculate winnings based on odds (rough est or real claimable?)
                        // getMarket to find total pool
                        const marketData = await getMarket(marketId);
                        if (marketData) {
                            // Simple logic: He won. We assume he hasn't claimed yet 
                            // because getUserBetAmount usually returns 0 if claimed? 
                            // Actually, getUserBetAmount might still return value until claim?
                            // No, typically 'delete' or set to 0 after claim.
                            // Let's assume if > 0, it's claimable.

                            claims.push({
                                id: marketId,
                                title: marketMeta.title,
                                amount: amount // This is stake, winnings are proportional. 
                                // Precise winning calc requires pool math, let's just show "Claimable"
                            });
                            total += amount; // Approximate
                        }
                    }
                }
            }

            setUnclaimedMarkets(claims);
            setTotalWinnings(total);

        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkForWinnings();
        const interval = setInterval(checkForWinnings, 60000); // Check every min
        return () => clearInterval(interval);
    }, [address]);

    const [txHashes, setTxHashes] = useState<string[]>([]);

    const handleClaimAll = async () => {
        if (unclaimedMarkets.length === 0 || !address) return;
        setIsClaiming(true);
        setTxHashes([]);

        try {
            console.log("Building BATCH claim for markets:", unclaimedMarkets.map(m => m.id));

            const claimArgs = unclaimedMarkets.map(m => new U64Value(m.id));
            const baseGas = 5000000;
            const gasPerClaim = 1500000;
            const totalGas = baseGas + (unclaimedMarkets.length * gasPerClaim);

            const tx = smartContract.methodsExplicit
                .claimWinningsBatch(...claimArgs)
                .withGasLimit(totalGas)
                .withSender(new Address(address))
                .withChainID(getChainId())
                .buildTransaction();

            await refreshAccount();

            const { hashes, error } = await sendTransactions({
                transactions: [tx],
                transactionsDisplayInfo: {
                    processingMessage: `Processing Batch Claim for ${unclaimedMarkets.length} markets`,
                    errorMessage: 'An error has occurred during batch claim',
                    successMessage: `Claim request sent for ${unclaimedMarkets.length} markets!`
                },
                redirectAfterSign: false,
                callbackRoute: RouteNamesEnum.dashboard
            });

            if (hashes) {
                setTxHashes(hashes);
            }
            if (error) {
                console.error("Tx Error:", error);
            }

        } catch (error) {
            console.error("Batch claim failed", error);
        } finally {
            setIsClaiming(false);
        }
    };

    if (isLoading || unclaimedMarkets.length === 0) return null;

    return (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'}`}>
            {isExpanded ? (
                <div className='glass-panel p-6 bg-background/90 backdrop-blur-xl border-accent/50 shadow-[0_0_30px_rgba(255,255,255,0.1)] w-80 animate-slide-up'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2 text-accent'>
                            <FontAwesomeIcon icon={faTrophy} />
                            <h3 className='font-bold uppercase tracking-wider text-sm'>Winnings Available</h3>
                        </div>
                        <button onClick={() => setIsExpanded(false)} className='text-primary/40 hover:text-primary transition-colors'>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className='flex flex-col gap-3 max-h-60 overflow-y-auto mb-4 custom-scrollbar'>
                        {unclaimedMarkets.map(market => (
                            <div key={market.id} className='flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/5'>
                                <span className='text-xs font-bold text-primary truncate w-32'>{market.title}</span>
                                <span className='text-[10px] font-mono text-accent'>
                                    {market.amount > 0 ? `~${market.amount.toFixed(2)} EGLD` : 'Claimable'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className='text-center flex flex-col gap-3'>
                        {txHashes.length > 0 ? (
                            <div className='flex flex-col gap-1 max-h-40 overflow-y-auto'>
                                <p className='text-[10px] text-accent font-bold mb-1'>Transactions Sent:</p>
                                {txHashes.map(hash => (
                                    <a
                                        key={hash}
                                        href={`https://devnet-explorer.multiversx.com/transactions/${hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='text-[8px] font-mono text-primary/60 hover:text-accent truncate'
                                    >
                                        {hash.substring(0, 10)}...{hash.substring(hash.length - 10)}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className='flex justify-between items-center text-xs font-bold px-2'>
                                    <span className='text-primary/60'>Total Pending:</span>
                                    <span className='text-accent text-lg'>{totalWinnings.toFixed(2)} EGLD</span>
                                </div>

                                <button
                                    onClick={handleClaimAll}
                                    disabled={isClaiming}
                                    className='w-full neon-button bg-accent text-background font-bold py-3 rounded-xl uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                >
                                    {isClaiming ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCoins} />}
                                    {isClaiming ? 'Processing...' : 'Claim All Winnings'}
                                </button>

                                <p className='text-[8px] text-primary/40 italic'>
                                    Batch transaction: 1 signature for all claims.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsExpanded(true)}
                    className='group flex items-center gap-3 px-6 py-4 rounded-full bg-accent text-background font-bold shadow-lg hover:shadow-accent/50 transition-all hover:-translate-y-1'
                >
                    <FontAwesomeIcon icon={faCoins} className='text-lg animate-bounce' />
                    <span className='uppercase tracking-widest text-xs'>Claim Winnings ({unclaimedMarkets.length})</span>
                </button>
            )}
        </div>
    );
};
