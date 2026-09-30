export const sanitizeHeader = (value) =>
  String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, 150);

export default sanitizeHeader;