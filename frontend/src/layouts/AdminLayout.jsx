import { Outlet } from 'react-router'
import './AdminLayout.css'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <strong>INSTEA</strong>
          <span>Staff console</span>
        </div>

        <nav aria-label="Administrator navigation">
          {/* Sidebar links will be added in the navigation subtask. */}
          <p className="admin-shell__nav-placeholder">
            Management navigation
          </p>
        </nav>
      </aside>

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