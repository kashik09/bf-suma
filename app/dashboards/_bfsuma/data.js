/* BF Suma — realistic demo data (UGX, Uganda context) */
(function () {
  const money = (n) => "UGX " + n.toLocaleString("en-US");

  // Category accent keys map to CSS vars --c-*
  const CATEGORIES = [
    { id: "immune", name: "Immune Boosters", accent: "orange", count: 14 },
    { id: "digestive", name: "Digestive Health", accent: "green", count: 9 },
    { id: "cardio", name: "Cardiovascular Health", accent: "pink", count: 11 },
    { id: "skincare", name: "Skincare (Youth Series)", accent: "purple", count: 12 },
    { id: "women", name: "Women's Health", accent: "rose", count: 8 },
    { id: "men", name: "Men's Health", accent: "blue", count: 7 },
    { id: "bone", name: "Bone & Joint Care", accent: "amber", count: 6 },
    { id: "premium", name: "Premium Selected", accent: "amber", count: 5 },
    { id: "kids", name: "Smart Kids", accent: "blue", count: 4 },
    { id: "living", name: "Suma Living", accent: "teal", count: 10 },
  ];

  const P = (id, name, cat, price, stock, sold, rating, tag, blurb) =>
    ({ id, name, cat, price, stock, sold, rating, tag, blurb });

  const PRODUCTS = [
    P("cordyceps-coffee", "4 in 1 Cordyceps Coffee", "immune", 58500, 142, 318, 4.8, "Bestseller", "Premium coffee with Cordyceps mushroom extract for energy and vitality."),
    P("reishi-coffee", "4 in 1 Reishi Coffee", "immune", 58500, 96, 274, 4.7, "Bestseller", "Colombian coffee beans with Reishi extract for immune support."),
    P("ganoderma-caps", "Ganoderma Lucidum Capsules", "immune", 132000, 38, 121, 4.6, "", "Reishi spore capsules for daily immune resilience."),
    P("cordyceps-militaris", "Cordyceps Militaris Capsules", "immune", 154000, 12, 88, 4.5, "Low stock", "Concentrated cordyceps for stamina and lung support."),
    P("vig-power", "Pro Power (Vig Power) Capsules", "men", 198000, 64, 156, 4.7, "", "Men's vitality and performance support formula."),
    P("xpower-caps", "X Power Capsules", "men", 176000, 7, 95, 4.6, "Low stock", "Energy and endurance support for active men."),
    P("consti-relax", "Consti Relax Solution", "digestive", 130500, 73, 142, 4.4, "", "Digestive comfort solution for constipation support."),
    P("probio-powder", "Probio3 Probiotic Powder", "digestive", 96000, 55, 110, 4.5, "", "Gut flora balance with three probiotic strains."),
    P("arthro-xtra", "Arthro Xtra Tablets", "bone", 180000, 41, 134, 4.7, "", "Joint-support tablets for physically active users."),
    P("calcoplex", "Calcoplex Calcium Tablets", "bone", 92000, 60, 102, 4.3, "", "Calcium and mineral complex for bone strength."),
    P("calcium-d3-milk", "Calcium & Vitamin D3 Milk Tablets", "kids", 108000, 88, 167, 4.8, "Kids", "Chewable calcium + D3 with strawberry flavour."),
    P("youth-essence", "Youth Essence Renewal Serum", "skincare", 145000, 33, 79, 4.6, "New", "Youth series serum for hydration and tone support."),
    P("anatic-soap", "Anatic Herbal Essence Soap", "living", 19800, 210, 402, 4.5, "Bestseller", "Herbal soap with honey and tea extracts."),
    P("skin-renu", "Skin Renu Cleansing Gel", "skincare", 78000, 47, 64, 4.4, "New", "Gentle daily cleanser for the youth series routine."),
    P("circuplus", "Circuplus Cardio Support", "cardio", 168000, 29, 71, 4.6, "", "Circulation and heart vitality support formula."),
    P("hepato-care", "Hepato Care Liver Tablets", "cardio", 142000, 18, 58, 4.3, "", "Liver detox and metabolic support tablets."),
    P("femivin", "Femivin Women's Balance", "women", 156000, 44, 83, 4.7, "", "Hormonal balance support for women's wellness."),
    P("angel-slim", "Angel Slim Slimming Tea", "living", 64000, 102, 188, 4.2, "", "Herbal tea positioned for weight management."),
  ];
  const productById = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  const PACKAGES = [
    { id: "weight-loss-reset", name: "Weight Loss Reset System", goal: "1-Month Gut Cleanse → Fat Burn → Body Transformation", count: 3, price: 524475, sold: 64, accent: "green", items: ["consti-relax", "angel-slim", "probio-powder"] },
    { id: "xpower-mens", name: "X Power Men's Health", goal: "Energy, vitality, and confidence for men", count: 4, price: 468000, sold: 51, accent: "blue", items: ["vig-power", "xpower-caps", "cordyceps-coffee", "ganoderma-caps"] },
    { id: "womens-beauty", name: "Women's Health & Beauty", goal: "Hormonal balance, beauty, and feminine wellness", count: 5, price: 589500, sold: 47, accent: "rose", items: ["femivin", "youth-essence", "skin-renu", "calcoplex", "anatic-soap"] },
    { id: "immune-shield", name: "Daily Immune Shield", goal: "Year-round immune resilience stack", count: 3, price: 318000, sold: 39, accent: "orange", items: ["reishi-coffee", "ganoderma-caps", "cordyceps-militaris"] },
  ];

  // Orders
  const NAMES = ["Nakato Sarah", "Okello James", "Auma Patience", "Mugisha Brian", "Namugga Doreen", "Wasswa Daniel", "Achan Grace", "Ssemwogerere Paul", "Nabirye Joan", "Kato Emmanuel", "Atim Rebecca", "Tumusiime Allan"];
  const AREAS = ["Kampala — Nakawa", "Wakiso — Kira", "Kampala — Makindye", "Entebbe", "Jinja", "Mbarara", "Kampala — Kawempe", "Gulu", "Kampala — Central", "Mukono", "Fort Portal", "Kampala — Rubaga"];
  const PAYMENTS = ["MTN MoMo", "Airtel Money", "Cash on Delivery", "Visa Card"];
  const STATUSES = ["Delivered", "Shipped", "Processing", "Pending", "Cancelled"];

  function makeOrders() {
    const rows = [];
    const seedItems = [
      ["cordyceps-coffee", "arthro-xtra"],
      ["reishi-coffee"],
      ["calcium-d3-milk", "anatic-soap", "anatic-soap"],
      ["vig-power", "xpower-caps"],
      ["consti-relax", "probio-powder"],
      ["youth-essence", "skin-renu"],
      ["ganoderma-caps"],
      ["femivin", "calcoplex"],
      ["circuplus"],
      ["angel-slim", "anatic-soap"],
      ["cordyceps-militaris"],
      ["calcium-d3-milk"],
    ];
    for (let i = 0; i < 12; i++) {
      const items = seedItems[i].map((pid) => ({ pid, name: productById[pid].name, qty: 1 + (i % 2), price: productById[pid].price }));
      const total = items.reduce((s, it) => s + it.price * it.qty, 0);
      const dayAgo = i;
      const d = new Date(2026, 4, 31 - i);
      rows.push({
        id: "BF-" + (10847 - i),
        customer: NAMES[i],
        area: AREAS[i],
        items,
        total,
        payment: PAYMENTS[i % PAYMENTS.length],
        status: i === 11 ? "Cancelled" : STATUSES[Math.min(Math.floor(i / 3), 3)],
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        channel: i % 3 === 0 ? "WhatsApp" : i % 3 === 1 ? "Website" : "Partner",
      });
    }
    return rows;
  }
  const ORDERS = makeOrders();

  // Partners / distributors (Join Us program)
  const PARTNERS = [
    { id: "PA-204", name: "Nalwoga Christine", rank: "Diamond", area: "Kampala — Central", downline: 142, volume: 18900000, commission: 2646000, status: "Active", joined: "Aug 2023", avatar: "NC" },
    { id: "PA-198", name: "Opio Richard", rank: "Gold", area: "Gulu", downline: 87, volume: 11200000, commission: 1456000, status: "Active", joined: "Nov 2023", avatar: "OR" },
    { id: "PA-233", name: "Birungi Faith", rank: "Gold", area: "Mbarara", downline: 64, volume: 8650000, commission: 1124500, status: "Active", joined: "Feb 2024", avatar: "BF" },
    { id: "PA-251", name: "Ssewanyana Mark", rank: "Silver", area: "Wakiso — Kira", downline: 38, volume: 5320000, commission: 585200, status: "Active", joined: "May 2024", avatar: "SM" },
    { id: "PA-260", name: "Akello Brenda", rank: "Silver", area: "Jinja", downline: 29, volume: 3980000, commission: 437800, status: "Pending payout", joined: "Jul 2024", avatar: "AB" },
    { id: "PA-272", name: "Kiprotich Allan", rank: "Distributor", area: "Mbale", downline: 11, volume: 1640000, commission: 131200, status: "Active", joined: "Jan 2025", avatar: "KA" },
    { id: "PA-281", name: "Nampijja Sylvia", rank: "Distributor", area: "Entebbe", downline: 6, volume: 920000, commission: 73600, status: "Inactive", joined: "Mar 2025", avatar: "NS" },
  ];

  const RANK_THRESHOLDS = [
    { rank: "Distributor", min: 0 },
    { rank: "Silver", min: 5000000 },
    { rank: "Gold", min: 12000000 },
    { rank: "Diamond", min: 25000000 },
  ];

  // Customers
  const CUSTOMERS = NAMES.map((n, i) => ({
    id: "CU-" + (1500 + i),
    name: n,
    area: AREAS[i],
    orders: 1 + ((i * 3) % 9),
    spent: 60000 + ((i * 137) % 9) * 95000 + (i % 4) * 42000,
    last: ORDERS[i] ? ORDERS[i].date : "—",
    status: i % 5 === 0 ? "VIP" : "Active",
    avatar: n.split(" ").map((w) => w[0]).join(""),
  }));

  // Blog posts
  const BLOG = [
    { id: 1, title: "Understanding the Power of Reishi Mushrooms for Immune Health", cat: "Immunity", status: "Published", views: 2840, date: "28 May", author: "Dr. Aceng" },
    { id: 2, title: "The Complete Guide to Ginseng: Energy, Focus, and Vitality", cat: "Energy", status: "Published", views: 1960, date: "21 May", author: "W. Okot" },
    { id: 3, title: "Skin Health from Within: The Science of Youth Essence", cat: "Skincare", status: "Published", views: 1530, date: "14 May", author: "S. Nabirye" },
    { id: 4, title: "Building a Strong Immune System: Your Complete Wellness Guide", cat: "Immunity", status: "Draft", views: 0, date: "—", author: "Dr. Aceng" },
    { id: 5, title: "Gut Health 101: Probiotics and Daily Balance", cat: "Digestive", status: "Scheduled", views: 0, date: "05 Jun", author: "W. Okot" },
  ];

  // Discounts / promotions
  const DISCOUNTS = [
    { code: "WELLNESS10", type: "10% off", scope: "Sitewide", used: 184, cap: 500, status: "Active", ends: "30 Jun" },
    { code: "IMMUNE2FOR1", type: "Buy 2 get 1", scope: "Immune Boosters", used: 92, cap: 200, status: "Active", ends: "15 Jun" },
    { code: "NEWSTART", type: "UGX 15,000 off", scope: "First order", used: 311, cap: 1000, status: "Active", ends: "31 Dec" },
    { code: "PARTNER5", type: "5% partner", scope: "Partner orders", used: 47, cap: 0, status: "Active", ends: "—" },
    { code: "EASTER24", type: "20% off", scope: "Sitewide", used: 420, cap: 420, status: "Expired", ends: "06 Apr" },
  ];

  // Sales chart — last 12 weeks revenue (UGX, in thousands)
  const SALES_12W = [4200, 4650, 4380, 5120, 4890, 5560, 6010, 5740, 6480, 6920, 7240, 8110];
  const ORDERS_12W = [86, 94, 88, 102, 97, 110, 121, 116, 129, 138, 144, 161];

  const CATEGORY_SALES = [
    { name: "Immune Boosters", value: 31, accent: "orange" },
    { name: "Men's Health", value: 19, accent: "blue" },
    { name: "Bone & Joint", value: 14, accent: "amber" },
    { name: "Digestive", value: 12, accent: "green" },
    { name: "Women's Health", value: 11, accent: "rose" },
    { name: "Skincare", value: 8, accent: "purple" },
    { name: "Other", value: 5, accent: "teal" },
  ];

  const ADMIN_METRICS = {
    revenueMonth: 81100000,
    revenueDelta: 12.4,
    orders: 161,
    ordersDelta: 8.1,
    aov: 503700,
    aovDelta: 3.9,
    partners: 7,
    partnersActive: 5,
    lowStock: 3,
    pendingOrders: ORDERS.filter((o) => o.status === "Pending" || o.status === "Processing").length,
    conversion: 3.7,
  };

  // ---- Customer-facing (logged-in shopper "Sarah Nakato") ----
  const ME = {
    name: "Sarah Nakato",
    first: "Sarah",
    initials: "SN",
    email: "sarah.nakato@gmail.com",
    phone: "+256 778 421 905",
    area: "Kampala — Nakawa",
    points: 1840,
    pointsToNext: 2500,
    tier: "Gold Member",
    joined: "Member since 2024",
    isPartner: false,
  };

  const MY_ORDERS = [
    { id: "BF-10847", date: "31 May 2026", status: "Out for delivery", total: 137000, eta: "Today, by 6:00 PM", items: [{ pid: "cordyceps-coffee", qty: 1 }, { pid: "anatic-soap", qty: 4 }], step: 3 },
    { id: "BF-10791", date: "18 May 2026", status: "Delivered", total: 180000, eta: "Delivered 20 May", items: [{ pid: "arthro-xtra", qty: 1 }], step: 4 },
    { id: "BF-10702", date: "26 Apr 2026", status: "Delivered", total: 117000, eta: "Delivered 28 Apr", items: [{ pid: "reishi-coffee", qty: 2 }], step: 4 },
    { id: "BF-10588", date: "02 Apr 2026", status: "Delivered", total: 130500, eta: "Delivered 04 Apr", items: [{ pid: "consti-relax", qty: 1 }], step: 4 },
  ];

  const MY_WISHLIST = ["youth-essence", "vig-power", "femivin", "circuplus", "ganoderma-caps"];

  const MY_SUBSCRIPTIONS = [
    { pid: "cordyceps-coffee", every: "Every 30 days", next: "12 Jun 2026", qty: 1, status: "Active" },
    { pid: "anatic-soap", every: "Every 60 days", next: "28 Jun 2026", qty: 4, status: "Active" },
  ];

  const MY_ADDRESSES = [
    { id: 1, label: "Home", line: "Plot 14, Spring Road, Bugolobi", city: "Kampala — Nakawa", phone: "+256 778 421 905", default: true },
    { id: 2, label: "Office", line: "Lloyds Mall, 2nd Floor F9, Entebbe Rd", city: "Kampala — Central", phone: "+256 747 928 920", default: false },
  ];

  const MY_PAYMENTS = [
    { id: 1, type: "MTN MoMo", detail: "•••• 905", default: true },
    { id: 2, type: "Airtel Money", detail: "•••• 412", default: false },
    { id: 3, type: "Visa", detail: "•••• 4417", default: false },
  ];

  const MY_GOALS = [
    { id: "energy", name: "Daily Energy & Vitality", progress: 72, accent: "orange", note: "Cordyceps stack — 18-day streak" },
    { id: "immunity", name: "Immune Resilience", progress: 54, accent: "green", note: "Reishi routine — on track" },
    { id: "joint", name: "Joint Comfort", progress: 38, accent: "amber", note: "Arthro Xtra — started 12 days ago" },
  ];

  const RECOMMENDED = ["ganoderma-caps", "probio-powder", "circuplus", "youth-essence"];

  window.BF = {
    money, CATEGORIES, PRODUCTS, productById, PACKAGES, ORDERS, PARTNERS, RANK_THRESHOLDS,
    CUSTOMERS, BLOG, DISCOUNTS, SALES_12W, ORDERS_12W, CATEGORY_SALES, ADMIN_METRICS,
    ME, MY_ORDERS, MY_WISHLIST, MY_SUBSCRIPTIONS, MY_ADDRESSES, MY_PAYMENTS, MY_GOALS, RECOMMENDED,
  };
})();
