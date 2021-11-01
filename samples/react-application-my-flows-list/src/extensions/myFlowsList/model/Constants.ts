export default class Constants {
    public static flowService: string = 'https://service.flow.microsoft.com/';
    public static activeFlowsUrl: string = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/Default-{tenantId}/flows?api-version=2016-11-01&$filter=properties/isActive+eq+\'true\'';
    public static flowsRunsUrl: string = 'https://api.flow.microsoft.com/providers/Microsoft.ProcessSimple/environments/Default-{tenantId}/flows/{flowId}/runs?api-version=2016-11-01';
    public static urlToFlowDetail: string = 'https://us.flow.microsoft.com/manage/environments/Default-{tenantId}/flows/{flowId}/details';
    public static communicationSiteIconPosition: number = 283;
    public static teamSiteIconPosition: number = 283;
}