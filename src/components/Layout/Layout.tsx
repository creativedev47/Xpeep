import type { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
// import { AuthenticatedRoutesWrapper } from 'components/sdkDappComponents'; 
import { RouteNamesEnum } from 'localConstants/routes';
import { routes } from 'routes/routes';
import { Footer } from './Footer';
import { Header } from './Header';

export const Layout = ({ children }: PropsWithChildren) => {
  const { search, pathname } = useLocation();
  const isUnlockPage = pathname === RouteNamesEnum.unlock;

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      {!isUnlockPage && <Header />}
      <main className='flex flex-grow items-stretch justify-center'>
        {children}
      </main>
      {!isUnlockPage && <Footer />}
    </div>
  );

};

