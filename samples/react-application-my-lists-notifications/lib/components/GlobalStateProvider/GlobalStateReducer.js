var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { EGlobalStateTypes } from "./EGlobalStateTypes";
// Reducer
export var GlobalStateReducer = function (state, action) {
    switch (action.type) {
        case EGlobalStateTypes.SET_ERROR_INFO:
            return __assign(__assign({}, state), { errorInfo: action.payload });
        case EGlobalStateTypes.SET_LISTS:
            return __assign(__assign({}, state), { lists: action.payload });
        case EGlobalStateTypes.SET_LIST_ACTIVITY:
            return __assign(__assign({}, state), { listActivities: action.payload });
        case EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS:
            return __assign(__assign({}, state), { numberOfNotifications: action.payload });
        case EGlobalStateTypes.SET_ACTIVE_CONNECTIONS:
            return __assign(__assign({}, state), { activeConnections: action.payload });
        default:
            return state;
    }
};
//# sourceMappingURL=GlobalStateReducer.js.map