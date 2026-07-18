import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { coaApi } from '../api/coaApi';

const AccountingContext = createContext(null);

export const AccountingProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [sections, setSections] = useState([]);
  const [parentGroups, setParentGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, secRes, pgRes] = await Promise.all([
        coaApi.getAll(),
        coaApi.getSectionDropdown(),
        coaApi.getParentGroupDropdown(),
      ]);
      setAccounts(accRes.data?.data || []);
      setSections(secRes.data?.data || []);
      setParentGroups(pgRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load accounting data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <AccountingContext.Provider value={{ accounts, sections, parentGroups, loading, refresh }}>
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const ctx = useContext(AccountingContext);
  if (!ctx) throw new Error('useAccounting must be used within AccountingProvider');
  return ctx;
};
