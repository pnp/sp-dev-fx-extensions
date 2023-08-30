import { IItemData, IPermissionsData } from "../../src/extensions/uniquePermissions/models";
import { PermissionsService } from "../../src/extensions/uniquePermissions/services/PermissionsService";
import { IPermissionsService } from "../../src/extensions/uniquePermissions/services/interfaces/IPermissionsService";

describe("PermissionsService", () => {
    let permissionsService: IPermissionsService;
    let mockSpHttpClient: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSpHttpClient = {
            get: jest.fn(),
            post: jest.fn(),
        };

        permissionsService = new PermissionsService(mockSpHttpClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getUniquePermissionsForItem", () => {
        it("should return false if there are no unique permissions", async () => {
            const guid = "00000000-0000-0000-0000-000000000000";

            const itemData: IItemData = {
                webUrl: "webUrl",
                listId: guid as any,
                itemId: "itemId",
            };

            const result = await permissionsService.getUniquePermissionsForItem(itemData);
            mockSpHttpClient.get.mockResolvedValueOnce({ value: false });

            expect(mockSpHttpClient.get).toHaveBeenCalledWith(`webUrl/_api/web/lists('${guid}')/items(itemId)/HasUniqueRoleAssignments`);
            expect(result).toBe(false);
        });

        it("should return true if there are unique permissions", async () => {
            const guid = "00000000-0000-0000-0000-000000000000";
            const itemData: IItemData = {
                webUrl: "webUrl",
                listId: guid as any,
                itemId: "itemId",
            };

            mockSpHttpClient.get.mockResolvedValueOnce({ value: true });

            const result = await permissionsService.getUniquePermissionsForItem(itemData);

            expect(mockSpHttpClient.get).toHaveBeenCalledWith(`webUrl/_api/web/lists('${guid}')/items(itemId)/HasUniqueRoleAssignments`);
            expect(result).toBe(true);
        });
    });

    describe("resetRoleInheritance", () => {
        test("should return true if role inheritance is reset successfully", async () => {
            mockSpHttpClient.post.mockResolvedValueOnce({ value: true });

            const guid = "00000000-0000-0000-0000-000000000000";

            const itemData: IItemData = {
                webUrl: "https://example.com",
                listId: guid as any,
                itemId: '1',
            };

            const result = await permissionsService.resetRoleInheritance(itemData);

            expect(mockSpHttpClient.post).toHaveBeenCalledWith(
                `https://example.com/_api/web/lists('${guid}')/items(1)/resetroleinheritance`,
                {}
            );
            expect(result).toBe(true);
        });

        test("should return false if role inheritance reset fails", async () => {
            mockSpHttpClient.post.mockResolvedValueOnce({ value: false });

            const guid = "00000000-0000-0000-0000-000000000000";

            const itemData: IItemData = {
                webUrl: "https://example.com",
                listId: guid as any,
                itemId: '1',
            };

            const result = await permissionsService.resetRoleInheritance(itemData);

            expect(mockSpHttpClient.post).toHaveBeenCalledWith(
                `https://example.com/_api/web/lists('${guid}')/items(1)/resetroleinheritance`,
                {}
            );
            expect(result).toBe(false);
        });
    });

    describe("getUserPermissionsForItem", () => {
        test("should return permissions data for the user", async () => {
            const itemData: IItemData = {
                webUrl: "https://example.com",
                listId: "list-id" as any,
                itemId: '1',
            };
            const userLogin = "user1";

            const mockResponse: IPermissionsData = {
                Low: 123,
                High: 456,
            };

            mockSpHttpClient.get.mockResolvedValueOnce(mockResponse);

            const result = await permissionsService.getUserPermissionsForItem(itemData, userLogin);

            expect(mockSpHttpClient.get).toHaveBeenCalledWith(
                "https://example.com/_api/web/lists('list-id')/items(1)/getUserEffectivePermissions(@user)?@user=%27user1%27"
            );
            expect(result).toEqual(mockResponse);
        });
    });
});
