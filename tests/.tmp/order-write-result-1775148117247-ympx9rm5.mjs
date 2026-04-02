export class InvalidAtomicOrderWriteResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidAtomicOrderWriteResponseError";
    }
}
function ensureString(value, field) {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new InvalidAtomicOrderWriteResponseError(`Invalid RPC response: ${field} must be a non-empty string.`);
    }
    return value;
}
function ensureNumber(value, field) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new InvalidAtomicOrderWriteResponseError(`Invalid RPC response: ${field} must be a finite number.`);
    }
    return Math.round(value);
}
function normalizeFieldErrors(value) {
    if (!value || typeof value !== "object" || Array.isArray(value))
        return {};
    const output = {};
    for (const [key, raw] of Object.entries(value)) {
        if (Array.isArray(raw)) {
            const messages = raw.filter((entry) => typeof entry === "string");
            if (messages.length > 0)
                output[key] = messages;
            continue;
        }
        if (typeof raw === "string" && raw.length > 0) {
            output[key] = [raw];
        }
    }
    return output;
}
function parseResultPayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        throw new InvalidAtomicOrderWriteResponseError("Invalid RPC response: response_payload must be an object.");
    }
    const row = payload;
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
export function parseAtomicOrderWriteRpcRow(row) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new InvalidAtomicOrderWriteResponseError("Invalid RPC response: row must be an object.");
    }
    const payload = row;
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
