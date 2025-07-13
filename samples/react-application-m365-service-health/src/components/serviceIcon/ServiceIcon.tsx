import { IServiceIconProps } from "./IServiceIconProps";
import React from "react";
import { useServiceIcons } from "../../hooks/useServiceIcons";

const ServiceIcon: React.FC<IServiceIconProps> = ({
  service,
  size = 40,
  alt,
}) => {
    const { getServiceImage } = useServiceIcons();
  const src = getServiceImage(service);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt || service}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
      }}
    />
  );
};

export default ServiceIcon;
