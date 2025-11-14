import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type FocusModeContextValue = {
  isFocusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocusMode: () => void;
};

const FocusModeContext = createContext<FocusModeContextValue | undefined>(undefined);

export const FocusModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const setFocusMode = useCallback((value: boolean) => {
    setIsFocusMode(value);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isFocusMode,
      setFocusMode,
      toggleFocusMode,
    }),
    [isFocusMode, setFocusMode, toggleFocusMode],
  );

  return <FocusModeContext.Provider value={value}>{children}</FocusModeContext.Provider>;
};

export const useFocusMode = (): FocusModeContextValue => {
  const context = useContext(FocusModeContext);
  if (!context) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

