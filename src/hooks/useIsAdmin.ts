import { useGetAccountInfo } from 'hooks/sdkDappHooks';
import { ADMIN_ADDRESSES } from 'config/config.devnet';


export const useIsAdmin = () => {
    const { address } = useGetAccountInfo();
    return ADMIN_ADDRESSES.includes(address);
};
