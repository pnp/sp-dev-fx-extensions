import { ILanguage } from "../../models/ILanguage";
import { IContextualMenuItem } from "office-ui-fabric-react/lib/ContextualMenu";
import { IDetectedLanguage } from "../../models/IDetectedLanguage";

export interface ITranslationBarState {
  availableLanguages: IContextualMenuItem[];
  selectedLanguage: ILanguage;
  pageItem: any;
  isLoading: boolean;
  isTranslating: boolean;
  isTranslated: boolean;
  globalError: string;
}
