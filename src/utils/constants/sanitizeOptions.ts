import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "b",
    "i",
    "em",
    "strong",
    "a",
    "ul",
    "ol",
    "li",
    "p",
    "br",
    "code",
    "pre",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "name", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {},
  allowedClasses: {},
};

export default SANITIZE_OPTIONS;
