export const toast = {
  success: (text, title = "Success") => {
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "success", title, text } }));
  },
  error: (text, title = "Error") => {
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "error", title, text } }));
  },
  info: (text, title = "Info") => {
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "info", title, text } }));
  },
  warning: (text, title = "Warning") => {
    window.dispatchEvent(new CustomEvent("toast", { detail: { type: "warning", title, text } }));
  },
};
