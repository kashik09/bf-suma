# Shop Image Audit — 2026-05-14

## Summary

| Status | Count |
|--------|-------|
| 🟢 All images working | 41 |
| 🟡 Remote URL broken (400) | 7 |
| 🔴 Zero images | 0 |

**Total ACTIVE products:** 48

---

## 🟡 BROKEN: Remote URLs returning HTTP 400

These images fail to load. Customers see broken images.

| Product | Slug | Broken URL | Local Backup? |
|---------|------|------------|---------------|
| Ginseng Coffee | `ginseng-coffee` | ginseng-coffee.jpg | ✓ `ginseng.webp` |
| Quad Reishi Capsules | `quad-reishi-capsules` | quad-reishi-capsules.jpg | ✓ `quad-reishi.webp` |
| SUMA GRAND 1 Set | `suma-grand-1-set` | suma-grand-1-set.jpg | ✗ |
| SUMA GRAND 2 Full Set | `suma-grand-2-full-set` | suma-grand-2-full-set.jpg | ✗ |
| Youth Essence Facial Cream | `youth-essence-facial-cream` | youth-essence-facial-cream.jpg | ✗ |
| Youth Essence Toner | `youth-essence-toner` | youth-essence-toner.jpg | ✗ |
| Youth Ever | `youth-ever` | youth-ever.jpg | ✗ |

---

## 🟢 WORKING: Local Images (14)

| Product | File |
|---------|------|
| Anatic Herbal Essence Soap | anatic-herbal-soap.jpg |
| CereBrain Tablets | cerebrain.jpg |
| Detoxilive Pro Oil Capsules | detoxilive-pro-oil.jpg |
| Dr. Ts Toothpaste | dr-toothpaste.jpg |
| FemiVitamins | femivitamins.jpeg |
| GluzoJoint-Ultra Pro | gluzojoint-ultra-pro.jpg |
| MicrO2 Cycle Tablets | micro2-cycle.jpg |
| NT Diarr Pills | ntdiarr-pills.jpg |
| ProstatRelax Capsules | prostatrelax.jpg |
| Sharp Vision – Chewable Tablets | sharp-vision.jpg |
| Sleep Beauty | sleep-beauty.jpeg |
| X Power Man Plus Capsules | xpower-man-plus.jpg |
| Xpower Coffee | xpower-coffee.jpg |
| ZaminoCal Plus Capsules | zaminocal-plus-capsules.webp |

---

## 🟢 WORKING: Remote Supabase URLs (27)

All returning HTTP 200:
- cordyceps-coffee.jpg
- reishi-coffee.jpg
- arthro-xtra-tablets.jpg
- calcium-vitamin-d3-milk.jpg
- consti-relax-solution.jpg
- cool-roll.jpg
- elements.webp
- ez-xlim.jpg
- femibiotics.webp
- femicalcium-d3.webp
- femicare-cleanser.jpg
- feminergy-capsules.jpg
- gym-effect-capsules.jpg
- nmn-coffee.webp
- nmn-duo-release.webp
- nmn-sharp-mind.webp
- novel-depile-capsules.jpg
- probio-3-plus.webp
- pure-ganoderma-spores-30.jpg
- pure-ganoderma-spores-60.jpg
- ganoderma-spores-oil-60.jpg
- refined-yunzhi-essence.jpg
- relivin-tea.jpg
- veggie-veggie.jpg
- vitamin-c-chewable.jpg
- youth-essence-facial-mask.jpg
- youth-essence-lotion.jpg
- youth-refreshing-facial-cleanser.jpg

---

## Unused Local Files

These exist in `/public/products/` but aren't referenced in DB:
- `ginseng.webp` (can replace broken ginseng-coffee.jpg)
- `quad-reishi.webp` (can replace broken quad-reishi-capsules.jpg)

---

## Recommended Actions

### Immediate (2 products have local backups)

```sql
-- Fix Ginseng Coffee
UPDATE product_images
SET url = '/products/ginseng.webp'
WHERE product_id = '1aab0a5e-c0fe-a103-3909-4dd343f0cef4';

-- Fix Quad Reishi Capsules
UPDATE product_images
SET url = '/products/quad-reishi.webp'
WHERE product_id = '1aab0a5e-cab5-a101-e7cf-cd9b22a33fcd';
```

### Needs sourcing (5 products)

1. SUMA GRAND 1 Set
2. SUMA GRAND 2 Full Set
3. Youth Essence Facial Cream
4. Youth Essence Toner
5. Youth Ever

Either:
- Re-upload to Supabase Storage
- Download and save locally to `/public/products/`
