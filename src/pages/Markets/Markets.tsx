import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { MarketCard } from 'components/MarketCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData } from 'hooks/transactions';
import { useMarketMetadata, useTableRealtime } from 'hooks/supabase';

export const Markets = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [markets, setMarkets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getMarket, getMarketCount, getParticipantCount } = useGetMarketData();
    const { fetchAllMetadata } = useMarketMetadata();

    const [dynamicCategories, setDynamicCategories] = useState<string[]>(['All']);

    const fetchMarkets = async () => {
        setIsLoading(true);
        try {
            const [count, allMetadata] = await Promise.all([
                getMarketCount(),
                fetchAllMetadata()
            ]);

            if (allMetadata && allMetadata.length > 0) {
                // Extract unique categories
                const cats = Array.from(new Set(allMetadata.map((m: any) => m.category))).filter(Boolean) as string[];
                setDynamicCategories(['All', ...cats.sort()]);

                const fetchedMarkets = [];
                // Use metadata as the source of truth for which markets to show
                for (const metadata of allMetadata) {
                    const marketId = metadata.market_id;
                    const [market, participants] = await Promise.all([
                        getMarket(marketId),
                        getParticipantCount(marketId)
                    ]);

                    if (market) {
                        const chainStatus = market.status?.name || market.status?.toString();
                        // Trust supabase metadata for Resolved status if chain lags
                        const finalStatus = metadata.status === 'Resolved' ? 'Resolved' : (chainStatus || 'Open');

                        fetchedMarkets.push({
                            id: marketId.toString(),
                            title: market.description?.toString() || metadata.title || 'Untitled Market',
                            category: metadata?.category || 'General',
                            totalStaked: market.total_staked ? (parseFloat(market.total_staked) / 10 ** 18).toFixed(2) : '0.00',
                            participants: participants || 0,
                            endTime: market.end_time ? new Date(market.end_time * 1000).toLocaleDateString() : 'N/A',
                            status: finalStatus
                        });
                    }
                }
                setMarkets(fetchedMarkets);
            } else {
                setMarkets([]);
            }
        } catch (err) {
            console.error('Failed to fetch markets', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, []);

    // Subscribe to all changes in markets_metadata to keep visibility in sync
    useTableRealtime('markets_metadata', fetchMarkets);


    return (
        <AuthRedirectWrapper requireAuth={false}>
            <PageWrapper>
                <div className='flex flex-col gap-6 md:gap-10 py-6 md:py-12'>
                    <div className='flex flex-col md:flex-row md:items-end justify-between gap-6'>
                        <div>
                            <h1 className='text-3xl md:text-4xl font-bold mb-2 text-primary'>Markets</h1>
                            <p className='text-soft-blue/80'>Peep into the future and stake your truth.</p>
                        </div>

                        <div className='flex items-center gap-4'>
                            <div className='relative'>
                                <FontAwesomeIcon icon={faSearch} className='absolute left-4 top-1/2 -translate-y-1/2 text-primary/30' />
                                <input
                                    type="text"
                                    placeholder="Search markets..."
                                    className="bg-primary/5 border border-primary/10 rounded-2xl pl-12 pr-6 py-3 focus:border-primary/50 transition-colors w-full md:w-64 text-primary placeholder:text-primary/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className='p-3 rounded-2xl bg-primary/5 border border-primary/10 hover:border-primary/50 text-primary/60 hover:text-primary transition-all'>
                                <FontAwesomeIcon icon={faFilter} />
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className='flex flex-wrap items-center gap-2 md:gap-3'>
                        {[...dynamicCategories, 'History'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-primary text-background shadow-md'
                                    : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Markets Grid */}
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center py-20 gap-4'>
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                            <p className='text-soft-blue/80 font-bold uppercase tracking-widest animate-pulse'>Fetching the future...</p>
                        </div>
                    ) : markets.length === 0 ? (
                        <div className='glass-panel p-20 text-center'>
                            <p className='text-soft-blue/80 text-lg'>No markets found. Be the first to create one!</p>
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                            {markets
                                .filter(m => {
                                    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());

                                    if (selectedCategory === 'History') {
                                        // Show ONLY resolved markets in History
                                        return matchesSearch && m.status !== 'Open';
                                    } else {
                                        // Show ONLY OPEN markets for 'All' and specific categories
                                        // This ensures resolved markets vanish from the main view immediately
                                        const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
                                        return matchesSearch && matchesCategory && m.status === 'Open';
                                    }
                                })
                                .map((market) => (
                                    <MarketCard key={market.id} {...market} />
                                ))}
                        </div>
                    )}

                    {/* Load More */}
                    {!isLoading && markets.length > 0 && (
                        <div className='flex justify-center mt-8'>
                            <button className='px-8 py-3 rounded-2xl border border-primary/10 text-soft-blue hover:text-primary hover:border-primary/50 transition-all font-bold uppercase tracking-widest text-sm'>
                                Load More Markets
                            </button>
                        </div>
                    )}

                </div>
            </PageWrapper>
        </AuthRedirectWrapper>
    );
};

