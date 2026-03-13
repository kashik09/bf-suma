"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import { submitOrderIntake } from "@/services/storefront-api";

const DELIVERY_FEE = 5000;

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(() => subtotal + (items.length > 0 ? DELIVERY_FEE : 0), [items.length, subtotal]);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      deliveryAddress: "",
      notes: ""
    }
  });

  async function onSubmit(values: CheckoutInput) {
    if (items.length === 0) {
      setResultMessage("Your cart is empty. Add products before checkout.");
      setResultStatus("error");
      return;
    }

    try {
      setIsSubmitting(true);
      setResultMessage(null);
      setResultStatus(null);

      const response = await submitOrderIntake({
        ...values,
        items,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total
      });

      if (response.persisted !== true) {
        setResultMessage(response.message || "Order was not saved. Your cart is still available.");
        setResultStatus("error");
        return;
      }

      clear();
      form.reset();
      setResultMessage(response.message || "Order saved successfully.");
      setResultStatus("success");
    } catch (error) {
      setResultMessage(
        error instanceof Error
          ? error.message
          : "Could not submit order. It was not saved, and your cart is still available."
      );
      setResultStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">No items to checkout</h2>
        <p className="mt-2 text-sm text-slate-600">Add items from the shop before placing an order.</p>
        <Link className="mt-4 inline-flex text-sm font-semibold text-brand-700" href="/shop">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[2fr_1fr]" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Customer and Delivery Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField error={form.formState.errors.firstName?.message} htmlFor="firstName" label="First Name">
            <Input id="firstName" {...form.register("firstName")} />
          </FormField>

          <FormField error={form.formState.errors.lastName?.message} htmlFor="lastName" label="Last Name">
            <Input id="lastName" {...form.register("lastName")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField error={form.formState.errors.email?.message} htmlFor="email" label="Email">
            <Input id="email" type="email" {...form.register("email")} />
          </FormField>

          <FormField error={form.formState.errors.phone?.message} htmlFor="phone" label="Phone">
            <Input id="phone" {...form.register("phone")} />
          </FormField>
        </div>

        <FormField
          error={form.formState.errors.deliveryAddress?.message}
          htmlFor="deliveryAddress"
          label="Delivery Address"
        >
          <Textarea id="deliveryAddress" {...form.register("deliveryAddress")} />
        </FormField>

        <FormField error={form.formState.errors.notes?.message} htmlFor="notes" label="Order Notes (Optional)">
          <Textarea id="notes" {...form.register("notes")} />
        </FormField>
      </div>

      <aside className="h-fit space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
        {items.map((item) => (
          <div className="flex items-center justify-between text-sm" key={item.product_id}>
            <span className="line-clamp-1 text-slate-600">
              {item.name} x {item.quantity}
            </span>
            <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}

        <div className="border-t border-slate-200 pt-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-slate-600">Delivery Fee</span>
            <span className="font-medium">{formatCurrency(DELIVERY_FEE)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Submitting order..." : "Place Order"}
        </Button>

        {resultMessage ? (
          <p className={`text-sm ${resultStatus === "success" ? "text-emerald-700" : "text-rose-700"}`}>
            {resultMessage}
          </p>
        ) : null}
      </aside>
    </form>
  );
}
