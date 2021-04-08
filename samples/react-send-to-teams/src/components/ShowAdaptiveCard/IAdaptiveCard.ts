export interface IAdaptiveCard {
  type: string;
  '$schema': string;
  version: string;
  body: Body[];
  selectAction: SelectAction;
}

export interface SelectAction {
  type: string;
  url: string;
}

export interface Body {
  type: string;
  bodyText?: string;
  wrap?: boolean;
  height?: string;
  fontType?: string;
  size?: string;
  isSubtle?: boolean;
  maxLines?: number;
  '$data'?: string;
  url?: string;
  actions?: Action[];
}

export interface Action {
  type: string;
  title: string;
}
