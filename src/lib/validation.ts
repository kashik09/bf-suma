import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().max(2000).optional(),
  sku: z.string().min(1).max(64),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stockQty: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED", "OUT_OF_STOCK"])
});

const checkoutSchemaBase = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Please enter your first name")
    .max(80, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Please enter your last name")
    .max(80, "Last name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address")
    .email("Your email address looks incomplete"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30, "Phone number is too long")
    .regex(/^\+?[0-9()\-\s]+$/, "Enter a valid phone number"),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  deliveryAddress: z
    .string()
    .trim()
    .max(255, "Delivery address is too long")
    .optional(),
  pickupLocation: z
    .string()
    .trim()
    .max(120, "Pickup location is too long")
    .optional(),
  paymentMethod: z.enum(["pay_on_delivery", "pay_now"]),
  notes: z
    .string()
    .trim()
    .max(500, "Notes are too long")
    .optional()
});

function validateCheckoutRefinement(
  data: z.infer<typeof checkoutSchemaBase>,
  ctx: z.RefinementCtx
) {
  if (data.fulfillmentType === "delivery") {
    if (!data.deliveryAddress || data.deliveryAddress.trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryAddress"],
        message: "Add at least an area or landmark we can find"
      });
    }
    return;
  }

  if (!data.pickupLocation || data.pickupLocation.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["pickupLocation"],
      message: "Choose a pickup location"
    });
  }
}

export const checkoutSchema = checkoutSchemaBase.superRefine(validateCheckoutRefinement);

export const cartItemSchema = z.object({
  product_id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  image_url: z.string().url(),
  quantity: z.number().int().min(1).max(99),
  max_quantity: z.number().int().min(0),
  availability: z.enum(["in_stock", "low_stock", "out_of_stock"])
});

export const orderIntakeSchema = checkoutSchemaBase.extend({
  items: z.array(cartItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().nonnegative()
}).superRefine(validateCheckoutRefinement);

export const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() === "") return undefined;
      return value;
    },
    z.string().email("Please enter a valid email").optional()
  ),
  phone: z.string().min(7, "Please enter a valid phone number").max(30),
  message: z.string().min(10, "Please tell us more about your inquiry").max(1200),
  source: z.string().default("contact_page")
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELED"
  ])
});

export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type OrderIntakeInput = z.infer<typeof orderIntakeSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
