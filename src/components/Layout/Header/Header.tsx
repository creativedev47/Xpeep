import { useState } from 'react';
import { Button } from 'components/Button';
import { MxLink } from 'components/MxLink';
import { logout } from 'helpers';
import { useGetIsLoggedIn, useGetAccountInfo } from 'hooks';
import { RouteNamesEnum } from 'localConstants';
import { useMatch, useNavigate } from 'react-router-dom';

import { Logo } from 'components/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faWallet, faUserCircle, faSun, faMoon, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useIsAdmin } from 'hooks/useIsAdmin';
import { useTheme } from 'context/ThemeContext';

export const Header = () => {
  const isLoggedIn = useGetIsLoggedIn();
  const { address, account } = useGetAccountInfo();
  const isUnlockRoute = Boolean(useMatch(RouteNamesEnum.unlock));
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    logout(`${window.location.origin}/unlock`, () => navigate(RouteNamesEnum.unlock), false);
  };

  const navItems = [
    { name: 'Home', route: RouteNamesEnum.home },
    ...(isAdmin ? [
      { name: 'Create', route: RouteNamesEnum.createMarket },
      { name: 'Control', route: RouteNamesEnum.admin }
    ] : [
      { name: 'Markets', route: RouteNamesEnum.markets },
      { name: 'My Peeps', route: RouteNamesEnum.myBets },
      { name: 'Roadmap', route: RouteNamesEnum.roadmap },
      { name: 'Community', route: RouteNamesEnum.community }
    ]),
    { name: 'Wallet', route: RouteNamesEnum.wallet },
  ];

  const formattedBalance = (parseFloat(account.balance) / 10 ** 18).toFixed(4);


  const { theme, toggleTheme } = useTheme();

  return (
    <header className='sticky top-0 z-50 w-full glass-panel !rounded-none border-b px-4 md:px-6 py-4 flex items-center justify-between'>
      <div className='flex items-center gap-4 md:gap-8'>
        <MxLink to={RouteNamesEnum.home}>
          <Logo />
        </MxLink>

        {/* Desktop Nav */}
        <nav className='hidden lg:flex items-center gap-6'>
          {navItems.map((item) => (
            <MxLink
              key={item.name}
              to={item.route}
              className='text-soft-blue hover:text-primary transition-colors font-medium text-sm uppercase tracking-wider'
            >
              {item.name}
            </MxLink>
          ))}
        </nav>
      </div>

      <div className='flex items-center gap-2 md:gap-4'>
        <button
          onClick={toggleTheme}
          className='w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-all'
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} />
        </button>

        {/* <div className='hidden md:flex items-center bg-primary/5 border border-primary/10 rounded-full px-4 py-1.5 focus-within:border-primary/50 transition-colors'>
          <FontAwesomeIcon icon={faSearch} className='text-primary/30 text-xs' />
          <input
            type='text'
            placeholder='Search events...'
            className='bg-transparent border-none focus:ring-0 text-sm ml-2 w-48 placeholder:text-primary/20 text-primary'
          />
        </div> */}

        {isLoggedIn ? (
          <div className='flex items-center gap-3'>
            <div className='hidden sm:flex flex-col items-end'>
              <span className='text-[10px] text-primary/40 uppercase font-bold'>Balance</span>
              <span className='text-xs font-mono text-primary'>
                {formattedBalance} EGLD
              </span>

            </div>
            <div className='h-8 w-[1px] bg-primary/10 mx-1 hidden sm:block' />
            <div className='flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-full pl-3 pr-1 py-1'>
              <span className='text-xs font-mono text-primary'>
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                onClick={handleLogout}
                className='h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors'
              >
                <FontAwesomeIcon icon={faUserCircle} className='text-primary' />
              </button>
            </div>
          </div>
        ) : (
          !isUnlockRoute && (
            <MxLink
              to={RouteNamesEnum.unlock}
              className='neon-button bg-primary text-background font-bold px-4 py-2 md:px-6 md:py-2 rounded-full text-xs md:text-sm uppercase tracking-widest hover:shadow-md'
            >
              <FontAwesomeIcon icon={faWallet} className='mr-2' />
              <span className="hidden md:inline">Connect</span>
              <span className="md:hidden">Connect</span>
            </MxLink>
          )
        )}

        {/* Mobile Menu Toggle */}
        <button
          className='lg:hidden w-10 h-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-all ml-2'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} size="lg" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className='absolute top-full left-0 w-full bg-background border-b border-primary/10 p-6 flex flex-col gap-4 shadow-xl lg:hidden animate-fade-in z-40'>
          {navItems.map((item) => (
            <MxLink
              key={item.name}
              to={item.route}
              onClick={() => setIsMobileMenuOpen(false)}
              className='text-soft-blue hover:text-primary transition-colors font-bold text-lg uppercase tracking-wider py-2 border-b border-primary/5 last:border-0'
            >
              {item.name}
            </MxLink>
          ))}
          {/* Mobile Search */}
          <div className='flex items-center bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 mt-2'>
            <FontAwesomeIcon icon={faSearch} className='text-primary/30 text-sm' />
            <input
              type='text'
              placeholder='Search events...'
              className='bg-transparent border-none focus:ring-0 text-sm ml-2 w-full placeholder:text-primary/20 text-primary'
            />
          </div>
        </div>
      )}
    </header>

  );
};

