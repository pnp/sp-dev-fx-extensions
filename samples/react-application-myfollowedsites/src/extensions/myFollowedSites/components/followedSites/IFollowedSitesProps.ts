import { ISPService}  from '../../../Common/Services/ISPService';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

export interface IFollowedSitesProps {
    spService : ISPService;
    currentContext: ApplicationCustomizerContext;
}