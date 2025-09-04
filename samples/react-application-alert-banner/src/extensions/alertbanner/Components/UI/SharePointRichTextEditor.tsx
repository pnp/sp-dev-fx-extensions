import * as React from "react";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { ApplicationCustomizerContext } from "@microsoft/sp-application-base";
import styles from "./SharePointRichTextEditor.module.scss";

export interface IRichTextStyleOptions {
  showBold?: boolean;
  showItalic?: boolean;
  showUnderline?: boolean;
  showAlign?: boolean;
  showList?: boolean;
  showLink?: boolean;
  showMore?: boolean;
  showStyles?: boolean;
  showStrikethrough?: boolean;
  showSubscript?: boolean;
  showSuperscript?: boolean;
  showFontName?: boolean;
  showFontSize?: boolean;
  showFontColor?: boolean;
  showBackgroundColor?: boolean;
}

export interface ISharePointRichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  context?: ApplicationCustomizerContext;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  // Enhanced PnP-specific options
  id?: string;
  styleOptions?: IRichTextStyleOptions;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  // Content validation options
  allowHTML?: boolean;
  restrictedElements?: string[];
  // Accessibility enhancements
  ariaLabel?: string;
  ariaDescribedBy?: string;
  // Performance options
  debounceMs?: number;
}

const SharePointRichTextEditor: React.FC<ISharePointRichTextEditorProps> = ({
  label,
  value,
  onChange,
  context,
  placeholder = "Enter your message...",
  required = false,
  disabled = false,
  error,
  description,
  className,
  // Enhanced options
  id,
  styleOptions,
  maxLength = 10000,
  minHeight = 120,
  maxHeight = 400,
  allowHTML = true,
  restrictedElements = ['script', 'iframe', 'object', 'embed'],
  ariaLabel,
  ariaDescribedBy,
  debounceMs = 300
}) => {
  const [internalValue, setInternalValue] = React.useState(value);
  const [characterCount, setCharacterCount] = React.useState(0);
  const [validationError, setValidationError] = React.useState<string>('');
  const debounceRef = React.useRef<number>();
  const uniqueId = React.useMemo(() => id || `richtext-${Math.random().toString(36).substr(2, 9)}`, [id]);

  // Update internal value when prop changes
  React.useEffect(() => {
    setInternalValue(value);
    updateCharacterCount(value);
  }, [value]);

  // Update character count
  const updateCharacterCount = React.useCallback((text: string) => {
    // Strip HTML tags for character counting
    const textContent = text.replace(/<[^>]*>/g, '');
    setCharacterCount(textContent.length);
  }, []);

  // Enhanced validation
  const validateContent = React.useCallback((text: string): string => {
    if (!text && required) {
      return 'This field is required';
    }

    const textContent = text.replace(/<[^>]*>/g, '');
    if (textContent.length > maxLength) {
      return `Content exceeds maximum length of ${maxLength} characters`;
    }

    // Check for restricted elements
    if (!allowHTML && /<[^>]*>/g.test(text)) {
      return 'HTML content is not allowed';
    }

    if (restrictedElements.length > 0) {
      const restrictedPattern = new RegExp(`<(${restrictedElements.join('|')})[^>]*>`, 'gi');
      if (restrictedPattern.test(text)) {
        return `The following HTML elements are not allowed: ${restrictedElements.join(', ')}`;
      }
    }

    return '';
  }, [required, maxLength, allowHTML, restrictedElements]);

  // Enhanced change handler with debouncing and validation
  const handleEditorChange = React.useCallback((text: string): string => {
    // Update internal state immediately for responsive UI (with original text)
    setInternalValue(text);
    updateCharacterCount(text);

    // Validate content immediately for UI feedback
    const error = validateContent(text);
    setValidationError(error);

    // Clear previous debounce timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounced onChange to parent (sanitization disabled to prevent encoding loops)
    debounceRef.current = window.setTimeout(() => {
      // SharePoint already provides security measures, so we skip aggressive sanitization
      // This prevents HTML encoding loops that cause text corruption
      onChange(text);
    }, debounceMs);

    return text; // Return original text immediately to avoid render issues
  }, [validateContent, onChange, debounceMs, updateCharacterCount]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Enhanced style options with security defaults
  const defaultStyleOptions: IRichTextStyleOptions = {
    showBold: true,
    showItalic: true,
    showUnderline: true,
    showAlign: true,
    showList: true,
    showLink: true,
    showMore: false, // Disable by default for security
    showStyles: true,
    showStrikethrough: false,
    showSubscript: false,
    showSuperscript: false,
    showFontName: false, // Disable to maintain consistent branding
    showFontSize: false, // Disable to maintain consistent sizing
    showFontColor: false, // Disable to maintain accessibility
    showBackgroundColor: false, // Disable to maintain accessibility
    ...styleOptions
  };

  const editorStyles: React.CSSProperties = {
    minHeight: `${minHeight}px`,
    maxHeight: `${maxHeight}px`
  };

  const currentError = error || validationError;
  const isOverLimit = characterCount > maxLength;
  const describedBy = ariaDescribedBy || (description ? `${uniqueId}-description` : undefined);

  return (
    <div className={`${styles.field} ${className || ''} ${currentError ? styles.error : ''}`}>
      <div className={styles.labelContainer}>
        <label
          className={styles.label}
          htmlFor={uniqueId}
          id={`${uniqueId}-label`}
        >
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>

        {maxLength > 0 && (
          <div className={`${styles.characterCount} ${isOverLimit ? styles.overLimit : ''}`}>
            {characterCount} / {maxLength}
          </div>
        )}
      </div>

      {description && (
        <div
          className={styles.description}
          id={`${uniqueId}-description`}
        >
          {description}
        </div>
      )}

      <div className={`${styles.editorContainer} ${currentError ? styles.editorError : ''}`}>
        <RichText
          id={uniqueId}
          value={internalValue}
          onChange={handleEditorChange}
          placeholder={placeholder}
          className={styles.editor}
          style={editorStyles}
          styleOptions={defaultStyleOptions}
          isEditMode={!disabled}
          // Accessibility enhancements
          {...(ariaLabel && { 'aria-label': ariaLabel })}
          {...(describedBy && { 'aria-describedby': describedBy })}
          aria-labelledby={`${uniqueId}-label`}
          aria-required={required}
          aria-invalid={!!currentError}
        />
      </div>

      {currentError && (
        <div
          className={styles.error}
          id={`${uniqueId}-error`}
          role="alert"
          aria-live="polite"
        >
          {currentError}
        </div>
      )}

      {/* Hidden helper text for screen readers */}
      <div className={styles.srOnly}>
        Rich text editor. Use toolbar buttons or keyboard shortcuts to format text.
        {maxLength > 0 && ` Maximum ${maxLength} characters allowed.`}
        {required && ' This field is required.'}
      </div>
    </div>
  );
};

export default SharePointRichTextEditor;
