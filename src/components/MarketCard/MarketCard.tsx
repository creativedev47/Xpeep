import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUsers, faEye } from '@fortawesome/free-solid-svg-icons';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';

interface MarketCardProps {
    id: string;
    title: string;
    category: string;
    totalStaked: string;
    participants: number;
    endTime: string;
    status?: string;
}

export const MarketCard = ({ id, title, category, totalStaked, participants, endTime, status = 'Open' }: MarketCardProps) => {
    const isResolved = status !== 'Open';

    return (
        <div className={`glass-panel p-6 flex flex-col gap-6 transition-all group relative overflow-hidden h-full ${isResolved ? 'border-primary/5 opacity-80 hover:opacity-100' : 'hover:border-primary/50'}`}>
            {/* Glow Effect */}
            {!isResolved && (
                <div className='absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all' />
            )}

            <div className='flex items-center justify-between'>
                <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md ${isResolved ? 'bg-primary/5 text-primary/40' : 'text-primary bg-primary/5'}`}>
                    {category}
                </span>
                <div className='flex items-center gap-1 text-primary/40 text-[10px] font-bold uppercase'>
                    {isResolved ? (
                        <span className='text-primary/60'>Ended</span>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faClock} className='text-primary/60' />
                            <span>{endTime}</span>
                        </>
                    )}
                </div>
            </div>

            <h3 className={`text-xl font-bold leading-tight min-h-[3.5rem] ${isResolved ? 'text-primary/60' : 'text-primary'}`}>
                {title}
            </h3>

            <div className='flex items-center justify-between py-4 border-y border-primary/5'>
                <div className='flex flex-col'>
                    <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Total Staked</span>
                    <span className='text-lg font-bold text-primary font-mono'>{totalStaked} EGLD</span>
                </div>
                <div className='flex flex-col items-end'>
                    <span className='text-[10px] text-primary/40 uppercase font-bold mb-1'>Participants</span>
                    <div className='flex items-center gap-2'>
                        <FontAwesomeIcon icon={faUsers} className='text-primary/60 text-xs' />
                        <span className='font-bold text-primary'>{participants}</span>
                    </div>
                </div>
            </div>

            <MxLink
                to={`${RouteNamesEnum.markets}/${id}`}
                className={`neon-button font-bold py-3 rounded-xl text-sm uppercase tracking-widest text-center transition-all mt-auto flex items-center justify-center gap-2 ${isResolved
                    ? 'bg-primary/5 text-primary/40 hover:bg-primary/10'
                    : 'bg-primary/5 hover:bg-primary hover:text-background text-primary'
                    }`}
            >
                <FontAwesomeIcon icon={faEye} />
                {isResolved ? 'View Results' : 'Peep In'}
            </MxLink>
        </div>

    );
};
