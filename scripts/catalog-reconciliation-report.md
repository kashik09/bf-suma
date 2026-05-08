# Catalog Reconciliation Report

Generated: 2026-05-08
Source: data/BF_SUMA_Website_Prices.xlsx (May 2026 retail prices)

## Summary

| Status | Count |
|--------|-------|
| ✅ Match | 51 |
| ❌ Mismatch | 0 |
| ⚠️ Missing in DB | 0 |
| 📦 Missing in Sheet | 5 |
| **Total** | **56** |

## 📦 In Database but Missing from Spreadsheet (5)

| SKU | Name | Stored UGX | Currency |
|-----|------|------------|----------|
| BFS-DER-007 | Derma Repair Body Lotion 150ml | 300,000 | UGX |
| BFS-DRC-027 | Dr Cow Smart Gummies | 388,800 | UGX |
| BFS-DRC-032 | Dr Cow Calcium Milk Candy | 379,100 | UGX |
| BFS-GYM-016 | Gym Ease Tea | 284,400 | UGX |
| BFS-PUR-040 | Purewell Water Purifier | 648,000 | UGX |

### Recommendation

These 5 products use the legacy `BFS-*` SKU format (not official AP/CP codes).
They appear to be old test data and should be **archived** (`status = 'ARCHIVED'`).

```sql
UPDATE public.products
SET status = 'ARCHIVED', updated_at = NOW()
WHERE sku LIKE 'BFS-%';
```

## ✅ Matches (51)

<details>
<summary>Click to expand</summary>

| SKU | Name | UGX |
|-----|------|-----|
| AP004E | MicrO2 Cycle Tablets | 99,000 |
| AP006E | ConstiRelax Solution | 130,500 |
| AP009F | ProstatRelax Capsules | 108,000 |
| AP011F | 4 in 1 Reishi Coffee | 58,500 |
| AP013E | Pure & Broken Ganoderma Spores (30's) | 261,000 |
| AP013G | Pure & Broken Ganoderma Spores (60's) | 495,000 |
| AP014C | GluzoJoint-F Capsules | 137,025 |
| AP014F | Refined Yunzhi Capsules | 130,500 |
| AP022E | ArthroXtra Tablets | 180,000 |
| AP024E | AnaticTM Herbal Essence Soap | 9,900 |
| AP028F | 4 in 1 Ginseng Coffee | 58,500 |
| AP029E | X Power Man Capsules | 189,000 |
| AP039F | 4 in 1 Cordyceps Coffee | 58,500 |
| AP041E | Novel Depile Capsules | 99,000 |
| AP052F | FemiCare Feminine Cleanser | 49,500 |
| AP074E | Feminergy Capsules | 135,000 |
| AP077E | CereBrain Tablets | 112,500 |
| AP097E | Detoxilive Capsules | 67,500 |
| AP100A | Veggie Veggie | 135,000 |
| AP101E | Dr.Ts Toothpaste | 24,750 |
| AP107E | Zaminocal Plus Capsules | 103,500 |
| AP113A | Xpower Coffee for Men | 67,500 |
| AP131A | Cool Roll (1 Dozen) | 4,500 |
| AP132A | Ntdiarr Pills (1 Dozen) | 13,500 |
| AP144B | NMN Coffee | 112,500 |
| AP145A | YOUTH EVER | 484,481 |
| AP146A | NMN DUO Release | 670,500 |
| AP146B | NMN-Sharp Mind | 783,000 |
| AP147B | Pure & Broken Ganoderma Oil (60's) | 576,000 |
| AP150A | Relivin Tea | 88,088 |
| AP152A | GymEffect Capsule | 90,000 |
| AP153A | Quad Reishi Capsules | 157,500 |
| AP155C | Probio 3 | 135,000 |
| AP158B | Vitamin C Chewable Tablets | 90,000 |
| AP166B | Detoxilive Pro Oil Capsules | 90,000 |
| AP169A | Elements | 135,000 |
| AP170A | Ez-Xlim Capsule | 254,475 |
| AP179D | Femibiotics | 180,000 |
| AP182B | Calcium & Vitamin D3 Milk Tablets | 108,000 |
| AP188A | Sharp Vision (Blueberry Chewable) | 108,000 |
| AP190A | GluzoJoint-Ultra Pro Tablets | 252,000 |
| AP192C | FemiCalcium D3 | 144,000 |
| AP209B | Sleep Beauty | 72,000 |
| AP211A | FemiVitamins tablet | 81,000 |
| CP0201 | Youth Refreshing Facial Cleanser | 99,000 |
| CP0202 | Youth Essence Lotion | 112,500 |
| CP0203 | Youth Essence Toner | 121,500 |
| CP0204 | Youth Essence Facial Mask | 81,000 |
| CP0205 | Youth Essence Cream | 153,000 |
| CP0206 | SUMA GRAND 1 (Cleanser+Lotion+Toner) | 362,138 |
| CP0207 | SUMA GRAND 2 (Cleanser+Lotion+Toner+Facial Mask+Cream) | 616,613 |

</details>

