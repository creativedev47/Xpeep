import './styles/globals.css';

import { walletConnectV2ProjectId, nativeAuth } from 'config';
import { EnvironmentsEnum, ICustomProvider, InitAppType } from './lib';

export const config: InitAppType = {
    storage: { getStorageCallback: () => sessionStorage },
    dAppConfig: {
        nativeAuth,
        environment: EnvironmentsEnum.devnet,
        providers: {
            walletConnect: {
                walletConnectV2ProjectId
            }
        }
    }
};
