// แหล่งความจริงเดียวของสิทธิ์ทั้งหมดในระบบ (permission catalog)
// FE ดึงไปเรนเดอร์เป็น checkbox, BE ใช้ตรวจสิทธิ์
const PERMISSION_GROUPS = [
  {
    group: 'รถ',
    items: [
      { key: 'cars.view', label: 'ดูรถ' },
      { key: 'cars.edit', label: 'เพิ่ม/แก้รถ' },
      { key: 'cars.delete', label: 'ลบรถ' },
      { key: 'cars.cost', label: 'เห็นราคาทุน/กำไร' },
    ],
  },
  {
    group: 'ยี่ห้อ/รุ่น',
    items: [{ key: 'masterdata.manage', label: 'จัดการยี่ห้อ/รุ่น/รุ่นย่อย' }],
  },
  {
    group: 'เอกสาร',
    items: [
      { key: 'documents.view', label: 'ดูเอกสาร' },
      { key: 'documents.manage', label: 'จัดการเอกสาร (อัปโหลด/ลบ)' },
      { key: 'documents.financial', label: 'เอกสารการเงิน' },
    ],
  },
  {
    group: 'ลูกค้า/CRM',
    items: [{ key: 'customers.manage', label: 'จัดการลูกค้า' }],
  },
  {
    group: 'แจ้งเตือน',
    items: [{ key: 'alerts.view', label: 'ดูแจ้งเตือน' }],
  },
  {
    group: 'รายงาน',
    items: [{ key: 'reports.view', label: 'ดูรายงาน/แดชบอร์ด' }],
  },
  {
    group: 'ผู้ใช้ & สิทธิ์',
    items: [{ key: 'users.manage', label: 'จัดการผู้ใช้ + สร้าง/แก้ role' }],
  },
  {
    group: 'ตั้งค่าเว็บ',
    items: [{ key: 'settings.manage', label: 'จัดการตั้งค่า/ข้อมูลติดต่อ' }],
  },
];

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

// role เริ่มต้น (seed)
const DEFAULT_ROLES = [
  { name: 'เจ้าของ', is_system: true, permissions: ALL_PERMISSIONS },
  {
    name: 'พนักงานขาย',
    is_system: false,
    permissions: ['cars.view', 'cars.edit', 'customers.manage', 'alerts.view', 'documents.view'],
  },
  {
    name: 'บัญชี',
    is_system: false,
    permissions: [
      'cars.view',
      'cars.cost',
      'documents.view',
      'documents.manage',
      'documents.financial',
      'reports.view',
      'alerts.view',
    ],
  },
];

module.exports = { PERMISSION_GROUPS, ALL_PERMISSIONS, DEFAULT_ROLES };
