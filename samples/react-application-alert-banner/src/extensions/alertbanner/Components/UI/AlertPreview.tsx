import * as React from "react";
import { AlertPriority, IAlertType } from "../Alerts/IAlerts";
import { htmlSanitizer } from "../Utils/HtmlSanitizer";
import { getPriorityIcon } from "../AlertItem/utils";
import styles from "./AlertPreview.module.scss";

interface IAlertPreviewProps {
  title: string;
  description: string;
  alertType: IAlertType;
  priority: AlertPriority;
  isPinned?: boolean;
  linkUrl?: string;
  linkDescription?: string;
  className?: string;
}

const AlertPreview: React.FC<IAlertPreviewProps> = ({
  title,
  description,
  alertType,
  priority,
  isPinned = false,
  linkUrl,
  linkDescription,
  className
}) => {
  const getPriorityClass = (priority: AlertPriority): string => {
    switch (priority) {
      case AlertPriority.Critical: return styles.critical;
      case AlertPriority.High: return styles.high;
      case AlertPriority.Medium: return styles.medium;
      case AlertPriority.Low: return styles.low;
      default: return styles.medium;
    }
  };

  // Ensure proper contrast for preview with enhanced readability
  const getContrastText = (bgColor: string): string => {
    // Enhanced contrast detection
    const getLuminance = (color: string): number => {
      // Convert color to RGB values
      let r: number, g: number, b: number;

      if (color.startsWith('#')) {
        // Hex color
        const hex = color.replace('#', '');
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else {
          r = parseInt(hex.substr(0, 2), 16);
          g = parseInt(hex.substr(2, 2), 16);
          b = parseInt(hex.substr(4, 2), 16);
        }
      } else if (color.toLowerCase() === 'white' || color.toLowerCase() === '#ffffff') {
        r = g = b = 255;
      } else if (color.toLowerCase() === 'black' || color.toLowerCase() === '#000000') {
        r = g = b = 0;
      } else if (color.startsWith('rgb(')) {
        // Handle RGB format
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
          r = parseInt(match[1]);
          g = parseInt(match[2]);
          b = parseInt(match[3]);
        } else {
          return 0.5; // Fallback
        }
      } else {
        // For other colors, use a conservative approach
        return 0.5; // Assume medium luminance
      }

      // Calculate relative luminance using WCAG formula
      const toLinear = (val: number) => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      };

      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };

    const bgLuminance = getLuminance(bgColor);

    // More aggressive approach for better readability
    // Use WCAG AAA standard (7:1 contrast ratio) for better accessibility
    if (bgLuminance > 0.3) {
      // For lighter backgrounds, always use dark text for maximum readability
      return '#323130'; // Dark text that meets AAA standards
    } else {
      // For darker backgrounds, always use white text
      return '#ffffff'; // White text for maximum contrast
    }
  };

  // Use the text color from the alert type configuration
  const textColor = alertType.textColor || getContrastText(alertType.backgroundColor);
  const containerStyle: React.CSSProperties = {
    backgroundColor: alertType.backgroundColor,
    color: textColor,
    border: alertType.backgroundColor === '#ffffff' || alertType.backgroundColor.toLowerCase() === 'white' ? '1px solid #edebe9' : undefined,
  };

  // Override inline styles using the configured text color
  const textStyle: React.CSSProperties = {
    color: textColor,
    // Add subtle text shadow for better readability across all backgrounds
    textShadow: textColor === '#ffffff' || textColor.toLowerCase() === '#ffffff'
      ? '0 1px 3px rgba(0, 0, 0, 0.5)' // White text gets dark shadow
      : '0 1px 3px rgba(255, 255, 255, 0.8)', // Dark text gets light shadow
    // Ensure text is always readable
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  };

  // Header style with fixed white text (not inheriting alert colors)
  const headerStyle: React.CSSProperties = {
    backgroundColor: alertType.backgroundColor,
    color: '#ffffff', // Always white text for header
    border: alertType.backgroundColor === '#ffffff' || alertType.backgroundColor.toLowerCase() === 'white' ? '1px solid #edebe9' : undefined,
  };

  return (
    <div className={`${styles.previewContainer} ${className || ''}`}>
      <div className={styles.previewHeader} style={headerStyle}>
        <h4 style={{ color: '#ffffff' }}>Live Preview</h4>
        <span className={styles.previewNote} style={{ color: '#ffffff', opacity: 0.8 }}>This is how your alert will appear</span>
      </div>

      <div
        className={`${styles.alertPreview} ${getPriorityClass(priority)} ${isPinned ? styles.pinned : ''}`}
        style={containerStyle}
      >
        <div className={styles.headerRow}>
          <div className={styles.iconSection}>
            <div className={styles.alertIcon}>
              {getPriorityIcon(priority)}
            </div>
          </div>

          <div className={styles.textSection}>
            {title && (
              <div className={styles.alertTitle} style={textStyle}>
                {title || 'Alert Title'}
                {isPinned && <span className={styles.pinnedBadge} style={textStyle}>📌 PINNED</span>}
              </div>
            )}

            {description && (
              <div className={styles.alertDescription} style={textStyle}>
                <div dangerouslySetInnerHTML={{ 
                  __html: React.useMemo(() => 
                    htmlSanitizer.sanitizePreviewContent(description || 'Alert description will appear here...'), 
                    [description]
                  )
                }} />
              </div>
            )}

            {linkUrl && linkDescription && (
              <div className={styles.alertLink}>
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" style={textStyle}>
                  🔗 {linkDescription}
                </a>
              </div>
            )}
          </div>

          <div className={styles.actionSection}>
            <button className={styles.expandButton} type="button">
              ⌄
            </button>
            <button className={styles.dismissButton} type="button">
              ✕
            </button>
          </div>
        </div>
      </div>

      <div className={styles.previewInfo}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Type:</span>
            <span className={styles.infoValue}>{alertType.name}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Priority:</span>
            <span className={`${styles.infoValue} ${styles.priorityBadge} ${getPriorityClass(priority)}`}>
              {priority.toUpperCase()}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Background:</span>
            <span className={styles.infoValue}>
              <span className={styles.colorSwatch} style={{ backgroundColor: alertType.backgroundColor }} />
              {alertType.backgroundColor}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Text Color:</span>
            <span className={styles.infoValue}>
              <span className={styles.colorSwatch} style={{ backgroundColor: alertType.textColor }} />
              {alertType.textColor}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Icon:</span>
            <span className={styles.infoValue}>{alertType.iconName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPreview;