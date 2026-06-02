"use client";

/* BF Suma — app shell, routing, role switch */
import React, { useState, useEffect } from "react";
import { BF } from "./data";
import { Icon, Avatar, useToast } from "./ui";
import { ADMIN_NAV, ADMIN_VIEWS } from "./admin";
import { CUSTOMER_NAV, CUSTOMER_NAV_PARTNER, CUSTOMER_VIEWS } from "./customer";

const THEME = {
  direction: "fresh",
  primary: "#1E9E5A",
  radius: 16,
  startRole: "Admin",
  showPartner: false
};

function Sidebar({ nav, route, navigate, brandLabel, open, onClose, foot }) {
  return (
    <>
      <div className={"bf-backdrop" + (open ? " show" : "")} onClick={onClose} />
      <aside className={"bf-sidebar" + (open ? " open" : "")}>
        <div className="bf-side-head">
          <img className="bf-side-mark" src="/bfsuma/bf-suma-mark.png" alt="BF Suma" />
          <div className="bf-side-word"><b>BF Suma</b><span>{brandLabel}</span></div>
        </div>
        <nav className="bf-nav">
          {nav.map((item, i) =>
            item.group ? (
              <div className="bf-nav-group" key={"g" + i}>{item.group}</div>
            ) : (
              <button key={item.id} className={"bf-nav-item" + (route === item.id ? " on" : "")} onClick={() => navigate(item.id)}>
                <Icon name={item.icon} size={19} />
                {item.label}
                {item.badge ? <span className="bf-nav-badge" style={item.badgeTone === "rose" ? { background: "var(--c-pink)" } : null}>{item.badge}</span> : null}
              </button>
            )
          )}
        </nav>
        <div className="bf-side-foot">{foot}</div>
      </aside>
    </>
  );
}

export default function DashboardApp() {
  const [role, setRole] = useState(THEME.startRole === "Customer" ? "customer" : "admin");
  const [adminRoute, setAdminRoute] = useState("overview");
  const [custRoute, setCustRoute] = useState("home");
  const [drawer, setDrawer] = useState(false);
  const [toastNode, toast] = useToast();

  // apply theme tokens
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute("data-theme", THEME.direction || "fresh");
  }, []);

  const rootStyle = {};
  if (THEME.primary) {
    rootStyle["--primary"] = THEME.primary;
    rootStyle["--accent"] = THEME.primary;
    rootStyle["--primary-deep"] = `color-mix(in oklab, ${THEME.primary} 82%, black)`;
    rootStyle["--primary-soft"] = `color-mix(in oklab, ${THEME.primary} 14%, white)`;
  }
  if (THEME.radius != null) {
    rootStyle["--radius"] = THEME.radius + "px";
    rootStyle["--radius-sm"] = (THEME.radius - 5) + "px";
    rootStyle["--radius-lg"] = (THEME.radius + 6) + "px";
  }

  const isAdmin = role === "admin";
  const nav = isAdmin ? ADMIN_NAV : (THEME.showPartner ? CUSTOMER_NAV_PARTNER : CUSTOMER_NAV);
  const route = isAdmin ? adminRoute : custRoute;
  const setRoute = isAdmin ? setAdminRoute : setCustRoute;
  const views = isAdmin ? ADMIN_VIEWS : CUSTOMER_VIEWS;
  const navigate = (id) => { setRoute(id); setDrawer(false); };

  const ViewComp = (views[route] || (isAdmin ? ADMIN_VIEWS.overview : CUSTOMER_VIEWS.home));

  const sideFoot = isAdmin ? (
    <div className="bf-side-user" onClick={() => toast("Admin profile")}>
      <Avatar initials="AK" accent="green" size={38} />
      <div style={{ flex: 1 }}><div className="nm">Aisha Kembabazi</div><div className="rl">Store Administrator</div></div>
      <Icon name="logout" size={16} style={{ color: "var(--side-muted)" }} />
    </div>
  ) : (
    <div className="bf-side-user" onClick={() => navigate("addresses")}>
      <Avatar initials={BF.ME.initials} accent="green" size={38} />
      <div style={{ flex: 1 }}><div className="nm">{BF.ME.name}</div><div className="rl">{BF.ME.tier}</div></div>
      <Icon name="chevronR" size={16} style={{ color: "var(--side-muted)" }} />
    </div>
  );

  const curLabel = nav.find((n) => n.id === route);
  const mobileNav = nav.filter((n) => n.id).slice(0, 5);

  return (
    <div className="bf-root" style={rootStyle}>
      <div className="bf-shell">
        <Sidebar nav={nav} route={route} navigate={navigate} brandLabel={isAdmin ? "Admin Console" : "My Account"} open={drawer} onClose={() => setDrawer(false)} foot={sideFoot} />
        <div className="bf-main">
          <header className="bf-topbar">
            <button className="bf-iconbtn bf-hamburger" onClick={() => setDrawer(true)}><Icon name="menu" size={20} /></button>
            <div className="bf-search"><Icon name="search" size={16} /><input placeholder={isAdmin ? "Search orders, products, partners…" : "Search products & orders…"} /></div>
            <div className="bf-top-actions">
              <div className="bf-role-switch">
                <button className={isAdmin ? "on" : ""} onClick={() => setRole("admin")}><Icon name="shield" size={15} /><span>Admin</span></button>
                <button className={!isAdmin ? "on" : ""} onClick={() => setRole("customer")}><Icon name="user" size={15} /><span>Customer</span></button>
              </div>
              {!isAdmin && <button className="bf-iconbtn bf-hide-sm" onClick={() => toast("Cart")}><Icon name="bag" size={18} /></button>}
              <button className="bf-iconbtn" onClick={() => toast("Notifications")}><Icon name="bell" size={18} /><span className="dot" /></button>
            </div>
          </header>
          <main className="bf-scroll" data-screen-label={(isAdmin ? "Admin" : "Customer") + " · " + (curLabel ? curLabel.label : route)}>
            <ViewComp navigate={navigate} toast={toast} />
          </main>
        </div>
      </div>

      {/* mobile bottom nav */}
      <nav className="bf-botnav">
        {mobileNav.map((n) => (
          <button key={n.id} className={route === n.id ? "on" : ""} onClick={() => navigate(n.id)}>
            <Icon name={n.icon} size={20} />{n.label.split(" ")[0]}
          </button>
        ))}
      </nav>

      {toastNode}
    </div>
  );
}
