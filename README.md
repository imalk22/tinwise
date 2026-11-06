# TINwise

*Your TIN, sorted.* A free TIN guide and tax calculators for Sri Lanka.

An independent helper site for Sri Lanka's TIN rules (mandatory for 8 transactions from 1 November 2026) and personal tax calculations.

## Run

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # tax engine tests
npm run build   # production build in dist/
```

## What's inside

| Section | File |
| --- | --- |
| "Do I need a TIN?" checker | `src/sections/TinChecker.tsx` |
| Registration guide and checklist | `src/sections/TinGuide.tsx` |
| Salary / APIT calculator | `src/sections/SalaryCalculator.tsx` |
| Annual tax estimator | `src/sections/AnnualEstimator.tsx` |
| Interest WHT and self-declaration | `src/sections/InterestWht.tsx` |
| Deadlines (.ics download) | `src/sections/Calendar.tsx` |
| More tools: capital gains, VAT & SSCL, foreign income, inflation, late penalties | `src/sections/Tools.tsx` (rules in `src/lib/tools.ts`) |
| FAQ | `src/sections/Faq.tsx` |

## Languages

English, Sinhala and Tamil. Strings live in `src/i18n/en.ts` (the source of truth), `si.ts` and `ta.ts`. TypeScript fails the build if a translation is missing a key. The chosen language is saved in the browser and defaults to the device language.

**Sinhala and Tamil translations were machine-drafted. Have native speakers review them before launch**, especially the tax terms.

All rates live in one object, `TAX_YEAR` in `src/lib/tax.ts`. Update it for each new year of assessment and re-run the tests.

## Before launch: verify these against official IRD notices

These figures came from secondary sources (news, tax firms, calculators):

- Personal relief Rs. 1.8M and the 6/18/24/30/36% bands (Y/A 2025/26). 2026/27 is not confirmed.
- 10% interest WHT, 15% dividend WHT, 25% rent relief
- CGT of 15% for individuals from 3 June 2026 (Act No. 11 of 2026)
- Quarterly instalment dates for 2026/27
- The interest WHT self-declaration process
- `RULES` in `src/lib/tools.ts`:
  - VAT threshold of Rs. 60M (sources conflict on whether it fell to Rs. 36M)
  - SSCL threshold of Rs. 36M a year from 1 July 2026, and the liable-turnover shares (100/85/50/25%)
  - Late-payment penalty and interest: 20% after 14 days, plus 1.5% a month
  - Late-filing penalty: greater of 5% + 1% a month, or Rs. 50k + Rs. 10k a month, capped at Rs. 400k
  - Latest CCPI figure (update monthly from CBSL)
- Capital gains main-home exemption conditions

Stack: Vite, React 19, TypeScript, Tailwind CSS v4, Motion, Lucide icons. Everything runs client-side; no user data leaves the browser.

## Deploy

The site is fully static: `npm run build` produces `dist/`, which any static host can serve. No server, database or API keys.

### 1. Before every release

1. In `.env`, set `VITE_SITE_URL` to your real domain. The build warns while it's still `https://your-domain.lk`. It feeds the social preview tags, the canonical link, `robots.txt` and `sitemap.xml`.
2. Set `VITE_RATES_CHECKED` to the date you last checked the rates. It's shown in the footer.
3. Run `npm test` and `npm run build`, then `npm run preview` to click through the production build locally.

### 2. Pick a host

All three have free tiers and read the headers file in this repo.

| Host | Settings | Headers file |
| --- | --- | --- |
| **Cloudflare Pages** (recommended: fast edge network close to Sri Lanka) | Build command `npm run build`, output `dist` | `public/_headers` |
| Netlify | Build command `npm run build`, publish `dist` | `public/_headers` |
| Vercel | Framework preset "Vite" | `vercel.json` |

Connect the Git repository, enter the settings above, and add `VITE_SITE_URL` as an environment variable in the host's dashboard (it overrides `.env`). Then point your domain at it.

### 3. After the first deploy

- Paste the URL into WhatsApp or the [Facebook sharing debugger](https://developers.facebook.com/tools/debug/) to check the preview card.
- Check the headers at [securityheaders.com](https://securityheaders.com).
- Submit `/sitemap.xml` in [Google Search Console](https://search.google.com/search-console).

### What's already set up

- **Performance:** separate long-cached chunks for React, Motion and icons. The Tools section loads lazily. Sinhala and Tamil fonts are self-hosted, script-only subsets that download only when those scripts appear.
- **Security headers:** strict Content-Security-Policy (no third-party scripts, no framing), HSTS, nosniff, Referrer-Policy and Permissions-Policy. Hashed assets are cached for a year.
- **Sharing and install:** Open Graph and Twitter tags, a 1200×630 preview image, app icons, a web manifest (installable to a home screen) and JSON-LD structured data.
- **Resilience:** an error boundary shows a reload message instead of a blank page, plus a `<noscript>` fallback with the key TIN facts.

Changing `public/og-image.png` or the icons: they were generated from code. Edit them in any image tool at the same sizes (1200×630, 512, 192 and 180 px).
