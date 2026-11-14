import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import AdminFormField from '../components/admin/AdminFormField.jsx'
import AdminPermissionsProvider from '../auth/AdminPermissionsProvider.jsx'
import useAdminPermissions from '../auth/useAdminPermissions.js'
import { adminRoles, adminRoutePermissions } from '../data/adminPermissions.js'
import './AdminLayout.css'

export default function AdminLayout() {
  return <AdminPermissionsProvider><AdminShell /></AdminPermissionsProvider>
}

function AdminShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { role, changeRole, can } = useAdminPermissions()
  const { pathname } = useLocation()
  const route = Object.keys(adminRoutePermissions).find((path) =>
    pathname === path || (path !== '/admin' && pathname.startsWith(`${path}/`)),
  )
  const permitted = route ? can(adminRoutePermissions[route]) : false
  const roleLabel = adminRoles.find((entry) => entry.id === role)?.label

  return (
    <div
      className={`admin-shell${sidebarCollapsed ? ' admin-shell--collapsed' : ''}`}
    >
      {/* Shared navigation for all administrator pages. */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((previous) => !previous)}
      />

      <div className="admin-shell__workspace">
        <header className="admin-shell__header">
          <div>
            <p className="admin-shell__store">Store name</p>
            <p className="admin-shell__welcome">Welcome, Staff Member</p>
          </div>

          <div className="admin-shell__profile">
            <AdminFormField as="select" label="Preview role" compact value={role} onChange={(event) => changeRole(event.target.value)}>
              {adminRoles.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
            </AdminFormField>
            <div>
              <p>Staff Member</p>
              <span>{roleLabel}</span>
            </div>

            <div className="admin-shell__avatar" aria-hidden="true">
              ST
            </div>
          </div>
        </header>

        <main className="admin-shell__content">
          <p className="admin-shell__preview-note">Mock role preview. Switch roles above to check access; refresh returns to Administrator.</p>
          {permitted ? <Outlet /> : (
            <section className="admin-shell__restricted" aria-labelledby="admin-restricted-heading">
              <h1 id="admin-restricted-heading">Access restricted</h1>
              <p>Your preview role does not have permission to access this page.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
