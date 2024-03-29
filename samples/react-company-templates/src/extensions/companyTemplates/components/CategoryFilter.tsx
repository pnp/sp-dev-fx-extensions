import * as React from "react";
import { Dropdown, IDropdownOption, IDropdownProps, Icon } from "@fluentui/react";
import { TemplatesManagementContext } from "../contexts/TemplatesManagementContext";
import * as strings from "CompanyTemplatesCommandSetStrings";


export function CategoryFilter(): JSX.Element {
  const { templateFilesByCategory, setTemplateCategoriesFilter } = React.useContext(TemplatesManagementContext);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  React.useEffect(() => {
    setTemplateCategoriesFilter(selectedKeys);
  }, [selectedKeys])

  const onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      setSelectedKeys(
        item.selected ? [...selectedKeys, item.key as string] : selectedKeys.filter(key => key !== item.key),
      );
    }
  };

  const onRenderCaretDown = (): JSX.Element => {
    return <>
      {selectedKeys.length > 0 && <Icon iconName="Clear" styles={{ root: { cursor: 'pointer', } }} onClick={() => {
        setSelectedKeys([]);
      }} />}
    </>
  }

  const onRenderPlaceholder = (props: IDropdownProps): JSX.Element => {
    return <>
      <Icon iconName="Filter" styles={{ root: { paddingRight: '0.5rem' } }} />
      <span>{props.placeholder ?? strings.CategoryFilter.DropdownPlaceholderFallback}</span>
    </>
  }

  return <Dropdown
    placeholder={strings.CategoryFilter.DropdownPlaceholder}
    selectedKeys={selectedKeys}
    onChange={onChange}
    styles={{ root: { width: 250, border: 'none', textAlign: 'left' } }}
    multiSelect
    onRenderPlaceholder={onRenderPlaceholder}
    onRenderCaretDown={onRenderCaretDown}
    options={templateFilesByCategory ? Object.keys(templateFilesByCategory).sort().map((category) => ({
      key: category,
      text: category,
    })) : []}
  // styles={dropdownStyles}
  />
}
