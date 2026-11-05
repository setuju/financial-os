import { PayPalPayoutsMinimalClient, ServerEnvironment } from './sdk/src/index.js';

// Pastikan environment variables tersedia
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || 'sandbox';

if (!clientId || !clientSecret) {
  throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
}

export const paypalClient = new PayPalPayoutsMinimalClient({
  environment: mode === 'sandbox' ? ServerEnvironment.Sandbox : ServerEnvironment.Production,
  oAuth2: {
    clientId,
    clientSecret,
  },
});
