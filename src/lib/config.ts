// Feature flags and environment config
// TODO_BACKEND_HOOKUP: Replace with real environment variables

export const config = {
  useMockData: true, // Toggle this to switch between mock and real API
  apiBaseUrl: "/api",
  appName: "Poser",
  supportEmail: "support@poser.app",
} as const;
