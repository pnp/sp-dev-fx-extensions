export const FlowConfig = {
  flowUrl:
    "https://xxxxxxxxxxxxxxxxxxxxxxx.5d.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1",

  // Optional secret for additional security validation in your Flow
  originSecret: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  // Dialog settings
  dialogTitle: "Trigger Authenticated Flow",
  dialogDescription:
    "Click the button below to trigger the authenticated flow for the selected document.",
  triggerButtonText: "Trigger Flow",
  cancelButtonText: "Cancel",

  // Messages
  successMessage: "Flow triggered successfully!",
  errorMessage: "Failed to trigger flow. Please try again.",
};
