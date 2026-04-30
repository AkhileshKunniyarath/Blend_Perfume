import { getSession } from '@/lib/session';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const session = await getSession();

  const sessionData = session
    ? {
        userId: session.userId,
        name: session.name,
        email: session.email,
        phone: session.phone,
      }
    : null;

  return <CheckoutClient session={sessionData} />;
}
