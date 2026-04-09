export interface WorkerResult {
  processed: number;
  sent: number;
  failed: number;
}

export interface AbandonedCartCandidate {
  id: string;
  customerEmail: string;
  customerName: string | null;
  cartItems: Array<{ name?: string; quantity?: number; price?: number }>;
  createdAt: string;
}

export interface ReviewRequestCandidate {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  total: number;
  currency: string;
  productName: string | null;
  productSlug: string | null;
}

export interface ReengagementCandidate {
  customerId: string;
  customerEmail: string;
  customerFirstName: string;
}

export async function processAbandonedCartLifecycle(params: {
  listCandidates: () => Promise<AbandonedCartCandidate[]>;
  markSent: (id: string, sentAtIso: string) => Promise<void>;
  sendEmail: (candidate: AbandonedCartCandidate) => Promise<boolean>;
  now?: Date;
}): Promise<WorkerResult> {
  const now = params.now || new Date();
  const candidates = await params.listCandidates();

  let sent = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      const ok = await params.sendEmail(candidate);
      if (!ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await params.markSent(candidate.id, now.toISOString());
    } catch {
      failed += 1;
    }
  }

  return {
    processed: candidates.length,
    sent,
    failed
  };
}

export async function processReviewRequestLifecycle(params: {
  listCandidates: () => Promise<ReviewRequestCandidate[]>;
  markSent: (orderId: string, sentAtIso: string) => Promise<void>;
  sendEmail: (candidate: ReviewRequestCandidate) => Promise<boolean>;
  now?: Date;
}): Promise<WorkerResult> {
  const now = params.now || new Date();
  const candidates = await params.listCandidates();

  let sent = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      const ok = await params.sendEmail(candidate);
      if (!ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await params.markSent(candidate.orderId, now.toISOString());
    } catch {
      failed += 1;
    }
  }

  return {
    processed: candidates.length,
    sent,
    failed
  };
}

export async function processReengagementLifecycle(params: {
  listCandidates: () => Promise<ReengagementCandidate[]>;
  markSent: (customerId: string, sentAtIso: string) => Promise<void>;
  sendEmail: (candidate: ReengagementCandidate) => Promise<boolean>;
  now?: Date;
}): Promise<WorkerResult> {
  const now = params.now || new Date();
  const candidates = await params.listCandidates();

  let sent = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      const ok = await params.sendEmail(candidate);
      if (!ok) {
        failed += 1;
        continue;
      }
      sent += 1;
      await params.markSent(candidate.customerId, now.toISOString());
    } catch {
      failed += 1;
    }
  }

  return {
    processed: candidates.length,
    sent,
    failed
  };
}
