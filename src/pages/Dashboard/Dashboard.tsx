import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faWallet, faTrophy, faPercentage, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData, useGetUserBets } from 'hooks/transactions';
import { useGetAccountInfo, useIsAdmin, useMarketMetadata } from 'hooks';
import { useResolvedHistory } from 'hooks/supabase';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';

const StatCard = ({ icon, label, value, color }: any) => (
  <div className='glass-panel p-6 flex items-center gap-4 bg-glow-primary'>
    <div className={`w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center ${color}`}>
      <FontAwesomeIcon icon={icon} size='lg' />
    </div>
    <div className='flex flex-col'>
      <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40'>{label}</span>
      <span className='text-xl font-bold text-primary'>{value}</span>
    </div>
  </div>
);

const MarketRow = ({ bet }: { bet: any }) => {
  const { metadata } = useMarketMetadata(bet.id);
  return (
    <tr key={bet.id} className='hover:bg-primary/5 transition-colors'>
      <td className='px-6 py-5'>
        <div className='flex flex-col gap-1'>
          <span className='font-bold text-sm text-primary'>{bet.title}</span>
          {metadata?.category && (
            <span className='text-[8px] uppercase font-bold text-primary/30 tracking-widest'>{metadata.category}</span>
          )}
        </div>
      </td>
      <td className='px-6 py-5'>
        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${bet.outcome === 'YES' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'}`}>
          {bet.outcome}
        </span>
      </td>
      <td className='px-6 py-5 font-mono text-sm text-primary'>{bet.totalStaked} EGLD</td>
      <td className='px-6 py-5 text-xs text-primary/40'>{bet.endTime}</td>
    </tr>
  );
};

export const Dashboard = () => {
  const { address, account } = useGetAccountInfo();
  const isAdmin = useIsAdmin();
  const formattedBalance = (parseFloat(account.balance) / 10 ** 18).toFixed(4);
  const [stats, setStats] = useState({
    totalStaked: '0',
    activeBets: 0,
    totalWon: '0',
    yieldApy: '12.5'
  });
  const [activeBetsList, setActiveBetsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { getMarket, getMarketCount } = useGetMarketData();
  const { getUserBetOutcome } = useGetUserBets();
  const { fetchAllMetadata } = useMarketMetadata();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!address) return;
      setIsLoading(true);
      try {
        const count = await getMarketCount();
        if (count) {
          const fetchedActiveBets = [];
          let activeCount = 0;
          for (let i = 1; i <= count; i++) {
            const outcome = await getUserBetOutcome(i);
            if (outcome && outcome !== 0) {
              const [market, allMetadata] = await Promise.all([
                getMarket(i),
                fetchAllMetadata()
              ]);
              const metadata = allMetadata?.find((m: any) => m.market_id === i);

              if (market && metadata && (market.status?.name === 'Open' || market.status === 'Open')) {
                activeCount++;
                fetchedActiveBets.push({
                  id: i,
                  title: market.description?.toString() || metadata.title || `Market #${i}`,
                  outcome: outcome === 1 ? 'YES' : 'NO',
                  totalStaked: market.total_staked ? (parseFloat(market.total_staked) / 10 ** 18).toFixed(2) : '0.00',
                  endTime: market.end_time ? new Date(market.end_time * 1000).toLocaleDateString() : 'N/A'
                });
              }
            }
          }
          setStats(prev => ({ ...prev, activeBets: activeCount }));
          setActiveBetsList(fetchedActiveBets);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [address]);

  return (
    <AuthRedirectWrapper requireAuth={true}>
      <PageWrapper>
        <div className='flex flex-col gap-10 py-12'>
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
            <div>
              <h1 className='text-4xl font-bold mb-2 text-primary'>Dashboard</h1>
              <p className='text-soft-blue/80'>Welcome back, Peeper. Here's your future at a glance.</p>
            </div>
            <div className='flex items-center gap-4'>
              {isAdmin && (
                <MxLink
                  to={RouteNamesEnum.createMarket}
                  className='px-6 py-3 rounded-2xl bg-primary text-background font-bold text-sm uppercase tracking-widest hover:shadow-lg transition-all'
                >
                  Create Market
                </MxLink>
              )}
              <div className='flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-2xl px-6 py-3'>
                <FontAwesomeIcon icon={faWallet} className='text-primary/40' />
                <span className='font-mono text-sm text-primary'>{address.slice(0, 8)}...{address.slice(-8)}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <StatCard icon={faWallet} label="Wallet Balance" value={`${formattedBalance} EGLD`} color="text-primary" />
            <StatCard icon={faTrophy} label="Active Bets" value={stats.activeBets.toString()} color="text-primary" />
            <StatCard icon={faChartLine} label="Total Staked" value={`${stats.totalStaked} EGLD`} color="text-primary" />
            <StatCard icon={faPercentage} label="Yield APY" value={`${stats.yieldApy}%`} color="text-primary" />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10'>
            {/* Active Bets Table */}
            <div className='lg:col-span-2 flex flex-col gap-6'>
              <h2 className='text-2xl font-bold text-primary'>Active Bets</h2>
              <div className='glass-panel overflow-hidden'>
                {isLoading ? (
                  <div className='p-20 flex flex-col items-center gap-4'>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                    <p className='text-primary/40 uppercase tracking-widest text-xs font-bold'>Syncing with the chain...</p>
                  </div>
                ) : activeBetsList.length === 0 ? (
                  <div className='p-20 text-center text-primary/40 italic'>No active bets found.</div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                      <thead className='bg-primary/5 border-b border-primary/10'>
                        <tr>
                          <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Event</th>
                          <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Your Bet</th>
                          <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Total Pool</th>
                          <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Ends</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-primary/5'>
                        {activeBetsList.map((bet) => (
                          <MarketRow key={bet.id} bet={bet} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Latest Markets */}
            <div className='flex flex-col gap-6'>
              <h2 className='text-2xl font-bold text-primary'>Latest Markets</h2>
              <div className='flex flex-col gap-4'>
                {activeBetsList.slice(0, 3).map((bet) => (
                  <div key={bet.id} className='glass-panel p-5 flex flex-col gap-2 border-primary/5 hover:border-primary/30 transition-all cursor-pointer group'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[10px] font-bold text-primary/40 uppercase tracking-widest'>Market #{bet.id}</span>
                      <span className='text-[10px] text-primary/20'>{bet.endTime}</span>
                    </div>
                    <p className='text-sm font-bold text-primary leading-relaxed truncate group-hover:text-primary transition-colors'>{bet.title}</p>
                  </div>
                ))}
                {activeBetsList.length === 0 && (
                  <div className='glass-panel p-10 text-center text-primary/40 text-xs italic'>
                    No markets found.
                  </div>
                )}
              </div>
            </div>
          </div>

          <ResolvedHistorySection address={address} />

        </div>

      </PageWrapper>
    </AuthRedirectWrapper>
  );
};

const ResolvedHistorySection = ({ address }: { address: string }) => {
  const { history, loading } = useResolvedHistory(address);

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-2xl font-bold text-primary'>Your History</h2>
      <div className='glass-panel overflow-hidden'>
        {loading ? (
          <div className='p-20 flex flex-col items-center gap-4'>
            <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
            <p className='text-primary/40 uppercase tracking-widest text-xs font-bold'>Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className='p-20 text-center text-primary/40 italic'>You haven't participated in any resolved markets yet.</div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead className='bg-primary/5 border-b border-primary/10'>
                <tr>
                  <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Market</th>
                  <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Outcome</th>
                  <th className='px-6 py-5 text-[10px] uppercase font-bold text-primary/40 tracking-widest'>Date Checked</th>
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
                      <span className='text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest bg-primary/5 text-primary'>
                        {market.winning_outcome === 1 ? 'YES' : 'NO'}
                      </span>
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

