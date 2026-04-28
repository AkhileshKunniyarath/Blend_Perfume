import { randomBytes } from 'crypto';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string) {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }

  return digitsOnly;
}

export function createGuestTrackingToken() {
  return randomBytes(24).toString('hex');
}

export function getSiteBaseUrl() {
  const configuredUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  return (configuredUrl || 'http://localhost:3000').replace(/\/$/, '');
}

export function getGuestTrackingPath(token: string) {
  return `/track-order/${token}`;
}

export function getGuestTrackingUrl(token: string) {
  return `${getSiteBaseUrl()}${getGuestTrackingPath(token)}`;
}

export function formatOrderCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatOrderDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}
