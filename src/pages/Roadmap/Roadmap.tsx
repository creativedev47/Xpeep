import { PageWrapper } from 'wrappers';
import { Logo } from 'components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircle, faRocket, faBrain, faGlobe, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const roadmapData = [
    {
        quarter: 'Q1 2026',
        year: '2026',
        status: 'Completed',
        icon: faRocket,
        description: 'Foundation & Performance Optimization',
        items: [
            { text: 'Multi-Wallet Matrix (xPortal, Ledger, DeFi Wallet)', completed: true },
            { text: 'AI-Powered Resolution Agents', completed: true },
            { text: 'Launch on Devnet', completed: true, highlight: true }
        ]
    },
    {
        quarter: 'Q2 2026',
        year: '2026',
        status: 'Planned',
        icon: faBrain,
        description: 'AI & Predictive Intelligence',
        items: [
            { text: 'COMING SOON', completed: false }
        ]
    },
    {
        quarter: 'Q3 2026',
        year: '2026',
        status: 'Vision',
        icon: faGlobe,
        description: 'Ecosystem Expansion',
        items: [
            { text: 'COMING SOON', completed: false }
        ]
    },
    {
        quarter: 'Q4 2026',
        year: '2026',
        status: 'Evolution',
        icon: faShieldAlt,
        description: 'Hyper-Scale & Security',
        items: [
            { text: 'COMING SOON', completed: false }
        ]
    }
];

export const Roadmap = () => {
    return (
        <PageWrapper>
            <div className='flex flex-col items-center py-12 md:py-20'>
                {/* Header Section */}
                <div className='flex flex-col items-center gap-6 text-center mb-16 md:mb-24'>
                    <Logo className='h-20 mb-2 animate-float' />
                    <div className='flex flex-col gap-2'>
                        <h2 className='text-4xl md:text-6xl font-bold uppercase tracking-[0.2em] text-primary italic'>
                            Our Journey
                        </h2>
                        <div className='h-1 w-24 bg-primary mx-auto rounded-full' />
                        <p className='text-soft-blue/60 text-sm md:text-lg max-w-xl mx-auto leading-relaxed mt-4'>
                            Tracking our path to building the most private, performance-driven, AI-powered prediction market.
                        </p>
                    </div>
                </div>

                {/* Timeline Container */}
                <div className='relative w-full max-w-4xl px-4'>
                    {/* Vertical Line */}
                    <div className='absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary/20 via-primary/40 to-transparent transform -translate-x-1/2 hidden md:block' />

                    <div className='flex flex-col gap-12 md:gap-24 relative'>
                        {roadmapData.map((milestone, index) => (
                            <div
                                key={milestone.quarter}
                                className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                {/* Content Card */}
                                <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                                    <div className='glass-panel p-6 md:p-8 hover:border-primary/30 transition-all duration-500 group relative'>
                                        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors' />

                                        <div className={`flex flex-col gap-4 ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                                            <div className='flex items-center gap-3'>
                                                <span className='px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold tracking-[0.2em] text-primary uppercase'>
                                                    {milestone.status}
                                                </span>
                                                <div className='w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform'>
                                                    <FontAwesomeIcon icon={milestone.icon} />
                                                </div>
                                            </div>

                                            <h3 className='text-2xl md:text-3xl font-bold text-primary tracking-widest'>
                                                {milestone.quarter}
                                            </h3>
                                            {/* <p className='text-xs text-primary/40 uppercase font-black tracking-widest leading-tight'>
                                                {milestone.description}
                                            </p> */}

                                            <ul className={`flex flex-col gap-3 mt-4 w-full ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'}`}>
                                                {milestone.items.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        className={`flex items-center gap-3 text-sm transition-all duration-300 ${item.completed ? 'text-primary font-bold' : item.highlight ? 'text-primary/70 font-bold' : 'text-primary/30'}`}
                                                    >
                                                        {index % 2 === 0 && <span className='hidden md:block'>{item.text}</span>}
                                                        <FontAwesomeIcon
                                                            icon={item.completed ? faCheckCircle : faCircle}
                                                            className={`text-[10px] ${item.completed ? 'text-primary shadow-[0_0_10px_rgb(var(--color-primary)/0.5)]' : item.highlight ? 'text-primary/50' : 'text-primary/20'}`}
                                                        />
                                                        <span className={index % 2 === 0 ? 'md:hidden' : ''}>{item.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Node */}
                                <div className='relative flex items-center justify-center z-10 w-12'>
                                    <div className='w-4 h-4 rounded-full bg-background border-2 border-primary animate-pulse shadow-[0_0_15px_rgb(var(--color-primary)/0.5)]' />
                                    <div className='absolute w-8 h-8 rounded-full border border-primary/20 animate-ping opacity-20' />
                                </div>

                                {/* Spacer for empty side */}
                                <div className='hidden md:block md:w-5/12' />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Closing Note */}
                <div className='mt-24 text-center'>
                    <p className='text-xs uppercase tracking-[0.5em] text-primary/20 font-bold mb-4'>
                        The Future is Peeping
                    </p>
                    <div className='h-[1px] w-48 bg-gradient-to-r from-transparent via-primary/20 to-transparent mx-auto' />
                </div>
            </div>
        </PageWrapper>
    );
};
