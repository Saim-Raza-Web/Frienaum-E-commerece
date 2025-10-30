# Feinraumshop Testing Report

---

## Devices & Browsers Tested

- **Desktop:**
  - Windows 10/11, MacOS Ventura, Ubuntu 22.04
  - Browsers: Chrome (latest), Firefox (latest), Edge (latest), Safari (latest on Mac)
- **Mobile:**
  - iOS (Safari, Chrome)
  - Android (Chrome, Firefox)


## Steps Taken & Main QA Areas

- Verified all page meta titles/descriptions and OG/twitter tags use 'Feinraumshop' branding
- All brand usages corrected: UI, meta, and translations (incl. special characters)
- Checked and updated `<html lang>` attributes
- Product card/grid responsiveness on all main devices
- Home, product, cart, categories, about, contact grids at 1200px/992px/768px/480px
- Admin/Merchant dashboards: visually checked card/grid layout in Chrome DevTools (manual, due to file complexity)
- Stripe payment tested (test key): flow OK up to confirmation/failure, error handled
- Signup/login/logout robust (form, OAuth if available)
- Product search, filter, category UX validated
- Page speed spot-checked: images lazy loaded, assets sized for desktop/mob, mainlists paged/limited, cache headers present (where relevant)


## Known Issues / Repro Steps

- Large admin/merchant dashboard files: grids/UX consistent, but deeper automated refactor may be needed for very large grids (manual review advised after deploy)
- Browser autofill on custom form fields (some fields require manual completion on iOS)
- Mobile menu overlay blur effect minor Safari issue (visual only)
- Stripe: Must use live key for prod, test key for staging/development


---

## Change Summary (all code changes)
See next commit log / README for full file list.
