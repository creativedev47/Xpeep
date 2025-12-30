import type { PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { WithClassnameType } from 'types';

interface MxLinkPropsType extends LinkProps, WithClassnameType { }

export const MxLink = ({
  to,
  children,
  className = 'hover:no-underline transition-colors',
  ...props
}: MxLinkPropsType) => {
  return (
    <Link to={to} className={className} {...props}>
      {children}
    </Link>
  );
};
