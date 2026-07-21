import * as React from 'react';
import type { ISettingsEditorStrings } from './SettingsEditorDialog';
import styles from './ColorPicker.module.scss';

export interface IColorPickerProps {
  label: string;
  value: string | undefined;
  onChange: (color: string | undefined) => void;
  description?: string;
  strings: ISettingsEditorStrings;
}

const DEFAULT_PRESETS: string[] = [
  '#0078d4', '#106ebe', '#005a9e', '#004578',
  '#107c10', '#0b6a0b', '#5c2d91', '#881798',
  '#d13438', '#a4262c', '#ca5010', '#8e562e',
  '#ffaa44', '#fff100', '#00bcf2', '#00b7c3',
  '#243242', '#605e5c', '#a19fa9', '#edebe9',
  '#000000', '#ffffff', '#f3f2f1', '#faf9f8'
];

function normalizeHex(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
  }
  return undefined;
}

function isValidHex(value: string): boolean {
  return normalizeHex(value) !== undefined;
}

const ColorPicker: React.FC<IColorPickerProps> = (props) => {
  const { label, value, onChange, description, strings } = props;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [hexInput, setHexInput] = React.useState<string>(value || '');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const presetRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  React.useEffect(() => {
    setHexInput(value || '');
  }, [value]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePresetSelect = React.useCallback((preset: string): void => {
    onChange(preset);
    setHexInput(preset);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  const handleHexChange = React.useCallback((newVal: string): void => {
    setHexInput(newVal);
    const normalized = normalizeHex(newVal);
    if (normalized) {
      onChange(normalized);
    }
  }, [onChange]);

  const handleNativePick = React.useCallback((newVal: string): void => {
    onChange(newVal);
    setHexInput(newVal);
  }, [onChange]);

  const handleClear = React.useCallback((): void => {
    onChange(undefined);
    setHexInput('');
  }, [onChange]);

  const handleTriggerKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    }
  }, [isOpen]);

  const handlePresetKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLButtonElement>, index: number): void => {
    const lastIndex = DEFAULT_PRESETS.length - 1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const next = index + 1 > lastIndex ? 0 : index + 1;
      presetRefs.current[next]?.focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = index - 1 < 0 ? lastIndex : index - 1;
      presetRefs.current[prev]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      presetRefs.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      presetRefs.current[lastIndex]?.focus();
    }
  }, []);

  const normalizedValue = normalizeHex(value || '');
  const showClear = !!value;

  return (
    <div className={styles.colorField} ref={containerRef}>
      <label className={styles.colorLabel}>{label}</label>
      {description ? <span className={styles.colorDescription}>{description}</span> : null}

      <div className={styles.colorTriggerWrap}>
        <button
          ref={triggerRef}
          className={`${styles.colorTrigger} ${showClear ? styles.colorTriggerWithClear : ''}`}
          onClick={(): void => setIsOpen(!isOpen)}
          onKeyDown={handleTriggerKeyDown}
          type="button"
          aria-label={`${label}: ${value || strings.colorNoColor}`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <div
            className={`${styles.colorSwatch} ${!normalizedValue ? styles.colorSwatchEmpty : ''}`}
            style={normalizedValue ? { background: normalizedValue } : undefined}
            aria-hidden="true"
          />
          <span className={`${styles.colorValue} ${!normalizedValue ? styles.colorValueEmpty : ''}`}>
            {normalizedValue || strings.colorNoColor}
          </span>
        </button>

        {showClear ? (
          <button
            className={styles.colorClear}
            onClick={(e): void => {
              e.stopPropagation();
              handleClear();
            }}
            type="button"
            aria-label={strings.colorClearAria}
            title={strings.colorClear}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" focusable="false">
              <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}

        {isOpen ? (
          <div
            className={styles.colorDropdown}
            onClick={(e): void => e.stopPropagation()}
            role="dialog"
            aria-label={label}
          >
            <div className={styles.dropdownSection}>
              <h4 className={styles.dropdownTitle}>{strings.colorPresets}</h4>
              <div className={styles.presetGrid} role="grid">
                {DEFAULT_PRESETS.map((preset, index) => (
                  <button
                    ref={(el): void => {
                      presetRefs.current[index] = el;
                    }}
                    className={`${styles.presetSwatch} ${normalizedValue === preset ? styles.presetSelected : ''}`}
                    key={preset}
                    onClick={(): void => handlePresetSelect(preset)}
                    onKeyDown={(e): void => handlePresetKeyDown(e, index)}
                    style={{ background: preset }}
                    type="button"
                    role="gridcell"
                    aria-label={`${strings.colorPresets} ${preset}`}
                    aria-selected={normalizedValue === preset}
                    title={preset}
                  />
                ))}
              </div>
            </div>

            <div className={styles.dropdownSection}>
              <h4 className={styles.dropdownTitle}>{strings.colorCustom}</h4>
              <div className={styles.customRow}>
                <input
                  className={styles.nativePicker}
                  onChange={(e): void => handleNativePick(e.target.value)}
                  type="color"
                  value={normalizedValue || '#000000'}
                  title={strings.colorCustom}
                  aria-label={strings.colorCustom}
                />
                <input
                  className={`${styles.hexInput} ${hexInput && !isValidHex(hexInput) ? styles.hexInputInvalid : ''}`}
                  onChange={(e): void => handleHexChange(e.target.value)}
                  onClick={(e): void => e.stopPropagation()}
                  placeholder="#000000"
                  type="text"
                  value={hexInput}
                  aria-label={strings.colorCustom}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ColorPicker;