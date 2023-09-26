import { useEvmNativeBalance } from '@moralisweb3/next';

function HomePage() {
    const address = '0x7B93AED8239f85949FDCec66f1f9ED13a5026adD';
    const { data: nativeBalance } = useEvmNativeBalance({ address });
    return (
        <div>
            <h3>Wallet: {address}</h3>
            <h3>Native Balance: {nativeBalance?.balance.ether} ETH</h3>
        </div>
    );
}

export default HomePage;