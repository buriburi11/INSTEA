import { fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminPlaceholder from '../../pages/admin/AdminPlaceholder.jsx'
import AdminRoles from '../../pages/admin/AdminRoles.jsx'
import { createDefaultAdminPermissions } from '../../data/adminPermissions.js'
import { ADMIN_PERMISSIONS_STORAGE_KEY } from '../../services/adminPermissionService.js'

function renderAdmin(path = '/admin') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Link to="/admin/employees">Open employee URL</Link>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h1>Dashboard</h1>} />
          <Route path="employees" element={<AdminPlaceholder title="Employee Management" />} />
          <Route path="employees/:id" element={<h1>Employee details</h1>} />
          <Route path="roles" element={<AdminRoles />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function previewRole(role) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Preview role' }), { target: { value: role } })
}

beforeEach(() => localStorage.clear())

describe('Employee Management navigation', () => {
  it('opens the placeholder page with the existing active sidebar styling', () => {
    renderAdmin()
    const link = screen.getByRole('link', { name: 'Employee Management' })
    expect(link).toHaveAttribute('href', '/admin/employees')
    expect(link).not.toHaveAttribute('aria-current')
    fireEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Employee Management' })).toBeInTheDocument()
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link).toHaveClass('admin-sidebar__link', 'admin-sidebar__link--active')
  })

  it('retains an accessible icon link in the collapsed sidebar', () => {
    renderAdmin()
    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    const link = screen.getByRole('link', { name: 'Employee Management' })
    expect(link).toHaveAttribute('title', 'Employee Management')
    fireEvent.click(link)
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Employee Management' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(link).not.toHaveAttribute('title')
  })

  it('keeps the item active for nested employee pages', () => {
    renderAdmin('/admin/employees/employee-1')
    expect(screen.getByRole('link', { name: 'Employee Management' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Employee details' })).toBeInTheDocument()
  })

  it.each(['staff', 'loyalty-member', 'regular-customer'])('hides the link and blocks the URL for %s without permission', (role) => {
    renderAdmin()
    previewRole(role)
    expect(screen.queryByRole('link', { name: 'Employee Management' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Open employee URL' }))
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Employee Management' })).not.toBeInTheDocument()
  })

  it('honors an explicit saved denial for Manager', () => {
    const permissions = createDefaultAdminPermissions()
    permissions.manager['employees.manage'] = false
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
    renderAdmin('/admin/employees')
    previewRole('manager')
    expect(screen.queryByRole('link', { name: 'Employee Management' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
  })

  it('allows the matrix to save employee access for Staff and restore it on refresh', () => {
    const view = renderAdmin('/admin/roles')
    const checkbox = screen.getByRole('checkbox', { name: 'Staff: Employee Management' })
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    fireEvent.click(screen.getByRole('button', { name: 'Save Permissions' }))
    previewRole('staff')
    fireEvent.click(screen.getByRole('link', { name: 'Employee Management' }))
    expect(screen.getByRole('heading', { name: 'Employee Management' })).toBeInTheDocument()
    view.unmount()
    renderAdmin('/admin/employees')
    previewRole('staff')
    expect(screen.getByRole('heading', { name: 'Employee Management' })).toBeInTheDocument()
  })
})
