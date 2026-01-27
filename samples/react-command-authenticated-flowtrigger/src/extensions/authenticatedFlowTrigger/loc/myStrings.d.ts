declare interface IAuthenticatedFlowTriggerCommandSetStrings {
  Command1: string;
  Command2: string;
}

declare module 'AuthenticatedFlowTriggerCommandSetStrings' {
  const strings: IAuthenticatedFlowTriggerCommandSetStrings;
  export = strings;
}
