import * as React from 'react';
import { DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';

export interface IPaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
  itemsPerPageOptions?: number[];
  maxVisiblePages?: number;
  showItemCount?: boolean;
}

export const PaginationControls: React.FC<IPaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = false,
  itemsPerPageOptions = [10, 20, 50, 100],
  maxVisiblePages = 7,
  showItemCount = true
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const getVisiblePages = (): number[] => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  const showFirstEllipsis = visiblePages[0] > 1;
  const showLastEllipsis = visiblePages[visiblePages.length - 1] < totalPages;

  const itemsPerPageDropdownOptions: IDropdownOption[] = itemsPerPageOptions.map(option => ({
    key: option.toString(),
    text: `${option} per page`
  }));

  const getItemRangeText = (): string => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    return `${startItem}-${endItem} of ${totalItems}`;
  };

  return (
    <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 12 }} style={{ padding: '16px 0' }}>
      {/* Items count and per-page selector */}
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        {showItemCount && (
          <Text variant="small" style={{ color: '#666' }}>
            {getItemRangeText()}
          </Text>
        )}
        
        {showItemsPerPageSelector && onItemsPerPageChange && (
          <Dropdown
            selectedKey={itemsPerPage.toString()}
            onChange={(_, option) => onItemsPerPageChange(parseInt(option?.key as string || '20'))}
            options={itemsPerPageDropdownOptions}
            styles={{
              root: { minWidth: '120px' },
              dropdown: { fontSize: '12px' }
            }}
          />
        )}
      </Stack>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Pagination buttons */}
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
        {/* Previous button */}
        <IconButton
          iconProps={{ iconName: 'ChevronLeft' }}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous page"
          styles={{
            root: {
              minWidth: '32px',
              height: '32px'
            }
          }}
        />

        {/* First page */}
        {showFirstEllipsis && (
          <>
            <DefaultButton
              text="1"
              onClick={() => onPageChange(1)}
              primary={currentPage === 1}
              styles={{
                root: {
                  minWidth: '32px',
                  height: '32px',
                  padding: '0'
                }
              }}
            />
            <Text variant="small" style={{ padding: '0 4px' }}>...</Text>
          </>
        )}

        {/* Visible page numbers */}
        {visiblePages.map(page => (
          <DefaultButton
            key={page}
            text={page.toString()}
            onClick={() => onPageChange(page)}
            primary={currentPage === page}
            styles={{
              root: {
                minWidth: '32px',
                height: '32px',
                padding: '0'
              }
            }}
          />
        ))}

        {/* Last page */}
        {showLastEllipsis && (
          <>
            <Text variant="small" style={{ padding: '0 4px' }}>...</Text>
            <DefaultButton
              text={totalPages.toString()}
              onClick={() => onPageChange(totalPages)}
              primary={currentPage === totalPages}
              styles={{
                root: {
                  minWidth: '32px',
                  height: '32px',
                  padding: '0'
                }
              }}
            />
          </>
        )}

        {/* Next button */}
        <IconButton
          iconProps={{ iconName: 'ChevronRight' }}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next page"
          styles={{
            root: {
              minWidth: '32px',
              height: '32px'
            }
          }}
        />
      </Stack>
    </Stack>
  );
};