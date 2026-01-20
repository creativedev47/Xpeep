import { LoginMethodsEnum } from 'types/sdkDappTypes';
import { useGetLoginInfo } from './sdkDappHooks';

export const useIsWebProvider = () => {
  const { providerType } = useGetLoginInfo();
  const isWebProvider = providerType === LoginMethodsEnum.wallet;

  return { isWebProvider };
};
