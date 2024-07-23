import { Hanko, register } from '@teamhanko/hanko-elements';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import styles from './HankoAuth.module.css';
import { useSessionData } from '../hooks/useSessionData';

const hankoApi = process.env.REACT_APP_HANKO_API_URL;

const HankoAuth = () => {
  const hanko = useMemo(() => new Hanko(hankoApi!), []);

  useEffect(() => {
    return hanko?.onAuthFlowCompleted((detail) => {
      document.location.href = '/';
    });
  }, [hanko]);

  useEffect(() => {
    if (hankoApi) {
      register(hankoApi, { enablePasskeys: false }).catch((error) => {
        console.log('error', error);
      });
    }
  }, []);

  return <hanko-auth />;
};

export default HankoAuth;
