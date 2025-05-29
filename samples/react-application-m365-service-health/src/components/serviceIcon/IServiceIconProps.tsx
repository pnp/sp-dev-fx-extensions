import { ServiceName } from "../../hooks/useServiceIcons";

export interface IServiceIconProps {
  service: ServiceName;
  size?: number | string;
  alt?: string;
}
