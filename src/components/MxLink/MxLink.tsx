import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { WithClassnameType } from 'types';

interface MxLinkPropsType extends PropsWithChildren, WithClassnameType {
  to: string;
}

export const MxLink = ({
  to,
  children,
  className = 'hover:no-underline transition-colors'

}: MxLinkPropsType) => {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
};
