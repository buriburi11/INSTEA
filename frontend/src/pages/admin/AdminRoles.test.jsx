import { fireEvent, render, screen, within } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { adminPermissionAreas, createDefaultAdminPermissions } from '../../data/adminPermissions.js'
import { ADMIN_PERMISSIONS_STORAGE_KEY } from '../../services/adminPermissionService.js'
import { getProducts } from '../../services/productService.js'
import { getCustomers } from '../../services/customerService.js'
import { products } from '../../data/products.js'
import { customers } from '../../data/customers.js'
import AdminLayout from '../../layouts/AdminLayout.jsx'
import AdminRoles from './AdminRoles.jsx'
import AdminProducts from './AdminProducts.jsx'
import AdminCustomers from './AdminCustomers.jsx'

vi.mock('../../services/productService.js', () => ({ getProducts: vi.fn() }))
vi.mock('../../services/customerService.js', () => ({ getCustomers: vi.fn() }))

function renderPage(path = '/admin/roles') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      {/* Test-only link exercises a URL even when its sidebar link is hidden. */}
      <Link to="/admin/products">Open Menu URL</Link>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<h1>Dashboard</h1>} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function previewRole(role) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Preview role' }), { target: { value: role } })
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
  localStorage.clear()
  getProducts.mockResolvedValue(products)
  getCustomers.mockResolvedValue(customers)
})
afterEach(() => vi.restoreAllMocks())

describe('roles and permissions matrix', () => {
  it.each([['loyalty-member', 'Loyalty Member'], ['regular-customer', 'Regular Customer']])('locks all permissions off for %s, including previously saved grants', (role, label) => {
    const permissions = createDefaultAdminPermissions()
    for (const area of adminPermissionAreas) permissions[role][area.id] = true
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
    renderPage()
    for (const area of adminPermissionAreas) {
      const checkbox = screen.getByRole('checkbox', { name: `${label}: ${area.label}` })
      expect(checkbox).not.toBeChecked()
      expect(checkbox).toBeDisabled()
    }
    previewRole(role)
    expect(within(screen.getByRole('navigation', { name: 'Administrator navigation' })).queryAllByRole('link')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
  })

  it.each([['staff', 'Staff'], ['loyalty-member', 'Loyalty Member']])('locks off role management for %s and blocks its page', (role, label) => {
    const permissions = createDefaultAdminPermissions()
    permissions[role]['roles.manage'] = true
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
    renderPage()
    const checkbox = screen.getByRole('checkbox', { name: `${label}: Roles & permissions` })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeDisabled()
    previewRole(role)
    expect(screen.queryByRole('link', { name: 'Roles & access' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save Permissions' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
  })

  it('shows every role and area with named editable checkboxes', () => {
    renderPage()
    const table = within(screen.getByRole('table', { name: 'Role permission matrix' }))
    for (const name of ['Administrator', 'Manager', 'Staff', 'Loyalty Member', 'Regular Customer']) {
      expect(table.getByRole('columnheader', { name })).toBeInTheDocument()
    }
    for (const area of adminPermissionAreas) expect(table.getByText(area.label)).toBeInTheDocument()
    expect(table.getAllByRole('checkbox')).toHaveLength(60)
    const staffMenu = table.getByRole('checkbox', { name: 'Staff: Menu management' })
    expect(staffMenu).not.toBeChecked()
    fireEvent.click(staffMenu)
    expect(staffMenu).toBeChecked()
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
  })

  it('locks required administrator access and prevents changes to those checkboxes', () => {
    renderPage()
    for (const name of ['Administrator: Dashboard overview', 'Administrator: Roles & permissions']) {
      const checkbox = screen.getByRole('checkbox', { name })
      expect(checkbox).toBeChecked()
      expect(checkbox).toBeDisabled()
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    }
    expect(screen.getByRole('button', { name: 'Save Permissions' })).toBeDisabled()
  })

  it('saves changed permissions and restores them when the page reloads', () => {
    const view = renderPage()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Manager: Menu management' }))
    expect(localStorage.getItem(ADMIN_PERMISSIONS_STORAGE_KEY)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Save Permissions' }))
    expect(screen.getByRole('status')).toHaveTextContent('Permissions saved for this browser.')
    expect(JSON.parse(localStorage.getItem(ADMIN_PERMISSIONS_STORAGE_KEY)).permissions.manager['menu.manage']).toBe(false)
    expect(screen.getByRole('button', { name: 'Save Permissions' })).toBeDisabled()
    view.unmount()
    renderPage()
    expect(screen.getByRole('checkbox', { name: 'Manager: Menu management' })).not.toBeChecked()
  })

  it('applies saved permissions to sidebar links and blocks direct page access', () => {
    renderPage()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Manager: Menu management' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save Permissions' }))
    previewRole('manager')
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Roles & access' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Open Menu URL' }))
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New product' })).not.toBeInTheDocument()
    expect(getProducts).not.toHaveBeenCalled()
  })

  it('keeps unsaved edits from changing the active permissions', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Manager: Menu management' }))
    previewRole('manager')
    expect(screen.getByRole('link', { name: 'Menu' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Menu' }))
    expect(await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
  })

  it.each(['loyalty-member', 'regular-customer'])('restricts customer console access for %s and permits returning to Administrator preview', async (role) => {
    renderPage('/admin/products')
    await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })
    previewRole(role)
    expect(screen.getByRole('heading', { name: 'Access restricted' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New product' })).not.toBeInTheDocument()
    previewRole('administrator')
    expect(await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
  })

  it('hides points and reward actions when a role can view customers but lacks those permissions', async () => {
    const permissions = createDefaultAdminPermissions()
    permissions.manager['loyalty.adjust'] = false
    permissions.manager['loyalty.manage'] = false
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions }))
    renderPage('/admin/customers')
    previewRole('manager')
    await screen.findByRole('button', { name: 'View Alex Rivera' })
    expect(screen.queryByRole('spinbutton', { name: 'Adjustment amount' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Issue reward' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Deactivate account' })).toBeDisabled()
  })

  it('keeps applied permissions unchanged when saving fails', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Manager: Menu management' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    fireEvent.click(screen.getByRole('button', { name: 'Save Permissions' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Permissions could not be saved')
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument()
    previewRole('manager')
    fireEvent.click(screen.getByRole('link', { name: 'Menu' }))
    expect(await screen.findByRole('button', { name: 'Edit Jasmine Green Tea' })).toBeInTheDocument()
  })

  it('reports corrupted saved settings and retains required administrator access', () => {
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, '{broken')
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Sample defaults are in use.')
    expect(screen.getByRole('checkbox', { name: 'Administrator: Roles & permissions' })).toBeChecked()
  })
})
