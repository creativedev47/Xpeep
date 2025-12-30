import React from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { useGetAccountInfo, useProfile } from 'hooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faArrowUp, faArrowDown, faExchangeAlt, faCoins, faUserEdit, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

export const Wallet = () => {
    const { address, account } = useGetAccountInfo();
    const { profile, updateProfile, loading: profileLoading } = useProfile(address);
    const [isEditing, setIsEditing] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [bio, setBio] = React.useState('');

    React.useEffect(() => {
        if (profile) {
            setUsername(profile.username || '');
            setBio(profile.bio || '');
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        try {
            await updateProfile({ username, bio });
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile', err);
        }
    };

    const formattedBalance = (parseFloat(account.balance) / 10 ** 18).toFixed(4);
    const usdValue = (parseFloat(formattedBalance) * 50).toFixed(2); // Assuming $50/EGLD for devnet visualization

    return (
        <AuthRedirectWrapper requireAuth={true}>
            <PageWrapper>
                <div className='flex flex-col gap-10 py-12 w-full max-w-5xl'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-4xl font-bold mb-2 text-primary'>Wallet</h1>
                            <p className='text-soft-blue/80'>Manage your assets and track your on-chain activity.</p>
                        </div>
                        <div className='flex gap-3'>
                            <button className='px-6 py-2 rounded-xl bg-black/5 border border-black/10 hover:border-primary/50 transition-all font-bold text-sm uppercase tracking-widest text-primary'>
                                <FontAwesomeIcon icon={faArrowUp} className='mr-2' />
                                Send
                            </button>
                            <button className='px-6 py-2 rounded-xl bg-primary text-background hover:shadow-md transition-all font-bold text-sm uppercase tracking-widest'>
                                <FontAwesomeIcon icon={faArrowDown} className='mr-2' />
                                Receive
                            </button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className='lg:col-span-2 flex flex-col gap-8'>
                            <div className='glass-panel p-10 bg-glow-primary flex flex-col items-center gap-6'>
                                <div className='absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl' />
                                <h3 className='text-[10px] text-primary/40 uppercase font-bold mb-6 tracking-widest'>Main Account</h3>
                                <div className='flex flex-col gap-1 mb-8'>
                                    <span className='text-4xl font-bold text-primary'>{formattedBalance} EGLD</span>
                                    <span className='text-sm text-primary/60 font-mono'>~$ {usdValue} USD</span>
                                </div>
                                <div className='flex flex-col gap-2'>
                                    <span className='text-[10px] text-primary/40 uppercase font-bold'>Address</span>
                                    <div className='flex items-center justify-between bg-black/5 rounded-xl px-4 py-2 border border-black/5'>
                                        <span className='text-xs font-mono text-soft-blue truncate mr-4'>{address}</span>
                                        <button className='text-primary hover:text-primary/60 transition-colors' onClick={() => navigator.clipboard.writeText(address)}>
                                            <FontAwesomeIcon icon={faExchangeAlt} size='xs' />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='glass-panel p-8'>
                                <div className='flex items-center justify-between mb-8'>
                                    <h3 className='text-xl font-bold text-primary'>Profile Settings</h3>
                                    <button
                                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                        className='text-primary hover:text-primary/60 transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest'
                                    >
                                        <FontAwesomeIcon icon={isEditing ? faCheck : faUserEdit} />
                                        {isEditing ? 'Save' : 'Edit'}
                                    </button>
                                </div>

                                <div className='flex flex-col gap-6'>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-[10px] text-primary/40 uppercase font-bold tracking-widest'>Username</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className='bg-black/5 border border-black/10 rounded-xl px-4 py-2 text-primary focus:outline-none focus:border-primary/50 transition-all'
                                                placeholder="Enter username..."
                                            />
                                        ) : (
                                            <span className='text-primary font-bold'>{profile?.username || 'Not set'}</span>
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <label className='text-[10px] text-primary/40 uppercase font-bold tracking-widest'>Bio</label>
                                        {isEditing ? (
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className='bg-black/5 border border-black/10 rounded-xl px-4 py-2 text-primary focus:outline-none focus:border-primary/50 transition-all min-h-[100px]'
                                                placeholder="Tell us about yourself..."
                                            />
                                        ) : (
                                            <p className='text-soft-blue/80 text-sm leading-relaxed'>{profile?.bio || 'No bio yet.'}</p>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className='text-warning hover:text-warning/60 transition-colors text-xs uppercase font-bold tracking-widest self-start'
                                        >
                                            <FontAwesomeIcon icon={faTimes} className='mr-2' />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className='glass-panel p-8'>
                                <div className='flex items-center justify-between mb-8'>
                                    <h3 className='text-xl font-bold text-primary'>Assets</h3>
                                    <FontAwesomeIcon icon={faCoins} className='text-primary/20' />
                                </div>
                                <div className='flex flex-col gap-4'>
                                    <AssetItem name="MultiversX" symbol="EGLD" balance={formattedBalance} value={usdValue} />
                                    <AssetItem name="USD Coin" symbol="USDC" balance="0.00" value="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col gap-6'>
                            <div className='glass-panel p-6'>
                                <h3 className='text-lg font-bold mb-6 text-primary'>Quick Actions</h3>
                                <div className='grid grid-cols-2 gap-4'>
                                    <ActionButton icon={faExchangeAlt} label="Swap" color="text-primary" />
                                    <ActionButton icon={faArrowUp} label="Stake" color="text-primary" />
                                    <ActionButton icon={faArrowDown} label="Bridge" color="text-primary" />
                                    <ActionButton icon={faWallet} label="Buy" color="text-primary" />
                                </div>
                            </div>

                            <div className='glass-panel p-6'>
                                <h3 className='text-lg font-bold mb-6 text-primary'>Recent Activity</h3>
                                <div className='flex flex-col gap-4'>
                                    <ActivityItem type="Peep Placed" amount="-1.0 EGLD" time="2h ago" />
                                    <ActivityItem type="Claimed" amount="+4.5 EGLD" time="1d ago" />
                                    <ActivityItem type="Received" amount="+10.0 EGLD" time="3d ago" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PageWrapper>
        </AuthRedirectWrapper>
    );
};

const AssetItem = ({ name, symbol, balance, value }: any) => (
    <div className='flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5 hover:border-black/10 transition-all'>
        <div className='flex items-center gap-4'>
            <div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs'>
                {symbol[0]}
            </div>
            <div className='flex flex-col'>
                <span className='font-bold text-primary'>{name}</span>
                <span className='text-[10px] text-primary/40 uppercase font-bold'>{symbol}</span>
            </div>
        </div>
        <div className='flex flex-col items-end'>
            <span className='font-bold text-primary'>{balance}</span>
            <span className='text-[10px] text-primary/40 font-mono'>$ {value}</span>
        </div>
    </div>
);

const ActionButton = ({ icon, label, color }: any) => (
    <button className='flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/5 border border-black/5 hover:border-primary/30 transition-all group'>
        <FontAwesomeIcon icon={icon} className={`${color} group-hover:scale-110 transition-transform`} />
        <span className='text-[10px] uppercase font-bold text-primary/40'>{label}</span>
    </button>
);

const ActivityItem = ({ type, amount, time }: any) => (
    <div className='flex items-center justify-between text-sm'>
        <div className='flex flex-col'>
            <span className='font-bold text-primary'>{type}</span>
            <span className='text-[10px] text-primary/20'>{time}</span>
        </div>
        <span className={`font-mono font-bold ${amount.startsWith('+') ? 'text-primary' : 'text-primary/60'}`}>
            {amount}
        </span>
    </div>
);


