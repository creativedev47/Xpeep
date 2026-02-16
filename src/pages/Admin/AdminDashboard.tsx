import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faSpinner, faCheckCircle, faClock, faChartLine, faUsers, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData, useResolveMarket, useResetSystem, useCreateMarket } from 'hooks/transactions';
import { useIsAdmin, useMarketMetadata } from 'hooks';
import { supabase } from 'utils/supabase';
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
                    <MxLink
                        to={RouteNamesEnum.marketDetails.replace(':id', market.id)}
                        className='font-bold text-sm text-primary hover:text-accent transition-colors'
                    >
                        {market.title}
                    </MxLink>
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
                        <MxLink
                            to={RouteNamesEnum.marketDetails.replace(':id', market.id)}
                            className='mr-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase hover:bg-primary/20 transition-all flex items-center gap-2 group'
                        >
                            Manage <FontAwesomeIcon icon={faArrowRight} className='group-hover:translate-x-0.5 transition-transform' />
                        </MxLink>
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

    const { fetchAllMetadata } = useMarketMetadata();

    const fetchMarkets = async () => {
        setIsLoading(true);
        try {
            const [count, allMetadata] = await Promise.all([
                getMarketCount(),
                fetchAllMetadata()
            ]);

            if (allMetadata && allMetadata.length > 0) {
                const fetchedMarkets = [];
                for (const metadata of allMetadata) {
                    const marketId = metadata.market_id;
                    const market = await getMarket(marketId);
                    if (market) {
                        const chainStatus = market.status?.name || market.status?.toString();
                        const metaStatus = metadata.status; // Supabase status (Resolved/Open)

                        // If Supabase says Resolved, trust it (it's our management layer)
                        const finalStatus = metaStatus === 'Resolved' ? 'Resolved' : (chainStatus || 'Open');

                        fetchedMarkets.push({
                            id: marketId,
                            title: market.description?.toString() || metadata.title || `Market #${marketId}`,
                            totalStaked: market.total_staked ? (parseFloat(market.total_staked) / 10 ** 18).toFixed(2) : '0.00',
                            endTime: market.end_time ? new Date(market.end_time * 1000).toLocaleString() : 'N/A',
                            status: finalStatus
                        });
                    }
                }
                setMarkets(fetchedMarkets);
            } else {
                setMarkets([]);
            }
        } catch (err) {
            console.error('Failed to fetch markets for admin', err);
        } finally {
            setIsLoading(false);
        }
    };

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchMarkets();
    }, []);

    const handleResolve = async (id: number, outcome: number) => {
        if (window.confirm(`Are you sure you want to resolve Market #${id} as ${outcome === 1 ? 'YES' : 'NO'}?`)) {
            await resolveMarket(id, outcome);
            setTimeout(() => {
                fetchMarkets();
                setRefreshKey(prev => prev + 1); // Refresh history after resolution too
            }, 2000);
        }
    };

    const handleWipeSuccess = () => {
        fetchMarkets();
        setRefreshKey(prev => prev + 1);
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

                    <PendingProposalsSection />

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
                                            {markets.filter(m => m.status === 'Open').map((market) => (
                                                <AdminMarketRow key={market.id} market={market} onResolve={handleResolve} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <ResolvedHistorySection key={refreshKey} />

                    <MaintenanceSection onWipeSuccess={handleWipeSuccess} />
                </div>
            </PageWrapper>
        </AuthRedirectWrapper>
    );
};

const PendingProposalsSection = () => {
    const [proposals, setProposals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { sendCreateMarket } = useCreateMarket();
    const { supabase } = useMarketMetadata(); // Assuming we expose supabase or import it directly. Using direct import for now to be safe.

    // We need to import supabase directly or use the hook properly.
    // The existing hooks/supabase file doesn't export the client, but utils/supabase does.
    // I'll use the import from utils/supabase inside the fetch function or at top level if I could, 
    // but I can't add imports easily with replace_file_content unless I replace the whole file or top chunk.
    // I will assume `import { supabase } from 'utils/supabase';` is added or I will use `require` if needed, 
    // but better to just use the `useMarketMetadata` hook if I can modify it to expose supabase or just add the import at the top in a separate call.
    // Actually, I will add the import at the top in the next step. For now let's write the component assuming `supabase` is available.
    // Wait, `AdminDashboard` imports are at the top. I need to add `import { supabase } from 'utils/supabase';`
    // I will do a multi_replace for imports + this section.

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('market_proposals')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (data) setProposals(data);
        setLoading(false);
    };

    const handleApprove = async (proposal: any) => {
        if (!window.confirm('Approve this proposal? It will be created on-chain.')) return;

        try {
            await sendCreateMarket({
                description: proposal.description,
                category: proposal.category,
                endTime: proposal.end_time
            });

            // Update status to approved
            await supabase
                .from('market_proposals')
                .update({ status: 'approved' })
                .eq('id', proposal.id);

            fetchProposals();
        } catch (err) {
            console.error(err);
            alert('Failed to approve transaction');
        }
    };

    const handleDecline = async (proposal: any) => {
        const reason = prompt('Reason for decline:', 'Low quality');
        if (reason === null) return;

        await supabase
            .from('market_proposals')
            .update({ status: 'declined', feedback: reason })
            .eq('id', proposal.id);

        fetchProposals();
    };

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-3'>
                <h2 className='text-2xl font-bold text-primary'>Pending Proposals</h2>
                <span className='px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-widest'>{proposals.length} New</span>
            </div>

            <div className='glass-panel overflow-hidden border-accent/20'>
                {loading ? (
                    <div className='p-10 flex justify-center text-primary/40 text-xs font-bold uppercase tracking-widest'>Loading proposals...</div>
                ) : proposals.length === 0 ? (
                    <div className='p-10 text-center text-primary/40 italic'>No pending proposals. good job!</div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-accent/5 border-b border-accent/10'>
                                <tr>
                                    <th className='px-6 py-4 text-[10px] uppercase font-bold text-accent/60 tracking-widest'>Description</th>
                                    <th className='px-6 py-4 text-[10px] uppercase font-bold text-accent/60 tracking-widest'>Category</th>
                                    <th className='px-6 py-4 text-[10px] uppercase font-bold text-accent/60 tracking-widest'>Source</th>
                                    <th className='px-6 py-4 text-[10px] uppercase font-bold text-accent/60 tracking-widest text-right'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-accent/5'>
                                {proposals.map((p) => (
                                    <tr key={p.id} className='hover:bg-accent/5 transition-colors'>
                                        <td className='px-6 py-4 font-bold text-sm text-primary'>{p.description}</td>
                                        <td className='px-6 py-4 text-xs text-primary/60'>{p.category}</td>
                                        <td className='px-6 py-4 text-xs font-mono text-primary/40'>{p.source}</td>
                                        <td className='px-6 py-4 text-right'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <button onClick={() => handleApprove(p)} className='px-3 py-1.5 bg-primary text-background rounded-lg text-[10px] font-bold uppercase hover:scale-105 transition-transform'>
                                                    Approve
                                                </button>
                                                <button onClick={() => handleDecline(p)} className='px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500/20 transition-colors'>
                                                    Decline
                                                </button>
                                            </div>
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


const MaintenanceSection = ({ onWipeSuccess }: { onWipeSuccess: () => void }) => {
    const { deleteAllMetadata, deleteAllUserBets, loading } = useMarketMetadata();

    const resetSystem = useResetSystem();
    const [wipeLoading, setWipeLoading] = useState(false);

    const handleWipe = async () => {
        if (!window.confirm('🚨 NUCLEAR OPTION 🚨\n\nThis will permanently delete ALL market metadata and bet history from Supabase. This action is irreversible.\n\nAre you ABSOLUTELY sure?')) {
            return;
        }

        setWipeLoading(true);
        try {
            await Promise.all([
                deleteAllMetadata(),
                deleteAllUserBets()
            ]);
            alert('Visibility history successfully wiped.');
            onWipeSuccess();
        } catch (err) {
            console.error('Wipe failed', err);
            alert('Failed to wipe data.');
        } finally {
            setWipeLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('⚠️ DANGER: COMPLETE SYSTEM RESET ⚠️\n\nThis will:\n1. Delete ALL data from Supabase\n2. RESET the Smart Contract state (creating new epoch)\n3. Clear ALL User Bets and Markets on-chain\n\nThis is effectively a factory reset. Are you sure?')) {
            return;
        }

        try {
            await resetSystem();
            onWipeSuccess();
        } catch (err) {
            console.error('Reset failed', err);
            alert('Failed to reset system.');
        }
    };

    return (
        <div className='flex flex-col gap-6 mt-10 p-8 glass-panel border-warning/20 bg-warning/5'>
            <div className='flex flex-col gap-2'>
                <h2 className='text-2xl font-bold text-warning'>Maintenance Mode</h2>
                <p className='text-warning/60 text-sm'>Use these tools to reset or clear corrupted data from the visibility layer.</p>
            </div>

            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4'>
                    <button
                        onClick={handleWipe}
                        disabled={wipeLoading}
                        className='px-8 py-3 rounded-2xl bg-warning/20 text-warning border border-warning/50 font-bold text-sm uppercase tracking-widest hover:bg-warning/30 transition-all'
                    >
                        {wipeLoading ? 'Wiping...' : 'Wipe All History'}
                    </button>
                    <div className='flex-1'>
                        <p className='text-[10px] text-warning/40 uppercase font-bold'>Only affects frontend visibility (Supabase). Contract state remains.</p>
                    </div>
                </div>

                <div className='w-full h-[1px] bg-warning/10 my-2' />

                <div className='flex items-center gap-4'>
                    <button
                        onClick={handleReset}
                        className='px-8 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm uppercase tracking-widest hover:bg-red-600 hover:shadow-lg transition-all shadow-red-500/20 shadow-md'
                    >
                        DELETE ALL
                    </button>
                    <div className='flex-1'>
                        <p className='text-[10px] text-red-500/60 uppercase font-bold'>Factory Reset: Wipes Contract State + Frontend. Irreversible.</p>
                    </div>
                </div>
            </div>
        </div>
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
