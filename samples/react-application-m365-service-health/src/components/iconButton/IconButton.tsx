import React, { useCallback, useMemo, useState } from 'react';

import { IconButtonProps } from './IconButtonProps';
import { tokens } from '@fluentui/react-components';

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  hoverIcon,
  imageSrc,
  width = 24,
  height = 24,
  color,
  hoverColor,
  onClick,
  enabled = true,
}) => {
  // Use Fluent UI 9 tokens directly.
  const defaultIconColor = color || tokens.colorBrandBackground;
  const defaultHoverColor = hoverColor || tokens.colorBrandBackgroundHover;
  const defaultFontFamily = tokens.fontFamilyBase;

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (enabled) {
      setIsHovered(true);
    }
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    if (enabled) {
      setIsHovered(false);
    }
  }, [enabled]);

  // Memoize the current icon to render.
  const currentIcon = useMemo(() => {
    if (!enabled) {
      return icon;
    }
    return isHovered && hoverIcon ? hoverIcon : icon;
  }, [isHovered, hoverIcon, icon, enabled]);

  // Memoize style for the icon element.
  const iconStyle = useMemo<React.CSSProperties>(
    () => ({
      width,
      height,
      color: isHovered ? defaultHoverColor : defaultIconColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: enabled ? 1 : 0.5,
      fontFamily: defaultFontFamily,
      fontSize: 'inherit',
    }),
    [width, height, isHovered, defaultHoverColor, defaultIconColor, enabled, defaultFontFamily]
  );

  // Memoize button and image styles.
  const buttonStyle = useMemo<React.CSSProperties>(
    () => ({
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: enabled ? 'pointer' : 'default',
    }),
    [enabled]
  );

  const imageStyle = useMemo<React.CSSProperties>(
    () => ({
      width,
      height,
      objectFit: 'contain',
      opacity: enabled ? 1 : 0.5,
    }),
    [width, height, enabled]
  );

  return (
    <button
      onClick={enabled ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={!enabled}
      style={buttonStyle}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="icon" style={imageStyle} />
      ) : (
        React.cloneElement(currentIcon, {
          style: { ...currentIcon.props.style, ...iconStyle },
        })
      )}
    </button>
  );
};

export default React.memo(IconButton);