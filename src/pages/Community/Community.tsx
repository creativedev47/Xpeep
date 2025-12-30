import React from 'react';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';

export const Community = () => {
    return (
        <AuthRedirectWrapper requireAuth={false}>
            <PageWrapper>
                <div className='flex flex-col gap-10 py-12'>
                    <h1 className='text-4xl font-bold text-primary'>Community</h1>
                    <div className='glass-panel p-12 text-center'>
                        <h3 className='text-2xl font-bold mb-4 text-primary'>Coming Soon!</h3>
                        <p className='text-soft-blue/80'>Join our Discord and follow us on X to stay updated on the latest peeps.</p>
                    </div>
                </div>

            </PageWrapper>
        </AuthRedirectWrapper>
    );
};
