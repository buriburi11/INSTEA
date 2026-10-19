import { useState } from 'react'
import { Outlet } from 'react-router'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import './AdminLayout.css'

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
            <p>Welcome, staff member</p>
          </div>

          <div className="admin-shell__profile">
            <div>
              <p>Staff member</p>
              <span>Administrator</span>
            </div>

            <div className="admin-shell__avatar" aria-hidden="true">
              ST
            </div>
          </div>
        </header>

        <main className="admin-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}