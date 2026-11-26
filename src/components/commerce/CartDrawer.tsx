import React, { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Landmark,
  ShoppingBag,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateCoverDataUri } from '../../utils/artwork';
import { formatPrice } from '../../utils/format';
import { initiatePaystackPayment } from '../../utils/paystack';

export const CartDrawer: React.FC = () => {
  const {
    cartOpen,
    setCartOpen,
    cart,
    removeFromCart,
    cartSubtotalUsd,
    bundleDiscountUsd,
    cartTotalUsd,
    currency,
    setCurrency,
    completeCheckout,
    navigate,
    beats,
    currentUser,
    openAuthModal,
    showToast,
  } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paystack'>(
    currency === 'NGN' ? 'paystack' : 'card'
  );
  const [checkedOut, setCheckedOut] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!cartOpen) return null;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!currentUser) {
      showToast('Please sign in to complete checkout and secure license records', 'info');
      openAuthModal('signin');
      return;
    }

    if (paymentMethod === 'paystack') {
      const firstItem = cart[0];
      const beat = beats.find((b) => b.id === firstItem.beatId);
      if (!beat) return;

      const approxNaira = Math.round(cartTotalUsd * 1550); // Live or fallback USD->NGN
      const tierType = firstItem.tierId === 'exclusive' ? 'exclusive' : 'standard';

      setProcessing(true);
      try {
        await initiatePaystackPayment({
          email: currentUser.email || 'customer@klave.app',
          amountNaira: approxNaira,
          beatId: beat.id,
          buyerId: currentUser.uid,
          tier: tierType,
          onSuccess: (res) => {
            setProcessing(false);
            completeCheckout();
            setCheckedOut(true);
            showToast(`Payment verified! Reference: ${res.reference}`, 'success');
          },
          onClose: () => {
            setProcessing(false);
            showToast('Checkout cancelled', 'info');
          },
          onError: (err) => {
            setProcessing(false);
            showToast(err.message || 'Payment verification failed', 'info');
          },
        });
      } catch (err: unknown) {
        setProcessing(false);
        const e = err as { message?: string };
        showToast(e.message || 'Unable to initialize checkout', 'info');
      }
    } else {
      // Standard card checkout flow
      completeCheckout();
      setCheckedOut(true);
    }
  };

  const handleClose = () => {
    setCheckedOut(false);
    setCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div
        className="flex h-full w-full max-w-md flex-col border-l shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-strong)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-base font-bold">Licensing Cart ({cart.length})</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrency(currency === 'USD' ? 'NGN' : 'USD')}
              className="cursor-pointer rounded-md border px-2 py-1 font-mono-tech text-xs font-semibold"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {currency === 'USD' ? '$ USD' : '₦ NGN'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close cart"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border"
              style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {checkedOut ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-ice)' }}
              >
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold">Licenses Unlocked</h3>
              <p className="mt-2 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
                Your master audio, PDF agreements, and stem archives are stored in your Profile library.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  navigate('profile');
                }}
                className="mt-6 cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                View Purchased Licenses
              </button>
            </div>
          ) : cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-3 h-10 w-10" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold">Your crate is empty</p>
              <p className="mt-1 max-w-xs text-xs" style={{ color: 'var(--text-secondary)' }}>
                Select any stem-verified beat and choose MP3, WAV, Trackout Stems, or Exclusive rights.
                Add 2+ beats to unlock a 15% bundle discount.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const beat = beats.find((b) => b.id === item.beatId);
                if (!beat) return null;
                const tier = beat.licenses[item.tierId];
                const cover = generateCoverDataUri(beat.coverSeed, beat.palette, `${beat.bpm}`);
                return (
                  <div
                    key={item.beatId}
                    className="flex items-center justify-between gap-3 rounded-xl border p-3"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={cover} alt={beat.title} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold">{beat.title}</div>
                        <div className="truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {tier.name} · {beat.producerName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="font-mono-tech text-sm font-bold">
                        {formatPrice(tier.priceUsd, currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.beatId)}
                        aria-label={`Remove ${beat.title}`}
                        className="cursor-pointer rounded p-1 transition hover:opacity-75"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Payment Rail Selector */}
              <div className="pt-4">
                <span className="block font-mono-tech text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Payment Rail
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold"
                    style={{
                      backgroundColor: paymentMethod === 'card' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: paymentMethod === 'card' ? 'var(--accent-ice)' : 'var(--text-secondary)',
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                    Simulated / Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paystack')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold"
                    style={{
                      backgroundColor: paymentMethod === 'paystack' ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: paymentMethod === 'paystack' ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: paymentMethod === 'paystack' ? 'var(--accent-ice)' : 'var(--text-secondary)',
                    }}
                  >
                    <Landmark className="h-4 w-4" />
                    Paystack / NGN
                  </button>
                </div>

                {paymentMethod === 'paystack' && (
                  <div
                    className="mt-3 flex items-start gap-2 rounded-md border p-2.5 text-[11px]"
                    style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>
                      Paystack is configured with live keys. Test charges verify server-side in <code>/api/verify-payment</code>.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && !checkedOut && (
          <div
            className="space-y-3 border-t p-5"
            style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span className="font-mono-tech">{formatPrice(cartSubtotalUsd, currency)}</span>
              </div>
              {bundleDiscountUsd > 0 && (
                <div className="flex justify-between font-medium" style={{ color: 'var(--accent-ice)' }}>
                  <span>Multi-Beat Bundle (15% off)</span>
                  <span className="font-mono-tech">-{formatPrice(bundleDiscountUsd, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-sm font-bold" style={{ borderColor: 'var(--border-subtle)' }}>
                <span>Total</span>
                <span className="font-mono-tech text-base">{formatPrice(cartTotalUsd, currency)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={processing}
              onClick={handleCheckout}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to Paystack...</span>
                </>
              ) : (
                `Complete Checkout · ${formatPrice(cartTotalUsd, currency)}`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
