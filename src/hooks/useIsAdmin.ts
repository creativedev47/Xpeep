import { useGetAccount } from 'hooks/sdkDappHooks';
import { ADMIN_ADDRESSES } from 'config/config.devnet';


export const useIsAdmin = () => {
    const { address } = useGetAccount();
    return ADMIN_ADDRESSES.includes(address);
};
