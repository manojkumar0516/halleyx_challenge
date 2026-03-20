import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Button, Input, Select, Label, cn } from '../ui';
import { Product, OrderStatus, CreatedBy } from '../../types';

const PRODUCTS: { name: Product; price: number }[] = [
  { name: 'Fiber Internet 300 Mbps', price: 50 },
  { name: '5GUnlimited Mobile Plan', price: 60 },
  { name: 'Fiber Internet 1 Gbps', price: 100 },
  { name: 'Business Internet 500 Mbps', price: 150 },
  { name: 'VoIP Corporate Package', price: 200 },
];

const COUNTRIES = ['United States', 'Canada', 'Australia', 'Singapore', 'Hong Kong'];
const CREATORS: CreatedBy[] = ['Mr. Michael Harris', 'Mr. Ryan Cooper', 'Ms. Olivia Carter', 'Mr. Lucas Martin'];
const STATUSES: OrderStatus[] = ['Pending', 'In progress', 'Completed'];

interface OrderFormProps {
  onClose: () => void;
  orderId?: string;
}

export function OrderForm({ onClose, orderId }: OrderFormProps) {
  const { orders, addOrder, updateOrder } = useStore();
  const existingOrder = orderId ? orders.find((o) => o.id === orderId) : null;

  const [formData, setFormData] = useState({
    firstName: existingOrder?.firstName || '',
    lastName: existingOrder?.lastName || '',
    email: existingOrder?.email || '',
    phone: existingOrder?.phone || '',
    streetAddress: existingOrder?.streetAddress || '',
    city: existingOrder?.city || '',
    state: existingOrder?.state || '',
    postalCode: existingOrder?.postalCode || '',
    country: existingOrder?.country || COUNTRIES[0],
    product: existingOrder?.product || PRODUCTS[0].name,
    quantity: existingOrder?.quantity || 1,
    unitPrice: existingOrder?.unitPrice || PRODUCTS[0].price,
    status: existingOrder?.status || 'Pending' as OrderStatus,
    createdBy: existingOrder?.createdBy || CREATORS[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const selectedProduct = PRODUCTS.find((p) => p.name === formData.product);
    if (selectedProduct && !existingOrder) {
      setFormData((prev) => ({ ...prev, unitPrice: selectedProduct.price }));
    }
  }, [formData.product, existingOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'streetAddress', 'city', 'state', 'postalCode'];
    
    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'Please fill the field';
      }
    });

    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity cannot be less than 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (existingOrder) {
      updateOrder(existingOrder.id, formData);
    } else {
      addOrder(formData);
    }
    onClose();
  };

  const totalAmount = formData.quantity * formData.unitPrice;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Customer Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>First Name *</Label>
            <Input name="firstName" value={formData.firstName} onChange={handleChange} className={cn(errors.firstName && 'border-red-500')} />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div className="space-y-1">
            <Label>Last Name *</Label>
            <Input name="lastName" value={formData.lastName} onChange={handleChange} className={cn(errors.lastName && 'border-red-500')} />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email ID *</Label>
            <Input type="email" name="email" value={formData.email} onChange={handleChange} className={cn(errors.email && 'border-red-500')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <Label>Phone Number *</Label>
            <Input name="phone" value={formData.phone} onChange={handleChange} className={cn(errors.phone && 'border-red-500')} />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <Label>Street Address *</Label>
            <Input name="streetAddress" value={formData.streetAddress} onChange={handleChange} className={cn(errors.streetAddress && 'border-red-500')} />
            {errors.streetAddress && <p className="text-xs text-red-500">{errors.streetAddress}</p>}
          </div>
          <div className="space-y-1">
            <Label>City *</Label>
            <Input name="city" value={formData.city} onChange={handleChange} className={cn(errors.city && 'border-red-500')} />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>
          <div className="space-y-1">
            <Label>State / Province *</Label>
            <Input name="state" value={formData.state} onChange={handleChange} className={cn(errors.state && 'border-red-500')} />
            {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
          </div>
          <div className="space-y-1">
            <Label>Postal Code *</Label>
            <Input name="postalCode" value={formData.postalCode} onChange={handleChange} className={cn(errors.postalCode && 'border-red-500')} />
            {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode}</p>}
          </div>
          <div className="space-y-1">
            <Label>Country *</Label>
            <Select name="country" value={formData.country} onChange={handleChange}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Order Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2 space-y-1">
            <Label>Product *</Label>
            <Select name="product" value={formData.product} onChange={handleChange}>
              {PRODUCTS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Quantity *</Label>
            <Input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className={cn(errors.quantity && 'border-red-500')} />
            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
          </div>
          <div className="space-y-1">
            <Label>Unit Price ($) *</Label>
            <Input type="number" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} />
          </div>
          <div className="space-y-1">
            <Label>Total Amount</Label>
            <Input type="text" readOnly value={`$${totalAmount.toFixed(2)}`} className="bg-slate-50" />
          </div>
          <div className="space-y-1">
            <Label>Status *</Label>
            <Select name="status" value={formData.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="col-span-1 md:col-span-2 space-y-1">
            <Label>Created By *</Label>
            <Select name="createdBy" value={formData.createdBy} onChange={handleChange}>
              {CREATORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
        <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button className="w-full sm:w-auto" type="submit">{existingOrder ? 'Update Order' : 'Create Order'}</Button>
      </div>
    </form>
  );
}
