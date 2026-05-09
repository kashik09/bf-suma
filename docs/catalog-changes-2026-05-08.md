# Catalog Updates — 2026-05-08

Applied per client spreadsheet reconciliation.

## Changes

| SKU | Field | Before | After |
|-----|-------|--------|-------|
| AP024E | price | 9,900 | 19,800 |
| AP013E | price | 261,000 | 277,000 |
| AP188A | name | Blueberry Chewable Tablets | Sharp Vision – Chewable Tablets |
| AP132A → AP132B | sku | AP132A | AP132B |
| AP101E → AP10/E | sku | AP101E | AP10/E |

## Rationale

- **AP024E**: Spreadsheet lists 19,800 for 2's/box packaging
- **AP013E**: Client PDF confirms 277,000
- **AP188A**: Spreadsheet uses "Sharp Vision" branding
- **AP132B**: Spreadsheet SKU correction for NT Diarr
- **AP10/E**: Spreadsheet SKU correction for Dr. Toothpaste

## Verification

```sql
SELECT sku, name, price, status
FROM public.products
WHERE sku IN ('AP024E', 'AP013E', 'AP188A', 'AP132B', 'AP10/E');
```

All 5 rows confirmed ACTIVE with correct values.
