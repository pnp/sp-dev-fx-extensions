import * as React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { IPermissionsService } from '../../src/extensions/uniquePermissions/services/interfaces/IPermissionsService';
import { IItemData } from '../../src/extensions/uniquePermissions/models/IItemData';
import UniquePermissions, { IUniquePermissionsProps } from '../../src/extensions/uniquePermissions/components/UniquePermissions/UniquePermissions';
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

describe('UniquePermissions', () => {
    let defaultProps: IUniquePermissionsProps;

    beforeEach(() => {
        defaultProps = {
            permissionsService: permissionsServiceMock,
            itemData: itemDataMock,
            currentUserLoginName: 'user@example.com',
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', async () => {
        render(<UniquePermissions {...defaultProps} />);

        expect(screen.getByTestId('unique-permissions')).toBeInTheDocument();
        act(() => {
            expect(permissionsServiceMock.getUniquePermissionsForItem).toHaveBeenCalledWith(itemDataMock);
            expect(permissionsServiceMock.getUserPermissionsForItem).toHaveBeenCalledWith(itemDataMock, defaultProps.currentUserLoginName);
        });
    });

    test('displays the correct permissions icon', async () => {
        permissionsServiceMock.getUniquePermissionsForItem.mockResolvedValue(true);
        permissionsServiceMock.checkManagePermissionsAccess.mockReturnValue(true);
        permissionsServiceMock.checkEditPermissions.mockReturnValue(false);
        permissionsServiceMock.checkReadPermissions.mockReturnValue(false);

        act(() => {
            render(<UniquePermissions {...defaultProps} />);
        });

        await waitFor(() => {
            expect(screen.getByTitle('Permissions for Current User - Manage')).toBeInTheDocument();
        });
    });

});
