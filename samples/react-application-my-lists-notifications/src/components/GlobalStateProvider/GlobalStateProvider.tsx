import React, { createContext, useReducer } from "react";

import { GlobalStateReducer } from "./GlobalStateReducer";
import { IGlobalState } from "./IGlobalState";
import { IGlobalStateContext } from "./IGlobalStateContext";

// Reducer
// Initial State (Store )
const initialState: IGlobalState = {
  errorInfo: undefined,
  lists: [],
  listActivities: [],
  numberOfNotifications: 0,
  activeConnections: [],
};

const stateInit: IGlobalStateContext = {
  state: initialState,
  setGlobalState: () => {
    return;
  },
};

// Meeting Details Context to Share to all Sub Components (store)
export const GlobalStateContext = createContext<IGlobalStateContext>(stateInit);
export const GlobalStateProvider = (props: { children: React.ReactNode }): JSX.Element => {
  const [state, setGlobalState] = useReducer(GlobalStateReducer, initialState);

  return <GlobalStateContext.Provider value={{ state, setGlobalState }}>{props.children}</GlobalStateContext.Provider>;
};
