import  * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseComponentContext } from '@microsoft/sp-component-base';
import { AdditionalCommandButton, IAdditionalCommandButtonProps } from '../../src/extensions/uniquePermissions/components/AdditionalCommandButton/AdditionalCommandButton';
import '@testing-library/jest-dom/extend-expect';

const contextMock: jest.Mocked<BaseComponentContext> = {} as any;

describe('AdditionalCommandButton', () => {
  let defaultProps: IAdditionalCommandButtonProps;

  beforeEach(() => {
    defaultProps = {
      context: contextMock,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component', async () => {
    render(<AdditionalCommandButton {...defaultProps} />);
    expect(screen.getByTestId('additional-command-button')).toBeInTheDocument();
    expect(screen.queryByText('Check Permissions for testuser')).not.toBeInTheDocument();
  });
});
