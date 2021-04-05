import React, {
  createContext,
  useReducer
} from "react";

import { reducer } from "./GlobalStateContextReducer";
import { IGlobalState } from "./IGlobalState";
import { IGlobalStateContext } from "./IGlobalStateContext";
// Initial State (Store )
const initialState:IGlobalState = {
   serviceScope: undefined,
  teams: [],
  teamsChannels:[],
   messageInfo: {message: '', isShow: false, messageProps: {}},
   hasError: false,
   appContext: undefined,
   filter: 'All',
   searchValue: '',
   selectedTeam: undefined,
   selectedTeamChannel: undefined,
   selectedFieldKeys: [],
   selectedImage: undefined,
   selectedSubTitle: undefined,
   selectedText: '',
   selectedTitle: undefined,
   adaptiveCard: '',
   cardFieldsWithImages: [],
   isSendingMessage: false,

};


//
export const GlobalStateContext =   createContext<IGlobalStateContext>({state: initialState, dispatch: ()=>null});
export const GlobalStateContextProvider = (props: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalStateContext.Provider value={{state, dispatch}}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};
