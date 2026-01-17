import type {
  ExtensionLoginButtonPropsType,
  WebWalletLoginButtonPropsType,
  OperaWalletLoginButtonPropsType,
  LedgerLoginButtonPropsType,
  WalletConnectLoginButtonPropsType
} from '@multiversx/sdk-dapp/UI';
import {
  ExtensionLoginButton,
  LedgerLoginButton,
  OperaWalletLoginButton,
  WalletConnectLoginButton,
  WebWalletLoginButton as WebWalletUrlLoginButton,
  XaliasLoginButton,
  CrossWindowLoginButton
} from 'components/sdkDappComponents';
import { useExtensionLogin } from '@multiversx/sdk-dapp/hooks/login/useExtensionLogin';
import { nativeAuth, walletConnectV2ProjectId } from 'config';
import { RouteNamesEnum } from 'localConstants';
import { useNavigate } from 'react-router-dom';
import { AuthRedirectWrapper, PageWrapper } from 'wrappers';
import { Logo } from 'components/Logo';

type CommonPropsType =
  | OperaWalletLoginButtonPropsType
  | ExtensionLoginButtonPropsType
  | WebWalletLoginButtonPropsType
  | LedgerLoginButtonPropsType
  | WalletConnectLoginButtonPropsType;

const USE_WEB_WALLET_CROSS_WINDOW = true;

const WebWalletLoginButton = USE_WEB_WALLET_CROSS_WINDOW
  ? CrossWindowLoginButton
  : WebWalletUrlLoginButton;

export const Unlock = () => {
  const navigate = useNavigate();
  const loginProps = {
    callbackRoute: RouteNamesEnum.dashboard,
    nativeAuth: true, // Force boolean
    onLoginRedirect: () => {
      navigate(RouteNamesEnum.dashboard);
    },
    logoutRoute: RouteNamesEnum.unlock
  };

  const [initiateExtensionLogin] = useExtensionLogin({
    callbackRoute: loginProps.callbackRoute,
    nativeAuth: loginProps.nativeAuth,
    onLoginRedirect: loginProps.onLoginRedirect
  });

  const commonProps: any = {
    callbackRoute: loginProps.callbackRoute,
    nativeAuth: true,
    onLoginRedirect: loginProps.onLoginRedirect
  };

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
                  Choose your preferred method to access the future of prediction markets.
                </p>
              </div>
            </div>

            {/* Login Methods Grid */}
            <div className='glass-panel p-10 md:p-12 bg-glow-primary relative overflow-hidden shadow-2xl border-primary/10'>
              <div className='absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32' />
              <div className='absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -ml-32 -mb-32' />

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 unlock-buttons relative z-10'>

                <div className='flex flex-col gap-2'>
                  <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40 ml-1'>Mobile</span>
                  <WalletConnectLoginButton
                    loginButtonText='xPortal App'
                    walletConnectV2ProjectId={walletConnectV2ProjectId}
                    {...commonProps}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40 ml-1'>Desktop</span>
                  <button
                    onClick={() => initiateExtensionLogin()}
                    className={buttonClassName}
                  >
                    DeFi Wallet
                  </button>
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40 ml-1'>Web</span>
                  <WebWalletLoginButton
                    loginButtonText='Web Wallet'
                    {...commonProps}
                  />
                </div>

                <div className='flex flex-col gap-2'>
                  <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40 ml-1'>Social</span>
                  <XaliasLoginButton
                    loginButtonText='xAlias'
                    {...commonProps}
                  />
                </div>

                {/* <div className='md:col-span-2 mt-4'>
                  <div className='h-[1px] bg-primary/5 w-full mb-6' />
                  <div className='flex flex-col gap-2'>
                    <span className='text-[10px] uppercase tracking-widest font-bold text-primary/40 text-center mb-1'>Hardware</span>
                    <LedgerLoginButton
                      loginButtonText='Ledger Hardware Wallet'
                      {...commonProps}
                    />
                  </div>
                </div> */}
              </div>
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


