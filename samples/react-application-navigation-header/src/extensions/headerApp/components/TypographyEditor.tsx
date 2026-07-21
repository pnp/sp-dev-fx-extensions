import * as React from 'react';
import { Input, Dropdown, Option, Slider } from '@fluentui/react-components';
import styles from './TypographyEditor.module.scss';

export interface ITypographyEditorProps {
  label: string;
  defaultValue: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  previewText: string;
}

const UNITS: Array<{ key: string; text: string }> = [
  { key: 'px', text: 'px' },
  { key: 'rem', text: 'rem' },
  { key: 'em', text: 'em' }
];

const PRESETS_PX: number[] = [12, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32];
const PRESETS_REM: number[] = [0.75, 0.875, 1, 1.0625, 1.125, 1.25, 1.375, 1.5, 1.75, 2];

interface IParsedSize {
  numeric: number;
  unit: string;
}

function parseSize(value: string | undefined): IParsedSize | undefined {
  if (!value) { return undefined; }
  const match = value.trim().match(/^([\d.]+)\s*(px|rem|em)?$/i);
  if (!match) { return undefined; }
  const numeric = parseFloat(match[1]);
  const unit = (match[2] || 'px').toLowerCase();
  if (Number.isNaN(numeric)) { return undefined; }
  return { numeric, unit };
}

function formatSize(numeric: number, unit: string): string {
  const rounded = Math.round(numeric * 100) / 100;
  return `${rounded}${unit}`;
}

const TypographyEditor: React.FC<ITypographyEditorProps> = (props) => {
  const { label, defaultValue, value, onChange, previewText } = props;

  const parsed = parseSize(value);
  const numeric = parsed?.numeric ?? 0;
  const unit = parsed?.unit ?? 'px';

  const isOverridden = !!value && value.trim().length > 0;

  const handleNumericChange = React.useCallback((newNumeric: number): void => {
    if (newNumeric <= 0) {
      onChange(undefined);
      return;
    }
    onChange(formatSize(newNumeric, unit));
  }, [unit, onChange]);

  const handleUnitChange = React.useCallback((newUnit: string): void => {
    if (numeric > 0) {
      onChange(formatSize(numeric, newUnit));
    }
  }, [numeric, onChange]);

  const handlePresetClick = React.useCallback((presetNumeric: number): void => {
    onChange(formatSize(presetNumeric, unit));
  }, [unit, onChange]);

  const handleReset = React.useCallback((): void => {
    onChange(undefined);
  }, [onChange]);

  const sliderMin = unit === 'px' ? 8 : 0.5;
  const sliderMax = unit === 'px' ? 48 : 3;
  const sliderStep = unit === 'px' ? 1 : 0.0625;
  const presets = unit === 'px' ? PRESETS_PX : PRESETS_REM;

  const previewFontSize = isOverridden && parsed ? formatSize(parsed.numeric, parsed.unit) : defaultValue;

  return (
    <div className={styles.fontField}>
      <div className={styles.fontHeader}>
        <div className={styles.fontLabelBlock}>
          <span className={styles.fontLabel}>{label}</span>
          <span className={styles.fontDefault}>Default: {defaultValue}</span>
        </div>
        <button
          className={styles.fontResetButton}
          disabled={!isOverridden}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className={styles.fontPreview} style={{ fontSize: previewFontSize }}>
        <span className={styles.fontPreviewText}>{previewText}</span>
      </div>

      <div className={styles.fontControls}>
        <div className={styles.fontInputRow}>
          <Input
            className={styles.fontNumberInput}
            onChange={(e, data): void => {
              const next = data.value || '';
              if (!next.trim()) {
                onChange(undefined);
                return;
              }
              const p = parseSize(next);
              if (p) {
                onChange(formatSize(p.numeric, p.unit));
              } else {
                onChange(next);
              }
            }}
            placeholder={defaultValue}
            value={value || ''}
          />
          <Dropdown
            className={styles.fontUnitSelect}
            value={unit}
            selectedOptions={[unit]}
            onOptionSelect={(e, data): void => {
              if (data.optionValue) {
                handleUnitChange(data.optionValue);
              }
            }}
          >
            {UNITS.map((u) => (
              <Option key={u.key} value={u.key}>
                {u.text}
              </Option>
            ))}
          </Dropdown>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Slider
            className={styles.fontSlider}
            max={sliderMax}
            min={sliderMin}
            onChange={(e, data): void => handleNumericChange(data.value)}
            step={sliderStep}
            value={numeric || parseFloat(defaultValue)}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '12px', minWidth: '32px', textAlign: 'right' }}>
            {numeric || parseFloat(defaultValue)}
          </span>
        </div>

        <div className={styles.fontPresets}>
          {presets.map((preset) => (
            <button
              className={`${styles.fontPresetButton} ${isOverridden && parsed && Math.abs(parsed.numeric - preset) < 0.01 ? styles.fontPresetActive : ''}`}
              key={preset}
              onClick={(): void => handlePresetClick(preset)}
              type="button"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypographyEditor;