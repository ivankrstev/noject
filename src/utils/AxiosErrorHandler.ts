import { AuthReloginError } from "@/types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { NextRouter } from "next/router";
import { toast } from "react-toastify";

/**
 * Global error handling utility for Axios HTTP requests
 *
 * This module provides centralized error handling for API requests by:
 * 1. Displaying user-friendly error messages via toast notifications
 * 2. Handling authentication failures by redirecting to login
 * 3. Preventing duplicate error messages
 * 4. Supporting custom error messages
 */

// Prevent duplicate toasts with the same content
let errorMessage = "";
// Prevent routing to login if already routed to it
let routedToLogin: boolean | undefined;

/**
 * Handles API errors with appropriate UI feedback
 *
 * @param error - The error object from an API request
 * @param router - Next.js router for navigation (required for auth redirects)
 * @param customMessage - Optional custom error message to display instead of the default
 *
 * This function:
 * - Redirects to login page when authentication errors occur
 * - Displays appropriate toast notifications for different error types
 * - Prevents duplicate error messages
 * - Clears error message state after a delay
 */
export default function AxiosErrorHandler(
  error?: AuthReloginError | null,
  router?: NextRouter | AppRouterInstance | null,
  customMessage?: string
): void {
  // Handle authentication errors by redirecting to login
  if (error?.logInAgain && router && !routedToLogin)
    setTimeout(() => {
      routedToLogin = true;
      router.push("/login/");
    }, 200);

  // Display authentication error message
  if (error?.logInAgain && errorMessage !== "Please, log in") {
    toast.error("Please, log in");
    errorMessage = "Please, log in";
  }
  // Display other error messages (avoiding duplicates)
  else if (
    errorMessage !== "Please, log in" &&
    errorMessage !==
      (error?.response?.data?.error ||
        error?.message ||
        customMessage ||
        "Oops! Something went wrong")
  ) {
    // Show toast with the most specific error message available
    toast.error(
      error?.response?.data?.error ||
        error?.message ||
        customMessage ||
        "Oops! Something went wrong"
    );

    // Store the current error message to prevent duplicates
    errorMessage = error
      ? error.message
      : customMessage
      ? customMessage
      : "Oops! Something went wrong";
  }

  // Reset error message after delay to allow future errors to be displayed
  setTimeout(() => (errorMessage = ""), 2400);
}
