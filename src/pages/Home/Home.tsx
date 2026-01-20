import React, { useState, useEffect } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { CrystalBall } from 'components/CrystalBall';
import { MarketCard } from 'components/MarketCard';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBolt, faShieldAlt, faGlobe, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useGetMarketData } from 'hooks/transactions';
import { useMarketMetadata } from 'hooks/supabase';
import { useGetAccount } from 'hooks';
import { useWalletConnect } from 'hooks/useWalletConnect';

export const Home = () => {
  const [trendingMarkets, setTrendingMarkets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getMarket, getMarketCount, getParticipantCount } = useGetMarketData();
  const { fetchAllMetadata } = useMarketMetadata();
  const { address } = useGetAccount();

  useEffect(() => {
    const fetchTrending = async () => {
      setIsLoading(true);
      try {
        const [count, allMetadata] = await Promise.all([
          getMarketCount(),
          fetchAllMetadata()
        ]);

        if (allMetadata && allMetadata.length > 0) {
          const visibleMarkets = allMetadata
            .filter((m: any) => m.status === 'Open')
            .sort((a: any, b: any) => b.market_id - a.market_id)
            .slice(0, 3);

          const fetched = [];
          for (const metadata of visibleMarkets) {
            const marketId = metadata.market_id;
            const market = await getMarket(marketId);
            const participants = await getParticipantCount(marketId);
            if (market) {
              fetched.push({
                id: marketId.toString(),
                title: market.description?.toString() || metadata.title || 'Untitled Market',
                category: metadata.category || 'General',
                totalStaked: market.total_staked ? (parseFloat(market.total_staked) / 10 ** 18).toFixed(2) : '0.00',
                participants: participants || 0,
                endTime: market.end_time ? new Date(market.end_time * 1000).toLocaleDateString() : 'N/A',
                status: market.status?.name || market.status?.toString() || 'Open'
              });
            }
          }
          setTrendingMarkets(fetched);
        }
      } catch (err) {
        console.error('Failed to fetch trending markets', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);


  const walletConnect = useWalletConnect();

  return (
    <AuthRedirectWrapper requireAuth={false}>
      <PageWrapper>
        <div className='flex flex-col gap-20 py-12'>
          {/* Hero Section */}
          <section className='flex flex-col lg:flex-row items-center gap-12 min-h-[70vh]'>
            <div className='flex-1 text-center lg:text-left'>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 animate-pulse'>
                <FontAwesomeIcon icon={faBolt} />
                <span>Live on MultiversX Devnet</span>
              </div>
              <h1 className='text-5xl md:text-7xl font-bold mb-6 leading-tight text-primary'>
                Peep the <span className='text-primary text-glow'>Future</span>.<br />
              </h1>
              <p className='text-soft-blue/80 text-lg md:text-xl max-w-2xl mb-10'>
                The world's first high-stakes decentralized prediction market built for speed and fun.
                Leverage MultiversX's sub-second finality to peep into tomorrow.
              </p>
              <div className='flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start'>
                <MxLink
                  to={RouteNamesEnum.markets}
                  className='neon-button bg-primary text-background font-bold px-8 py-4 rounded-2xl text-lg uppercase tracking-widest hover:shadow-md w-full sm:w-auto text-center'
                >
                  Start Peeping
                  <FontAwesomeIcon icon={faArrowRight} className='ml-2' />
                </MxLink>
                {address ? (
                  <MxLink
                    to={RouteNamesEnum.wallet}
                    className='px-8 py-4 rounded-2xl border border-primary/10 text-primary font-bold hover:bg-primary/5 transition-all w-full sm:w-auto text-center'
                  >
                    {`${address.slice(0, 6)}...${address.slice(-4)}`}
                  </MxLink>
                ) : (
                  <button
                    onClick={walletConnect}
                    className='px-8 py-4 rounded-2xl border border-primary/10 text-primary font-bold hover:bg-primary/5 transition-all w-full sm:w-auto text-center'
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>

            <div className='flex-1 flex justify-center items-center'>
              <CrystalBall />
            </div>
          </section>

          {/* Features Section */}
          <section className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='glass-panel p-8 bg-glow-primary'>

              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6'>
                <FontAwesomeIcon icon={faBolt} size='lg' />
              </div>
              <h3 className='text-xl font-bold mb-4 text-primary'>Sub-second Speed</h3>
              <p className='text-soft-blue/80 text-sm'>
                Powered by MultiversX, transactions are settled in less than a second with near-zero fees.
              </p>
            </div>
            <div className='glass-panel p-8 bg-glow-secondary'>

              <div className='w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-6'>
                <FontAwesomeIcon icon={faShieldAlt} size='lg' />
              </div>
              <h3 className='text-xl font-bold mb-4 text-primary'>Fully On-Chain</h3>
              <p className='text-soft-blue/80 text-sm'>
                No middleman. All peeps and resolutions are handled by secure smart contracts.
              </p>
            </div>
            <div className='glass-panel p-8'>
              <div className='w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6'>
                <FontAwesomeIcon icon={faGlobe} size='lg' />
              </div>
              <h3 className='text-xl font-bold mb-4 text-primary'>Global Events</h3>
              <p className='text-soft-blue/80 text-sm'>
                From crypto prices to pop culture, peep on anything that matters to the world.
              </p>
            </div>
          </section>

          {/* Trending Markets */}
          <section>
            <div className='flex items-center justify-between mb-10'>
              <h2 className='text-3xl font-bold text-primary'>Trending Markets</h2>
              <MxLink to={RouteNamesEnum.markets} className='text-primary hover:underline text-sm font-bold uppercase tracking-widest'>
                View All Markets <FontAwesomeIcon icon={faArrowRight} className='ml-1' />
              </MxLink>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {isLoading ? (
                <div className='col-span-full flex flex-col items-center py-10 gap-4'>
                  <FontAwesomeIcon icon={faSpinner} spin size='2x' className='text-primary' />
                  <p className='text-soft-blue/80 font-bold uppercase tracking-widest text-xs'>Loading trending peeps...</p>
                </div>
              ) : trendingMarkets.length === 0 ? (
                <div className='col-span-full text-center py-10 text-soft-blue/40 italic'>
                  No markets found. Be the first to create one!
                </div>
              ) : (
                trendingMarkets.map((market) => (
                  <MarketCard key={market.id} {...market} />
                ))
              )}
            </div>


          </section>
        </div>
      </PageWrapper>
    </AuthRedirectWrapper>
  );
};

