import { Card, SectionHeader } from "@/components/ui";
import { requireAdminSession } from "@/lib/admin-server";
import { SUPPORT_EMAIL, SUPPORT_PHONE } from "@/lib/constants";

export default async function AdminGuidePage() {
  await requireAdminSession(["SUPER_ADMIN", "OPERATIONS", "SUPPORT"]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin Guide"
        description="Quick operating guide for daily admin work."
      />

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Manage Orders</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li><code className="font-mono">PENDING</code>: New order waiting for confirmation.</li>
          <li><code className="font-mono">CONFIRMED</code>: Customer details verified, ready for processing.</li>
          <li><code className="font-mono">PROCESSING</code>: Order is being prepared.</li>
          <li><code className="font-mono">OUT_FOR_DELIVERY</code>: Rider or delivery team has picked up the order.</li>
          <li><code className="font-mono">DELIVERED</code>: Order reached the customer successfully.</li>
          <li><code className="font-mono">CANCELED</code>: Order will not be fulfilled.</li>
        </ul>
        <p className="text-sm text-slate-700">
          Update status from the order detail page and add a short note when a status changes.
        </p>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Manage Products</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Create products from <code className="font-mono">Products -&gt; New Product</code>.</li>
          <li>Keep name, SKU, price, category, and stock quantity accurate.</li>
          <li>Use <code className="font-mono">ACTIVE</code> for sellable items, <code className="font-mono">OUT_OF_STOCK</code> when inventory is zero.</li>
          <li>Use <code className="font-mono">DRAFT</code> while preparing content and <code className="font-mono">ARCHIVED</code> for retired products.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Handle Contacts and Reviews</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Contacts: move inquiries from <code className="font-mono">NEW</code> to <code className="font-mono">IN_PROGRESS</code>, then <code className="font-mono">RESOLVED</code> or <code className="font-mono">CLOSED</code>.</li>
          <li>Reviews: approve helpful and accurate feedback, reject spam or abusive content.</li>
          <li>Always review customer context before approving or rejecting anything.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">System Health Warnings</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li><code className="font-mono">HEALTHY</code>: No action required.</li>
          <li><code className="font-mono">WARNING</code>: The system is still running, but something needs attention soon.</li>
          <li><code className="font-mono">CRITICAL</code>: Important data or services are unavailable. Resolve immediately.</li>
        </ul>
        <p className="text-sm text-slate-700">
          Open each warning action link to fix the affected area.
        </p>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Search &amp; Analytics Setup</h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
          <li>Open <code className="font-mono">search.google.com/search-console</code>.</li>
          <li>Add your website domain as a property.</li>
          <li>Choose the HTML meta tag option and copy the <code className="font-mono">content</code> token value.</li>
          <li>Paste that value into <code className="font-mono">NEXT_PUBLIC_GSC_VERIFICATION_TOKEN</code> and redeploy.</li>
          <li>Return to Search Console and click <strong>Verify</strong>.</li>
          <li>Open the <strong>Sitemaps</strong> tab and submit <code className="font-mono">[SITE_URL]/sitemap.xml</code>.</li>
          <li>Check indexing status again after 3 to 5 days.</li>
        </ol>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">Google Analytics (GA4) Basics</h3>
        <p className="text-sm text-slate-700">
          Set <code className="font-mono">NEXT_PUBLIC_GA4_MEASUREMENT_ID</code> to your GA4 ID (starts with <code className="font-mono">G-</code>) and redeploy.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Find reports in GA4 under <strong>Reports -&gt; Acquisition</strong> and <strong>Reports -&gt; Engagement</strong>.</li>
          <li>Use <strong>Explore -&gt; Funnel exploration</strong> to view drop-off between add to cart, checkout, and purchase.</li>
          <li>Go to <strong>Configure -&gt; Events</strong> to confirm tracked events are arriving.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">What Tracked Events Mean</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li><code className="font-mono">add_to_cart</code>: A visitor added a product to cart.</li>
          <li><code className="font-mono">begin_checkout</code>: A visitor opened checkout.</li>
          <li><code className="font-mono">purchase</code>: An order was successfully received.</li>
          <li><code className="font-mono">generate_lead</code>: Someone submitted the contact form.</li>
          <li><code className="font-mono">sign_up</code>: Someone subscribed to newsletter updates.</li>
        </ul>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">If Something Looks Broken</h3>
        <p className="text-sm text-slate-700">
          Contact technical support with a screenshot and the page URL.
        </p>
        <p className="text-sm text-slate-700">
          Support email: {SUPPORT_EMAIL}
        </p>
        <p className="text-sm text-slate-700">
          Support phone: {SUPPORT_PHONE}
        </p>
      </Card>
    </div>
  );
}
