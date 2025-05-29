import * as React from 'react';

import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerProps,
} from '@fluentui/react-components/unstable';

import { IRenderDrawerProps } from './IRenderDrawerProps';

export type DrawerType = Required<DrawerProps>["type"];

export const RenderDrawer: React.FunctionComponent<IRenderDrawerProps> = (
  props: React.PropsWithChildren<IRenderDrawerProps>
) => {
  const {
    isOpen,
    onOpenChange,
    title,
    headerActions,
    footerActions,
    size,
    separator,
    type,
    style,
    children,
    position,
    classNameHeader = "",
    classNameBody = "",
    classNameFooter = "",
  } = props;
  return (
    <>
      <Drawer
        modalType='alert'
        style= {style}
        type={type}
        separator={separator}
        open={isOpen}
        onOpenChange={(ev: React.SyntheticEvent<HTMLElement>, data: { open: boolean }) => {
          if (onOpenChange) {
            onOpenChange(data.open);
          }
        }}
        size={size ?? undefined}
       
        position={position}
      >
        <DrawerHeader className={classNameHeader}>
          <DrawerHeaderTitle style={{ width: "100%" }} action={headerActions}>
            {title}
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className={classNameBody}>{children}</DrawerBody>
        <DrawerFooter className={classNameFooter}>{footerActions}</DrawerFooter>
      </Drawer>
    </>
  );
};
