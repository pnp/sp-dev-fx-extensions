import * as React from 'react';

// TEMPORARY SIMPLE ANIMATED COMPONENTS WITHOUT FREEZE-CAUSING ANIMATIONS

export interface IAnimatedContainerProps {
  children: React.ReactNode;
  isVisible?: boolean;
  className?: string;
  style?: React.CSSProperties;
  // Unused legacy props - kept for backward compatibility
  animationType?: string;
  duration?: number;
  delay?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export const AnimatedContainer: React.FC<IAnimatedContainerProps> = ({
  children,
  isVisible = true,
  className = '',
  style = {}
}) => {
  // Simple div without any animations to prevent freeze
  if (!isVisible) return null;
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

export interface IAnimatedListProps {
  children: React.ReactElement[];
  className?: string;
  // Unused legacy props - kept for backward compatibility
  stagger?: boolean;
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'scale';
}

export const AnimatedList: React.FC<IAnimatedListProps> = ({
  children,
  className = ''
}) => {
  // Simple div without animations to prevent freeze
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export interface IHoverAnimationProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  // Unused legacy props - kept for backward compatibility
  hoverType?: 'lift' | 'scale' | 'tilt' | 'wobble' | 'grow' | 'glow' | 'brightness';
}

export const HoverAnimation: React.FC<IHoverAnimationProps> = ({
  children,
  disabled = false,
  className = '',
  onClick
}) => {
  // Simple wrapper without animations to prevent freeze
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        cursor: onClick && !disabled ? 'pointer' : 'default'
      }}
    >
      {children}
    </div>
  );
};

export const RippleEffect: React.FC<any> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};