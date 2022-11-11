import * as React from 'react';
import { IBannerPanelProps } from './IBannerPanelProps';
import styles from './BannerPanel.module.scss';
import * as strings from 'MessageBannerApplicationCustomizerStrings';

import { PanelType, Panel } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { SwatchColorPicker, IColorCellProps } from 'office-ui-fabric-react/lib/SwatchColorPicker';
import { getColorFromString, IColor } from 'office-ui-fabric-react/lib/Color';
import { Slider } from 'office-ui-fabric-react/lib/Slider';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';

const TEXT_COLORS: IColorCellProps[] = [
  { id: 't1', label: 'Black', color: '#000000' },
  { id: 't2', label: 'Red', color: '#ff0000' },
  { id: 't3', label: 'Blue', color: '#1d45ba' },
  { id: 't4', label: 'White', color: '#ffffff' }
];

const BACKGROUND_COLORS: IColorCellProps[] = [
  { id: 'b1', label: 'Yellow', color: '#ffff00' },
  { id: 'b2', label: 'Light Yellow', color: '#ffffc6' },
  { id: 'b3', label: 'Teal', color: '#038387' },
  { id: 'b4', label: 'Blue', color: '#0078d4' },
  { id: 'b5', label: 'Dark Red', color: '#ba2a1d' },
  { id: 'b6', label: 'Salmon', color: '#e9967a' },
  { id: 'b7', label: 'Orange', color: '#ff8c00' },
  { id: 'b8', label: 'White', color: '#ffffff' }
];

const BannerPanel = (props: IBannerPanelProps) => {
  const textColor: IColor = getColorFromString(props.settings.textColor);
  const textColorMatch = TEXT_COLORS.filter((c: IColorCellProps) => textColor && c.color === textColor.str);
  const textColorSelectedId = textColorMatch && textColorMatch.length > 0 ? textColorMatch[0].id : null;

  const backgroundColor: IColor = getColorFromString(props.settings.backgroundColor);
  const backgroundColorMatch = BACKGROUND_COLORS.filter((c: IColorCellProps) => backgroundColor && c.color === backgroundColor.str);
  const backgroundColorSelectedId = backgroundColorMatch && backgroundColorMatch.length > 0 ? backgroundColorMatch[0].id : null;

  return (
    <Panel
      isOpen={props.isOpen}
      isBlocking={false}
      isLightDismiss={true}
      type={PanelType.smallFixedFar}
      onDismiss={props.onCancelOrDismiss}
      headerText={strings.BannerPanelHeaderText}
      className={styles.BannerPanelContainer}
      onRenderFooterContent={() => (
        <div className={styles.FooterButtons}>
          <PrimaryButton onClick={props.onSave} disabled={props.isSaving}>{strings.BannerPanelButtonSaveText}</PrimaryButton>
          <DefaultButton onClick={props.onCancelOrDismiss} disabled={props.isSaving}>{strings.BannerPanelButtonCancelText}</DefaultButton>
          {props.isSaving && <Spinner size={SpinnerSize.small} />}
          <div className={styles.ResetToDefaults} onClick={props.resetToDefaults}>{strings.BannerPanelButtonResetToDefaultsText}</div>
        </div>
      )}
    >
      <div className={styles.FieldContainer}>
        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldMessageLabel}</Label>
          <Label className={styles.FieldDescription}>{strings.BannerPanelFieldMessageDescription}</Label>
          <TextField
            multiline={true}
            rows={5}
            value={props.settings.message}
            className={styles.SwatchColorPicker}
            onChange={(e, value) => props.onFieldChange({ message: value })}
          />
        </div>

        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldTextColorLabel}</Label>
          <SwatchColorPicker
            columnCount={10}
            selectedId={textColorSelectedId}
            cellShape={'circle'}
            colorCells={TEXT_COLORS}
            className={styles.SwatchColorPicker}
            onColorChanged={(e, value) => props.onFieldChange({ textColor: value })}
          />
          <TextField defaultValue={props.settings.textColor} onChange={(e, value) => props.onFieldChange({ textColor: value })} />
        </div>

        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldBackgroundColorLabel}</Label>
          <SwatchColorPicker
            columnCount={10}
            selectedId={backgroundColorSelectedId}
            cellShape={'circle'}
            colorCells={BACKGROUND_COLORS}
            className={styles.SwatchColorPicker}
            onColorChanged={(e, value) => props.onFieldChange({ backgroundColor: value })}
          />
          <TextField defaultValue={props.settings.backgroundColor} onChange={(e, value) => props.onFieldChange({ backgroundColor: value })} />
        </div>

        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldTextSizeLabel}</Label>
          <Slider min={14} max={50} step={2} value={props.settings.textFontSizePx} showValue={true}
            onChange={(value) => props.onFieldChange({ textFontSizePx: value })}
          />
        </div>

        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldBannerHeightLabel}</Label>
          <Slider min={20} max={80} step={2} value={props.settings.bannerHeightPx} showValue={true}
            onChange={(value) => props.onFieldChange({ bannerHeightPx: value })}
          />
        </div>

        <div className={styles.FieldSection}>
          <Label className={styles.FieldLabel}>{strings.BannerPanelFieldVisibleStartDateLabel}</Label>
          <Toggle
            checked={props.settings.visibleStartDate !== null}
            onText={strings.BannerPanelFieldVisibleStartDateEnabledLabel}
            offText={strings.BannerPanelFieldVisibleStartDateDisabledLabel}
            onChange={(ev, value) => props.onFieldChange({ visibleStartDate: value ? new Date() : null })}
          />
          {props.settings.visibleStartDate && (
            <DatePicker
              value={new Date(props.settings.visibleStartDate)}
              onSelectDate={(value) => props.onFieldChange({ visibleStartDate: value.toDateString() })} />
          )}
        </div>
      </div>
    </Panel>
  );
};

export default BannerPanel;
