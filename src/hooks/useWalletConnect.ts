import { UnlockPanelManager } from 'lib';
import { useNavigate } from 'react-router-dom';
import { RouteNamesEnum } from 'localConstants';

export function useWalletConnect() {
  const navigate = useNavigate();
  return () => {
    const unlockPanelManager = UnlockPanelManager.init({
      loginHandler: () => {
        navigate(RouteNamesEnum.dashboard);
      }
    });
    unlockPanelManager.openUnlockPanel();
  };
}
