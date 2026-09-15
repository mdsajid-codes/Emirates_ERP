#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          Emirates ERP — POS Database Seeder             ║
 * ║   Seeds all POS tables with 50 Dubai-themed records     ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 * Usage:
 *   node scripts/pos-seeder.js
 *
 * Requirements:
 *   - Backend running on localhost:8080
 *   - token.txt in project root containing a valid JWT
 *   - npm install axios (or: node --version >= 18 uses built-in fetch)
 */

const fs = require('fs');
const path = require('path');
const config = require('./pos-seeder-config');

// ── Colors for terminal output ──────────────────────────────
const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};
const log = (msg) => console.log(msg);
const ok = (msg) => console.log(`${C.green}✅ ${msg}${C.reset}`);
const warn = (msg) => console.log(`${C.yellow}⚠️  ${msg}${C.reset}`);
const err = (msg) => console.log(`${C.red}❌ ${msg}${C.reset}`);
const info = (msg) => console.log(`${C.cyan}ℹ️  ${msg}${C.reset}`);
const section = (msg) => console.log(`\n${C.bold}${C.cyan}━━ ${msg} ━━${C.reset}`);

// ── HTTP helper ─────────────────────────────────────────────
let token = '';

async function api(method, endpoint, body) {
  const url = `${config.API_URL}${endpoint}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

async function post(endpoint, body) { return api('POST', endpoint, body); }
async function get(endpoint) { return api('GET', endpoint); }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Seed a list with progress logging ───────────────────────
async function seedAll(label, endpoint, items, transform = x => x) {
  section(label);
  const results = [];
  let success = 0, fail = 0;
  for (let i = 0; i < items.length; i++) {
    try {
      const payload = transform(items[i], results);
      const result = await post(endpoint, payload);
      results.push(result);
      success++;
      process.stdout.write(`\r  ${C.dim}[${i + 1}/${items.length}] Inserted: ${payload.name || payload.supplierName || payload.orderId || JSON.stringify(payload).slice(0, 30)}...${C.reset}`);
    } catch (e) {
      fail++;
      warn(`\n  Skipped item ${i + 1}: ${e.message}`);
      results.push(null);
    }
    await sleep(config.REQUEST_DELAY_MS);
  }
  console.log('');
  if (fail === 0) ok(`${label}: ${success} records inserted`);
  else warn(`${label}: ${success} inserted, ${fail} failed`);
  return results;
}

// ═══════════════════════════════════════════════════════════
//  DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════

const TAX_RATES = [
  { name: 'VAT Standard 5%', percent: 5, compound: false },
  { name: 'VAT Zero-Rated', percent: 0, compound: false },
  { name: 'VAT Exempt', percent: 0, compound: false },
  { name: 'Service Charge 10%', percent: 10, compound: false },
  { name: 'Tourism Fee 3%', percent: 3, compound: false },
];

const CATEGORIES = [
  { name: 'Men', description: 'Menswear and accessories for men' },
  { name: 'Women', description: 'Womenswear and fashion accessories' },
  { name: 'Kids', description: 'Children clothing and accessories' },
  { name: 'Traditional', description: 'UAE traditional wear — Kandura, Abaya, Ghutra' },
  { name: 'Sports', description: 'Sportswear and athletic apparel' },
  { name: 'Footwear', description: 'Shoes, sandals, heels and sneakers' },
  { name: 'Accessories', description: 'Bags, wallets, perfumes, and fashion accessories' },
];

const STORES = [
  { name: 'Dubai Mall Flagship', address: 'Financial Centre Rd, Downtown Dubai', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: 'TRN100000001' },
  { name: 'Mall of the Emirates', address: 'Sheikh Zayed Rd, Al Barsha, Dubai', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: 'TRN100000002' },
  { name: 'Deira City Centre', address: 'Al Garhoud, Dubai', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: 'TRN100000003' },
  { name: 'Ibn Battuta Mall', address: 'Sheikh Zayed Rd, Jebel Ali, Dubai', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: 'TRN100000004' },
  { name: 'City Walk Boutique', address: 'Al Wasl Rd, Jumeirah, Dubai', currency: 'AED', timezone: 'Asia/Dubai', vatNumber: 'TRN100000005' },
];

const CUSTOMERS = [
  { name: 'Ahmed Al Mansouri', phone: '+971501234567', email: 'ahmed.mansouri@gmail.com' },
  { name: 'Fatima Al Hashimi', phone: '+971552345678', email: 'fatima.hashimi@gmail.com' },
  { name: 'Mohammed Al Rashid', phone: '+971523456789', email: 'm.rashid@gmail.com' },
  { name: 'Sara Al Zaabi', phone: '+971564567890', email: 'sara.zaabi@gmail.com' },
  { name: 'Khalid Al Nuaimi', phone: '+971505678901', email: 'khalid.nuaimi@gmail.com' },
  { name: 'Mariam Al Suwaidi', phone: '+971556789012', email: 'mariam.suwaidi@gmail.com' },
  { name: 'Omar Al Falasi', phone: '+971527890123', email: 'omar.falasi@gmail.com' },
  { name: 'Hessa Al Marri', phone: '+971568901234', email: 'hessa.marri@gmail.com' },
  { name: 'Yousef Al Ketbi', phone: '+971509012345', email: 'yousef.ketbi@gmail.com' },
  { name: 'Noura Al Hamdan', phone: '+971550123456', email: 'noura.hamdan@gmail.com' },
  { name: 'Rashid Al Mheiri', phone: '+971521234567', email: 'rashid.mheiri@gmail.com' },
  { name: 'Aisha Al Blooshi', phone: '+971562345678', email: 'aisha.blooshi@gmail.com' },
  { name: 'Saeed Al Qubaisi', phone: '+971503456789', email: 'saeed.qubaisi@gmail.com' },
  { name: 'Latifa Al Khoori', phone: '+971534567890', email: 'latifa.khoori@gmail.com' },
  { name: 'Hamad Al Romaithi', phone: '+971575678901', email: 'hamad.romaithi@gmail.com' },
  { name: 'Maryam Al Derei', phone: '+971506789012', email: 'maryam.derei@gmail.com' },
  { name: 'Sultan Al Kaabi', phone: '+971557890123', email: 'sultan.kaabi@gmail.com' },
  { name: 'Shaikha Al Ameri', phone: '+971528901234', email: 'shaikha.ameri@gmail.com' },
  { name: 'Abdullah Al Mazrouei', phone: '+971569012345', email: 'abdulla.mazrouei@gmail.com' },
  { name: 'Hind Al Shamsi', phone: '+971500123456', email: 'hind.shamsi@gmail.com' },
  { name: 'Majid Al Naqbi', phone: '+971531234567', email: 'majid.naqbi@gmail.com' },
  { name: 'Reem Al Muhairi', phone: '+971562345679', email: 'reem.muhairi@gmail.com' },
  { name: 'Faisal Al Ghurair', phone: '+971503456780', email: 'faisal.ghurair@gmail.com' },
  { name: 'Maitha Al Mansoori', phone: '+971534567891', email: 'maitha.mansoori@gmail.com' },
  { name: 'Saud Al Qassimi', phone: '+971575678902', email: 'saud.qassimi@gmail.com' },
  { name: 'Jawaher Al Sabri', phone: '+971506789013', email: 'jawaher.sabri@gmail.com' },
  { name: 'Butti Al Muaini', phone: '+971557890124', email: 'butti.muaini@gmail.com' },
  { name: 'Asma Al Sayed', phone: '+971528901235', email: 'asma.sayed@gmail.com' },
  { name: 'Nasser Al Awadhi', phone: '+971569012346', email: 'nasser.awadhi@gmail.com' },
  { name: 'Shamsa Al Matrooshi', phone: '+971500123457', email: 'shamsa.matrooshi@gmail.com' },
  { name: 'Humaid Al Teneiji', phone: '+971531234568', email: 'humaid.teneiji@gmail.com' },
  { name: 'Khawla Al Zarouni', phone: '+971562345680', email: 'khawla.zarouni@gmail.com' },
  { name: 'Tariq Al Kubaisi', phone: '+971503456781', email: 'tariq.kubaisi@gmail.com' },
  { name: 'Hayat Al Habsi', phone: '+971534567892', email: 'hayat.habsi@gmail.com' },
  { name: 'Mubarak Al Tunaiji', phone: '+971575678903', email: 'mubarak.tunaiji@gmail.com' },
  { name: 'Lubna Al Shamali', phone: '+971506789014', email: 'lubna.shamali@gmail.com' },
  { name: 'Khalifa Al Azeezi', phone: '+971557890125', email: 'khalifa.azeezi@gmail.com' },
  { name: 'Meera Al Shehhi', phone: '+971528901236', email: 'meera.shehhi@gmail.com' },
  { name: 'Jaber Al Dhaheri', phone: '+971569012347', email: 'jaber.dhaheri@gmail.com' },
  { name: 'Hoor Al Mazrouei', phone: '+971500123458', email: 'hoor.mazrouei@gmail.com' },
  { name: 'Obaid Al Falasi', phone: '+971531234569', email: 'obaid.falasi@gmail.com' },
  { name: 'Wedad Al Tamimi', phone: '+971562345681', email: 'wedad.tamimi@gmail.com' },
  { name: 'Yousif Al Hammadi', phone: '+971503456782', email: 'yousif.hammadi@gmail.com' },
  { name: 'Dana Al Kindi', phone: '+971534567893', email: 'dana.kindi@gmail.com' },
  { name: 'Musab Al Neyadi', phone: '+971575678904', email: 'musab.neyadi@gmail.com' },
  { name: 'Badria Al Rashidi', phone: '+971506789015', email: 'badria.rashidi@gmail.com' },
  { name: 'Zayed Al Shamsi', phone: '+971557890126', email: 'zayed.shamsi@gmail.com' },
  { name: 'Amna Al Baloushi', phone: '+971528901237', email: 'amna.baloushi@gmail.com' },
  { name: 'Essa Al Hammadi', phone: '+971569012348', email: 'essa.hammadi@gmail.com' },
  { name: 'Nayla Al Muftah', phone: '+971500123459', email: 'nayla.muftah@gmail.com' },
];

// 50 products — each with name, sku, category index, description, and variant info
const PRODUCTS_DATA = [
  // Traditional (cat index 3)
  { name: 'Dubai Classic Kandura', sku: 'TRAD-KAN-001', catIdx: 3, price: 29900, cost: 15000, attrs: { Color: 'White', Size: 'L' }, barcode: '6291001001001' },
  { name: 'Premium Abaya', sku: 'TRAD-ABA-001', catIdx: 3, price: 34900, cost: 18000, attrs: { Color: 'Black', Size: 'M' }, barcode: '6291001001002' },
  { name: 'Embroidered Kandura Gold', sku: 'TRAD-KAN-002', catIdx: 3, price: 44900, cost: 22000, attrs: { Color: 'Beige', Size: 'XL' }, barcode: '6291001001003' },
  { name: 'Linen Summer Kandura', sku: 'TRAD-KAN-003', catIdx: 3, price: 24900, cost: 12000, attrs: { Color: 'Off-White', Size: 'M' }, barcode: '6291001001004' },
  { name: 'Crystal-Embellished Abaya', sku: 'TRAD-ABA-002', catIdx: 3, price: 89900, cost: 45000, attrs: { Color: 'Navy', Size: 'L' }, barcode: '6291001001005' },
  { name: 'Silk Abaya', sku: 'TRAD-ABA-003', catIdx: 3, price: 59900, cost: 30000, attrs: { Color: 'Dark Blue', Size: 'M' }, barcode: '6291001001006' },
  { name: 'Prayer Cap (Thoub)', sku: 'TRAD-CAP-001', catIdx: 3, price: 4900, cost: 2000, attrs: { Color: 'White' }, barcode: '6291001001007' },
  { name: 'Ghutra Headscarf', sku: 'TRAD-GHU-001', catIdx: 3, price: 7900, cost: 3500, attrs: { Color: 'White/Red' }, barcode: '6291001001008' },
  // Men (cat index 0)
  { name: "Men's Polo Shirt", sku: 'MEN-POL-001', catIdx: 0, price: 14900, cost: 6000, attrs: { Color: 'Navy', Size: 'L' }, barcode: '6291001002001' },
  { name: "Men's Slim-Fit Chinos", sku: 'MEN-CHI-001', catIdx: 0, price: 19900, cost: 8500, attrs: { Color: 'Khaki', Size: '32' }, barcode: '6291001002002' },
  { name: "Men's Formal Blazer", sku: 'MEN-BLA-001', catIdx: 0, price: 59900, cost: 28000, attrs: { Color: 'Charcoal', Size: '42' }, barcode: '6291001002003' },
  { name: "Men's Linen Shirt", sku: 'MEN-LIN-001', catIdx: 0, price: 17900, cost: 7500, attrs: { Color: 'Sky Blue', Size: 'M' }, barcode: '6291001002004' },
  { name: "Men's Jogger Pants", sku: 'MEN-JOG-001', catIdx: 0, price: 13900, cost: 5500, attrs: { Color: 'Grey', Size: 'M' }, barcode: '6291001002005' },
  { name: "Men's Denim Jeans", sku: 'MEN-DEN-001', catIdx: 0, price: 22900, cost: 9500, attrs: { Color: 'Indigo', Size: '34' }, barcode: '6291001002006' },
  { name: "Men's Premium T-Shirt", sku: 'MEN-TSH-001', catIdx: 0, price: 9900, cost: 3500, attrs: { Color: 'White', Size: 'XL' }, barcode: '6291001002007' },
  { name: "Men's Casual Shorts", sku: 'MEN-SHO-001', catIdx: 0, price: 11900, cost: 4500, attrs: { Color: 'Olive', Size: 'M' }, barcode: '6291001002008' },
  { name: "Men's Hoodie", sku: 'MEN-HOO-001', catIdx: 0, price: 27900, cost: 12000, attrs: { Color: 'Black', Size: 'L' }, barcode: '6291001002009' },
  { name: "Men's Oxford Shirt", sku: 'MEN-OXF-001', catIdx: 0, price: 18900, cost: 8000, attrs: { Color: 'Blue', Size: 'M' }, barcode: '6291001002010' },
  // Women (cat index 1)
  { name: "Women's Maxi Dress", sku: 'WOM-MAX-001', catIdx: 1, price: 29900, cost: 13000, attrs: { Color: 'Floral', Size: 'M' }, barcode: '6291001003001' },
  { name: "Women's Blouse", sku: 'WOM-BLO-001', catIdx: 1, price: 15900, cost: 6500, attrs: { Color: 'Peach', Size: 'S' }, barcode: '6291001003002' },
  { name: "Women's Palazzo Pants", sku: 'WOM-PAL-001', catIdx: 1, price: 19900, cost: 8500, attrs: { Color: 'Cream', Size: 'M' }, barcode: '6291001003003' },
  { name: "Women's Wrap Skirt", sku: 'WOM-SKI-001', catIdx: 1, price: 13900, cost: 5500, attrs: { Color: 'Teal', Size: 'S' }, barcode: '6291001003004' },
  { name: "Women's Linen Blazer", sku: 'WOM-BLA-001', catIdx: 1, price: 52900, cost: 25000, attrs: { Color: 'Sand', Size: 'L' }, barcode: '6291001003005' },
  { name: "Women's Casual Tee", sku: 'WOM-TEE-001', catIdx: 1, price: 9900, cost: 3500, attrs: { Color: 'Lavender', Size: 'M' }, barcode: '6291001003006' },
  { name: "Women's Denim Jacket", sku: 'WOM-DJA-001', catIdx: 1, price: 32900, cost: 14000, attrs: { Color: 'Light Blue', Size: 'M' }, barcode: '6291001003007' },
  { name: "Women's Midi Dress", sku: 'WOM-MID-001', catIdx: 1, price: 24900, cost: 11000, attrs: { Color: 'Rose', Size: 'S' }, barcode: '6291001003008' },
  { name: "Women's Summer Shorts", sku: 'WOM-SHO-001', catIdx: 1, price: 11900, cost: 4500, attrs: { Color: 'White', Size: 'S' }, barcode: '6291001003009' },
  { name: "Women's Cardigan", sku: 'WOM-CAR-001', catIdx: 1, price: 19900, cost: 8500, attrs: { Color: 'Beige', Size: 'L' }, barcode: '6291001003010' },
  // Kids (cat index 2)
  { name: "Kids' Cotton T-Shirt", sku: 'KID-TSH-001', catIdx: 2, price: 6900, cost: 2500, attrs: { Color: 'Red', Size: '6Y' }, barcode: '6291001004001' },
  { name: "Kids' Denim Jeans", sku: 'KID-DEN-001', catIdx: 2, price: 12900, cost: 5000, attrs: { Color: 'Blue', Size: '8Y' }, barcode: '6291001004002' },
  { name: "Kids' Hoodie", sku: 'KID-HOO-001', catIdx: 2, price: 11900, cost: 4500, attrs: { Color: 'Green', Size: '10Y' }, barcode: '6291001004003' },
  { name: "Kids' School Shirt", sku: 'KID-SCH-001', catIdx: 2, price: 8900, cost: 3500, attrs: { Color: 'White', Size: '7Y' }, barcode: '6291001004004' },
  { name: "Kids' Party Dress", sku: 'KID-DRE-001', catIdx: 2, price: 14900, cost: 6000, attrs: { Color: 'Pink', Size: '5Y' }, barcode: '6291001004005' },
  // Footwear (cat index 5)
  { name: "Men's Running Shoes", sku: 'FTW-RUN-001', catIdx: 5, price: 44900, cost: 20000, attrs: { Color: 'Black/White', Size: '43' }, barcode: '6291001005001' },
  { name: "Women's High Heels", sku: 'FTW-HEE-001', catIdx: 5, price: 37900, cost: 16000, attrs: { Color: 'Nude', Size: '38' }, barcode: '6291001005002' },
  { name: "Men's Leather Oxford", sku: 'FTW-LEA-001', catIdx: 5, price: 54900, cost: 25000, attrs: { Color: 'Brown', Size: '42' }, barcode: '6291001005003' },
  { name: "Kids' Sneakers", sku: 'FTW-SNE-001', catIdx: 5, price: 19900, cost: 8500, attrs: { Color: 'Blue/White', Size: '32' }, barcode: '6291001005004' },
  { name: "Women's Sandals", sku: 'FTW-SAN-001', catIdx: 5, price: 24900, cost: 10500, attrs: { Color: 'Gold', Size: '37' }, barcode: '6291001005005' },
  { name: "Men's Casual Slip-Ons", sku: 'FTW-SLI-001', catIdx: 5, price: 27900, cost: 12000, attrs: { Color: 'Navy', Size: '44' }, barcode: '6291001005006' },
  // Sports (cat index 4)
  { name: 'Sports Running Shorts', sku: 'SPT-SHO-001', catIdx: 4, price: 12900, cost: 4500, attrs: { Color: 'Black', Size: 'M' }, barcode: '6291001006001' },
  { name: 'Dry-Fit Sport T-Shirt', sku: 'SPT-DRY-001', catIdx: 4, price: 11900, cost: 4000, attrs: { Color: 'Blue', Size: 'L' }, barcode: '6291001006002' },
  { name: 'Sports Track Pants', sku: 'SPT-TRA-001', catIdx: 4, price: 15900, cost: 6000, attrs: { Color: 'Grey', Size: 'M' }, barcode: '6291001006003' },
  { name: 'Compression Leggings', sku: 'SPT-LEG-001', catIdx: 4, price: 17900, cost: 7000, attrs: { Color: 'Black', Size: 'S' }, barcode: '6291001006004' },
  { name: 'Sports Gym Jacket', sku: 'SPT-JAC-001', catIdx: 4, price: 29900, cost: 12000, attrs: { Color: 'Red', Size: 'L' }, barcode: '6291001006005' },
  // Accessories (cat index 6)
  { name: 'Genuine Leather Wallet', sku: 'ACC-WAL-001', catIdx: 6, price: 19900, cost: 8000, attrs: { Color: 'Brown' }, barcode: '6291001007001' },
  { name: 'Classic Leather Belt', sku: 'ACC-BEL-001', catIdx: 6, price: 14900, cost: 5500, attrs: { Color: 'Black', Size: 'M' }, barcode: '6291001007002' },
  { name: 'Silk Pocket Square', sku: 'ACC-POC-001', catIdx: 6, price: 6900, cost: 2500, attrs: { Color: 'Royal Blue' }, barcode: '6291001007003' },
  { name: 'Designer Sunglasses', sku: 'ACC-SUN-001', catIdx: 6, price: 39900, cost: 16000, attrs: { Color: 'Black Frame' }, barcode: '6291001007004' },
  { name: 'Luxury Oud Perfume 50ml', sku: 'ACC-OUD-001', catIdx: 6, price: 74900, cost: 35000, attrs: { Size: '50ml' }, barcode: '6291001007005' },
  { name: 'Prayer Beads (Misbaha)', sku: 'ACC-MIS-001', catIdx: 6, price: 9900, cost: 3500, attrs: { Color: 'Amber' }, barcode: '6291001007006' },
];

const SUPPLIERS = [
  'Al Gurg Textiles LLC',
  'Emirates Fashion Trading',
  'Dubai Garments Wholesale',
  'Mirdif Fashion Supply Co.',
  'Al Barsha Clothing House',
  'Jumeirah Lifestyle Trading',
  'Deira Fabric & Apparel Co.',
  'Ajman Fashion Suppliers',
  'Gulf Garments Group',
  'Sharjah Textile House',
];

const PAYMENT_METHODS = ['CASH', 'CARD', 'UPI', 'WALLET'];
const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];

// ═══════════════════════════════════════════════════════════
//  MAIN SEEDER
// ═══════════════════════════════════════════════════════════

async function main() {
  log(`\n${C.bold}${C.cyan}╔══════════════════════════════════════════════╗`);
  log(`║   Emirates ERP — POS Database Seeder        ║`);
  log(`╚══════════════════════════════════════════════╝${C.reset}\n`);

  // ── 1. Load or Fetch Token ────────────────────────────
  section('Step 0 — Auth Token');
  const tokenPath = path.resolve(__dirname, '..', config.TOKEN_FILE.replace('./', ''));

  if (fs.existsSync(tokenPath)) {
    token = fs.readFileSync(tokenPath, 'utf8').trim();
  }

  if (!token) {
    info('token.txt is empty or missing — attempting auto-login...');
    // Try to auto-login using credentials from config or defaults
    const creds = config.LOGIN_CREDENTIALS;
    if (!creds || !creds.tenantId || !creds.email || !creds.password) {
      err('No credentials set in pos-seeder-config.js LOGIN_CREDENTIALS.');
      err('Please add: module.exports.LOGIN_CREDENTIALS = { tenantId, email, password }');
      err('OR put a valid JWT in token.txt and rerun.');
      process.exit(1);
    }
    try {
      const loginRes = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!loginRes.ok) {
        const txt = await loginRes.text();
        err(`Login failed (HTTP ${loginRes.status}): ${txt.slice(0, 200)}`);
        process.exit(1);
      }
      const loginData = await loginRes.json();
      token = loginData.token || loginData.accessToken || loginData.jwt;
      if (!token) {
        err('Login succeeded but no token field found in response: ' + JSON.stringify(loginData).slice(0, 200));
        process.exit(1);
      }
      // Save for reuse
      fs.writeFileSync(tokenPath, token, 'utf8');
      ok(`Auto-login successful — token saved to token.txt`);
    } catch (e) {
      err(`Auto-login request failed: ${e.message}`);
      process.exit(1);
    }
  } else {
    ok(`Token loaded from token.txt (${token.length} chars)`);
  }

  // ── 2. Seed Tax Rates ─────────────────────────────────
  const taxRates = await seedAll('Step 1 — Tax Rates', '/pos/tax-rates', TAX_RATES,
    ({ name, percent, compound }) => ({ name, percent, compound })
  );
  const vatTaxId = taxRates[0]?.id; // VAT 5% is first
  if (!vatTaxId) { warn('Could not get tax rate ID — products will have no tax linked.'); }

  // ── 3. Seed Categories ────────────────────────────────
  const categories = await seedAll('Step 2 — Categories', '/pos/categories', CATEGORIES,
    ({ name, description }) => ({ name, description })
  );

  // ── 4. Seed Stores ────────────────────────────────────
  const stores = await seedAll('Step 3 — Stores', '/pos/stores', STORES,
    ({ name, address, currency, timezone, vatNumber }) => ({ name, address, currency, timezone, vatNumber })
  );
  const storeIds = stores.filter(Boolean).map(s => s.id);
  if (storeIds.length === 0) {
    warn('No stores were created (subscription limit may have been reached).');
    warn('Trying to fetch existing stores...');
    try {
      const existingStores = await get('/pos/stores');
      storeIds.push(...existingStores.map(s => s.id));
      if (storeIds.length === 0) {
        err('No stores available. Cannot continue without at least one store.');
        process.exit(1);
      }
      ok(`Using ${storeIds.length} existing store(s): IDs [${storeIds.join(', ')}]`);
    } catch (e) {
      err('Failed to fetch existing stores: ' + e.message);
      process.exit(1);
    }
  }

  // ── 5. Seed Customers ─────────────────────────────────
  await seedAll('Step 4 — Customers (50)', '/pos/customers', CUSTOMERS,
    ({ name, phone, email }) => ({ name, phone, email })
  );

  // ── 6. Build category ID map ──────────────────────────
  section('Step 5 — Fetching Category IDs');
  let catMap = {};
  try {
    const allCats = await get('/pos/categories');
    const catNames = ['Men', 'Women', 'Kids', 'Traditional', 'Sports', 'Footwear', 'Accessories'];
    catNames.forEach((name, idx) => {
      const found = allCats.find(c => c.name === name);
      catMap[idx] = found?.id || null;
    });
    ok(`Category map built: ${Object.entries(catMap).map(([k,v]) => `${k}→${v}`).join(', ')}`);
  } catch(e) {
    warn('Could not fetch categories: ' + e.message + '. Using null categoryId.');
  }

  // ── 7. Seed Products + Variants ───────────────────────
  section('Step 6 — Products + Variants (50 each)');
  const variantIds = [];
  let prodSuccess = 0, prodFail = 0;

  for (let i = 0; i < PRODUCTS_DATA.length; i++) {
    const p = PRODUCTS_DATA[i];
    const catId = catMap[p.catIdx] || null;
    const payload = {
      name: p.name,
      sku: p.sku,
      description: `Premium ${p.name} — available at Emirates ERP stores across Dubai.`,
      isActive: true,
      categoryId: catId,
      variants: [
        {
          sku: `${p.sku}-VAR1`,
          barcode: p.barcode,
          attributes: p.attrs,
          priceCents: p.price,
          costCents: p.cost,
          taxRateId: vatTaxId || null,
          active: true,
        }
      ]
    };

    try {
      const result = await post('/pos/products', payload);
      // The product was created; now get the variant ID
      // The product response includes the product. Fetch it to get variant IDs.
      if (result && result.id) {
        try {
          const productDetails = await get(`/pos/products/${result.id}`);
          const firstVariant = productDetails?.variants?.[0];
          if (firstVariant?.id) {
            variantIds.push({ variantId: firstVariant.id, price: p.price, name: p.name });
          }
        } catch (e2) {
          // variant ID retrieval failed — will skip inventory for this product
        }
      }
      prodSuccess++;
      process.stdout.write(`\r  ${C.dim}[${i + 1}/${PRODUCTS_DATA.length}] ${p.name}${C.reset}`);
    } catch (e) {
      prodFail++;
      warn(`\n  Skipped product ${i + 1} (${p.name}): ${e.message}`);
    }
    await sleep(config.REQUEST_DELAY_MS);
  }
  console.log('');
  if (prodFail === 0) ok(`Products + Variants: ${prodSuccess} records inserted`);
  else warn(`Products: ${prodSuccess} inserted, ${prodFail} failed`);

  // ── 8. Seed Stock Movements (Initial Inventory) ───────
  section('Step 7 — Stock Movements / Initial Inventory');
  if (variantIds.length === 0) {
    warn('No variant IDs available — skipping inventory seeding.');
    warn('(Fetch existing variants from /pos/products to manually add stock.)');
  } else {
    const primaryStoreId = storeIds[0];
    let stockSuccess = 0, stockFail = 0;

    for (let i = 0; i < variantIds.length; i++) {
      const { variantId, name } = variantIds[i];
      const storeId = storeIds[i % storeIds.length]; // distribute across stores
      const qty = 50 + Math.floor(Math.random() * 100); // 50–149 units

      try {
        await post('/pos/stock-movements', {
          storeId,
          productVariantId: variantId,
          changeQuantity: qty,
          reason: 'initial_stock',
          batchCode: `BATCH-${new Date().getFullYear()}-${String(i + 1).padStart(3, '0')}`,
        });
        stockSuccess++;
        process.stdout.write(`\r  ${C.dim}[${i + 1}/${variantIds.length}] Stock: ${name} → ${qty} units @ Store ${storeId}${C.reset}`);
      } catch (e) {
        stockFail++;
        warn(`\n  Stock movement failed for variant ${variantId}: ${e.message}`);
      }
      await sleep(config.REQUEST_DELAY_MS);
    }
    console.log('');
    if (stockFail === 0) ok(`Stock Movements (initial): ${stockSuccess} records inserted`);
    else warn(`Stock: ${stockSuccess} inserted, ${stockFail} failed`);
  }

  // ── 9. Seed Purchase Orders ───────────────────────────
  section('Step 8 — Purchase Orders (50)');
  if (variantIds.length === 0) {
    warn('No variant IDs — skipping purchase orders.');
  } else {
    let poSuccess = 0, poFail = 0;
    for (let i = 0; i < 50; i++) {
      const storeId = storeIds[i % storeIds.length];
      const supplier = SUPPLIERS[i % SUPPLIERS.length];
      const itemCount = 2 + (i % 4); // 2–5 items per PO
      const items = [];
      for (let j = 0; j < itemCount; j++) {
        const v = variantIds[(i * 3 + j) % variantIds.length];
        items.push({
          productVariantId: v.variantId,
          quantityOrdered: 10 + (j * 5),
          unitCostCents: Math.round(v.price * 0.5),
        });
      }

      try {
        await post('/pos/purchase-orders', {
          storeId,
          supplierName: supplier,
          status: i < 30 ? 'received' : 'open',
          items,
        });
        poSuccess++;
        process.stdout.write(`\r  ${C.dim}[${i + 1}/50] PO from ${supplier}${C.reset}`);
      } catch (e) {
        poFail++;
        warn(`\n  PO ${i + 1} failed: ${e.message}`);
      }
      await sleep(config.REQUEST_DELAY_MS);
    }
    console.log('');
    if (poFail === 0) ok(`Purchase Orders: ${poSuccess} records inserted`);
    else warn(`Purchase Orders: ${poSuccess} inserted, ${poFail} failed`);
  }

  // ── 10. Seed Sales (50 complete sales) ────────────────
  section('Step 9 — Sales + Sale Items + Payments (50 each)');

  // Fetch customers for linking
  let customerIds = [];
  try {
    const custs = await get('/pos/customers');
    customerIds = custs.map(c => c.id);
    info(`Using ${customerIds.length} customers for sales.`);
  } catch (e) {
    warn('Could not fetch customers — sales will use walk-in (null customer).');
  }

  if (variantIds.length === 0) {
    warn('No variant IDs — skipping sales seeding.');
  } else {
    let saleSuccess = 0, saleFail = 0;
    const paymentMethods = ['CASH', 'CARD', 'UPI', 'WALLET'];

    for (let i = 0; i < 50; i++) {
      const storeId = storeIds[i % storeIds.length];
      const customerId = customerIds.length > 0 ? customerIds[i % customerIds.length] : null;
      const itemCount = 2 + (i % 4); // 2–5 items
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        const v = variantIds[(i + j) % variantIds.length];
        const qty = 1 + (j % 3);
        items.push({ productVariantId: v.variantId, quantity: qty });
        subtotal += v.price * qty;
      }

      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + tax;
      const method = paymentMethods[i % paymentMethods.length];
      const orderId = `ORD-SEED-${Date.now()}-${String(i + 1).padStart(4, '0')}`;

      try {
        await post('/pos/sales', {
          storeId,
          customerId,
          orderId,
          discountCents: 0,
          orderType: ORDER_TYPES[i % 3],
          adultsCount: 1 + (i % 4),
          kidsCount: i % 3,
          salesSource: 'POS',
          items,
          payments: [{ method, amountCents: total, reference: `REF-${orderId}` }],
        });
        saleSuccess++;
        process.stdout.write(`\r  ${C.dim}[${i + 1}/50] Sale ${orderId} — AED ${(total / 100).toFixed(2)} (${method})${C.reset}`);
      } catch (e) {
        saleFail++;
        warn(`\n  Sale ${i + 1} failed: ${e.message}`);
      }
      await sleep(config.REQUEST_DELAY_MS + 20); // slightly longer for sales
    }
    console.log('');
    if (saleFail === 0) ok(`Sales: ${saleSuccess} records inserted (with sale_items + payments)`);
    else warn(`Sales: ${saleSuccess} inserted, ${saleFail} failed`);
  }

  // ── 11. Summary ───────────────────────────────────────
  section('Seeding Complete');
  log(`\n${C.bold}${C.green}╔══════════════════════════════════════════════╗`);
  log(`║   🎉 POS Database Seeded Successfully!       ║`);
  log(`╚══════════════════════════════════════════════╝${C.reset}\n`);
  log(`${C.dim}Tables seeded: tax_rates · categories · stores · customers`);
  log(`               products · product_variants · inventory`);
  log(`               purchase_orders · purchase_order_items`);
  log(`               sales · sale_items · payments · stock_movements${C.reset}\n`);
  log(`${C.cyan}Next Steps:${C.reset}`);
  log(`  1. Open POS → Sales — you should see 50 products with real data`);
  log(`  2. Open POS → Customers — 50 Dubai customers visible`);
  log(`  3. Open POS → Reports — sales history from seeded data\n`);
}

main().catch(e => {
  err(`Fatal error: ${e.message}`);
  console.error(e);
  process.exit(1);
});
