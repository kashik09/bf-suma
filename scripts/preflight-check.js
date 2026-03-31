#!/usr/bin/env node

import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false }
  }
);

let FAILURES = 0;

function pass(msg) {
  console.log(`✅ PASS: ${msg}`);
}

function fail(msg) {
  console.error(`❌ FAIL: ${msg}`);
  FAILURES++;
}

async function checkSchema() {
  console.log("\n=== SCHEMA CHECK ===");

  const checks = [
    supabase.from("categories").select("id").limit(1),
    supabase.from("products").select("id,name,price,currency,status,stock_qty").limit(1),
    supabase.from("order_items").select("*").limit(1),
    supabase.from("customers").select("*").limit(1),
    supabase.from("order_idempotency_keys").select("*").limit(1),
    supabase.from("api_rate_limits").select("*").limit(1),
    supabase.from("order_request_replays").select("*").limit(1),
  ];

  for (const q of checks) {
    const { error } = await q;
    if (error) {
      fail(`Schema issue: ${error.code} - ${error.message}`);
      return;
    }
  }

  pass("Schema OK");
}

async function checkRPC() {
  console.log("\n=== RPC CHECK ===");

  const { error } = await supabase.rpc("process_order_intake_atomic", {
    p_idempotency_key: "test",
    p_request_hash: "test",
    p_customer_id: null,
    p_delivery_address: "test",
    p_notes: "",
    p_subtotal: 0,
    p_delivery_fee: 0,
    p_total: 0,
    p_currency: "UGX",
    p_items: []
  });

  if (error && error.code === "PGRST202") {
    fail("RPC process_order_intake_atomic is missing");
  } else {
    pass("RPC present");
  }
}

async function checkCatalog() {
  console.log("\n=== CATALOG CHECK ===");

  const res = await fetch(`${BASE_URL}/api/products`);
  const headers = res.headers;

  if (headers.get("x-commerce-ready") !== "true") {
    fail("Catalog not live (degraded mode)");
  } else {
    pass("Catalog live");
  }
}

async function checkOrders() {
  console.log("\n=== ORDER CHECK ===");

  const payload = {
    items: [
      {
        productId: "test-id",
        quantity: 1
      }
    ],
    customer: {
      name: "Test User",
      email: "test@example.com",
      phone: "0700000000"
    },
    delivery: {
      location: "Test Location"
    }
  };

  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": "preflight-test"
    },
    body: JSON.stringify(payload)
  });

  if (res.status === 503) {
    fail("Orders endpoint failing (503)");
  } else {
    pass("Orders endpoint responding");
  }
}

async function run() {
  console.log("🚀 PREFLIGHT CHECK STARTING");

  await checkSchema();
  await checkRPC();
  await checkCatalog();
  await checkOrders();

  console.log("\n=== RESULT ===");

  if (FAILURES > 0) {
    console.error(`❌ BLOCKED: ${FAILURES} critical issues found`);
    process.exit(1);
  } else {
    console.log("✅ READY FOR DEPLOYMENT");
  }
}

run();
