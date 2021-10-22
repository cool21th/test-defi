import * as React from 'react';
import { ModalProvider } from '@pancakeswap-libs/uikit';
import * as bsc from '@binance-chain/bsc-use-wallet'
import { Provider } from 'react-redux'
import getRpcUrl from 'utils/getRpcUrl'
import { LanguagecontextProvider} from 'contexts/Localization/languagecontext'
import { ThemeContextProvider } from 'contexts/ThemeContext'
import { BlockContextProvider } from 'contexts/BlockContext'
import { RefreshContextProvider } from 'contexts/RefreshContext'
import store from 'state'


const Provider: React.FC = ({ children }) => {
    const rpcUrl = getRpcUrl()
    const chainId = parseInt(process.env.REACT_APP_CHAIN_ID);
    return (
        <Provider store={store}>
            <ThemeContextProvider>
                <LanguagecontextProvider>
                    <bsc.UseWalletProvider
                        chaindId={chainId}
                        connectors={{
                            walletconnect: {rpcUrl},
                            bsc,
                        }}
                    >
                        <BlockContextProvider>
                            <RefreshContextProvider>
                                <ModalProvider>{children}</ModalProvider>
                            </RefreshContextProvider>
                        </BlockContextProvider>
                    </bsc.UseWalletProvider>
                </LanguagecontextProvider>
            </ThemeContextProvider>
        </Provider>
    )
}

export default Providers