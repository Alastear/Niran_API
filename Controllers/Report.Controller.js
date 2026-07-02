const { db, schema } = require('../database/db');

// สรุปภาพรวมธุรกิจ (ต้องมีสิทธิ์ reports.view — เห็นตัวเลขการเงิน)
module.exports = {
  get_summary: async (req, res, next) => {
    try {
      const now = new Date();
      const cars = await db.select().from(schema.carStore);

      let stockCount = 0, stockCost = 0, stockSale = 0;
      let soldCount = 0, revenue = 0, profit = 0, reservedCount = 0;
      const statusBreakdown = {};
      const brandCount = {};
      const aging = [];

      for (const c of cars) {
        const st = c.cars_status || 'SELL';
        statusBreakdown[st] = (statusBreakdown[st] || 0) + 1;
        brandCount[c.brand_name] = (brandCount[c.brand_name] || 0) + 1;

        if (st === 'SOLD') {
          soldCount++;
          if (c.sale_price != null) revenue += c.sale_price;
          if (c.sale_price != null && c.cost_price != null) profit += c.sale_price - c.cost_price;
        } else if (st === 'SELL') {
          // พร้อมขาย
          stockCount++;
          if (c.cost_price != null) stockCost += c.cost_price;
          if (c.sale_price != null) stockSale += c.sale_price;
          if (c.createDate) {
            const days = Math.floor((now.getTime() - new Date(c.createDate).getTime()) / 86400000);
            if (days >= 90) aging.push({ _id: c._id, title: c.cars_title, days });
          }
        } else {
          // จอง/RESERVE/อื่น ๆ
          reservedCount++;
        }
      }

      const by_brand = Object.entries(brandCount)
        .map(([brand, count]) => ({ brand, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      aging.sort((a, b) => b.days - a.days);

      // นับแจ้งเตือนภาษีรถที่ใกล้ครบ (<=30 วัน) เพื่อโชว์ในรายงาน
      let taxDueCount = 0;
      for (const c of cars) {
        if (c.tax_expiry) {
          const dl = Math.ceil((new Date(c.tax_expiry).getTime() - now.getTime()) / 86400000);
          if (dl <= 30) taxDueCount++;
        }
      }

      res.send({
        totalCars: cars.length,
        stock: { count: stockCount, value_cost: stockCost, value_sale: stockSale },
        sold: { count: soldCount, revenue, profit },
        reserved: { count: reservedCount },
        status_breakdown: statusBreakdown,
        by_brand,
        aging: aging.slice(0, 10),
        aging_count: aging.length,
        tax_due_count: taxDueCount,
      });
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
