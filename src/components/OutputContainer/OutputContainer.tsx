import type { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { WithClassnameType } from 'types';

interface OutputContainerPropsType
  extends PropsWithChildren,
  WithClassnameType {
  isLoading?: boolean;
  'data-testid'?: string;
}

export const OutputContainer = (props: OutputContainerPropsType) => {
  const { children, isLoading = false, className = 'p-4' } = props;

  return (
    <div
      className={classNames(
        'glass-panel overflow-auto text-primary',
        className
      )}

      data-testid={props['data-testid']}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-4">
          <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary" />
        </div>
      ) : children}
    </div>
  );
};
