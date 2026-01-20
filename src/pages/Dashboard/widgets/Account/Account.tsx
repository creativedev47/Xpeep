import { Label } from 'components/Label';
import { OutputContainer } from 'components/OutputContainer';
import { FormatAmount } from 'components/sdkDappComponents';
import { useGetAccount, useGetNetworkConfig } from 'hooks';
import { Username } from './components';

export const Account = () => {
  const { network } = useGetNetworkConfig();
  const account = useGetAccount();
  const { address, shard, balance } = account;

  return (
    <OutputContainer>
      <div className='flex flex-col text-black' data-testid='topInfo'>
        <p className='truncate'>
          <Label>Address: </Label>
          <span data-testid='accountAddress'> {address}</span>
        </p>

        <Username account={account} />
        <p>
          <Label>Shard: </Label> {shard}
        </p>

        <p>
          <Label>Balance: </Label>
          <FormatAmount
            value={balance}
            egldLabel={network.egldLabel}
            data-testid='balance'
          />
        </p>
      </div>
    </OutputContainer>
  );
};
