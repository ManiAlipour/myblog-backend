import sanitizeHtml from "sanitize-html";
import SANITIZE_OPTIONS from "../constants/sanitizeOptions";

function sanitize(input?: string): string {
  return sanitizeHtml(input ?? "", SANITIZE_OPTIONS);
}

export default sanitize;
