import * as React from 'react';
import { IconButton, TooltipHost } from '@fluentui/react';

const CopyPageButton: React.FC = () => (
  <TooltipHost
    content="Copy Page or save as a template in another site" // Tooltip text
    calloutProps={{ gapSpace: 5 }} // Adjust spacing
    styles={{ root: { display: 'inline-block' } }} // Ensure proper alignment
  >
    <IconButton
      iconProps={{ iconName: 'Copy' }} // Add the copy icon
  
      styles={{ root: { width: 32, height: 32 } }} // Adjust size for the icon button
      ariaLabel="Copy Page"
      ariaDescription="Click to copy the page to the selected destination site."
    />
  </TooltipHost>
);

export default CopyPageButton;