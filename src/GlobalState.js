import React, { createContext, useContext, useState } from 'react';

// Create a context for global state
const GlobalStateContext = createContext();

// Custom hook to use global state
export const useGlobalState = () => useContext(GlobalStateContext);

export const GlobalStateProvider = ({ children }) => {
    // Define all the global states you want to persist across components
    const [businessRulesData, setBusinessRulesData] = useState(null);
    const [testPlanData, setTestPlanData] = useState(null);

    return (
        <GlobalStateContext.Provider
            value={{
                businessRulesData,
                setBusinessRulesData,
                testPlanData,
                setTestPlanData
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
