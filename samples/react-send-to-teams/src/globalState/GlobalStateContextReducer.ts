import { EGlobalStateTypes } from "./EGlobalStateTypes";
import { IGlobalState } from "./IGlobalState";

// Reducer
export const reducer = (
  state: IGlobalState,
  action: { type: EGlobalStateTypes; payload: any }
) => {
  switch (action.type) {
    case EGlobalStateTypes.SET_SERVICE_SCOPE:
      return { ...state, serviceScope: action.payload };
    case EGlobalStateTypes.SET_TEAMS:
      return { ...state, teams: action.payload };
    case EGlobalStateTypes.SET_TEAM_CHANNELS:
      return { ...state, teamsChannels: action.payload };
    case EGlobalStateTypes.SET_HAS_ERROR:
      return { ...state, hasError: action.payload };
    case EGlobalStateTypes.SET_APP_CONTEXT:
      return { ...state, appContext: action.payload };
    case EGlobalStateTypes.SET_FILTER:
      return { ...state, filter: action.payload };
    case EGlobalStateTypes.SET_MESSAGE:
      return { ...state,  messageInfo: action.payload };
    case EGlobalStateTypes.SET_SELECTED_TEAM:
      return { ...state, selectedTeam: action.payload };
    case EGlobalStateTypes.SET_SELECTED_FIELDS:
      return { ...state, selectedFieldKeys: action.payload };
    case EGlobalStateTypes.SET_SELECTED_TITLE:
      return { ...state, selectedTitle: action.payload };
    case EGlobalStateTypes.SET_SELECTED_SUBTITLE:
      return { ...state, selectedSubTitle: action.payload };
    case EGlobalStateTypes.SET_SELECTED_TEXT:
      return { ...state, selectedText: action.payload };
    case EGlobalStateTypes.SET_SELECTED_IMAGE:
      return { ...state, selectedImage: action.payload };
    case EGlobalStateTypes.SET_SELECTED_TEAM_CHANNEL:
      return { ...state, selectedTeamChannel: action.payload };
    case EGlobalStateTypes.SET_ADAPTIVE_CARD:
      return { ...state, adaptiveCard: action.payload };
    case EGlobalStateTypes.SET_CARDFIELDS_WITH_IMAGES:
      return { ...state, cardFieldsWithImages: action.payload };
    case EGlobalStateTypes.SET_IS_SENDING_MESSAGE:
      return { ...state, isSendingMessage: action.payload };
    default:
      return state;
  }
};
