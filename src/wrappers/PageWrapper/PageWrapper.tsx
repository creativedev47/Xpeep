import type { PropsWithChildren } from 'react';

export const PageWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center w-full max-w-7xl mx-auto px-6'>
      {children}
    </div>
  );
};

