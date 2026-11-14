import { useContext } from 'react'
import { AdminPermissionsContext } from './AdminPermissionsContext.js'

export default function useAdminPermissions() {
  const context = useContext(AdminPermissionsContext)
  if (!context) throw new Error('useAdminPermissions requires AdminPermissionsProvider')
  return context
}
