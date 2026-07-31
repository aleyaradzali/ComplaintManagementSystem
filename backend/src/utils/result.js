export const Result = {
  ok: (data = null, message = 'Success') => ({ success: true, message, data }),
  fail: (message = 'Request failed', data = null) => ({ success: false, message, data }),
};
