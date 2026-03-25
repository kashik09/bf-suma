export type IdempotencyStatus = "IN_PROGRESS" | "SUCCEEDED" | "FAILED";

export interface IdempotencyDecisionRow {
  request_hash: string;
  status: IdempotencyStatus;
  expires_at: string;
  response_payload?: unknown;
}

export type IdempotencyDecision =
  | { kind: "initialize" }
  | { kind: "replay" }
  | { kind: "in_progress" }
  | { kind: "conflict" }
  | { kind: "recycle" };

function isExpired(expiresAt: string, nowMs: number): boolean {
  return new Date(expiresAt).getTime() <= nowMs;
}

export function evaluateIdempotencyDecision(
  row: IdempotencyDecisionRow | null,
  requestHash: string,
  nowMs: number = Date.now()
): IdempotencyDecision {
  if (!row) return { kind: "initialize" };

  const expired = isExpired(row.expires_at, nowMs);

  if (row.status === "SUCCEEDED") {
    if (row.request_hash !== requestHash) return { kind: "conflict" };
    return { kind: "replay" };
  }

  if (!expired && row.request_hash !== requestHash) {
    return { kind: "conflict" };
  }

  if (!expired && row.status === "IN_PROGRESS") {
    return { kind: "in_progress" };
  }

  return { kind: "recycle" };
}
