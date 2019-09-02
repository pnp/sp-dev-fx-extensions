/**
 * Properties for the QR Dialog Content
 */
export interface IQRDialogContentProps {
  /**
   * The name of the file or library
   */
  fileName: string;

  /**
   * The absolute URL for which a QR code will be generated
   */
  absolutePath: string;

  /**
   * The DOM element to attach the dialog to
   */
  domElement: any;

  /**
   * Dismiss handler
   */
  onDismiss: () => void;
}

/**
 * State for the QR dialog contnet
 */
export interface IQRDialogContentState {
  // This space for rent
}
