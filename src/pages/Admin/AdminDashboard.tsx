import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faSpinner, faCheckCircle, faClock, faChartLine, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData, useResolveMarket } from 'hooks/transactions';
import { useIsAdmin, useMarketMetadata } from 'hooks';
import { useResolvedHistory } from 'hooks/supabase';
import { RouteNamesEnum } from 'localConstants';
import { MxLink } from 'components/MxLink';
import { PageNotFound } from 'pages/PageNotFound';

const AdminMarketRow = ({ market, onResolve }: { market: any, onResolve: (id: number, outcome: number) => void }) => {
    const { metadata } = useMarketMetadata(market.id);

    return (
        <tr className='hover:bg-primary/5 transition-colors'>
            <td className='px-6 py-5'>
                <div className='flex flex-col gap-1'>
                    <span className='font-bold text-sm text-primary'>{market.title}</span>
                    <span className='text-[8px] uppercase font-bold text-primary/30 tracking-widest'>
                        {metadata?.category || 'General'} • Market #{market.id}
                    </span>
                </div>
            </td>
            <td className='px-6 py-5'>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${market.status === 'Open' ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary/60'
                    }`}>
                    {market.status}
                </span>
            </td>
            <td className='px-6 py-5 font-mono text-sm text-primary'>{market.totalStaked} EGLD</td>
            <td className='px-6 py-5 text-xs text-primary/40'>{market.endTime}</td>
            <td className='px-6 py-5 text-right'>
                {market.status === 'Open' && (
                    <div className='flex items-center justify-end gap-2'>
                        <button
                            onClick={() => onResolve(market.id, 1)}
                            className='px-3 py-1 rounded-lg bg-primary text-background text-[10px] font-bold uppercase hover:shadow-md transition-all'
                        >
                            YES
                        </button>
                        <button
                            onClick={() => onResolve(market.id, 2)}
                            className='px-3 py-1 rounded-lg bg-warning text-background text-[10px] font-bold uppercase hover:shadow-md transition-all'
                        >
                            NO
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export const AdminDashboard = () => {
    const isAdmin = useIsAdmin();
    const [markets, setMarkets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { getMarket, getMarketCount } = useGetMarketData();
    const resolveMarket = useResolveMarket();

    const fetchMarkets = async () => {
        setIsLoading(true);
        try {
            const count = await getMarketCount();
            if (count) {
                const fetchedMarkets = [];
                for (let i = 1; i <= count; i++) {
                    const market = await getMarket(i);
                    if (market) {
                        fetchedMarkets.push({
                            id: i,
                            title: market.description?.toString() || `Market #${i}`,
                            totalStaked: (parseFloat(market.total_staked) / 10 ** 18).toFixed(2),
                            endTime: new Date(market.end_time * 1000).toLocaleString(),
                            status: market.status?.name || market.status?.toString() || 'Open'
                        });
                    }
                }
                setMarkets(fetchedMarkets);
            }
        } catch (err) {
            console.error('Failed to fetch markets for admin', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarkets();
    }, []);

    const handleResolve = async (id: number, outcome: number) => {
        if (window.confirm(`Are you sure you want to resolve Market #${id} as ${outcome === 1 ? 'YES' : 'NO'}?`)) {
            await resolveMarket(id, outcome);
            setTimeout(fetchMarkets, 2000); // Refresh after tx
        }
    };

    if (!isAdmin) {
        return <PageNotFound />;
    }

    return (
        <AuthRedirectWrapper requireAuth={true}>
            <PageWrapper>
                <div className='flex flex-col gap-10 py-12'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                        <div>
                            <h1 className='text-4xl font-bold mb-2 text-primary'>Admin Control Center</h1>
                            <p className='text-soft-blue/80'>Manage markets and resolve predictions.</p>
                        </div>
                        <MxLink
                            to={RouteNamesEnum.createMarket}
                            className='px-6 py-3 rounded-2xl bg-primary text-background font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all'
                        >
                            Create New Market
                        </MxLink>
                    </div>

                    {/* Stats */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='glass-panel p-6 flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
                                <FontAwesomeIcon icon={faChartLine} size='lg' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40'>Total Markets</span>
                                <span className='text-xl font-bold text-primary'>{markets.length}</span>
                            </div>
                        </div>
                        <div className='glass-panel p-6 flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
                                <FontAwesomeIcon icon={faUsers} size='lg' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40'>Active Markets</span>
                                <span className='text-xl font-bold text-primary'>{markets.filter(m => m.status === 'Open').length}</span>
                            </div>
                        </div>
                        <div className='glass-panel p-6 flex items-center gap-4'>
                            <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary'>
                                <FontAwesomeIcon icon={faCheckCircle} size='lg' />
                            </div>
                            <div className='flex flex-col'>
                                <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40'>Resolved</span>
                                <span className='text-xl font-bold text-primary'>{markets.filter(m => m.status === 'Resolved').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Markets Table */}
                    <div className='flex flex-col gap-6'>
                        <h2 className='text-2xl font-bold text-primary'>Market Management</h2>
                        <div className='glass-panel overflow-hidden'>
                            {isLoading ? (
                                <div className='p-20 flex flex-col items-center gap-4'>
                                    <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                                    <p className='text-primary/40 uppercase tracking-widest text-xs font-bold'>Loading markets...</p>
                                </div>
                            ) : markets.length === 0 ? (
                                <div className='p-20 text-center text-primary/40 italic'>No markets found.</div>
                            ) : (
                                <div className='overflow-x-auto'>
                                    <table className='w-full text-left'>
                                        <thead className='bg-primary/5 border-b border-primary/10'>
                                            <tr>
                                                <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Market</th>
                                                <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Status</th>
                                                <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Total Pool</th>
                                                <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Ends</th>
                                                <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest text-right'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='divide-y divide-primary/5'>
                                            {markets.map((market) => (
                                                <AdminMarketRow key={market.id} market={market} onResolve={handleResolve} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <ResolvedHistorySection />
                </div>
            </PageWrapper>
        </AuthRedirectWrapper>
    );
};

const ResolvedHistorySection = () => {
    const { history, loading } = useResolvedHistory();

    return (
        <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-bold text-primary'>Resolved History</h2>
            <div className='glass-panel overflow-hidden'>
                {loading ? (
                    <div className='p-20 flex flex-col items-center gap-4'>
                        <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                        <p className='text-primary/40 uppercase tracking-widest text-xs font-bold'>Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className='p-20 text-center text-primary/40 italic'>No resolved markets found.</div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-primary/5 border-b border-primary/10'>
                                <tr>
                                    <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Market</th>
                                    <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Outcome</th>
                                    <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Resolved By</th>
                                    <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Date</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-primary/5'>
                                {history.map((market: any) => (
                                    <tr key={market.id} className='hover:bg-primary/5 transition-colors'>
                                        <td className='px-6 py-5'>
                                            <div className='flex flex-col gap-1'>
                                                <span className='font-bold text-sm text-primary'>Market #{market.market_id}</span>
                                                <span className='text-[10px] text-primary/40'>{market.long_description || 'No description'}</span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-5'>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${market.winning_outcome === 1 ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
                                                {market.winning_outcome === 1 ? 'YES' : 'NO'}
                                            </span>
                                        </td>
                                        <td className='px-6 py-5 font-mono text-xs text-primary/60'>
                                            {market.resolved_by ? `${market.resolved_by.slice(0, 6)}...${market.resolved_by.slice(-6)}` : 'N/A'}
                                        </td>
                                        <td className='px-6 py-5 text-xs text-primary/40'>
                                            {new Date(market.resolved_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
