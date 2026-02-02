import * as React from 'react';
import { 
  Panel, 
  PanelType,
  MessageBar,
  MessageBarType,
  Text
} from '@fluentui/react';
import { ISmartContextPanelProps } from './ISmartContextPanelProps';
import { CopilotService } from '../services/CopilotService';
import { AiLoader } from './AiLoader';
import { SmartContextContent } from './SmartContextContent';
import { ISmartContextData } from '../services/ICopilotService';
import { extractJsonFromResponse, validateSmartContextData } from '../services/jsonUtils';
import { getErrorMessage } from '../services/errors';
import styles from './SmartContextPanel.module.scss';

interface ISmartContextPanelState {
  isLoading: boolean;
  error: string | undefined;
  smartContext: ISmartContextData | undefined;
}

export const SmartContextPanel: React.FC<ISmartContextPanelProps> = (props) => {
  const [state, setState] = React.useState<ISmartContextPanelState>({
    isLoading: false,
    error: undefined,
    smartContext: undefined
  });

  const fetchSmartContext = React.useCallback(async (): Promise<void> => {
    setState({ isLoading: true, error: undefined, smartContext: undefined });

    try {
      const graphClient = await props.graphClientFactory.getClient('3');
      const copilotService = new CopilotService(graphClient);
      
      const response = await copilotService.getSmartContext(props.currentPageUrl);
      
      // Parse JSON using utility function
      const parsedJson = extractJsonFromResponse(response.text);
      
      // Validate the parsed data structure
      const validatedData = validateSmartContextData(parsedJson);
      
      // Add attributions to the validated data
      validatedData.attributions = response.attributions;
      
      setState({
        isLoading: false,
        error: undefined,
        smartContext: validatedData
      });
    } catch (error) {
      console.error('Error fetching smart context:', error);
      setState({
        isLoading: false,
        error: getErrorMessage(error),
        smartContext: undefined
      });
    }
  }, [props.graphClientFactory, props.currentPageUrl]);

  // Fetch when panel opens
  const prevIsOpenRef = React.useRef(props.isOpen);
  React.useEffect(() => {
    if (props.isOpen && !prevIsOpenRef.current) {
      fetchSmartContext().catch(console.error);
    }
    prevIsOpenRef.current = props.isOpen;
  }, [props.isOpen, fetchSmartContext]);

  const renderContent = (): JSX.Element => {
    const { isLoading, error, smartContext } = state;

    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <AiLoader />
        </div>
      );
    }

    if (error) {
      return (
        <MessageBar messageBarType={MessageBarType.error}>
          {error}
        </MessageBar>
      );
    }

    if (smartContext) {
      return <SmartContextContent data={smartContext} />;
    }

    return (
      <Text>Click the button to generate Smart Context for this page.</Text>
    );
  };

  return (
    <Panel
      isOpen={props.isOpen}
      onDismiss={props.onDismiss}
      type={PanelType.medium}
      closeButtonAriaLabel="Close"
      isLightDismiss={true}
      hasCloseButton={true}
      className={styles.smartContextPanel}
    >
      {renderContent()}
    </Panel>
  );
};
