/* BF Suma — Admin dashboard views */
const { useState: aUse } = React;

const ADMIN_NAV = [
  { group: "Overview" },
  { id: "overview", label: "Dashboard", icon: "home" },
  { id: "analytics", label: "Reports & Analytics", icon: "chart" },
  { group: "Commerce" },
  { id: "orders", label: "Orders", icon: "bag", badge: BF.ADMIN_METRICS.pendingOrders },
  { id: "products", label: "Products", icon: "box", badge: BF.ADMIN_METRICS.lowStock, badgeTone: "rose" },
  { id: "packages", label: "Health Packages", icon: "layers" },
  { id: "discounts", label: "Promotions", icon: "percent" },
  { group: "People" },
  { id: "customers", label: "Customers", icon: "users" },
  { id: "partners", label: "Partners", icon: "award" },
  { group: "Content" },
  { id: "blog", label: "Blog & Insights", icon: "file" },
];

/* ---------------- Overview ---------------- */
function AdminOverview({ navigate }) {
  const M = BF.ADMIN_METRICS;
  return (
    <div className="bf-page fade-in">
      <PageHead title="Good morning, Admin 👋" sub="Here's how BF Suma Uganda is performing this month.">
        <Btn variant="outline" icon="download" size="md">Export</Btn>
        <Btn variant="primary" icon="plus" size="md" onClick={() => navigate("products")}>Add product</Btn>
      </PageHead>

      <div className="bf-grid g-4" style={{ marginBottom: 16 }}>
        <Stat label="Revenue this month" value={shortMoney(M.revenueMonth)} delta={M.revenueDelta} icon="trending" accent="green" spark={BF.SALES_12W.slice(-8)} />
        <Stat label="Orders" value={M.orders} delta={M.ordersDelta} icon="bag" accent="blue" spark={BF.ORDERS_12W.slice(-8)} />
        <Stat label="Avg. order value" value={shortMoney(M.aov)} delta={M.aovDelta} icon="card" accent="amber" footer={M.conversion + "% checkout conversion"} />
        <Stat label="Active partners" value={M.partnersActive + " / " + M.partners} icon="award" accent="purple" footer="2 payouts pending review" />
      </div>

      <div className="bf-row" style={{ marginBottom: 16 }}>
        <Card style={{ flex: 2 }}>
          <div className="bf-card-head">
            <div><h3 className="bf-card-title">Revenue trend</h3><p className="bf-card-sub">Weekly revenue, last 12 weeks (UGX '000)</p></div>
            <Segmented options={["12w", "6m", "1y"]} value="12w" onChange={() => {}} />
          </div>
          <BarChart data={BF.SALES_12W} labels={BF.SALES_12W.map((_, i) => "W" + (i + 1))} accent="green" h={210} format={(v) => "UGX " + v + "K"} />
        </Card>
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Sales by category</h3></div>
          <Donut data={BF.CATEGORY_SALES} />
        </Card>
      </div>

      <div className="bf-row">
        <Card style={{ flex: 1.5 }} pad={false}>
          <div className="bf-card-head" style={{ padding: "20px 20px 4px" }}>
            <div><h3 className="bf-card-title">Recent orders</h3></div>
            <span className="bf-link" onClick={() => navigate("orders")}>View all <Icon name="chevronR" size={14} /></span>
          </div>
          <div style={{ padding: "0 8px 8px", overflowX: "auto" }}>
            <table className="bf-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th className="ta-r">Total</th></tr></thead>
              <tbody>
                {BF.ORDERS.slice(0, 6).map((o) => (
                  <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => navigate("orders")}>
                    <td><div className="bf-cell-main bf-num">{o.id}</div><div className="bf-cell-sub">{o.date} · {o.channel}</div></td>
                    <td>{o.customer}</td>
                    <td><Badge>{o.status}</Badge></td>
                    <td className="ta-r bf-cell-main bf-num">{shortMoney(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Top products</h3></div>
          <div className="bf-col" style={{ gap: 14 }}>
            {[...BF.PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 5).map((p, i) => (
              <div key={p.id} className="bf-rowflex">
                <span className="bf-faint bf-num" style={{ width: 16, fontWeight: 800 }}>{i + 1}</span>
                <ProductThumb pid={p.id} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bf-cell-main" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 13 }}>{p.name}</div>
                  <div className="bf-cell-sub">{p.sold} sold</div>
                </div>
                <b className="bf-num" style={{ fontSize: 13 }}>{shortMoney(p.price)}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Orders ---------------- */
function AdminOrders() {
  const [filter, setFilter] = aUse("All");
  const [q, setQ] = aUse("");
  const [open, setOpen] = aUse(null);
  const tabs = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  const rows = BF.ORDERS.filter((o) => (filter === "All" || o.status === filter) && (o.customer.toLowerCase().includes(q.toLowerCase()) || o.id.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="bf-page fade-in">
      <PageHead title="Orders" sub={`${BF.ORDERS.length} total orders · ${BF.ADMIN_METRICS.pendingOrders} need attention`}>
        <Btn variant="outline" icon="download" size="md">Export CSV</Btn>
      </PageHead>
      <Card pad={false}>
        <div style={{ padding: "16px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--border-2)" }}>
          <div className="bf-search" style={{ maxWidth: 280, flex: "1 1 220px" }}>
            <Icon name="search" size={16} />
            <input placeholder="Search order # or customer…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="bf-seg" style={{ flexWrap: "wrap" }}>
            {tabs.map((t) => <button key={t} className={"bf-seg-btn" + (t === filter ? " on" : "")} onClick={() => setFilter(t)}>{t}</button>)}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Order</th><th>Customer</th><th className="bf-hide-sm">Items</th><th className="bf-hide-sm">Payment</th><th>Status</th><th className="ta-r">Total</th><th></th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} style={{ cursor: "pointer" }} onClick={() => setOpen(o)}>
                  <td><div className="bf-cell-main bf-num">{o.id}</div><div className="bf-cell-sub">{o.date}</div></td>
                  <td><div className="bf-cell-main">{o.customer}</div><div className="bf-cell-sub">{o.area}</div></td>
                  <td className="bf-hide-sm bf-muted">{o.items.reduce((s, i) => s + i.qty, 0)} item(s)</td>
                  <td className="bf-hide-sm"><span className="bf-chip" style={{ cursor: "default" }}>{o.payment}</span></td>
                  <td><Badge>{o.status}</Badge></td>
                  <td className="ta-r bf-cell-main bf-num">{BF.money(o.total)}</td>
                  <td className="ta-r"><Icon name="chevronR" size={16} style={{ color: "var(--faint)" }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--faint)" }}>No orders match your filters.</div>}
        </div>
      </Card>
      {open && <OrderDrawer order={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function OrderDrawer({ order, onClose }) {
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
  const idx = order.status === "Cancelled" ? -1 : steps.indexOf(order.status);
  return (
    <div className="bf-drawer-wrap" onClick={onClose}>
      <div className="bf-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="bf-drawer-head">
          <div><div className="bf-cell-main bf-num" style={{ fontSize: 18 }}>{order.id}</div><div className="bf-cell-sub">{order.date} · {order.channel}</div></div>
          <button className="bf-iconbtn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="bf-drawer-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <Badge>{order.status}</Badge>
            <b className="bf-num" style={{ fontSize: 18 }}>{BF.money(order.total)}</b>
          </div>
          {idx >= 0 && (
            <div className="bf-steps" style={{ marginBottom: 22 }}>
              {steps.map((s, i) => (
                <div key={s} className={"bf-step" + (i <= idx ? " done" : "")}>
                  <span className="bf-step-dot">{i <= idx ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
                  <span className="bf-step-lb">{s}</span>
                </div>
              ))}
            </div>
          )}
          <div className="bf-card-sub" style={{ fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>Customer</div>
          <div className="bf-rowflex" style={{ marginBottom: 18 }}>
            <Avatar initials={order.customer.split(" ").map((w) => w[0]).join("")} accent="green" />
            <div><div className="bf-cell-main">{order.customer}</div><div className="bf-cell-sub">{order.area}</div></div>
          </div>
          <div className="bf-card-sub" style={{ fontWeight: 800, color: "var(--text)", marginBottom: 10 }}>Items</div>
          <div className="bf-col" style={{ gap: 12, marginBottom: 18 }}>
            {order.items.map((it, i) => (
              <div key={i} className="bf-rowflex">
                <ProductThumb pid={it.pid} size={46} />
                <div style={{ flex: 1 }}><div className="bf-cell-main" style={{ fontSize: 13 }}>{it.name}</div><div className="bf-cell-sub">Qty {it.qty}</div></div>
                <b className="bf-num" style={{ fontSize: 13 }}>{BF.money(it.price * it.qty)}</b>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 14 }}>
            <div className="bf-rowflex" style={{ justifyContent: "space-between" }}><span className="bf-muted">Payment</span><b>{order.payment}</b></div>
            <hr className="bf-hr" style={{ margin: "10px 0" }} />
            <div className="bf-rowflex" style={{ justifyContent: "space-between" }}><span className="bf-muted">Total</span><b className="bf-num">{BF.money(order.total)}</b></div>
          </div>
        </div>
        <div className="bf-drawer-foot">
          <Btn variant="outline" full icon="phone">Contact</Btn>
          <Btn variant="primary" full icon="truck">Update status</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Products ---------------- */
function AdminProducts() {
  const [cat, setCat] = aUse("all");
  const [q, setQ] = aUse("");
  const cats = [{ id: "all", name: "All" }, ...BF.CATEGORIES.filter((c) => BF.PRODUCTS.some((p) => p.cat === c.id))];
  const rows = BF.PRODUCTS.filter((p) => (cat === "all" || p.cat === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="bf-page fade-in">
      <PageHead title="Products" sub={`${BF.PRODUCTS.length} products across ${BF.CATEGORIES.length} categories`}>
        <Btn variant="outline" icon="filter" size="md">Filters</Btn>
        <Btn variant="primary" icon="plus" size="md">Add product</Btn>
      </PageHead>
      <div className="bf-grid g-4" style={{ marginBottom: 16 }}>
        <Stat label="Total SKUs" value={BF.PRODUCTS.length} icon="box" accent="green" />
        <Stat label="Low stock" value={BF.PRODUCTS.filter((p) => p.stock < 20).length} icon="shield" accent="rose" footer="Reorder soon" />
        <Stat label="Units sold (mo)" value={BF.PRODUCTS.reduce((s, p) => s + p.sold, 0).toLocaleString()} icon="trending" accent="blue" />
        <Stat label="Avg. rating" value={(BF.PRODUCTS.reduce((s, p) => s + p.rating, 0) / BF.PRODUCTS.length).toFixed(1) + " ★"} icon="star" accent="amber" />
      </div>
      <Card pad={false}>
        <div style={{ padding: "16px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid var(--border-2)" }}>
          <div className="bf-search" style={{ maxWidth: 260, flex: "1 1 200px" }}><Icon name="search" size={16} /><input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {cats.map((c) => <span key={c.id} className={"bf-chip" + (c.id === cat ? " on" : "")} onClick={() => setCat(c.id)}>{c.name}</span>)}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Product</th><th className="bf-hide-sm">Category</th><th className="ta-r">Price</th><th className="ta-r bf-hide-sm">Stock</th><th className="ta-r bf-hide-sm">Sold</th><th className="ta-r">Status</th></tr></thead>
            <tbody>
              {rows.map((p) => {
                const c = BF.CATEGORIES.find((x) => x.id === p.cat);
                return (
                  <tr key={p.id}>
                    <td><div className="bf-rowflex"><ProductThumb pid={p.id} size={44} /><div><div className="bf-cell-main" style={{ fontSize: 13 }}>{p.name}</div><div className="bf-cell-sub">{p.rating} ★ · {p.id}</div></div></div></td>
                    <td className="bf-hide-sm"><Badge tone={c.accent}>{c.name}</Badge></td>
                    <td className="ta-r bf-cell-main bf-num">{BF.money(p.price)}</td>
                    <td className="ta-r bf-num bf-hide-sm" style={{ color: p.stock < 20 ? "var(--c-rose)" : "var(--text)", fontWeight: 700 }}>{p.stock}</td>
                    <td className="ta-r bf-num bf-hide-sm bf-muted">{p.sold}</td>
                    <td className="ta-r"><Badge>{p.stock < 20 ? "Low stock" : "Active"}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Partners ---------------- */
function AdminPartners() {
  const totalVol = BF.PARTNERS.reduce((s, p) => s + p.volume, 0);
  const totalComm = BF.PARTNERS.reduce((s, p) => s + p.commission, 0);
  const rankColor = { Diamond: "purple", Gold: "amber", Silver: "blue", Distributor: "teal" };
  return (
    <div className="bf-page fade-in">
      <PageHead title="Partners & Distributors" sub="BF Suma 'Join Us' network — sales volume, downline and commissions.">
        <Btn variant="outline" icon="download" size="md">Payout report</Btn>
        <Btn variant="primary" icon="plus" size="md">Invite partner</Btn>
      </PageHead>
      <div className="bf-grid g-4" style={{ marginBottom: 16 }}>
        <Stat label="Network volume (mo)" value={shortMoney(totalVol)} delta={14.2} icon="trending" accent="green" />
        <Stat label="Commissions due" value={shortMoney(totalComm)} icon="card" accent="amber" footer="2 pending approval" />
        <Stat label="Active partners" value={BF.PARTNERS.filter((p) => p.status !== "Inactive").length} icon="award" accent="purple" />
        <Stat label="Total downline" value={BF.PARTNERS.reduce((s, p) => s + p.downline, 0)} icon="users" accent="blue" footer="across all tiers" />
      </div>
      <Card pad={false}>
        <div className="bf-card-head" style={{ padding: "18px 20px 14px" }}><h3 className="bf-card-title">Partner leaderboard</h3><span className="bf-faint" style={{ fontSize: 12 }}>Ranked by monthly volume</span></div>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Partner</th><th>Rank</th><th className="bf-hide-sm">Downline</th><th className="ta-r">Volume</th><th className="ta-r bf-hide-sm">Commission</th><th className="ta-r">Status</th></tr></thead>
            <tbody>
              {BF.PARTNERS.map((p) => (
                <tr key={p.id}>
                  <td><div className="bf-rowflex"><Avatar initials={p.avatar} accent={rankColor[p.rank]} size={40} /><div><div className="bf-cell-main">{p.name}</div><div className="bf-cell-sub">{p.id} · {p.area}</div></div></div></td>
                  <td><Badge tone={rankColor[p.rank]}>{p.rank}</Badge></td>
                  <td className="bf-hide-sm bf-num bf-muted">{p.downline}</td>
                  <td className="ta-r bf-cell-main bf-num">{shortMoney(p.volume)}</td>
                  <td className="ta-r bf-num bf-hide-sm">{shortMoney(p.commission)}</td>
                  <td className="ta-r"><Badge>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Packages ---------------- */
function AdminPackages() {
  return (
    <div className="bf-page fade-in">
      <PageHead title="Health Packages" sub="Curated bundles designed around specific wellness goals.">
        <Btn variant="primary" icon="plus" size="md">Create package</Btn>
      </PageHead>
      <div className="bf-grid g-2">
        {BF.PACKAGES.map((pk) => (
          <Card key={pk.id}>
            <div className="bf-rowflex" style={{ alignItems: "flex-start", marginBottom: 14 }}>
              <span className="bf-stat-ic" style={{ background: accentSoft(pk.accent), color: accentColor(pk.accent), width: 46, height: 46 }}><Icon name="layers" size={20} /></span>
              <div style={{ flex: 1 }}>
                <div className="bf-cell-main" style={{ fontSize: 15.5 }}>{pk.name}</div>
                <div className="bf-cell-sub" style={{ fontSize: 12.5 }}>{pk.goal}</div>
              </div>
              <button className="bf-iconbtn" style={{ width: 34, height: 34 }}><Icon name="dots" size={16} /></button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {pk.items.slice(0, 5).map((pid) => <ProductThumb key={pid} pid={pid} size={40} />)}
            </div>
            <div className="bf-rowflex" style={{ justifyContent: "space-between", borderTop: "1px solid var(--border-2)", paddingTop: 14 }}>
              <div><div className="bf-faint" style={{ fontSize: 11.5, fontWeight: 700 }}>{pk.count} products · {pk.sold} sold</div><b className="bf-num" style={{ fontSize: 18 }}>{BF.money(pk.price)}</b></div>
              <Btn variant="soft" size="sm" icon="edit">Edit bundle</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Customers ---------------- */
function AdminCustomers() {
  const [q, setQ] = aUse("");
  const rows = BF.CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="bf-page fade-in">
      <PageHead title="Customers" sub={`${BF.CUSTOMERS.length} registered customers`}>
        <Btn variant="outline" icon="download" size="md">Export</Btn>
      </PageHead>
      <Card pad={false}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border-2)" }}>
          <div className="bf-search" style={{ maxWidth: 300 }}><Icon name="search" size={16} /><input placeholder="Search customers…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Customer</th><th className="bf-hide-sm">Location</th><th className="ta-r">Orders</th><th className="ta-r">Total spent</th><th className="bf-hide-sm">Last order</th><th className="ta-r">Status</th></tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td><div className="bf-rowflex"><Avatar initials={c.avatar} accent={c.status === "VIP" ? "purple" : "green"} size={40} /><div><div className="bf-cell-main">{c.name}</div><div className="bf-cell-sub">{c.id}</div></div></div></td>
                  <td className="bf-hide-sm bf-muted">{c.area}</td>
                  <td className="ta-r bf-num bf-cell-main">{c.orders}</td>
                  <td className="ta-r bf-num bf-cell-main">{BF.money(c.spent)}</td>
                  <td className="bf-hide-sm bf-muted">{c.last}</td>
                  <td className="ta-r"><Badge>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Blog ---------------- */
function AdminBlog() {
  return (
    <div className="bf-page fade-in">
      <PageHead title="Blog & Insights" sub="Wellness articles and health guides.">
        <Btn variant="primary" icon="plus" size="md">New article</Btn>
      </PageHead>
      <Card pad={false}>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Article</th><th>Category</th><th className="bf-hide-sm">Author</th><th className="ta-r bf-hide-sm">Views</th><th>Status</th><th className="ta-r">Date</th></tr></thead>
            <tbody>
              {BF.BLOG.map((b) => (
                <tr key={b.id} style={{ cursor: "pointer" }}>
                  <td className="bf-cell-main" style={{ maxWidth: 340 }}>{b.title}</td>
                  <td><span className="bf-chip" style={{ cursor: "default" }}>{b.cat}</span></td>
                  <td className="bf-hide-sm bf-muted">{b.author}</td>
                  <td className="ta-r bf-num bf-hide-sm bf-muted">{b.views ? b.views.toLocaleString() : "—"}</td>
                  <td><Badge>{b.status}</Badge></td>
                  <td className="ta-r bf-muted">{b.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Discounts ---------------- */
function AdminDiscounts({ toast }) {
  return (
    <div className="bf-page fade-in">
      <PageHead title="Promotions" sub="Discount codes and seasonal offers.">
        <Btn variant="primary" icon="plus" size="md" onClick={() => toast("Promotion code created")}>New code</Btn>
      </PageHead>
      <div className="bf-grid g-2">
        {BF.DISCOUNTS.map((d) => (
          <Card key={d.code}>
            <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 14 }}>
              <div className="bf-rowflex">
                <span className="bf-stat-ic" style={{ background: "var(--primary-soft)", color: "var(--primary-deep)", width: 44, height: 44 }}><Icon name="tag" size={19} /></span>
                <div><div className="bf-cell-main bf-num" style={{ fontSize: 16, letterSpacing: ".02em" }}>{d.code}</div><div className="bf-cell-sub">{d.type} · {d.scope}</div></div>
              </div>
              <Badge>{d.status}</Badge>
            </div>
            <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <span className="bf-faint" style={{ fontSize: 12, fontWeight: 700 }}>Redemptions</span>
              <span className="bf-num bf-muted" style={{ fontSize: 12.5 }}>{d.used}{d.cap ? " / " + d.cap : ""}</span>
            </div>
            <Progress value={d.cap ? Math.min(100, (d.used / d.cap) * 100) : 40} accent={d.status === "Expired" ? "muted" : "green"} />
            <div className="bf-rowflex" style={{ justifyContent: "space-between", marginTop: 14 }}>
              <span className="bf-faint" style={{ fontSize: 12 }}>Ends {d.ends}</span>
              <span className="bf-link">Edit</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Analytics ---------------- */
function AdminAnalytics() {
  return (
    <div className="bf-page fade-in">
      <PageHead title="Reports & Analytics" sub="Deeper view of revenue, channels and product performance.">
        <Segmented options={["This month", "Quarter", "Year"]} value="This month" onChange={() => {}} />
      </PageHead>
      <div className="bf-grid g-4" style={{ marginBottom: 16 }}>
        <Stat label="Gross revenue" value={shortMoney(BF.ADMIN_METRICS.revenueMonth)} delta={12.4} icon="trending" accent="green" />
        <Stat label="Refunds" value={shortMoney(1240000)} delta={-2.1} icon="repeat" accent="rose" />
        <Stat label="New customers" value="48" delta={9.0} icon="users" accent="blue" />
        <Stat label="Repeat rate" value="41%" delta={5.2} icon="award" accent="purple" />
      </div>
      <div className="bf-row" style={{ marginBottom: 16 }}>
        <Card style={{ flex: 2 }}>
          <div className="bf-card-head"><div><h3 className="bf-card-title">Orders volume</h3><p className="bf-card-sub">Weekly orders, last 12 weeks</p></div></div>
          <BarChart data={BF.ORDERS_12W} labels={BF.ORDERS_12W.map((_, i) => "W" + (i + 1))} accent="blue" h={200} />
        </Card>
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Sales channels</h3></div>
          <Donut data={[{ name: "Website", value: 52, accent: "green" }, { name: "WhatsApp", value: 31, accent: "teal" }, { name: "Partners", value: 17, accent: "purple" }]} />
        </Card>
      </div>
      <Card>
        <div className="bf-card-head"><h3 className="bf-card-title">Category performance</h3></div>
        <div className="bf-col" style={{ gap: 16 }}>
          {BF.CATEGORY_SALES.map((c) => (
            <div key={c.name}>
              <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                <span className="bf-num bf-muted" style={{ fontSize: 12.5 }}>{c.value}%</span>
              </div>
              <Progress value={c.value * 3} accent={c.accent} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

const ADMIN_VIEWS = {
  overview: AdminOverview, orders: AdminOrders, products: AdminProducts, partners: AdminPartners,
  packages: AdminPackages, customers: AdminCustomers, blog: AdminBlog, discounts: AdminDiscounts, analytics: AdminAnalytics,
};

Object.assign(window, { ADMIN_NAV, ADMIN_VIEWS });
