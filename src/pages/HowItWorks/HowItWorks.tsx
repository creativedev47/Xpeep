import React from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faRocket, faShieldAlt, faUsers, faGlobe, faArrowRight, faZap, faChartPie } from '@fortawesome/free-solid-svg-icons';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';

export const HowItWorks = () => {
    return (
        <AuthRedirectWrapper requireAuth={false}>
            <PageWrapper>
                <div className='flex flex-col gap-24 py-16 w-full max-w-5xl mx-auto'>

                    {/* Hero Section */}
                    <section className='text-center flex flex-col items-center gap-6'>
                        <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest animate-pulse'>
                            <FontAwesomeIcon icon={faZap} className="text-yellow-400" />
                            <span>Supernova Protocol: ACTIVE</span>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping ml-1" />
                        </div>
                        <h1 className='text-5xl md:text-7xl font-bold text-primary leading-tight'>
                            Prediction at <br />
                            <span className='text-glow'>Supernova Speed</span>
                        </h1>
                        <p className='text-soft-blue/80 text-lg md:text-xl max-w-2xl text-center'>
                            Xpeep isn't just another prediction market. It's the only platform leveraging
                            <span className='text-primary font-bold'> Adaptive State Sharding </span>
                            to deliver sub-second finality and instant resolution.
                        </p>
                    </section>

                    {/* The MultiversX Edge */}
                    <section className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
                        <div className='flex flex-col gap-6 order-2 md:order-1'>
                            <h2 className='text-3xl font-bold text-primary'>The Sharding Advantage</h2>
                            <p className='text-soft-blue/80'>
                                Traditional prediction markets on legacy chains are slow, expensive, and prone to congestion.
                                Xpeep is built differently. By utilizing MultiversX's sharded architecture, we process
                                thousands of transactions per second across parallel shards.
                            </p>
                            <div className='flex flex-col gap-4'>
                                <div className='flex items-start gap-4 p-4 glass-panel bg-glow-primary border-primary/20'>
                                    <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                                        <FontAwesomeIcon icon={faZap} />
                                    </div>
                                    <div>
                                        <h4 className='font-bold text-primary'>Adaptive State Sharding</h4>
                                        <p className='text-xs text-soft-blue/60'>Parallel processing that scales infinitely as the market grows.</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4 p-4 glass-panel border-primary/10'>
                                    <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                                        <FontAwesomeIcon icon={faRocket} />
                                    </div>
                                    <div>
                                        <h4 className='font-bold text-primary'>Supernova Finality</h4>
                                        <p className='text-xs text-soft-blue/60'>We've already optimized for the upcoming Supernova specs, ensuring your peeps are finalized faster than a heartbeat.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='relative order-1 md:order-2'>
                            <div className='absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse' />
                            <div className='relative glass-panel p-8 border-primary/20 aspect-square flex flex-col items-center justify-center text-center gap-6 overflow-hidden'>
                                <div className='text-6xl text-primary drop-shadow-glow'>
                                    <FontAwesomeIcon icon={faGlobe} />
                                </div>
                                <h3 className='text-2xl font-bold text-primary uppercase tracking-[0.2em]'>One Reality.<br />Multiple Shards.</h3>
                                <p className='text-[10px] text-primary/40 uppercase font-bold tracking-widest'>The Speed of Future is Here.</p>
                            </div>
                        </div>
                    </section>

                    {/* How it Works Steps */}
                    <section className='flex flex-col gap-12'>
                        <div className='text-center'>
                            <h2 className='text-3xl font-bold text-primary mb-4'>How It Works</h2>
                            <p className='text-soft-blue/60 max-w-xl mx-auto italic'>Four simple steps to start peeping on the future with decentralized precision.</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                            {[
                                { step: '01', title: 'Connect', desc: 'Securely link your MultiversX wallet via xPortal, Ledger, or Extension.', icon: faUsers },
                                { step: '02', title: 'Analyze', desc: 'Browse the trending markets and analyze the current odds in real-time.', icon: faChartPie },
                                { step: '03', title: 'Peep', desc: 'Choose your side and stake your EGLD. Your peep is instantly finalized on-chain.', icon: faBolt },
                                { step: '04', title: 'Claim', desc: 'Once resolved, winners can claim their rewards immediately thanks to our smart contracts.', icon: faShieldAlt }
                            ].map((item) => (
                                <div key={item.step} className='glass-panel p-6 flex flex-col gap-4 border-primary/10 hover:border-primary/30 transition-all hover:translate-y-[-4px]'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-2xl font-black text-primary/10 italic'>{item.step}</span>
                                        <div className='w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary'>
                                            {/* @ts-ignore */}
                                            <FontAwesomeIcon icon={item.icon} />
                                        </div>
                                    </div>
                                    <h4 className='font-bold text-primary uppercase tracking-wider'>{item.title}</h4>
                                    <p className='text-xs text-soft-blue/80 leading-relaxed'>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Call to Action */}
                    <section className='glass-panel p-12 bg-glow-secondary border-primary/20 text-center flex flex-col items-center gap-8'>
                        <h2 className='text-4xl font-bold text-primary'>Ready to Peep?</h2>
                        <p className='text-soft-blue/80 max-w-md'>
                            Join the fastest prediction market in the MultiversX ecosystem and leverage sharding-speed finality today.
                        </p>
                        <div className='flex gap-4'>
                            <MxLink to={RouteNamesEnum.markets} className='neon-button bg-primary text-background px-10 py-4 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2'>
                                Explore Markets
                                <FontAwesomeIcon icon={faArrowRight} />
                            </MxLink>
                        </div>
                    </section>

                </div>
            </PageWrapper>
        </AuthRedirectWrapper>
    );
};
