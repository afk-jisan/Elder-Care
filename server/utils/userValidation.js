export const NID_ERROR_MESSAGE =
  'NID should start from 9 and lenths 8 digits and cannot be letter.';

export const PHONE_ERROR_MESSAGE = 'Phone number should start from 01';

/** 8 digits, starts with 9, digits only */
const NID_PATTERN = /^9\d{7}$/;

/** Bangladesh mobile: 01 + 9 digits */
const PHONE_PATTERN = /^01\d{9}$/;

export function validateNid(value) {
  const nid = String(value || '').trim();
  if (!nid) {
    return 'National ID number is required for caregivers';
  }
  if (!NID_PATTERN.test(nid)) {
    return NID_ERROR_MESSAGE;
  }
  return null;
}

export function validatePhone(value) {
  const phone = String(value || '').trim();
  if (!phone) {
    return 'Phone is required';
  }
  if (!PHONE_PATTERN.test(phone)) {
    return PHONE_ERROR_MESSAGE;
  }
  return null;
}
