import nodemailer from "nodemailer";

/* ── Create transporter from env vars ── */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* ── HTML email template ── */
const orderEmailHTML = (order) => {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ead8;font-family:'Helvetica Neue',sans-serif;font-size:14px;color:#1A1208;">
        ${item.title} <span style="color:#8A7D6B;">× ${item.qty}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0ead8;text-align:right;font-family:'Helvetica Neue',sans-serif;font-size:14px;font-weight:700;color:#D4831A;">
        $${(item.price * item.qty).toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#FFFCF5;">
    <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid rgba(245,166,35,0.2);box-shadow:0 8px 30px rgba(0,0,0,0.06);">

      <!-- Header -->
      <div style="background:#1A1208;padding:32px 40px;text-align:center;">
        <span style="font-size:22px;font-weight:800;color:#fff;">🐝 BuyBee</span>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0;">Order Confirmation</p>
      </div>

      <!-- Body -->
      <div style="padding:36px 40px;font-family:'Helvetica Neue',Helvetica,sans-serif;">
        <h1 style="font-size:24px;font-weight:800;color:#1A1208;margin:0 0 8px;">
          Thank you, ${order.customer.firstName}! 🎉
        </h1>
        <p style="color:#8A7D6B;font-size:15px;margin:0 0 28px;line-height:1.6;">
          Your order has been placed successfully and is being processed.
        </p>

        <!-- Order number -->
        <div style="background:#FFF3DC;border:1.5px solid rgba(245,166,35,0.3);border-radius:12px;padding:14px 20px;margin-bottom:28px;text-align:center;">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#8A7D6B;">Order Number</span>
          <div style="font-size:22px;font-weight:800;color:#D4831A;margin-top:4px;">${order.orderNumber}</div>
        </div>

        <!-- Items -->
        <h3 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#8A7D6B;margin:0 0 12px;">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tbody>${rows}</tbody>
        </table>

        <!-- Totals -->
        <div style="background:#FFFCF5;border-radius:12px;border:1px solid rgba(245,166,35,0.15);padding:16px 20px;margin-bottom:28px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#8A7D6B;">Subtotal</td>
              <td style="padding:4px 0;font-size:13px;color:#1A1208;text-align:right;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0 12px;font-size:13px;color:#8A7D6B;border-bottom:1px solid rgba(245,166,35,0.2);">Shipping</td>
              <td style="padding:4px 0 12px;font-size:13px;color:#1A1208;text-align:right;border-bottom:1px solid rgba(245,166,35,0.2);">$${order.shippingFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0 0;font-size:15px;font-weight:800;color:#1A1208;">Total</td>
              <td style="padding:12px 0 0;font-size:18px;font-weight:800;color:#D4831A;text-align:right;">$${order.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Shipping -->
        <h3 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#8A7D6B;margin:0 0 12px;">Shipping To</h3>
        <div style="background:#FFFCF5;border-radius:12px;border:1px solid rgba(245,166,35,0.15);padding:16px 20px;margin-bottom:28px;font-size:14px;color:#1A1208;line-height:1.8;">
          <strong>${order.customer.firstName} ${order.customer.lastName}</strong><br>
          ${order.customer.address}<br>
          ${order.customer.city}${order.customer.province ? ", " + order.customer.province : ""} ${order.customer.postalCode}<br>
          ${order.customer.country}<br>
          <span style="color:#8A7D6B;">${order.customer.phone}</span>
        </div>

        <!-- Payment -->
        <h3 style="font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#8A7D6B;margin:0 0 8px;">Payment</h3>
        <p style="font-size:14px;color:#1A1208;margin:0 0 28px;">
          ${
            order.paymentMethod === "cod"
              ? "🚚 Cash on Delivery — pay when your order arrives."
              : "💳 Credit / Debit Card"
          }
        </p>

        <!-- CTA -->
        <div style="text-align:center;margin-top:8px;">
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/products"
             style="display:inline-block;background:#F5A623;color:#1A1208;font-weight:800;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none;">
            Continue Shopping →
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#F7F6F3;padding:20px 40px;text-align:center;border-top:1px solid rgba(245,166,35,0.1);">
        <p style="font-size:12px;color:#8A7D6B;margin:0;line-height:1.6;">
          🐝 BuyBee — Shop Smarter, Live Better<br>
          Built with ❤️ by <a href="https://flegoinnovation.com" style="color:#D4831A;text-decoration:none;">Flego Innovation</a>
        </p>
      </div>
    </div>
  </body>
  </html>`;
};

/* ── Send order confirmation to customer ── */
export const sendOrderConfirmation = async (order) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(
      "⚠️  SMTP not configured — skipping confirmation email for",
      order.orderNumber,
    );
    return;
  }
  try {
    await transporter.sendMail({
      from: `"BuyBee" <${process.env.SMTP_USER}>`,
      to: order.customer.email,
      subject: `🐝 Order Confirmed — ${order.orderNumber}`,
      html: orderEmailHTML(order),
    });
    console.log(`✅ Confirmation email sent to ${order.customer.email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    // Don't throw — order is saved, email is best-effort
  }
};

/* ── Send new order alert to admin ── */
export const sendAdminAlert = async (order) => {
  if (!process.env.SMTP_USER || !process.env.ADMIN_EMAIL) return;
  try {
    await transporter.sendMail({
      from: `"BuyBee Orders" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ New Order ${order.orderNumber} — $${order.total.toFixed(2)}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#fff;border-radius:16px;">
          <h2 style="color:#1A1208;margin:0 0 16px;">🛍️ New order received!</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 0;color:#8A7D6B;width:120px;">Order</td><td style="font-weight:700;color:#D4831A;">${order.orderNumber}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Customer</td><td>${order.customer.firstName} ${order.customer.lastName}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Email</td><td>${order.customer.email}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Phone</td><td>${order.customer.phone}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Total</td><td style="font-weight:700;font-size:16px;color:#1A1208;">$${order.total.toFixed(2)}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Payment</td><td>${order.paymentMethod === "cod" ? "🚚 Cash on Delivery" : "💳 Card"}</td></tr>
            <tr><td style="padding:6px 0;color:#8A7D6B;">Items</td><td>${order.items.map((i) => `${i.title} × ${i.qty}`).join(", ")}</td></tr>
          </table>
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/admin/orders"
             style="display:inline-block;margin-top:20px;background:#F5A623;color:#1A1208;padding:11px 24px;border-radius:20px;text-decoration:none;font-weight:700;font-size:14px;">
            View in Admin →
          </a>
        </div>
      `,
    });
    console.log(`✅ Admin alert sent to ${process.env.ADMIN_EMAIL}`);
  } catch (err) {
    console.error("❌ Admin alert failed:", err.message);
  }
};
