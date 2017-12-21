import IGraphBotSettings from "./IGraphBotSettings";

interface IPageHeaderState {
    showPanel?: boolean;
    isBotInitializing?: boolean;
    botId: string;
}

export default IPageHeaderState;