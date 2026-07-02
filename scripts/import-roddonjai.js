require('dotenv').config();
const { eq, and } = require('drizzle-orm');
const { db, schema } = require('../database/db');

const FILTER_URL = 'https://api-buyer.roddonjai.com/api-gateway/buyer/home-page/search-car-filter';
// โลโก้ placeholder (mock) — เปลี่ยนทีหลังได้
const logo = (brand) => `https://placehold.co/200x100?text=${encodeURIComponent(brand)}`;

// ตัด prefix ยี่ห้อออกจากชื่อรุ่น เช่น "Toyota Veloz" -> "Veloz"
function stripBrand(model, brand) {
  if (model.toLowerCase().startsWith(brand.toLowerCase() + ' ')) {
    return model.slice(brand.length + 1).trim();
  }
  return model.trim();
}

async function main() {
  const res = await fetch(FILTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://www.roddonjai.com',
      Referer: 'https://www.roddonjai.com/',
      'User-Agent': 'Mozilla/5.0',
    },
    body: '{}',
  });
  const json = await res.json();
  const data = json.data || {};
  const brandList = data.brandList || [];
  const modelList = data.modelList || {};      // { brand: [fullModel...] }
  const subModelList = data.subModelList || {}; // { fullModel: [sub...] }

  console.log(`source: ${brandList.length} brands`);

  const date = new Date();
  let bCreated = 0, bSkip = 0, mCreated = 0, mSkip = 0;

  // brands ที่มีอยู่แล้ว
  const existingBrands = new Set((await db.select().from(schema.masterBrand)).map((b) => b.brand_name.toLowerCase()));

  for (const brand of brandList) {
    if (!existingBrands.has(brand.toLowerCase())) {
      await db.insert(schema.masterBrand).values({
        brand_name: brand,
        brand_description: '',
        brand_image: logo(brand),
        updateDate: date,
      });
      bCreated++;
    } else {
      bSkip++;
    }

    // models ของ brand นี้ที่มีอยู่แล้ว
    const existingModels = new Set(
      (await db.select().from(schema.masterModel).where(eq(schema.masterModel.brand_name, brand)))
        .map((m) => (m.model_name || '').toLowerCase())
    );

    const fullModels = modelList[brand] || [];
    for (const fullModel of fullModels) {
      const modelName = stripBrand(fullModel, brand);
      if (!modelName) continue;
      if (existingModels.has(modelName.toLowerCase())) { mSkip++; continue; }
      // subModelList ใช้ key แบบ "Brand Model" (เช่น "Honda Accord"); fallback เป็นชื่อรุ่นเปล่า
      const subs = subModelList[`${brand} ${fullModel}`] || subModelList[fullModel] || [];
      await db.insert(schema.masterModel).values({
        model_name: modelName,
        brand_name: brand,
        model_submodel: subs,
        model_description: '',
        model_image: [],
        updateDate: date,
      });
      existingModels.add(modelName.toLowerCase());
      mCreated++;
    }
  }

  console.log(`brands:  +${bCreated} created, ${bSkip} skipped`);
  console.log(`models:  +${mCreated} created, ${mSkip} skipped`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
