import type { IOrder } from '@/models/Order';
import {
  formatOrderCurrency,
  formatOrderDate,
  getGuestTrackingUrl,
} from '@/lib/order-utils';

type EmailResult = {
  sent: boolean;
  skipped?: boolean;
};

type OrderEmailOrder = Pick<
  IOrder,
  | '_id'
  | 'address'
  | 'products'
  | 'totalAmount'
  | 'orderStatus'
  | 'paymentStatus'
  | 'guestTrackingToken'
  | 'shippingCarrier'
  | 'trackingNumber'
  | 'trackingUrl'
  | 'createdAt'
>;

function buildTrackingLink(order: OrderEmailOrder) {
  return order.trackingUrl || getGuestTrackingUrl(order.guestTrackingToken);
}

function buildEmailHtml(order: OrderEmailOrder) {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const trackingLink = buildTrackingLink(order);
  const itemsHtml = order.products
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;color:#111827;">${item.name}${item.size ? ` (${item.size})` : ''}</td>
          <td style="padding:8px 0;color:#4b5563;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;color:#111827;text-align:right;">${formatOrderCurrency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join('');

  const trackingDetails = order.trackingNumber
    ? `<p style="margin:0 0 12px;color:#374151;">Tracking number: <strong>${order.trackingNumber}</strong>${
        order.shippingCarrier ? ` via ${order.shippingCarrier}` : ''
      }</p>`
    : '<p style="margin:0 0 12px;color:#374151;">Use the button below to see the latest status and tracking updates for your order.</p>';

  return `
    <div style="background:#f5f5f4;padding:32px 16px;font-family:Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e7e5e4;">
        <p style="margin:0 0 8px;color:#a16207;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;">Blend Order Confirmation</p>
        <h1 style="margin:0 0 12px;color:#111827;font-size:28px;">Your order is confirmed</h1>
        <p style="margin:0 0 24px;color:#4b5563;line-height:1.6;">
          Hi ${order.address.fullName}, thanks for shopping with Blend. Your payment was received and your order is now being prepared.
        </p>

        <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:16px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#111827;"><strong>Order #${orderNumber}</strong></p>
          <p style="margin:0 0 8px;color:#374151;">Placed on ${formatOrderDate(order.createdAt)}</p>
          <p style="margin:0 0 8px;color:#374151;">Payment status: ${order.paymentStatus}</p>
          <p style="margin:0;color:#374151;">Order status: ${order.orderStatus}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead>
            <tr>
              <th style="padding:0 0 10px;text-align:left;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Item</th>
              <th style="padding:0 0 10px;text-align:center;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Qty</th>
              <th style="padding:0 0 10px;text-align:right;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <div style="border-top:1px solid #e7e5e4;padding-top:16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#111827;"><strong>Total: ${formatOrderCurrency(order.totalAmount)}</strong></p>
          <p style="margin:0;color:#374151;">Shipping to ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}, ${order.address.country}</p>
        </div>

        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 10px;color:#92400e;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">Tracking Details</p>
          ${trackingDetails}
          <a href="${trackingLink}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:600;">Track this order</a>
        </div>

        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
          If you later create an account with the same email address and mobile number, your guest orders can be matched back to your profile.
        </p>
      </div>
    </div>
  `;
}

function buildEmailText(order: OrderEmailOrder) {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const trackingLink = buildTrackingLink(order);
  const itemLines = order.products
    .map(
      (item) =>
        `- ${item.name}${item.size ? ` (${item.size})` : ''} x ${item.quantity}: ${formatOrderCurrency(
          item.price * item.quantity
        )}`
    )
    .join('\n');

  return [
    `Your Blend order #${orderNumber} is confirmed.`,
    '',
    `Hi ${order.address.fullName},`,
    'Your payment was received and your order is now being prepared.',
    '',
    `Placed on: ${formatOrderDate(order.createdAt)}`,
    `Payment status: ${order.paymentStatus}`,
    `Order status: ${order.orderStatus}`,
    '',
    'Items:',
    itemLines,
    '',
    `Total: ${formatOrderCurrency(order.totalAmount)}`,
    `Shipping address: ${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.zipCode}, ${order.address.country}`,
    '',
    order.trackingNumber
      ? `Tracking number: ${order.trackingNumber}${order.shippingCarrier ? ` (${order.shippingCarrier})` : ''}`
      : 'Tracking updates are available from the link below.',
    `Track order: ${trackingLink}`,
  ].join('\n');
}

export async function sendOrderConfirmationEmail(order: OrderEmailOrder): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ORDER_EMAIL_FROM || process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.warn(
      'Skipping order confirmation email because RESEND_API_KEY or ORDER_EMAIL_FROM is not configured.'
    );
    return { sent: false, skipped: true };
  }

  const subject = `Your Blend order #${order._id.toString().slice(-8).toUpperCase()} is confirmed`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [order.address.email],
      subject,
      html: buildEmailHtml(order),
      text: buildEmailText(order),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send order email: ${response.status} ${errorBody}`);
  }

  return { sent: true };
}
