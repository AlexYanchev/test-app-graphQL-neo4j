import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  makeVar,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useSessionData } from './components/hooks/useSessionData';

export const starredVar = makeVar<any[]>([]);

const AppWithApollo = () => {
  const { jwt, isValid } = useSessionData();

  const httpLink = createHttpLink({ uri: 'http://localhost:4000' });

  const authLink = setContext(async (_, { headers }) => {
    if (jwt) {
      return {
        headers: {
          ...headers,
          authorization: jwt ? `Bearer ${jwt}` : '',
        },
      };
    } else {
      return { ...headers };
    }
  });

  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Business: {
          fields: {
            isStarred: {
              read(_, { readField }) {
                return starredVar().includes(readField('businessId'));
              },
            },
          },
        },
      },
    }),
  });

  return (
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <AppWithApollo />
  </React.StrictMode>,
  document.getElementById('root') as HTMLElement
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
