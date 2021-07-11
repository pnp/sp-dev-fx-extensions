import React, { createContext, useReducer } from "react";
import { GlobalStateReducer } from "./GlobalStateReducer";
// Reducer
// Initial State (Store )
var initialState = {
    errorInfo: undefined,
    lists: [],
    listActivities: [],
    numberOfNotifications: 0,
    activeConnections: [],
};
var stateInit = {
    state: initialState,
    setGlobalState: function () {
        return;
    },
};
// Meeting Details Context to Share to all Sub Components (store)
export var GlobalStateContext = createContext(stateInit);
export var GlobalStateProvider = function (props) {
    var _a = useReducer(GlobalStateReducer, initialState), state = _a[0], setGlobalState = _a[1];
    return React.createElement(GlobalStateContext.Provider, { value: { state: state, setGlobalState: setGlobalState } }, props.children);
};
//# sourceMappingURL=GlobalStateProvider.js.map