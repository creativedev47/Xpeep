import React, { useState } from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClock, faFileAlt, faLock, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useCreateMarket } from 'hooks/transactions';
import { useMarketMetadata } from 'hooks/supabase';
import { useIsAdmin } from 'hooks/useIsAdmin';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';
import { PageNotFound } from 'pages/PageNotFound';

export const CreateMarket = () => {
    const [description, setDescription] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [existingCategories, setExistingCategories] = useState<string[]>([]);

    const { sendCreateMarket } = useCreateMarket();
    const { fetchAllMetadata } = useMarketMetadata();
    const isAdmin = useIsAdmin();

    React.useEffect(() => {
        const loadCategories = async () => {
            const metadata = await fetchAllMetadata();
            if (metadata) {
                const cats = Array.from(new Set(metadata.map((m: any) => m.category))).filter(Boolean) as string[];
                setExistingCategories(cats.sort());
            }
        };
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return;

        const finalCategory = (newCategory.trim() || selectedCategory || 'General').trim();

        if (!description || !endTime) {
            alert('Please fill in all fields');
            return;
        }

        const timestamp = Math.floor(new Date(endTime).getTime() / 1000);
        await sendCreateMarket({ description, endTime: timestamp, category: finalCategory });
    };

    return (
        <AuthRedirectWrapper requireAuth={true}>
            <PageWrapper>
                {!isAdmin ? (
                    <PageNotFound />
                ) : (
                    <div className='flex flex-col gap-10 py-12 w-full max-w-2xl'>
                        <div>
                            <h1 className='text-4xl font-bold mb-2 text-primary'>Create Market</h1>
                            <p className='text-soft-blue/80'>Define the future. Set up a new prediction market.</p>
                        </div>

                        <form onSubmit={handleCreate} className='glass-panel p-8 flex flex-col gap-6 bg-glow-purple'>
                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-bold uppercase tracking-widest text-primary/40 ml-2'>
                                    <FontAwesomeIcon icon={faFileAlt} className='mr-2' />
                                    Market Description
                                </label>
                                <textarea
                                    placeholder='e.g. Will BTC hit $100K by the end of 2025?'
                                    className='bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary/50 transition-colors min-h-[120px] resize-none text-primary placeholder:text-primary/20'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-2'>
                                    <label className='text-sm font-bold uppercase tracking-widest text-primary/40 ml-2'>
                                        <FontAwesomeIcon icon={faBolt} className='mr-2' />
                                        Select Category
                                    </label>
                                    <select
                                        className='w-full bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 focus:border-primary/50 transition-colors text-primary appearance-none cursor-pointer'
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="" className='bg-background text-primary'>Select existing category...</option>
                                        {existingCategories.map(cat => (
                                            <option key={cat} value={cat} className='bg-background text-primary'>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className='flex flex-col gap-2'>
                                    <label className='text-sm font-bold uppercase tracking-widest text-primary/40 ml-2 italic'>
                                        Or Create New Category
                                    </label>
                                    <input
                                        type="text"
                                        placeholder='Typing here will create a new category...'
                                        className='w-full bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 focus:border-primary/50 transition-colors text-primary placeholder:text-primary/20'
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <label className='text-sm font-bold uppercase tracking-widest text-primary/40 ml-2'>
                                    <FontAwesomeIcon icon={faClock} className='mr-2' />
                                    Resolution Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    className='bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary/50 transition-colors text-primary'
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className='neon-button bg-primary text-background font-bold py-4 rounded-2xl uppercase tracking-widest hover:shadow-md mt-4'
                            >
                                <FontAwesomeIcon icon={faPlus} className='mr-2' />
                                Deploy Market
                            </button>
                        </form>
                    </div>
                )}

            </PageWrapper>
        </AuthRedirectWrapper>
    );
};
