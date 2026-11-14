import { adminRoles, adminPermissionAreas, createDefaultAdminPermissions, isRequiredAdministratorPermission, isRestrictedRolePermission } from '../data/adminPermissions.js'

export const ADMIN_PERMISSIONS_STORAGE_KEY = 'instea.adminPermissions.v1'

// Only known boolean grants survive. Required administrator access is restored
// even if browser storage was manually edited. This is a mock UI, not server authorization.
export function normalizeAdminPermissions(source) {
  return Object.fromEntries(adminRoles.map((role) => [role.id, Object.fromEntries(
    adminPermissionAreas.map((permission) => [permission.id,
      !isRestrictedRolePermission(role.id, permission.id)
      && (isRequiredAdministratorPermission(role.id, permission.id) || source?.[role.id]?.[permission.id] === true),
    ]),
  )]))
}

export function readAdminPermissions() {
  try {
    const saved = localStorage.getItem(ADMIN_PERMISSIONS_STORAGE_KEY)
    if (!saved) return { permissions: createDefaultAdminPermissions(), warning: '' }
    const parsed = JSON.parse(saved)
    if (parsed?.version !== 1 || !parsed.permissions || typeof parsed.permissions !== 'object' || Array.isArray(parsed.permissions)) {
      throw new Error('Invalid saved permissions')
    }
    return { permissions: normalizeAdminPermissions(parsed.permissions), warning: '' }
  } catch {
    return { permissions: createDefaultAdminPermissions(), warning: 'Saved preview permissions could not be loaded. Sample defaults are in use.' }
  }
}

export function saveAdminPermissions(source) {
  const permissions = normalizeAdminPermissions(source)
  try {
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
    return { success: true, permissions }
  } catch {
    return { success: false, error: 'Permissions could not be saved in this browser. Your changes have not been applied.' }
  }
}

export function hasAdminPermission(permissions, role, permission) {
  return adminRoles.some((entry) => entry.id === role)
    && adminPermissionAreas.some((entry) => entry.id === permission)
    && !isRestrictedRolePermission(role, permission)
    && permissions?.[role]?.[permission] === true
}
