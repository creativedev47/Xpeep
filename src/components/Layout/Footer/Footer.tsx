import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import { MxLink } from 'components/MxLink';
import { RouteNamesEnum } from 'localConstants';
import { Logo } from 'components/Logo';


export const Footer = () => {
  return (
    <footer className='w-full border-t border-primary/5 bg-background py-12 px-6'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12'>
        <div className='col-span-1 md:col-span-2'>
          <MxLink to={RouteNamesEnum.home} className='inline-block mb-6'>
            <Logo className='h-24' />
          </MxLink>


          <p className='text-soft-blue/80 text-sm max-w-xs mb-6'>
            Peep the Future. The next generation of decentralized prediction markets on MultiversX.
          </p>
          <div className='flex gap-4'>
            <a href='https://x.com/thexpeep' target='blank' className='text-primary/40 hover:text-primary transition-colors'>
              <FontAwesomeIcon icon={faTwitter as any} size='lg' />
            </a>
            <a href='#' className='text-primary/40 hover:text-primary transition-colors'>
              <FontAwesomeIcon icon={faDiscord as any} size='lg' />
            </a>
            <a href='#' className='text-primary/40 hover:text-primary transition-colors'>
              <FontAwesomeIcon icon={faGithub as any} size='lg' />
            </a>

          </div>
        </div>

        <div>
          <h4 className='text-primary font-bold text-sm uppercase tracking-widest mb-4'>Platform</h4>
          <ul className='space-y-2 text-sm text-soft-blue/80'>
            <li><a href='#' className='hover:text-primary transition-colors'>About Xpeep</a></li>
            <li><MxLink to={RouteNamesEnum.howItWorks} className='hover:text-primary transition-colors'>How it Works</MxLink></li>
            <li><a href='#' className='hover:text-primary transition-colors'>FAQ</a></li>
            <li><a href='#' className='hover:text-primary transition-colors'>Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className='text-primary font-bold text-sm uppercase tracking-widest mb-4'>Powered By</h4>
          <div className='flex flex-col gap-4'>
            <a
              href='https://multiversx.com'
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-2 text-primary/40 hover:text-primary transition-colors'
            >
              <span className='text-xs'>Built on</span>
              <span className='font-bold text-sm tracking-tighter'>MultiversX</span>
            </a>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto mt-12 pt-8 border-t border-primary/5 text-center'>
        <p className='text-[10px] text-primary/20 uppercase tracking-[0.2em]'>
          © 2025 Xpeep. All rights reserved. Peep responsibly.
        </p>
      </div>
    </footer>

  );
};
