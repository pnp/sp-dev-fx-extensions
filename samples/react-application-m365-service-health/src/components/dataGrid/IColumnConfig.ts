export interface IColumnConfig<T> {
    column : keyof T;
    
    header?: string;
    onRender?: (item: T) => JSX.Element;
    media?: (item: T) => JSX.Element;
    order?: (a: T, b: T) => number;
  }