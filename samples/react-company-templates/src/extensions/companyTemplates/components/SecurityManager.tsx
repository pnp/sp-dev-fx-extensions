import { Log } from "@microsoft/sp-core-library";

import * as React from "react"
export type ISecurityManagerProps = {

}

const LOG_SOURCE: string = 'Security Manager';


// export const SecurityManager: React.FunctionComponent<ISecurityManagerProps> = (props: React.PropsWithChildren<ISecurityManagerProps>) => {
export function SecurityManager<ISecurityManagerProps>(props: React.PropsWithChildren<ISecurityManagerProps>): JSX.Element {
  Log.info(LOG_SOURCE, 'SecurityManager loaded');

  function evaluate<T>(children: T): T[] {
    return React.Children.map(children, child => {
      // TODO: implement rulesets here...
      // return child && child.key === 'title' ? <h3>{child.props.children}</h3> : null;
      return child;
    });
  }

  return <>{evaluate(props.children)}</>
}