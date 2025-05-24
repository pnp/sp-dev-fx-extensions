import * as React from 'react';

import {
  Caption1,
  tokens,
} from '@fluentui/react-components';

import { IRenderLabelProps } from './IRenderLabelProps';
import { Icon } from '@iconify/react';
import { useRenderLabelStyles } from './useRenderLabelStylesStyles';

export const RenderLabel: React.FunctionComponent<IRenderLabelProps> = (props: React.PropsWithChildren<IRenderLabelProps>) => {
  const { label, icon, isRequired } = props;
  const styles = useRenderLabelStyles();
  return (
    <>
      <div className={styles.labelContainer}>
        {icon && React.isValidElement(icon) ? (
          icon
        ) : (
          <Icon
            icon={icon as string}
            className={styles.iconStyles}
            width={"20px"}
            height={"20px"}
            color={tokens.colorBrandForeground1}
          />
        )}
        <Caption1 style={{ color: tokens.colorBrandForeground1 }}>{label}</Caption1>
        <Caption1 style={{ color: tokens.colorPaletteRedForeground1 }}>{isRequired ? " *" : ""}</Caption1>
      </div>
    </>
  );
};

export default RenderLabel;
