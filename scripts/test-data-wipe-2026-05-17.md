# Test Data Wipe — 2026-05-17

## Summary
Cleared pre-launch test orders + associated data from production DB.

## Before
- orders: 24 (PENDING, created Apr 17 – May 11)
- customers: 6
- order_items: 39

## After
- orders: 0
- customers: 0
- order_items: 0
- order_events: 0
- order_status_history: 0

## Verified
SQL counts re-run at end of session — all zeros.

## Backup
Supabase daily backup available pre-wipe (if rollback ever needed).
