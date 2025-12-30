import { PropsWithChildren } from 'react';

export const Label = ({ children }: PropsWithChildren) => {
  return <label className='text-primary/60 font-bold uppercase tracking-widest text-[10px]'>{children}</label>;

};
