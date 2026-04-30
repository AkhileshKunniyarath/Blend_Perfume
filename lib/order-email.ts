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

function buildEmailHtml(order: OrderEmailOrder): string {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const trackingLink = buildTrackingLink(order);
  const placedOn = formatOrderDate(order.createdAt);

  // ── Item rows ────────────────────────────────────────────────────────────
  const itemRows = order.products
    .map(
      (item, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#fafaf9'};">
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;color:#111827;font-size:14px;line-height:1.5;">
          <strong>${item.name}</strong>
          ${item.size ? `<br><span style="color:#6b7280;font-size:12px;">Size: ${item.size}</span>` : ''}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;color:#374151;font-size:14px;text-align:center;white-space:nowrap;">
          ${item.quantity}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;color:#374151;font-size:14px;text-align:right;white-space:nowrap;">
          ${formatOrderCurrency(item.price)}
        </td>
        <td style="padding:14px 16px;border-bottom:1px solid #f0ede8;color:#111827;font-size:14px;font-weight:600;text-align:right;white-space:nowrap;">
          ${formatOrderCurrency(item.price * item.quantity)}
        </td>
      </tr>`
    )
    .join('');

  // ── Tracking section ─────────────────────────────────────────────────────
  const trackingSection = order.trackingNumber
    ? `<p style="margin:0 0 10px;color:#374151;font-size:14px;">
        Carrier: <strong>${order.shippingCarrier || 'Standard Shipping'}</strong><br>
        Tracking number: <strong>${order.trackingNumber}</strong>
       </p>`
    : `<p style="margin:0 0 10px;color:#374151;font-size:14px;">
        Your shipment tracking number will be updated here once your order is dispatched.
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — Blend Perfume</title>
</head>
<body style="margin:0;padding:0;background:#f5f1ea;font-family:Arial,'Helvetica Neue',sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">

          <!-- ── Header ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f0f0f,#3b2a1a);border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#c9a96e;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;">Blend Perfume</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.02em;">Order Confirmed</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">Thank you for your purchase, ${order.address.fullName.split(' ')[0]}!</p>
            </td>
          </tr>

          <!-- ── Order meta strip ── -->
          <tr>
            <td style="background:#1a1a1a;padding:14px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:rgba(255,255,255,0.55);font-size:11px;text-transform:uppercase;letter-spacing:0.18em;">Order</td>
                  <td style="color:rgba(255,255,255,0.55);font-size:11px;text-transform:uppercase;letter-spacing:0.18em;text-align:center;">Date</td>
                  <td style="color:rgba(255,255,255,0.55);font-size:11px;text-transform:uppercase;letter-spacing:0.18em;text-align:right;">Status</td>
                </tr>
                <tr>
                  <td style="color:#c9a96e;font-size:15px;font-weight:700;padding-top:4px;">#${orderNumber}</td>
                  <td style="color:#ffffff;font-size:13px;padding-top:4px;text-align:center;">${placedOn}</td>
                  <td style="padding-top:4px;text-align:right;">
                    <span style="background:#c9a96e;color:#0f0f0f;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;padding:3px 10px;border-radius:999px;">
                      ${order.orderStatus}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Main card ── -->
          <tr>
            <td style="background:#ffffff;padding:0;border-radius:0 0 20px 20px;overflow:hidden;">

              <!-- Intro -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:32px 40px 24px;">
                    <p style="margin:0;color:#374151;font-size:14px;line-height:1.7;">
                      Your payment was received and your order is now being prepared. We'll send you another update when it ships.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- ── Items table ── -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ede8;border-bottom:1px solid #f0ede8;">
                <!-- Table header -->
                <tr style="background:#fafaf9;">
                  <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;border-bottom:1px solid #e7e5e4;">Item</th>
                  <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;border-bottom:1px solid #e7e5e4;white-space:nowrap;">Qty</th>
                  <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;border-bottom:1px solid #e7e5e4;white-space:nowrap;">Unit Price</th>
                  <th style="padding:10px 16px;text-align:right;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;border-bottom:1px solid #e7e5e4;white-space:nowrap;">Total</th>
                </tr>
                ${itemRows}
              </table>

              <!-- ── Order totals ── -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 0 auto;max-width:260px;">
                      <tr>
                        <td style="padding:14px 0 6px;color:#6b7280;font-size:13px;border-top:1px solid #f0ede8;">Subtotal</td>
                        <td style="padding:14px 0 6px;color:#374151;font-size:13px;text-align:right;border-top:1px solid #f0ede8;">${formatOrderCurrency(order.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#6b7280;font-size:13px;">Shipping</td>
                        <td style="padding:6px 0;color:#16a34a;font-size:13px;font-weight:600;text-align:right;">Free</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 16px;color:#111827;font-size:15px;font-weight:700;border-top:2px solid #e7e5e4;">Order Total</td>
                        <td style="padding:12px 0 16px;color:#111827;font-size:15px;font-weight:700;text-align:right;border-top:2px solid #e7e5e4;">${formatOrderCurrency(order.totalAmount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ── Two-column: Shipping + Tracking ── -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ede8;">
                <tr>
                  <!-- Shipping address -->
                  <td width="50%" valign="top" style="padding:24px 20px 24px 40px;border-right:1px solid #f0ede8;">
                    <p style="margin:0 0 10px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;">Shipping To</p>
                    <p style="margin:0;color:#111827;font-size:14px;font-weight:600;line-height:1.6;">${order.address.fullName}</p>
                    <p style="margin:0;color:#374151;font-size:13px;line-height:1.7;">
                      ${order.address.street}<br>
                      ${order.address.city}, ${order.address.state} ${order.address.zipCode}<br>
                      ${order.address.country}
                    </p>
                    <p style="margin:10px 0 0;color:#6b7280;font-size:13px;line-height:1.6;">
                      ${order.address.email}<br>
                      ${order.address.phone}
                    </p>
                  </td>
                  <!-- Tracking -->
                  <td width="50%" valign="top" style="padding:24px 40px 24px 20px;">
                    <p style="margin:0 0 10px;color:#6b7280;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.18em;">Tracking</p>
                    ${trackingSection}
                    <a href="${trackingLink}"
                       style="display:inline-block;margin-top:8px;background:#0f0f0f;color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:10px 20px;border-radius:999px;">
                      Track Order →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- ── Guest account note ── -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ede8;">
                <tr>
                  <td style="padding:20px 40px 32px;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.7;">
                      If you create an account with the same email address and mobile number, your guest orders will automatically appear in your order history.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} Blend Perfume. All rights reserved.</p>
              <p style="margin:0;color:#c9a96e;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;">Premium Fragrances</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function buildEmailText(order: OrderEmailOrder): string {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const trackingLink = buildTrackingLink(order);

  const itemLines = order.products
    .map(
      (item) =>
        `  ${item.name}${item.size ? ` (${item.size})` : ''}\n  Qty: ${item.quantity}  |  Unit: ${formatOrderCurrency(item.price)}  |  Total: ${formatOrderCurrency(item.price * item.quantity)}`
    )
    .join('\n\n');

  return [
    '='.repeat(52),
    'BLEND PERFUME — ORDER CONFIRMED',
    '='.repeat(52),
    '',
    `Order #${orderNumber}`,
    `Placed on: ${formatOrderDate(order.createdAt)}`,
    `Status: ${order.orderStatus}  |  Payment: ${order.paymentStatus}`,
    '',
    'Hi ' + order.address.fullName + ',',
    'Your payment was received and your order is being prepared.',
    '',
    '-'.repeat(52),
    'ITEMS',
    '-'.repeat(52),
    itemLines,
    '',
    '-'.repeat(52),
    `Shipping: Free`,
    `ORDER TOTAL: ${formatOrderCurrency(order.totalAmount)}`,
    '-'.repeat(52),
    '',
    'SHIPPING ADDRESS',
    order.address.fullName,
    order.address.street,
    `${order.address.city}, ${order.address.state} ${order.address.zipCode}`,
    order.address.country,
    order.address.email,
    order.address.phone,
    '',
    'TRACKING',
    order.trackingNumber
      ? `${order.shippingCarrier ? order.shippingCarrier + ' — ' : ''}${order.trackingNumber}`
      : 'Tracking details will be updated once your order is dispatched.',
    `Track your order: ${trackingLink}`,
    '',
    '='.repeat(52),
    '© ' + new Date().getFullYear() + ' Blend Perfume. All rights reserved.',
    '='.repeat(52),
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

  // In test mode (Resend free tier), override recipient to the account owner's email.
  // Remove ORDER_EMAIL_TEST_RECIPIENT once your domain is verified at resend.com/domains.
  const testRecipient = process.env.ORDER_EMAIL_TEST_RECIPIENT;
  const toEmail = testRecipient || order.address.email;

  if (testRecipient) {
    console.log(`📧 Test mode: redirecting order email from ${order.address.email} → ${testRecipient}`);
  }

  const subject = `Order #${order._id.toString().slice(-8).toUpperCase()} confirmed — Blend Perfume`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
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
