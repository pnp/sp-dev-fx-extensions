import * as React from 'react';
import { FloatingButton } from './FloatingButton';
import { SmartContextPanel } from './SmartContextPanel';
import { ISmartContextContainerProps } from './ISmartContextContainerProps';

export const SmartContextContainer: React.FC<ISmartContextContainerProps> = (props) => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);

  const handleButtonClick = React.useCallback((): void => {
    setIsPanelOpen(true);
  }, []);

  const handlePanelDismiss = React.useCallback((): void => {
    setIsPanelOpen(false);
  }, []);

  return (
    <>
      <FloatingButton onClick={handleButtonClick} />
      <SmartContextPanel
        isOpen={isPanelOpen}
        onDismiss={handlePanelDismiss}
        graphClientFactory={props.graphClientFactory}
        currentPageUrl={props.currentPageUrl}
      />
    </>
  );
};
