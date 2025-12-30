import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';

export const PageNotFound = () => {
  const { pathname } = useLocation();

  return (
    <div className='flex flex-col w-full h-[calc(100vh-200px)] justify-center items-center'>
      <div className='flex flex-col p-12 items-center justify-center gap-6 glass-panel max-w-md w-full'>
        <FontAwesomeIcon icon={faSearch} className='fa-3x text-primary/20' />

        <div className='flex flex-col items-center gap-2'>
          <h4 className='text-2xl font-bold text-primary'>Page not found</h4>
          <span className='text-sm font-mono text-soft-blue/60'>{pathname}</span>
        </div>
      </div>
    </div>

  );
};
