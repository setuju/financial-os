import { PayPalPayoutsMinimalClient } from './sdk/src/index.js';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const mode = process.env.PAYPAL_MODE || 'sandbox';

if (!clientId || !clientSecret) {
  throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set');
}

export const paypalClient = new PayPalPayoutsMinimalClient({
  // Override baseUrl explicitly to ensure correct endpoint regardless of APIMatic's enum naming
  serverOptions: {
    baseUrl: mode === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com' 
      : 'https://api-m.paypal.com'
  },
  oAuth2: {
    clientId,
    clientSecret,
  },
});
