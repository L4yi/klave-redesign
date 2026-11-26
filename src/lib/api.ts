// src/lib/api.ts
import { auth } from './firebase';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://klaveapp.vercel.app/api';

/**
 * Common POST request helper for KLAVE Vercel functions
 * Automatically attaches Authorization: Bearer <idToken> if user is signed in.
 */
async function postApi<T>(endpoint: string, body: Record<string, unknown> = {}, needsAuth = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${idToken}`;
    } catch {
      // Ignored if unable to fetch token
    }
  } else if (needsAuth) {
    throw new Error('Authentication required for this operation');
  }

  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return data as T;
}

// -------------------------------------------------------------
// 1. Uploads & Audio Access (/api/upload, /api/upload-avatar)
// -------------------------------------------------------------

export interface UploadSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  publicId: string;
  uploadPreset: string;
  type?: 'authenticated' | 'upload';
  previewUrl?: string;
}

export async function getUploadSignature(
  fileName: string,
  kind: 'beat' | 'cover'
): Promise<UploadSignatureResponse> {
  return postApi<UploadSignatureResponse>('upload', { fileName, kind }, true);
}

export async function getFullAudioUrl(beatId: string): Promise<{ url: string }> {
  return postApi<{ url: string }>('upload', { action: 'full', beatId }, true);
}

export async function getAvatarUploadSignature(
  fileName: string
): Promise<UploadSignatureResponse> {
  return postApi<UploadSignatureResponse>('upload-avatar', { fileName }, true);
}

/**
 * Upload directly from the browser to Cloudinary using signed credentials
 */
export async function directUploadToCloudinary(
  file: File,
  signatureData: UploadSignatureResponse,
  isAudio: boolean
): Promise<{ secure_url: string; public_id: string }> {
  const resourceType = isAudio ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', String(signatureData.timestamp));
  formData.append('signature', signatureData.signature);
  formData.append('public_id', signatureData.publicId);
  formData.append('upload_preset', signatureData.uploadPreset);

  if (isAudio && signatureData.type === 'authenticated') {
    formData.append('type', 'authenticated');
  }

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Cloudinary upload failed (${res.status})`);
  }

  return res.json();
}

// -------------------------------------------------------------
// 2. Payments (/api/verify-payment, /api/verify-plan-payment, /api/cancel-plan)
// -------------------------------------------------------------

export interface VerifyPaymentResponse {
  success: boolean;
  alreadyProcessed: boolean;
  reference: string;
  beatId: string;
  tier: 'standard' | 'exclusive';
  amountPaidNaira: number;
  currency: string;
  audioUrl?: string;
}

export async function verifyBeatPayment(reference: string): Promise<VerifyPaymentResponse> {
  return postApi<VerifyPaymentResponse>('verify-payment', { reference });
}

export interface VerifyPlanResponse {
  success: boolean;
  tier: string;
  subscriptionCode?: string;
  alreadyProcessed?: boolean;
}

export async function verifyPlanPayment(
  reference: string,
  tier: 'pro15' | 'pro7' | 'pro25' = 'pro15'
): Promise<VerifyPlanResponse> {
  return postApi<VerifyPlanResponse>('verify-plan-payment', { reference, tier }, true);
}

export interface CancelPlanResponse {
  success: boolean;
  accessUntil: string;
}

export async function cancelPlan(): Promise<CancelPlanResponse> {
  return postApi<CancelPlanResponse>('cancel-plan', {}, true);
}

// -------------------------------------------------------------
// 3. Bank Account (/api/bank-account)
// -------------------------------------------------------------

export interface BankItem {
  name: string;
  code: string;
}

export async function listBanks(): Promise<BankItem[]> {
  const data = await postApi<{ banks: BankItem[] }>('bank-account', { action: 'list' });
  return data.banks || [];
}

export async function resolveBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{ accountName: string; accountNumber: string }> {
  return postApi<{ accountName: string; accountNumber: string }>('bank-account', {
    action: 'resolve',
    accountNumber,
    bankCode,
  });
}

export async function saveBankAccount(
  accountNumber: string,
  bankCode: string,
  bankName: string
): Promise<{ success: boolean; accountName: string }> {
  return postApi<{ success: boolean; accountName: string }>(
    'bank-account',
    {
      action: 'save',
      accountNumber,
      bankCode,
      bankName,
    },
    true
  );
}

// -------------------------------------------------------------
// 4. Referrals (/api/link-referral)
// -------------------------------------------------------------

export interface LinkReferralResponse {
  linked: boolean;
  referrerType?: 'users' | 'waitlist';
  reason?: string;
}

export async function linkReferral(pendingRef: string): Promise<LinkReferralResponse> {
  return postApi<LinkReferralResponse>('link-referral', { pendingRef }, true);
}

// -------------------------------------------------------------
// 5. NERO AI (/api/nero)
// -------------------------------------------------------------

export interface NeroMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface NeroResponse {
  content?: Array<{ type: string; text: string }>;
  mode?: 'fallback' | 'live';
}

export async function askNero(messages: NeroMessage[]): Promise<string> {
  const data = await postApi<NeroResponse>('nero', { messages });
  if (data?.content?.[0]?.text) {
    return data.content[0].text;
  }
  return "NERO is updating. Please check back shortly for full recommendations.";
}
