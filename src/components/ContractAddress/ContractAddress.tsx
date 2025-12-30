import { Label } from 'components/Label';
import { ACCOUNTS_ENDPOINT, ExplorerLink } from 'components/sdkDappComponents';
import { contractAddress } from 'config';

export const ContractAddress = () => {
  return (
    <p>
      <Label>Contract: </Label>
      <ExplorerLink
        page={`/${ACCOUNTS_ENDPOINT}/${contractAddress}`}
        className='text-primary/60 hover:text-primary transition-colors font-mono text-xs'
      >
        {contractAddress}
      </ExplorerLink>

    </p>
  );
};
