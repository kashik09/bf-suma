import type { InquiryInput, OrderIntakeInput } from "@/lib/validation";
import type { Inquiry, OrderIntakeResponse } from "@/types";

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = (body && typeof body.message === "string" && body.message) || "Request failed";
    throw new Error(message);
  }

  return body as T;
}

export async function submitOrderIntake(payload: OrderIntakeInput): Promise<OrderIntakeResponse> {
  return requestJson<OrderIntakeResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function submitInquiry(payload: InquiryInput): Promise<Pick<Inquiry, "id" | "status">> {
  return requestJson<Pick<Inquiry, "id" | "status">>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
