export interface AtomicOrderWriteResultPayload {
  orderId: string;
  orderNumber: string;
  receivedAt: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
}

export interface AtomicOrderWriteRpcRow {
  result_code: string;
  message: string | null;
  response_payload: unknown;
  field_errors: unknown;
}

export type AtomicOrderWriteDecision =
  | { kind: "created"; result: AtomicOrderWriteResultPayload }
  | { kind: "replayed"; result: AtomicOrderWriteResultPayload }
  | { kind: "conflict"; message: string }
  | { kind: "in_progress"; message: string }
  | { kind: "temporary_failure"; message: string }
  | { kind: "rejected"; message: string; fieldErrors: Record<string, string[]> };

export class InvalidAtomicOrderWriteResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidAtomicOrderWriteResponseError";
  }
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new InvalidAtomicOrderWriteResponseError(`Invalid RPC response: ${field} must be a non-empty string.`);
  }
  return value;
}

function ensureNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidAtomicOrderWriteResponseError(`Invalid RPC response: ${field} must be a finite number.`);
  }
  return Math.round(value);
}

function normalizeFieldErrors(value: unknown): Record<string, string[]> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const output: Record<string, string[]> = {};

  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(raw)) {
      const messages = raw.filter((entry): entry is string => typeof entry === "string");
      if (messages.length > 0) output[key] = messages;
      continue;
    }

    if (typeof raw === "string" && raw.length > 0) {
      output[key] = [raw];
    }
  }

  return output;
}

function parseResultPayload(payload: unknown): AtomicOrderWriteResultPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new InvalidAtomicOrderWriteResponseError("Invalid RPC response: response_payload must be an object.");
  }

  const row = payload as Record<string, unknown>;

  return {
    orderId: ensureString(row.orderId, "response_payload.orderId"),
    orderNumber: ensureString(row.orderNumber, "response_payload.orderNumber"),
    receivedAt: ensureString(row.receivedAt, "response_payload.receivedAt"),
    subtotal: ensureNumber(row.subtotal, "response_payload.subtotal"),
    deliveryFee: ensureNumber(row.deliveryFee, "response_payload.deliveryFee"),
    total: ensureNumber(row.total, "response_payload.total"),
    currency: ensureString(row.currency, "response_payload.currency")
  };
}

export function parseAtomicOrderWriteRpcRow(row: unknown): AtomicOrderWriteDecision {
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new InvalidAtomicOrderWriteResponseError("Invalid RPC response: row must be an object.");
  }

  const payload = row as Record<string, unknown>;
  const resultCode = ensureString(payload.result_code, "result_code");
  const message = typeof payload.message === "string" && payload.message.trim().length > 0
    ? payload.message
    : "Order processing result unavailable.";

  if (resultCode === "CREATED") {
    return { kind: "created", result: parseResultPayload(payload.response_payload) };
  }

  if (resultCode === "REPLAYED") {
    return { kind: "replayed", result: parseResultPayload(payload.response_payload) };
  }

  if (resultCode === "CONFLICT") {
    return { kind: "conflict", message };
  }

  if (resultCode === "IN_PROGRESS") {
    return { kind: "in_progress", message };
  }

  if (resultCode === "REJECTED") {
    return {
      kind: "rejected",
      message,
      fieldErrors: normalizeFieldErrors(payload.field_errors)
    };
  }

  if (resultCode === "TEMPORARY_FAILURE") {
    return { kind: "temporary_failure", message };
  }

  throw new InvalidAtomicOrderWriteResponseError(`Invalid RPC response: unsupported result_code '${resultCode}'.`);
}
