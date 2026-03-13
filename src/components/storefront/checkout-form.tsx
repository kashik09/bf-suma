"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FormField } from "@/components/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/hooks/use-cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { formatCurrency } from "@/lib/utils";
import { submitOrderIntake } from "@/services/storefront-api";

const DELIVERY_FEE = 5000;

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const { toast } = useToast();
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

  const watchedFirstName = form.watch("firstName");
  const watchedLastName = form.watch("lastName");
  const watchedPhone = form.watch("phone");
  const watchedEmail = form.watch("email");
  const watchedDeliveryAddress = form.watch("deliveryAddress");

  const attentionItems = useMemo(() => {
    const itemsToFix: string[] = [];
    if (!watchedFirstName?.trim()) itemsToFix.push("Add first name");
    if (!watchedLastName?.trim()) itemsToFix.push("Add last name");
    if (!watchedPhone?.trim()) itemsToFix.push("Add phone number");
    if (!watchedEmail?.trim()) itemsToFix.push("Add email address");
    if (!watchedDeliveryAddress?.trim()) itemsToFix.push("Add delivery address");
    return itemsToFix;
  }, [watchedDeliveryAddress, watchedEmail, watchedFirstName, watchedLastName, watchedPhone]);

  const hasAttention = attentionItems.length > 0;

  async function onSubmit(values: CheckoutInput) {
    if (items.length === 0) {
      setResultMessage("Your cart is empty. Add products before checkout.");
      setResultStatus("error");
      toast({
        title: "Cart is empty",
        description: "Add products before placing an order.",
        variant: "error"
      });
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
        const message = response.message || "We couldn't place your order right now. Your cart is still available.";
        setResultMessage(message);
        setResultStatus("error");
        toast({
          title: "Order not placed",
          description: message,
          variant: "error"
        });
        return;
      }

      clear();
      form.reset();
      const successMessage = response.message || "Thanks, your order has been received.";
      setResultMessage(successMessage);
      setResultStatus("success");
      toast({
        title: "Order received",
        description: successMessage,
        variant: "success"
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "We couldn't place your order right now. Please try again.";
      setResultMessage(message);
      setResultStatus("error");
      toast({
        title: "Order not placed",
        description: message,
        variant: "error"
      });
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
    <form className="grid gap-6 lg:grid-cols-[1.7fr_1fr]" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Checkout Progress</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {hasAttention ? "Details needed before placing order" : "Details complete. Ready to place order"}
          </p>
          {hasAttention ? (
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {attentionItems.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <section className="space-y-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Customer Details</h2>
            <p className="text-sm text-slate-600">Tell us who to contact for this order.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField error={form.formState.errors.firstName?.message} htmlFor="firstName" label="First Name">
              <Input id="firstName" placeholder="Ashanti" {...form.register("firstName")} />
            </FormField>

            <FormField error={form.formState.errors.lastName?.message} htmlFor="lastName" label="Last Name">
              <Input id="lastName" placeholder="Kweyu" {...form.register("lastName")} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField error={form.formState.errors.email?.message} htmlFor="email" label="Email">
              <Input id="email" placeholder="you@example.com" type="email" {...form.register("email")} />
            </FormField>

            <FormField error={form.formState.errors.phone?.message} htmlFor="phone" label="Phone">
              <Input id="phone" placeholder="+256 700 000 000" {...form.register("phone")} />
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Delivery Details</h2>
            <p className="text-sm text-slate-600">Use an address we can locate quickly for smooth delivery.</p>
          </div>

          <FormField
            error={form.formState.errors.deliveryAddress?.message}
            htmlFor="deliveryAddress"
            label="Delivery Address"
          >
            <Textarea
              id="deliveryAddress"
              placeholder="Area, street, nearby landmark, and any useful directions"
              {...form.register("deliveryAddress")}
            />
          </FormField>

          <FormField error={form.formState.errors.notes?.message} htmlFor="notes" label="Delivery Note (Optional)">
            <Textarea
              id="notes"
              placeholder="Optional: gate color, floor, building name, or best call time"
              {...form.register("notes")}
            />
          </FormField>
        </section>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:h-fit">
        <div className={`rounded-lg border p-3 text-sm ${hasAttention ? "border-amber-300 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
          <p className="font-semibold text-slate-900">{hasAttention ? "Needs attention" : "Ready for submission"}</p>
          <p className="mt-1 text-xs text-slate-700">
            {hasAttention
              ? "Add the missing details listed on the left, then place your order."
              : "Your contact and delivery details look complete."}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft">
          <h3 className="text-base font-semibold text-slate-900">Order Summary</h3>
          <p className="mt-1 text-xs text-slate-500">{items.length} item(s) in this order</p>

          <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
            {items.map((item) => (
              <div className="flex items-center justify-between text-sm" key={item.product_id}>
                <span className="line-clamp-1 text-slate-600">
                  {item.name} x {item.quantity}
                </span>
                <span className="font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3 text-sm">
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

          <Button className="mt-4 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Placing order..." : "Place Order"}
          </Button>

          {resultMessage ? (
            <p className={`mt-3 text-sm ${resultStatus === "success" ? "text-emerald-700" : "text-rose-700"}`}>
              {resultMessage}
            </p>
          ) : null}
        </div>
      </aside>
    </form>
  );
}
