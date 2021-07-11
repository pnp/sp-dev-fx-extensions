import { IActiveConnection } from "../../models/IActiveConnection";
import { IErrorInfo } from "../../models/IErrorInfo";
import { IListLastActivity } from "../../models/IListLastActivity";
import { IConfigurationListItem } from "../ConfigurationList";
import { EGlobalStateTypes } from "./EGlobalStateTypes";
import { IGlobalState } from "./IGlobalState";

// Reducer
export const GlobalStateReducer = (
  state: IGlobalState,
  action: { type: EGlobalStateTypes; payload: unknown }
): IGlobalState => {
  switch (action.type) {
    case EGlobalStateTypes.SET_ERROR_INFO:
      return { ...state, errorInfo: action.payload as IErrorInfo };
    case EGlobalStateTypes.SET_LISTS:
      return { ...state, lists: action.payload as IConfigurationListItem[] };
    case EGlobalStateTypes.SET_LIST_ACTIVITY:
      return { ...state, listActivities: action.payload as IListLastActivity[] };
    case EGlobalStateTypes.SET_NUMBER_OF_NOTIFICATIONS:
      return { ...state, numberOfNotifications: action.payload as number };
    case EGlobalStateTypes.SET_ACTIVE_CONNECTIONS:
      return { ...state, activeConnections: action.payload as IActiveConnection[] };
    default:
      return state;
  }
};
