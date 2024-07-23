import { Hanko } from '@teamhanko/hanko-elements';
import { useState, useEffect, useMemo, FC } from 'react';
import styles from './LogoutBtn.module.css';

const hankoApi = process.env.REACT_APP_HANKO_API_URL;

const LogoutBtn = () => {
  const hanko = useMemo(() => new Hanko(hankoApi!), []);

  const logout = async () => {
    try {
      await hanko?.user.logout();
      document.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <button type='button' onClick={logout}>
      Logout
    </button>
  );
};
export default LogoutBtn;
