import FlowsService from '../../services/flowsService/FlowsService';

export interface IMyFlowsApplicationCustomizerProps {
    showInHeaderButtonRegion: boolean;
    flowService: FlowsService;
    siteTemplate: string;
}