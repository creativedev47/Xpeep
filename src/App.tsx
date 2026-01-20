import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { BatchTransactionsContextProvider } from 'wrappers';
import { PageNotFound, Unlock } from 'pages';
import { routes } from 'routes';
import { RouteNamesEnum } from 'localConstants';
import { Layout } from 'components';
import { ThemeProvider } from 'context/ThemeContext';
import { initApp } from 'lib/sdkDapp';
import { API_URL, walletConnectV2ProjectId, apiTimeout } from 'config';

// Initialize the Dapp with configuration
// Initialize the Dapp with configuration
initApp({
  dAppConfig: {
    network: {
      apiAddress: API_URL,
      apiTimeout: String(apiTimeout) as any
    },
    providers: {
      walletConnect: {
        walletConnectV2ProjectId
      }
    }
  }
});

export const App = () => {
  return (
    <BatchTransactionsContextProvider>
      <Router>
        <ThemeProvider>
          <Layout>
            <Routes>
              <Route path={RouteNamesEnum.unlock} element={<Unlock />} />
              {routes.map((route) => (
                <Route
                  path={route.path}
                  key={`route-key-${route.path}`}
                  element={<route.component />}
                />
              ))}
              <Route path='*' element={<PageNotFound />} />
            </Routes>
          </Layout>
        </ThemeProvider>
      </Router>
    </BatchTransactionsContextProvider>
  );
};
