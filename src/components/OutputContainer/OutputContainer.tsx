import type { PropsWithChildren } from 'react';
import classNames from 'classnames';
import { Loader } from 'components/sdkDappComponents';
import { WithClassnameType } from 'types';

interface OutputContainerPropsType
  extends PropsWithChildren,
  WithClassnameType {
  isLoading?: boolean;
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
      {isLoading ? <Loader /> : children}
    </div>
  );
};
