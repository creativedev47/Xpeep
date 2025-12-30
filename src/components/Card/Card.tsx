import type { PropsWithChildren } from 'react';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { WithClassnameType } from 'types';

interface CardType extends PropsWithChildren, WithClassnameType {
  title: string;
  description?: string;
  reference: string;
  anchor?: string;
}

export const Card = (props: CardType) => {
  const { title, children, description, reference, anchor } = props;

  return (
    <div
      className='glass-panel p-8 flex flex-col'
      data-testid={props['data-testid']}
      id={anchor}
    >
      <h2 className='flex text-xl font-bold text-primary mb-4 group'>
        {title}
        <a
          href={reference}
          target='_blank'
          className='hidden group-hover:block ml-2 text-primary/40 hover:text-primary transition-colors'
        >
          <FontAwesomeIcon icon={faInfoCircle} size='sm' />
        </a>
      </h2>
      {description && <p className='text-soft-blue/80 mb-6'>{description}</p>}

      {children}
    </div>
  );
};
