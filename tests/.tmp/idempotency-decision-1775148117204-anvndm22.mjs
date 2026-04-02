function isExpired(expiresAt, nowMs) {
    return new Date(expiresAt).getTime() <= nowMs;
}
export function evaluateIdempotencyDecision(row, requestHash, nowMs = Date.now()) {
    if (!row)
        return { kind: "initialize" };
    const expired = isExpired(row.expires_at, nowMs);
    if (row.status === "SUCCEEDED") {
        if (row.request_hash !== requestHash)
            return { kind: "conflict" };
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
