'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { createSession, deleteSession } from '@/lib/session';
import { normalizePhone } from '@/lib/order-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateEmail(email: string): string[] {
  const errors: string[] = [];
  if (!email) errors.push('Email is required.');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('Please enter a valid email address.');
  return errors;
}

function validatePhone(phone: string): string[] {
  const errors: string[] = [];
  if (!phone) {
    errors.push('Mobile number is required.');
    return errors;
  }
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) {
    errors.push('Please enter a valid 10-digit mobile number.');
  }
  return errors;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) {
    errors.push('Password is required.');
    return errors;
  }
  if (password.length < 8) errors.push('Must be at least 8 characters long.');
  if (!/[a-zA-Z]/.test(password)) errors.push('Must contain at least one letter.');
  if (!/[0-9]/.test(password)) errors.push('Must contain at least one number.');
  return errors;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signup(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const phone = (formData.get('phone') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  const errors: NonNullable<AuthFormState>['errors'] = {};

  if (!name || name.length < 2) {
    errors.name = ['Name must be at least 2 characters long.'];
  }

  const emailErrors = validateEmail(email);
  if (emailErrors.length) errors.email = emailErrors;

  const phoneErrors = validatePhone(phone);
  if (phoneErrors.length) errors.phone = phoneErrors;

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length) errors.password = passwordErrors;

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const normalizedPhone = normalizePhone(phone);

  try {
    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return { errors: { email: ['An account with this email already exists.'] } };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone: normalizedPhone,
      password: hashedPassword,
    });

    await createSession(user._id.toString(), user.name, user.email, user.phone);
  } catch {
    return { message: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(
  state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  const errors: NonNullable<AuthFormState>['errors'] = {};

  const emailErrors = validateEmail(email);
  if (emailErrors.length) errors.email = emailErrors;

  if (!password) errors.password = ['Password is required.'];

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return { message: 'Invalid email or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { message: 'Invalid email or password.' };
    }

    await createSession(user._id.toString(), user.name, user.email, user.phone);
  } catch {
    return { message: 'Something went wrong. Please try again.' };
  }

  redirect('/');
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
