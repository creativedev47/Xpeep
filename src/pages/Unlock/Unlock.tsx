import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { UnlockPanelManager, useGetLoginInfo } from 'lib';
import { nativeAuth } from 'config';
import { RouteNamesEnum } from 'localConstants';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { Logo } from 'components/Logo';

export const Unlock = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useGetLoginInfo();

  const unlockPanelManager = UnlockPanelManager.init({
    loginHandler: () => {
      navigate(RouteNamesEnum.dashboard);
    },
    // onClose: () => {
    //   // Optional: what to do when closing panel without login
    // }
  });

  const handleOpenUnlockPanel = () => {
    unlockPanelManager.openUnlockPanel();
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate(RouteNamesEnum.dashboard);
    }
  }, [isLoggedIn, navigate]);

  const buttonClassName = 'neon-button py-2.5 px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] bg-primary text-background hover:shadow-lg transition-all w-full flex items-center justify-center gap-2';

  return (
    <AuthRedirectWrapper requireAuth={false} redirectIfLoggedIn={true}>
      <PageWrapper>
        <div className='flex flex-col items-center justify-center min-h-[80vh] py-12'>
          <div className='w-full max-w-2xl flex flex-col gap-12'>
            {/* Header */}
            <div className='flex flex-col items-center gap-6 text-center'>
              <Logo className='h-20 mb-2' />
              <div className='flex flex-col gap-2'>
                <h2 className='text-4xl md:text-5xl font-bold uppercase tracking-[0.2em] text-primary'>
                  Connect Wallet
                </h2>
                <p className='text-soft-blue/60 text-sm md:text-base max-w-md mx-auto leading-relaxed'>
                  Use the button below to connect your wallet.
                </p>
              </div>
            </div>

            {/* Main Action */}
            <div className='glass-panel p-10 md:p-12 bg-glow-primary relative overflow-hidden shadow-2xl border-primary/10 flex justify-center'>
              <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32' />
              <div className='absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32' />

              <button onClick={handleOpenUnlockPanel} className={`${buttonClassName} w-full md:w-auto min-w-[200px] text-base py-4`}>
                Choose Wallet
              </button>
            </div>

            {/* Footer Note */}
            <div className='flex flex-col items-center gap-6'>
              <p className='text-[10px] text-primary/30 uppercase tracking-[0.2em] font-medium'>
                By connecting, you agree to our <a href='#' className='text-primary/60 hover:text-primary transition-colors underline decoration-dotted'>Terms of Peeping</a>.
              </p>

              <button
                onClick={() => navigate(RouteNamesEnum.home)}
                className='text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors'
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </AuthRedirectWrapper>
  );
};


