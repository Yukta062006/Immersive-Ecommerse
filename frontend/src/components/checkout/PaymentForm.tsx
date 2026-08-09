'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PaymentFormProps {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  userName: string;
  userEmail: string;
  onPaymentSuccess: (data: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) => void;
  onPaymentError: (error: string) => void;
  isLoading?: boolean;
}

interface RazorpayPaymentDetails {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayPaymentDetails) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  on: (event: 'payment.failed', handler: (response: { error?: { description?: string } }) => void) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export default function PaymentForm({
  orderId,
  razorpayOrderId,
  amount,
  currency,
  userName,
  userEmail,
  onPaymentSuccess,
  onPaymentError,
  isLoading = false,
}: PaymentFormProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        // SDK already loaded — clear any previous error and reuse
        setError(null);
        resolve(true);
        return;
      }

      const scriptLoad = new Promise<boolean>((resolveScript) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolveScript(true);
        script.onerror = () => resolveScript(false);
        document.body.appendChild(script);
      });

      const timeout = new Promise<boolean>((resolveTimeout) => {
        setTimeout(() => resolveTimeout(false), 10000);
      });

      Promise.race([scriptLoad, timeout]).then((result) => {
        resolve(result);
      });
    });
  };

  const handlePayNow = async () => {
    setIsOpening(true);
    setError(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      const errorMsg = 'Failed to load Razorpay. Please check your internet connection.';
      setError(errorMsg);
      onPaymentError(errorMsg);
      setIsOpening(false);
      return;
    }

    // Key validation before opening modal
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      const errorMsg = 'Payment configuration is missing';
      setError(errorMsg);
      onPaymentError(errorMsg);
      setIsOpening(false);
      return;
    }

    const options = {
      key: razorpayKey,
      amount,
      currency,
      name: 'Immersive',
      description: `Order ${orderId.slice(-8)}`,
      order_id: razorpayOrderId,
      prefill: {
        name: userName,
        email: userEmail,
      },
      theme: {
        color: '#4f46e5',
      },
      handler: function (response: RazorpayPaymentDetails) {
        onPaymentSuccess({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          // Immediately reset on dismiss regardless of background state
          setIsOpening(false);
          onPaymentError('Payment cancelled');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: { error?: { description?: string } }) {
      setIsOpening(false);
      onPaymentError(response.error?.description || 'Payment failed');
    });
    rzp.open();
  };

  const getButtonLabel = () => {
    if (isLoading) return 'Verifying...';
    if (isOpening) return 'Opening payment gateway...';
    return 'Pay Now';
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">₹</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Razorpay Secure Payment</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">UPI, Cards, Wallets & Net Banking</p>
          </div>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>Amount: <span className="font-semibold text-gray-900 dark:text-white">₹{(amount / 100).toFixed(2)}</span></p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={handlePayNow}
        disabled={isLoading || isOpening}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {getButtonLabel()}
      </motion.button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Secured by Razorpay. 100+ payment methods supported.
      </p>
    </div>
  );
}
