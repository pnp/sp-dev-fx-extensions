import * as ReactDOM from 'react-dom';
import {OptionsRenderer} from '../../src/extensions/uniquePermissions/services/OptionsRenderer';

describe('OptionsRenderer', () => {
  let permissionsService: any;
  let optionsRenderer: OptionsRenderer;

  beforeEach(() => {
    jest.spyOn(ReactDOM,'render');

    permissionsService = {
      hasUserManagePermissionAccessToList: jest.fn(),
    };

    optionsRenderer = new OptionsRenderer(permissionsService);

    (window as any).IsUniquePermissionsRendererInitialized = false;

    document.getElementsByClassName = jest.fn().mockReturnValue([
      {
        className: 'ms-CommandBar-primaryCommand',
        appendChild: jest.fn(),
      },
    ]);
  });

  afterEach(() => {    
    jest.clearAllMocks();
  });

  describe('getIsRenderingInitialized', () => {
    it('should return the value of IsUniquePermissionsRendererInitialized variable', () => {
      const result = optionsRenderer.getIsRenderingInitialized();
      expect(result).toBe(false);
    });
  });

  describe('renderAdditionalOptions', () => {
    it('should render the AdditionalCommandButton when shouldRenderAdditionalOptions returns true', async () => {
      const context: any = {
        pageContext: {
          web: {
            absoluteUrl: 'https://example.com',
          },
          list: {
            id: '00000000-0000-0000-0000-000000000001',
          },
          user: {
            loginName: 'user@domain.com',
          },
        },
      };
      permissionsService.hasUserManagePermissionAccessToList.mockResolvedValue(true);

      await optionsRenderer.renderAdditionalOptions(context);

      expect(permissionsService.hasUserManagePermissionAccessToList).toHaveBeenCalledWith(
        {
          listId: '00000000-0000-0000-0000-000000000001',
          webUrl: 'https://example.com',
        },
        'i:0#.f|membership|user@domain.com'
      );
      expect(ReactDOM.render).toHaveBeenCalled();
    });

    it('should not render the AdditionalCommandButton when shouldRenderAdditionalOptions returns false', async () => {
      const context: any = {
        pageContext: {
          web: {
            absoluteUrl: 'https://example.com',
          },
          list: {
            id: '00000000-0000-0000-0000-000000000001',
          },
          user: {
            loginName: 'user@domain.com',
          },
        },
      };
      permissionsService.hasUserManagePermissionAccessToList.mockResolvedValue(false);
      await optionsRenderer.renderAdditionalOptions(context);

      expect(permissionsService.hasUserManagePermissionAccessToList).toHaveBeenCalledWith(
        {
          listId: '00000000-0000-0000-0000-000000000001',
          webUrl: 'https://example.com',
        },
        'i:0#.f|membership|user@domain.com'
      );
      expect(ReactDOM.render).not.toHaveBeenCalled();
    });

  });
});
