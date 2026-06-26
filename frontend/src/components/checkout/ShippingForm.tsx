'use client';

import { useState } from 'react';
import { ShippingAddress } from '@/types/order';
import AnimatedInput from '@/components/ui/AnimatedInput';

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  isLoading?: boolean;
}

export default function ShippingForm({ onSubmit, isLoading = false }: ShippingFormProps) {
  const [form, setForm] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.firstName) newErrors.firstName = 'Required';
    if (!form.lastName) newErrors.lastName = 'Required';
    if (!form.address1) newErrors.address1 = 'Required';
    if (!form.city) newErrors.city = 'Required';
    if (!form.state) newErrors.state = 'Required';
    if (!form.zip) newErrors.zip = 'Required';
    if (!form.phone) newErrors.phone = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const update = (field: keyof ShippingAddress) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <AnimatedInput
          label="First Name"
          value={form.firstName}
          onChange={update('firstName')}
          error={errors.firstName}
          required
        />
        <AnimatedInput
          label="Last Name"
          value={form.lastName}
          onChange={update('lastName')}
          error={errors.lastName}
          required
        />
      </div>

      <AnimatedInput
        label="Address Line 1"
        value={form.address1}
        onChange={update('address1')}
        error={errors.address1}
        required
      />

      <AnimatedInput
        label="Address Line 2 (Optional)"
        value={form.address2 || ''}
        onChange={update('address2')}
      />

      <div className="grid grid-cols-2 gap-4">
        <AnimatedInput
          label="City"
          value={form.city}
          onChange={update('city')}
          error={errors.city}
          required
        />
        <AnimatedInput
          label="State"
          value={form.state}
          onChange={update('state')}
          error={errors.state}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatedInput
          label="ZIP Code"
          value={form.zip}
          onChange={update('zip')}
          error={errors.zip}
          required
        />
        <AnimatedInput
          label="Phone"
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Creating Order...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
