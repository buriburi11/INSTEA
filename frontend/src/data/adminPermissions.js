// Prototype policy. Confirm production role assignments with the project owner.
export const adminRoles = [
  { id: 'administrator', label: 'Administrator' },
  { id: 'manager', label: 'Manager' },
  { id: 'staff', label: 'Staff' },
  { id: 'loyalty-member', label: 'Loyalty Member' },
  { id: 'regular-customer', label: 'Regular Customer' },
]

export const adminPermissionAreas = [
  { id: 'dashboard.view', label: 'Dashboard overview' },
  { id: 'orders.manage', label: 'Order management' },
  { id: 'refunds.manage', label: 'Refunds' },
  { id: 'menu.manage', label: 'Menu management' },
  { id: 'customers.manage', label: 'Customer management' },
  { id: 'loyalty.adjust', label: 'Points adjustments' },
  { id: 'loyalty.manage', label: 'Loyalty configuration' },
  { id: 'community.manage', label: 'Community & polls' },
  { id: 'content.manage', label: 'Content management' },
  { id: 'notifications.manage', label: 'Notifications' },
  { id: 'reports.view', label: 'Reports & exports' },
  { id: 'roles.manage', label: 'Roles & permissions' },
]

export const requiredAdministratorPermissions = ['dashboard.view', 'roles.manage']

export const adminRoutePermissions = {
  '/admin': 'dashboard.view',
  '/admin/orders': 'orders.manage',
  '/admin/products': 'menu.manage',
  '/admin/customers': 'customers.manage',
  '/admin/loyalty': 'loyalty.manage',
  '/admin/community': 'community.manage',
  '/admin/roles': 'roles.manage',
}

export function isRequiredAdministratorPermission(role, permission) {
  return role === 'administrator' && requiredAdministratorPermissions.includes(permission)
}

export function isRestrictedRolePermission(role, permission) {
  return ['loyalty-member', 'regular-customer'].includes(role)
    || (role === 'staff' && permission === 'roles.manage')
}

export function createDefaultAdminPermissions() {
  return Object.fromEntries(adminRoles.map((role) => [role.id, Object.fromEntries(
    adminPermissionAreas.map((permission) => [permission.id,
      role.id === 'administrator'
      || (role.id === 'manager' && permission.id !== 'roles.manage')
      || (role.id === 'staff' && ['dashboard.view', 'orders.manage'].includes(permission.id)),
    ]),
  )]))
}
