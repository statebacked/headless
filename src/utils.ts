export const toValidIdentifier = (str?: string) =>
  str && str.replace(/[^a-zA-Z0-9_-]/g, "_");
