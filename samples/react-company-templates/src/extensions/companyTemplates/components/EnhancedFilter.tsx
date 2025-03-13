import * as React from "react";
import { Stack, Text, DatePicker, Slider, DefaultButton, IIconProps, IconButton } from "@fluentui/react";
import { Panel, PanelType } from "@fluentui/react/lib/Panel";
import { TemplatesManagementContext } from "../contexts/TemplatesManagementContext";
// Remove unused strings import

export interface IAdvancedFilters {
  dateFrom?: Date;
  dateTo?: Date;
  fileSize?: number;
}

export interface IEnhancedFilterProps {
}

export const EnhancedFilter: React.FunctionComponent<IEnhancedFilterProps> = (props: React.PropsWithChildren<IEnhancedFilterProps>) => {
  const { setAdvancedFilters } = React.useContext(TemplatesManagementContext);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState<boolean>(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [fileSize, setFileSize] = React.useState<number>(0);
  const [fileSizeEnabled, setFileSizeEnabled] = React.useState<boolean>(false);

  // File size slider values in MB
  const fileSizeOptions = [0, 0.1, 0.5, 1, 5, 10, 50, 100];

  const filterIcon: IIconProps = { iconName: 'Filter' };

  const onApplyFilters = (): void => {
    setAdvancedFilters({
      dateFrom: dateFrom,
      dateTo: dateTo,
      fileSize: fileSizeEnabled ? fileSizeOptions[fileSize] * 1024 * 1024 : undefined // Convert MB to bytes
    });
    setIsFilterPanelOpen(false);
  };

  const onClearFilters = (): void => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setFileSize(0);
    setFileSizeEnabled(false);
    setAdvancedFilters({
      dateFrom: undefined,
      dateTo: undefined,
      fileSize: undefined
    });
  };

  return (
    <>
      <IconButton 
        iconProps={filterIcon} 
        title="Advanced Filters" 
        ariaLabel="Advanced Filters"
        onClick={() => setIsFilterPanelOpen(true)}
      />

      <Panel
        isOpen={isFilterPanelOpen}
        onDismiss={() => setIsFilterPanelOpen(false)}
        headerText="Advanced Filters"
        closeButtonAriaLabel="Close"
        type={PanelType.medium}
      >
        <Stack tokens={{ childrenGap: 20, padding: 10 }}>
          <Stack.Item>
            <Text variant="large">Date Modified</Text>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DatePicker
                label="From"
                placeholder="Select a date..."
                ariaLabel="Select a from date"
                value={dateFrom}
                onSelectDate={(date) => setDateFrom(date)}
                formatDate={(date) => date ? date.toLocaleDateString() : ''}
              />
              <DatePicker
                label="To"
                placeholder="Select a date..."
                ariaLabel="Select a to date"
                value={dateTo}
                onSelectDate={(date) => setDateTo(date)}
                formatDate={(date) => date ? date.toLocaleDateString() : ''}
                minDate={dateFrom}
              />
            </Stack>
          </Stack.Item>

          <Stack.Item>
            <Stack tokens={{ childrenGap: 10 }}>
              <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                <Text variant="large">File Size</Text>
                <DefaultButton 
                  toggle
                  checked={fileSizeEnabled}
                  text={fileSizeEnabled ? "Enabled" : "Disabled"}
                  onClick={() => setFileSizeEnabled(!fileSizeEnabled)}
                />
              </Stack>
              
              <Slider
                label={`Maximum size: ${fileSizeOptions[fileSize]} MB`}
                min={0}
                max={fileSizeOptions.length - 1}
                step={1}
                value={fileSize}
                onChange={setFileSize}
                disabled={!fileSizeEnabled}
                showValue={false}
              />
            </Stack>
          </Stack.Item>

          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: 10 }}>
              <DefaultButton text="Apply Filters" onClick={onApplyFilters} primary />
              <DefaultButton text="Clear Filters" onClick={onClearFilters} />
            </Stack>
          </Stack.Item>
        </Stack>
      </Panel>
    </>
  );
};