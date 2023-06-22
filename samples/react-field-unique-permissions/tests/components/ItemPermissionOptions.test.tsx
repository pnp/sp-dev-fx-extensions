import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { IPermissionsService } from '../../src/extensions/uniquePermissions/services/interfaces/IPermissionsService';
import { IItemData } from '../../src/extensions/uniquePermissions/models/IItemData';
import { IItemPermissionOptionsProps, ItemPermissionOptions } from '../../src/extensions/uniquePermissions/components/ItemPermissionOptions/ItemPermissionOptions';
import '@testing-library/jest-dom/extend-expect';

const permissionsServiceMock: jest.Mocked<IPermissionsService> = {
    getUniquePermissionsForItem: jest.fn().mockResolvedValue(true),
    getUserPermissionsForItem: jest.fn().mockResolvedValue({}),
    checkManagePermissionsAccess: jest.fn(),
    checkEditPermissions: jest.fn(),
    checkReadPermissions: jest.fn(),
    resetRoleInheritance: jest.fn(),
    goToItemPermissionsPage: jest.fn(),
    hasUserManagePermissionAccessToList: jest.fn()
};

const itemDataMock: IItemData = {
    webUrl: 'https://example.com',
    listId: '00000000-0000-0000-0000-000000000000' as any,
    itemId: '1',
};

describe('ItemPermissionOptions', () => {
    let defaultProps: IItemPermissionOptionsProps;

    beforeEach(() => {
        defaultProps = {
            permissionsService: permissionsServiceMock,
            itemData: itemDataMock,
            hasUniquePermissions: false,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', async () => {
        render(<ItemPermissionOptions {...defaultProps} />);
        expect(screen.getByTestId('item-permission-options')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
