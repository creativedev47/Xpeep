import type { PropsWithChildren, MouseEvent } from 'react';
import { WithClassnameType } from 'types';

interface ButtonType extends WithClassnameType, PropsWithChildren {
  onClick: (e: MouseEvent) => void;
  disabled?: boolean;
  dataTestId?: string;
  dataCy?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  onClick,
  disabled = false,
  type = 'button',
  id,
  className = 'neon-button bg-primary text-background font-bold px-6 py-2 rounded-full text-sm uppercase tracking-widest hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed',

  ...otherProps
}: ButtonType) => {
  return (
    <button
      id={id}
      data-testid={otherProps['data-testid']}
      disabled={disabled}
      onClick={onClick}
      className={className}
      type={type}
    >
      {children}
    </button>
  );
};
