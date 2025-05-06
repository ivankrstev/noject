import { toast } from "react-toastify";

// Prevent duplicate toasts with the same content
let errorMessage = "";
// Prevent routing to login if already routed to it
let routedToLogin;

export default function AxiosErrorHandler(error, router, customMessage) {
  if (error?.logInAgain && router && !routedToLogin)
    setTimeout(() => {
      routedToLogin = true;
      router.push("/login/");
    }, 200);
  if (error?.logInAgain && errorMessage !== "Please, log in") {
    toast.error("Please, log in");
    errorMessage = "Please, log in";
  } else if (
    errorMessage !== "Please, log in" &&
    errorMessage !==
      (error?.response?.data?.error ||
        error?.message ||
        customMessage ||
        "Oops! Something went wrong")
  ) {
    toast.error(
      error?.response?.data?.error ||
        error?.message ||
        customMessage ||
        "Oops! Something went wrong"
    );
    errorMessage = error
      ? error.message
      : customMessage
      ? customMessage
      : "Oops! Something went wrong";
  }
  setTimeout(() => (errorMessage = ""), 2400);
}
