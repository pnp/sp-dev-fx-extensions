import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";

export default interface IPageSentimentHeaderProps {
    context: ApplicationCustomizerContext;
    textAnalyticsApiKey?: string;
}