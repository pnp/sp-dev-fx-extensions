export interface IFlowItem {
    key: number;
    id: string;
    tenantId: string;
    name: string;
    type: string;
    enabled: boolean;
    status: string;
    startTime: Date;
    endTime: Date;
    errorMessage: string;
}