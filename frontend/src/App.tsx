import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import BusinessResults from './components/BusinessResults/BusinessResults';
import BusinessSearch from './components/BusinessSearch/BusinessSearch';
import { gql, useQuery } from '@apollo/client';
import HankoAuth from './components/HankoAuth/HankoAuth';
import { useUserData } from './components/hooks/useUserData';
import LogoutBtn from './components/LogoutBtn/LogoutBtn';
import { useSessionData } from './components/hooks/useSessionData';

export type BusinessType = {
  businessId: string;
  name: string;
  address: string;
  categories: Array<{ name: string }>;
  city: string;
  isStarred: boolean;
  averageStars: string;
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState(['All']);
  const {
    id,
    email,
    loading: userDataLoading,
    error: userDataError,
  } = useUserData();
  const { isValid } = useSessionData();

  const BUSINESS_DETAIL_FRAGMENT = gql`
    fragment businessDetails on Business {
      businessId
      name
      address
      categories {
        name
      }
      ${isValid ? 'averageStars' : ''}
      isStarred @client
    }
  `;

  const GET_BUSINESSES_BY_CATEGORY_QUERY = gql`
    query getBusinessesByCategory($selectedCategory: [String!]) {
      businesses(where: { categories_SOME: { name_IN: $selectedCategory } }) {
        ...businessDetails
      }
    }

    ${BUSINESS_DETAIL_FRAGMENT}
  `;

  const GET_BUSINESSES_QUERY = gql`
    query getBusinesses {
      businesses {
        ...businessDetails
      }
    }

    ${BUSINESS_DETAIL_FRAGMENT}
  `;

  const GET_CATEGORIES_QUERY = gql`
    query getCategories {
      categories {
        name
      }
    }
  `;

  const categoriesDataQuery = useQuery(GET_CATEGORIES_QUERY);

  const businessesDataQuery = useQuery(
    selectedCategory.includes('All')
      ? GET_BUSINESSES_QUERY
      : GET_BUSINESSES_BY_CATEGORY_QUERY,
    {
      variables: {
        selectedCategory,
      },
      // pollInterval: 500,
    }
  );

  if (businessesDataQuery.error) return <p> BUS Error</p>;
  if (businessesDataQuery.loading) return <p>Loading...</p>;
  if (categoriesDataQuery.error) return <p> CAT Error</p>;
  if (categoriesDataQuery.loading) return <p>Loading...</p>;

  return (
    <div>
      {isValid ? (
        <p>
          Вы зашли как {email}. <LogoutBtn />
        </p>
      ) : (
        <HankoAuth />
      )}
      <div>
        <h1>Business Search</h1>
        <div>
          <BusinessSearch
            criteries={['All'].concat(
              categoriesDataQuery.data.categories.map(
                (c: { name: string }) => c.name
              )
            )}
            selectedCriteria={selectedCategory}
            setSelectedCriteria={setSelectedCategory}
            title='Поиск по категориям'
            multipleSelected={true}
            refetch={businessesDataQuery.refetch}
          />
        </div>
      </div>

      <BusinessResults businesses={businessesDataQuery.data.businesses} />
    </div>
  );
}

export default App;
