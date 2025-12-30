import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useGetIsLoggedIn } from 'hooks';
import { RouteNamesEnum } from 'localConstants';

interface AuthRedirectWrapperPropsType extends PropsWithChildren {
  requireAuth?: boolean;
  redirectIfLoggedIn?: boolean;
}

export const AuthRedirectWrapper = ({
  children,
  requireAuth = true,
  redirectIfLoggedIn = false
}: AuthRedirectWrapperPropsType) => {
  const isLoggedIn = useGetIsLoggedIn();

  if (isLoggedIn && redirectIfLoggedIn) {
    return <Navigate to={RouteNamesEnum.dashboard} />;
  }

  if (!isLoggedIn && requireAuth) {
    return <Navigate to={RouteNamesEnum.unlock} />;
  }

  return <>{children}</>;
};


