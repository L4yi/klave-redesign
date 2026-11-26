import { verifyBeatPayment, VerifyPaymentResponse } from '../lib/api';

export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_188672a73e847bfa7e890e09144081018885d84b';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => {
        openIframe: () => void;
      };
    };
  }
}

/**
 * Loads Paystack Inline JS script dynamically if not present
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const existing = document.getElementById('paystack-inline-js');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack script')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}

export interface PaystackCheckoutArgs {
  email: string;
  amountNaira: number;
  beatId: string;
  buyerId: string;
  tier: 'standard' | 'exclusive';
  onSuccess: (res: VerifyPaymentResponse) => void;
  onClose?: () => void;
  onError?: (err: Error) => void;
}

export async function initiatePaystackPayment({
  email,
  amountNaira,
  beatId,
  buyerId,
  tier,
  onSuccess,
  onClose,
  onError,
}: PaystackCheckoutArgs): Promise<void> {
  try {
    await loadPaystackScript();

    if (!window.PaystackPop) {
      throw new Error('Paystack inline SDK is not available');
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amountNaira * 100), // in kobo
      currency: 'NGN',
      metadata: {
        custom_fields: [
          { display_name: 'Beat ID', variable_name: 'beatId', value: beatId },
          { display_name: 'Buyer ID', variable_name: 'buyerId', value: buyerId },
          { display_name: 'License Tier', variable_name: 'tier', value: tier },
        ],
        beatId,
        buyerId,
        tier,
      },
      callback: async (response: { reference: string }) => {
        try {
          // Immediately verify payment with server
          const verifyResult = await verifyBeatPayment(response.reference);
          onSuccess(verifyResult);
        } catch (err: unknown) {
          const e = err as Error;
          if (onError) onError(e);
        }
      },
      onClose: () => {
        if (onClose) onClose();
      },
    });

    handler.openIframe();
  } catch (err: unknown) {
    const e = err as Error;
    if (onError) onError(e);
    else throw e;
  }
}
