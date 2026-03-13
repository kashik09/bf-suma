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
const PICKUP_LOCATIONS = [
  "Main Store - Lubowa",
  "Main Store - Kampala",
  "Main Store - Entebbe"
];

export function CheckoutForm() {
  const { items, subtotal, clear } = useCart();
  const { toast } = useToast();
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"success" | "error" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      fulfillmentType: "delivery",
      deliveryAddress: "",
      pickupLocation: PICKUP_LOCATIONS[0],
      paymentMethod: "pay_on_delivery",
      notes: ""
    }
  });

  const watchedFirstName = form.watch("firstName");
  const watchedLastName = form.watch("lastName");
  const watchedPhone = form.watch("phone");
  const watchedEmail = form.watch("email");
  const watchedFulfillmentType = form.watch("fulfillmentType");
  const watchedDeliveryAddress = form.watch("deliveryAddress");
  const watchedPickupLocation = form.watch("pickupLocation");
  const watchedPaymentMethod = form.watch("paymentMethod");
  const isPickup = watchedFulfillmentType === "pickup";
  const deliveryFee = items.length > 0 && !isPickup ? DELIVERY_FEE : 0;

  const total = useMemo(() => subtotal + deliveryFee, [deliveryFee, subtotal]);

  const attentionItems = useMemo(() => {
    const itemsToFix: string[] = [];
    if (!watchedFirstName?.trim()) itemsToFix.push("Add first name");
    if (!watchedLastName?.trim()) itemsToFix.push("Add last name");
    if (!watchedPhone?.trim()) itemsToFix.push("Add phone number");
    if (!watchedEmail?.trim()) itemsToFix.push("Add email address");
    if (watchedFulfillmentType === "pickup") {
      if (!watchedPickupLocation?.trim()) itemsToFix.push("Choose pickup location");
    } else if (!watchedDeliveryAddress?.trim()) {
      itemsToFix.push("Add delivery address");
    }
    if (!watchedPaymentMethod) itemsToFix.push("Choose payment method");
    return itemsToFix;
  }, [
    watchedDeliveryAddress,
    watchedEmail,
    watchedFirstName,
    watchedFulfillmentType,
    watchedLastName,
    watchedPaymentMethod,
    watchedPhone,
    watchedPickupLocation
  ]);

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
        deliveryFee,
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
        description:
          values.paymentMethod === "pay_now"
            ? `${successMessage} We will contact you right away to complete payment.`
            : successMessage,
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
            <h2 className="text-lg font-semibold text-slate-900">Fulfillment and Payment</h2>
            <p className="text-sm text-slate-600">Choose how you want to receive and pay for your order.</p>
          </div>

          <fieldset className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Fulfillment</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <input type="radio" value="delivery" {...form.register("fulfillmentType")} />
                Delivery
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <input type="radio" value="pickup" {...form.register("fulfillmentType")} />
                Pickup
              </label>
            </div>
          </fieldset>

          {isPickup ? (
            <FormField
              error={form.formState.errors.pickupLocation?.message}
              htmlFor="pickupLocation"
              label="Pickup Location"
            >
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-600 focus:outline-none"
                id="pickupLocation"
                {...form.register("pickupLocation")}
              >
                {PICKUP_LOCATIONS.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </FormField>
          ) : (
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
          )}

          <fieldset className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Payment Method</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <input type="radio" value="pay_on_delivery" {...form.register("paymentMethod")} />
                <span>
                  <span className="block font-medium text-slate-900">{isPickup ? "Pay at pickup" : "Pay on delivery"}</span>
                  <span className="block text-xs text-slate-500">Pay with cash or mobile money when order arrives.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <input type="radio" value="pay_now" {...form.register("paymentMethod")} />
                <span>
                  <span className="block font-medium text-slate-900">Pay now</span>
                  <span className="block text-xs text-slate-500">We will contact you immediately to complete payment.</span>
                </span>
              </label>
            </div>
          </fieldset>

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
              <span className="text-slate-600">{isPickup ? "Pickup Fee" : "Delivery Fee"}</span>
              <span className="font-medium">{isPickup ? "Free" : formatCurrency(deliveryFee)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {watchedPaymentMethod === "pay_now"
              ? "Pay-now requests are confirmed directly by our team after order submission."
              : isPickup
                ? "You can pay when you collect your order."
                : "You can pay when your order is delivered."}
          </p>

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
