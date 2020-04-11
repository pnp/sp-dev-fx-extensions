import { ITranslationService } from "../../services/ITranslationService";

export interface ITranslationBarProps {
  supportedLanguages: string[];
  currentPageId: number;
  currentListId: string;
  currentWebUrl: string;
  translationService: ITranslationService;
}
