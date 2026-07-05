// Common types used across the application

// Error type for axios error handler
export interface AuthReloginError extends Error {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
  logInAgain?: boolean;
}
