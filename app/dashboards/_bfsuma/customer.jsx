/* BF Suma — Customer (shopper) dashboard views */
const { useState: cUse } = React;

const CUSTOMER_NAV = [
  { group: "My Wellness" },
  { id: "home", label: "Dashboard", icon: "home" },
  { id: "goals", label: "Wellness Goals", icon: "zap" },
  { id: "orders", label: "My Orders", icon: "bag", badge: 1 },
  { group: "Shopping" },
  { id: "subscriptions", label: "Reorder & Refills", icon: "repeat" },
  { id: "wishlist", label: "Wishlist", icon: "heart", badge: BF.MY_WISHLIST.length },
  { group: "Account" },
  { id: "addresses", label: "Addresses & Payment", icon: "card" },
];

/* ---------------- Home ---------------- */
function CustHome({ navigate, toast }) {
  const me = BF.ME;
  const active = BF.MY_ORDERS.find((o) => o.status === "Out for delivery");
  return (
    <div className="bf-page fade-in">
      <div className="bf-hero">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="bf-hero-tier"><Icon name="award" size={14} /> {me.tier}</div>
          <h1 className="bf-hero-h1">Welcome back, {me.first}.</h1>
          <p className="bf-hero-sub">You're {me.pointsToNext - me.points} points away from your next reward. Keep your wellness routine going.</p>
          <div className="bf-hero-pts">
            <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}><b className="bf-num" style={{ fontSize: 17 }}>{me.points.toLocaleString()}</b> SumaPoints</span>
              <span style={{ fontSize: 12, opacity: .8 }} className="bf-num">{me.pointsToNext.toLocaleString()} for Platinum</span>
            </div>
            <div className="bf-hero-prog"><div style={{ width: (me.points / me.pointsToNext) * 100 + "%" }} /></div>
          </div>
        </div>
      </div>

      {active && (
        <Card style={{ marginBottom: 16, borderColor: "var(--primary)", borderWidth: 1.5 }}>
          <div className="bf-rowflex" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div className="bf-rowflex">
              <span className="bf-stat-ic" style={{ background: "var(--c-blue-soft)", color: "var(--c-blue)", width: 46, height: 46 }}><Icon name="truck" size={20} /></span>
              <div><div className="bf-cell-main bf-num">{active.id} · Out for delivery</div><div className="bf-cell-sub">Arriving {active.eta}</div></div>
            </div>
            <Btn variant="soft" size="sm" icon="pin" onClick={() => navigate("orders")}>Track order</Btn>
          </div>
        </Card>
      )}

      <div className="bf-grid g-3" style={{ marginBottom: 16 }}>
        <Stat label="Active goals" value={BF.MY_GOALS.length} icon="zap" accent="orange" footer="Energy, Immunity, Joint" />
        <Stat label="Auto-refills" value={BF.MY_SUBSCRIPTIONS.length} icon="repeat" accent="green" footer="Next: 12 Jun" />
        <Stat label="Wishlist" value={BF.MY_WISHLIST.length} icon="heart" accent="pink" footer="2 back in stock" />
      </div>

      <div className="bf-row">
        <Card style={{ flex: 1.3 }}>
          <div className="bf-card-head"><div><h3 className="bf-card-title">Your wellness goals</h3><p className="bf-card-sub">Stay consistent — small habits compound.</p></div><span className="bf-link" onClick={() => navigate("goals")}>Details <Icon name="chevronR" size={14} /></span></div>
          <div className="bf-col" style={{ gap: 18 }}>
            {BF.MY_GOALS.map((g) => (
              <div key={g.id}>
                <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="bf-rowflex"><span className="bf-dot" style={{ background: accentColor(g.accent), width: 9, height: 9 }} /><b style={{ fontSize: 13.5 }}>{g.name}</b></div>
                  <span className="bf-num bf-muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{g.progress}%</span>
                </div>
                <Progress value={g.progress} accent={g.accent} />
                <div className="bf-faint" style={{ fontSize: 11.5, marginTop: 6 }}>{g.note}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Recommended for you</h3></div>
          <div className="bf-col" style={{ gap: 13 }}>
            {BF.RECOMMENDED.map((pid) => {
              const p = BF.productById[pid];
              return (
                <div key={pid} className="bf-rowflex">
                  <ProductThumb pid={pid} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}><div className="bf-cell-main" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div><div className="bf-cell-sub bf-num">{BF.money(p.price)}</div></div>
                  <button className="bf-iconbtn" style={{ width: 34, height: 34 }} onClick={() => toast("Added to cart")}><Icon name="plus" size={16} /></button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Goals ---------------- */
function CustGoals({ toast }) {
  return (
    <div className="bf-page fade-in">
      <PageHead title="Wellness Goals" sub="Track your routines and get product guidance for each goal.">
        <Btn variant="primary" icon="plus" size="md" onClick={() => toast("New goal started")}>Add a goal</Btn>
      </PageHead>
      <div className="bf-grid g-3" style={{ marginBottom: 16 }}>
        {BF.MY_GOALS.map((g) => (
          <Card key={g.id}>
            <span className="bf-stat-ic" style={{ background: accentSoft(g.accent), color: accentColor(g.accent), width: 46, height: 46, marginBottom: 14 }}><Icon name="zap" size={20} /></span>
            <div className="bf-cell-main" style={{ fontSize: 15.5, marginBottom: 4 }}>{g.name}</div>
            <div className="bf-faint" style={{ fontSize: 12.5, marginBottom: 16 }}>{g.note}</div>
            <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 8 }}><span className="bf-faint" style={{ fontSize: 12, fontWeight: 700 }}>Progress</span><b className="bf-num">{g.progress}%</b></div>
            <Progress value={g.progress} accent={g.accent} h={10} />
          </Card>
        ))}
      </div>
      <Card>
        <div className="bf-card-head"><div><h3 className="bf-card-title">Suggested for your goals</h3><p className="bf-card-sub">Hand-picked to match Energy, Immunity & Joint comfort.</p></div></div>
        <div className="bf-grid g-4">
          {["cordyceps-coffee", "ganoderma-caps", "arthro-xtra", "probio-powder"].map((pid) => {
            const p = BF.productById[pid];
            return (
              <div key={pid} className="bf-prodcard">
                <ProductThumb pid={pid} size={72} radius={16} />
                <div className="bf-cell-main" style={{ fontSize: 13, marginTop: 12, lineHeight: 1.3 }}>{p.name}</div>
                <div className="bf-num bf-muted" style={{ fontSize: 12.5, margin: "4px 0 12px" }}>{BF.money(p.price)}</div>
                <Btn variant="soft" size="sm" full icon="bag" onClick={() => toast("Added to cart")}>Add</Btn>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Orders ---------------- */
function CustOrders() {
  const [open, setOpen] = cUse(BF.MY_ORDERS[0]);
  const steps = ["Confirmed", "Packed", "Out for delivery", "Delivered"];
  return (
    <div className="bf-page fade-in">
      <PageHead title="My Orders" sub="Track deliveries and reorder past purchases." />
      <div className="bf-row">
        <div className="bf-col" style={{ flex: 1.1 }}>
          {BF.MY_ORDERS.map((o) => (
            <Card key={o.id} style={{ cursor: "pointer", borderColor: open && open.id === o.id ? "var(--primary)" : undefined }} onClick={() => setOpen(o)}>
              <div className="bf-rowflex" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <div><div className="bf-cell-main bf-num">{o.id}</div><div className="bf-cell-sub">{o.date}</div></div>
                <Badge>{o.status}</Badge>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {o.items.map((it, i) => <ProductThumb key={i} pid={it.pid} size={40} />)}
              </div>
              <div className="bf-rowflex" style={{ justifyContent: "space-between" }}>
                <span className="bf-faint" style={{ fontSize: 12 }}>{o.eta}</span>
                <b className="bf-num" style={{ fontSize: 14 }}>{BF.money(o.total)}</b>
              </div>
            </Card>
          ))}
        </div>
        <Card style={{ flex: 1.4, alignSelf: "flex-start", position: "sticky", top: 0 }}>
          <div className="bf-card-head"><div><h3 className="bf-card-title bf-num">{open.id}</h3><p className="bf-card-sub">{open.date}</p></div><Badge>{open.status}</Badge></div>
          {open.status !== "Delivered" ? (
            <div className="bf-steps" style={{ margin: "8px 0 24px" }}>
              {steps.map((s, i) => (
                <div key={s} className={"bf-step" + (i <= open.step - 1 ? " done" : "")}>
                  <span className="bf-step-dot">{i <= open.step - 1 ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
                  <span className="bf-step-lb">{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--c-green-soft)", color: "#1f8a4d", borderRadius: "var(--radius-sm)", padding: "12px 16px", display: "flex", gap: 10, alignItems: "center", marginBottom: 20, fontWeight: 700, fontSize: 13 }}>
              <Icon name="checkCircle" size={18} /> {open.eta}
            </div>
          )}
          <div className="bf-col" style={{ gap: 12, marginBottom: 18 }}>
            {open.items.map((it, i) => {
              const p = BF.productById[it.pid];
              return (
                <div key={i} className="bf-rowflex">
                  <ProductThumb pid={it.pid} size={48} />
                  <div style={{ flex: 1 }}><div className="bf-cell-main" style={{ fontSize: 13 }}>{p.name}</div><div className="bf-cell-sub">Qty {it.qty}</div></div>
                  <b className="bf-num" style={{ fontSize: 13 }}>{BF.money(p.price * it.qty)}</b>
                </div>
              );
            })}
          </div>
          <div style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 16 }}>
            <div className="bf-rowflex" style={{ justifyContent: "space-between" }}><span className="bf-muted">Total paid</span><b className="bf-num" style={{ fontSize: 15 }}>{BF.money(open.total)}</b></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="outline" full icon="file">Invoice</Btn>
            <Btn variant="primary" full icon="repeat">Reorder</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Subscriptions / Reorder ---------------- */
function CustSubs({ toast }) {
  const past = ["consti-relax", "reishi-coffee", "calcium-d3-milk", "arthro-xtra"];
  return (
    <div className="bf-page fade-in">
      <PageHead title="Reorder & Refills" sub="Auto-refill your essentials and reorder past favourites." />
      <Card style={{ marginBottom: 16 }}>
        <div className="bf-card-head"><div><h3 className="bf-card-title">Active auto-refills</h3><p className="bf-card-sub">Delivered on schedule — pause or skip anytime.</p></div></div>
        <div className="bf-col" style={{ gap: 12 }}>
          {BF.MY_SUBSCRIPTIONS.map((s) => {
            const p = BF.productById[s.pid];
            return (
              <div key={s.pid} className="bf-rowflex" style={{ background: "var(--surface-2)", borderRadius: "var(--radius-sm)", padding: 12 }}>
                <ProductThumb pid={s.pid} size={50} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bf-cell-main" style={{ fontSize: 13.5 }}>{p.name}</div>
                  <div className="bf-cell-sub">{s.every} · Qty {s.qty}</div>
                </div>
                <div className="bf-hide-sm" style={{ textAlign: "right", marginRight: 6 }}>
                  <div className="bf-faint" style={{ fontSize: 11, fontWeight: 700 }}>Next delivery</div>
                  <div className="bf-cell-main bf-num" style={{ fontSize: 13 }}>{s.next}</div>
                </div>
                <Btn variant="outline" size="sm" onClick={() => toast("Refill skipped")}>Skip</Btn>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <div className="bf-card-head"><div><h3 className="bf-card-title">Buy again</h3><p className="bf-card-sub">From your recent orders.</p></div></div>
        <div className="bf-grid g-4">
          {past.map((pid) => {
            const p = BF.productById[pid];
            return (
              <div key={pid} className="bf-prodcard">
                <ProductThumb pid={pid} size={72} radius={16} />
                <div className="bf-cell-main" style={{ fontSize: 13, marginTop: 12, lineHeight: 1.3 }}>{p.name}</div>
                <div className="bf-num bf-muted" style={{ fontSize: 12.5, margin: "4px 0 12px" }}>{BF.money(p.price)}</div>
                <Btn variant="soft" size="sm" full icon="repeat" onClick={() => toast("Added to cart")}>Buy again</Btn>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Wishlist ---------------- */
function CustWishlist({ toast }) {
  const [items, setItems] = cUse(BF.MY_WISHLIST);
  const remove = (pid) => { setItems(items.filter((x) => x !== pid)); toast("Removed from wishlist"); };
  return (
    <div className="bf-page fade-in">
      <PageHead title="Wishlist" sub={`${items.length} saved products`} />
      {items.length === 0 ? (
        <Card><div style={{ textAlign: "center", padding: 40, color: "var(--faint)" }}><Icon name="heart" size={34} /><p style={{ marginTop: 12, fontWeight: 600 }}>Your wishlist is empty.</p></div></Card>
      ) : (
        <div className="bf-grid g-4">
          {items.map((pid) => {
            const p = BF.productById[pid];
            const lowStock = p.stock < 20;
            return (
              <Card key={pid} style={{ position: "relative" }}>
                <button className="bf-iconbtn" style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, color: "var(--c-pink)" }} onClick={() => remove(pid)}><Icon name="heart" size={16} fill="current" /></button>
                <ProductThumb pid={pid} size={80} radius={18} />
                <div className="bf-cell-main" style={{ fontSize: 13.5, marginTop: 14, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ margin: "6px 0 12px" }}>{lowStock ? <Badge>Low stock</Badge> : <Badge tone="green" dot>In stock</Badge>}</div>
                <div className="bf-rowflex" style={{ justifyContent: "space-between" }}>
                  <b className="bf-num" style={{ fontSize: 15 }}>{BF.money(p.price)}</b>
                  <Btn variant="primary" size="sm" icon="bag" onClick={() => toast("Added to cart")}>Add</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Addresses & Payment ---------------- */
function CustAddresses({ toast }) {
  const me = BF.ME;
  return (
    <div className="bf-page fade-in">
      <PageHead title="Addresses & Payment" sub="Manage your delivery details and payment methods." />
      <Card style={{ marginBottom: 16 }}>
        <div className="bf-card-head"><h3 className="bf-card-title">Profile</h3><span className="bf-link" onClick={() => toast("Profile saved")}>Edit</span></div>
        <div className="bf-rowflex" style={{ gap: 16 }}>
          <Avatar initials={me.initials} accent="green" size={56} />
          <div>
            <div className="bf-cell-main" style={{ fontSize: 16 }}>{me.name}</div>
            <div className="bf-cell-sub">{me.email} · {me.phone}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}><Badge tone="amber" dot>{me.tier}</Badge><span className="bf-faint" style={{ fontSize: 12 }}>{me.joined}</span></div>
          </div>
        </div>
      </Card>
      <div className="bf-row">
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Delivery addresses</h3><Btn variant="soft" size="sm" icon="plus" onClick={() => toast("Add address")}>Add</Btn></div>
          <div className="bf-col" style={{ gap: 12 }}>
            {BF.MY_ADDRESSES.map((a) => (
              <div key={a.id} className="bf-rowflex" style={{ alignItems: "flex-start", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 14 }}>
                <span className="bf-stat-ic" style={{ background: "var(--primary-soft)", color: "var(--primary-deep)", width: 40, height: 40 }}><Icon name="pin" size={18} /></span>
                <div style={{ flex: 1 }}>
                  <div className="bf-rowflex" style={{ gap: 8 }}><b style={{ fontSize: 13.5 }}>{a.label}</b>{a.default && <Badge tone="green">Default</Badge>}</div>
                  <div className="bf-cell-sub" style={{ marginTop: 3 }}>{a.line}</div>
                  <div className="bf-cell-sub">{a.city} · {a.phone}</div>
                </div>
                <button className="bf-iconbtn" style={{ width: 32, height: 32 }}><Icon name="edit" size={15} /></button>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ flex: 1 }}>
          <div className="bf-card-head"><h3 className="bf-card-title">Payment methods</h3><Btn variant="soft" size="sm" icon="plus" onClick={() => toast("Add payment")}>Add</Btn></div>
          <div className="bf-col" style={{ gap: 12 }}>
            {BF.MY_PAYMENTS.map((m) => (
              <div key={m.id} className="bf-rowflex" style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 14 }}>
                <span className="bf-stat-ic" style={{ background: "var(--surface-3)", color: "var(--text)", width: 40, height: 40 }}><Icon name={m.type === "Visa" ? "card" : "phone"} size={18} /></span>
                <div style={{ flex: 1 }}><div className="bf-rowflex" style={{ gap: 8 }}><b style={{ fontSize: 13.5 }}>{m.type}</b>{m.default && <Badge tone="green">Default</Badge>}</div><div className="bf-cell-sub bf-num">{m.detail}</div></div>
                <button className="bf-iconbtn" style={{ width: 32, height: 32 }}><Icon name="dots" size={15} /></button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Partner earnings (shown when customer is a partner) ---------------- */
function CustPartner({ toast }) {
  const me = { rank: "Silver", volume: 4380000, commission: 481800, downline: 23, next: "Gold", nextAt: 12000000 };
  const recruits = [
    { name: "Achan Grace", initials: "AG", joined: "May 2026", vol: 640000, accent: "green" },
    { name: "Kato Emmanuel", initials: "KE", joined: "Apr 2026", vol: 1120000, accent: "blue" },
    { name: "Atim Rebecca", initials: "AR", joined: "Apr 2026", vol: 380000, accent: "amber" },
    { name: "Tumusiime Allan", initials: "TA", joined: "Mar 2026", vol: 910000, accent: "pink" },
  ];
  return (
    <div className="bf-page fade-in">
      <PageHead title="Partner Earnings" sub="Your BF Suma 'Join Us' business — volume, downline and commissions.">
        <Btn variant="primary" icon="external" size="md" onClick={() => toast("Share link copied")}>Share my link</Btn>
      </PageHead>
      <div className="bf-grid g-4" style={{ marginBottom: 16 }}>
        <Stat label="Commission (mo)" value={shortMoney(me.commission)} delta={11.4} icon="card" accent="green" />
        <Stat label="Sales volume" value={shortMoney(me.volume)} delta={8.2} icon="trending" accent="blue" />
        <Stat label="My downline" value={me.downline} icon="users" accent="purple" footer="4 joined this month" />
        <Stat label="Current rank" value={me.rank} icon="award" accent="amber" footer={"Next: " + me.next} />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div className="bf-card-head"><div><h3 className="bf-card-title">Progress to {me.next}</h3><p className="bf-card-sub">Reach {BF.money(me.nextAt)} in team volume to rank up.</p></div><b className="bf-num">{Math.round((me.volume / me.nextAt) * 100)}%</b></div>
        <Progress value={(me.volume / me.nextAt) * 100} accent="amber" h={12} />
        <div className="bf-rowflex" style={{ justifyContent: "space-between", marginTop: 10 }}><span className="bf-faint bf-num" style={{ fontSize: 12 }}>{BF.money(me.volume)}</span><span className="bf-faint bf-num" style={{ fontSize: 12 }}>{BF.money(me.nextAt)}</span></div>
      </Card>
      <Card pad={false}>
        <div className="bf-card-head" style={{ padding: "18px 20px 8px" }}><h3 className="bf-card-title">My team</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table className="bf-table">
            <thead><tr><th>Member</th><th className="bf-hide-sm">Joined</th><th className="ta-r">Volume</th></tr></thead>
            <tbody>
              {recruits.map((r) => (
                <tr key={r.name}>
                  <td><div className="bf-rowflex"><Avatar initials={r.initials} accent={r.accent} size={38} /><div className="bf-cell-main">{r.name}</div></div></td>
                  <td className="bf-hide-sm bf-muted">{r.joined}</td>
                  <td className="ta-r bf-cell-main bf-num">{shortMoney(r.vol)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const CUSTOMER_VIEWS = {
  home: CustHome, goals: CustGoals, orders: CustOrders, subscriptions: CustSubs,
  wishlist: CustWishlist, addresses: CustAddresses, partner: CustPartner,
};

const CUSTOMER_NAV_PARTNER = [
  ...CUSTOMER_NAV.slice(0, 5),
  { group: "Partner" },
  { id: "partner", label: "Partner Earnings", icon: "award" },
  ...CUSTOMER_NAV.slice(5),
];

Object.assign(window, { CUSTOMER_NAV, CUSTOMER_NAV_PARTNER, CUSTOMER_VIEWS });
