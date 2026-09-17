/** Da forma de error-de-axios a un mensaje local, para que getErrorMessage() lo lea igual. */
export function apiError(message) {
  const err = new Error(message);
  err.response = { data: { error: message } };
  return err;
}
