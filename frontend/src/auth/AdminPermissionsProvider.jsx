import { useState } from 'react'
import { AdminPermissionsContext } from './AdminPermissionsContext.js'
import { adminRoles } from '../data/adminPermissions.js'
import { hasAdminPermission, readAdminPermissions, saveAdminPermissions } from '../services/adminPermissionService.js'

export default function AdminPermissionsProvider({ children }) {
  const [settings, setSettings] = useState(readAdminPermissions)
  // Explicit preview selector, independent of customer login. Refresh returns to
  // Administrator so a role preview cannot lock the demonstrator out of the matrix.
  const [role, setRole] = useState('administrator')

  function can(permission) {
    return hasAdminPermission(settings.permissions, role, permission)
  }

  function savePermissions(draft) {
    if (!can('roles.manage')) return { success: false, error: 'Your preview role cannot manage permissions.' }
    const result = saveAdminPermissions(draft)
    if (result.success) setSettings({ permissions: result.permissions, warning: '' })
    return result
  }

  function changeRole(nextRole) {
    if (adminRoles.some((entry) => entry.id === nextRole)) setRole(nextRole)
  }

  return (
    <AdminPermissionsContext.Provider value={{
      permissions: settings.permissions,
      storageWarning: settings.warning,
      role,
      changeRole,
      can,
      savePermissions,
    }}>
      {children}
    </AdminPermissionsContext.Provider>
  )
}
