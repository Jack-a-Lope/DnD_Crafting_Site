import type * as React from "react";
import "react-grid-layout";

declare module "react-grid-layout" {
  interface LayoutItem {
    [key: string]: any;
  }

  interface ReactGridLayoutProps {
    id?: string;
    enableCrossGridDrag?: boolean;
    crossGridAcceptsDrop?:
      | boolean
      | ((item: LayoutItem, sourceId: string) => boolean);
    crossGridTransform?: (
      item: LayoutItem,
      sourceConfig: any,
      targetConfig: any
    ) => LayoutItem;
  }

  export const DragDropProvider: React.ComponentType<{
    children?: React.ReactNode;
  }>;

  export const Droppable: React.ComponentType<any>;
  export const ReactFlexLayout: React.ComponentType<any>;
}