import { adminRoles, adminPermissionAreas, createDefaultAdminPermissions } from '../data/adminPermissions.js'
import { ADMIN_PERMISSIONS_STORAGE_KEY, hasAdminPermission, normalizeAdminPermissions, readAdminPermissions, saveAdminPermissions } from './adminPermissionService.js'

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})
afterEach(() => vi.restoreAllMocks())

describe('mock administrator permissions', () => {
  it.each(['loyalty-member', 'regular-customer'])('rejects every admin grant for %s when checking, saving, and loading', (role) => {
    const source = createDefaultAdminPermissions()
    for (const permission of adminPermissionAreas) source[role][permission.id] = true
    const saved = saveAdminPermissions(source)
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions: source }))
    const loaded = readAdminPermissions()
    for (const permission of adminPermissionAreas) {
      expect(hasAdminPermission(source, role, permission.id)).toBe(false)
      expect(saved.permissions[role][permission.id]).toBe(false)
      expect(loaded.permissions[role][permission.id]).toBe(false)
    }
  })

  it.each(['staff', 'loyalty-member'])('rejects role management grants for %s, including modified storage', (role) => {
    const source = createDefaultAdminPermissions()
    source[role]['roles.manage'] = true
    expect(hasAdminPermission(source, role, 'roles.manage')).toBe(false)
    expect(saveAdminPermissions(source).permissions[role]['roles.manage']).toBe(false)
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions: source }))
    expect(readAdminPermissions().permissions[role]['roles.manage']).toBe(false)
  })

  it('defines all five roles and all twelve permission areas', () => {
    const settings = createDefaultAdminPermissions()
    expect(Object.keys(settings)).toHaveLength(5)
    for (const role of adminRoles) expect(Object.keys(settings[role.id])).toHaveLength(12)
    for (const permission of adminPermissionAreas) {
      expect(settings.administrator[permission.id]).toBe(true)
      expect(settings['loyalty-member'][permission.id]).toBe(false)
      expect(settings['regular-customer'][permission.id]).toBe(false)
    }
  })

  it('preserves explicit grants while rejecting unknown or non-boolean permissions', () => {
    const normalized = normalizeAdminPermissions({ manager: { 'orders.manage': true, 'menu.manage': 'true', invented: true } })
    expect(hasAdminPermission(normalized, 'manager', 'orders.manage')).toBe(true)
    expect(hasAdminPermission(normalized, 'manager', 'menu.manage')).toBe(false)
    expect(hasAdminPermission(normalized, 'manager', 'customers.manage')).toBe(false)
    expect(hasAdminPermission(normalized, 'manager', 'invented')).toBe(false)
    expect(hasAdminPermission(normalized, 'unknown-role', 'orders.manage')).toBe(false)
  })

  it('restores required administrator grants when saving and reading modified browser data', () => {
    const source = createDefaultAdminPermissions()
    source.administrator['dashboard.view'] = false
    source.administrator['roles.manage'] = false
    expect(saveAdminPermissions(source).permissions.administrator['roles.manage']).toBe(true)
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, JSON.stringify({ version: 1, permissions: source }))
    const loaded = readAdminPermissions().permissions.administrator
    expect(loaded['dashboard.view']).toBe(true)
    expect(loaded['roles.manage']).toBe(true)
  })

  it('falls back safely when stored settings are invalid or storage is unavailable', () => {
    localStorage.setItem(ADMIN_PERMISSIONS_STORAGE_KEY, '{bad json')
    expect(readAdminPermissions().warning).toMatch(/could not be loaded/)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked') })
    expect(readAdminPermissions().permissions.administrator['roles.manage']).toBe(true)
  })

  it('reports write failures without claiming settings were saved', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    expect(saveAdminPermissions(createDefaultAdminPermissions())).toMatchObject({ success: false })
  })
})
