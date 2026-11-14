import { useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import AdminTable from '../../components/admin/AdminTable.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import AdminFormField from '../../components/admin/AdminFormField.jsx'
import useAdminPermissions from '../../auth/useAdminPermissions.js'
import { adminRoles, adminPermissionAreas, isRequiredAdministratorPermission, isRestrictedRolePermission } from '../../data/adminPermissions.js'
import './AdminRoles.css'

export default function AdminRoles() {
  const { permissions, storageWarning, can, savePermissions } = useAdminPermissions()
  const [draft, setDraft] = useState(() => structuredClone(permissions))
  const [feedback, setFeedback] = useState({ message: '', error: false })
  const dirty = JSON.stringify(draft) !== JSON.stringify(permissions)
  const mayEdit = can('roles.manage')

  function changePermission(role, permission, checked) {
    if (!mayEdit || isRequiredAdministratorPermission(role, permission) || isRestrictedRolePermission(role, permission)) return
    setDraft((previous) => ({ ...previous, [role]: { ...previous[role], [permission]: checked } }))
    setFeedback({ message: '', error: false })
  }

  function save() {
    const result = savePermissions(draft)
    if (result.success) setDraft(result.permissions)
    setFeedback({ message: result.success ? 'Permissions saved for this browser.' : result.error, error: !result.success })
  }

  const columns = [
    { key: 'label', label: 'Area' },
    ...adminRoles.map((role) => ({
      key: role.id,
      label: role.id === 'administrator'
        ? <span className="admin-roles-admin-heading"><LockKeyhole size={13} aria-hidden="true" />{role.label}</span>
        : role.label,
      align: 'center',
      render: (area) => {
        const required = isRequiredAdministratorPermission(role.id, area.id)
        const restricted = isRestrictedRolePermission(role.id, area.id)
        return (
          <AdminFormField
            type="checkbox"
            compact
            hideLabel
            label={`${role.label}: ${area.label}`}
            checked={draft[role.id][area.id]}
            disabled={!mayEdit || required || restricted}
            title={required ? 'Required administrator access' : restricted ? 'This permission is unavailable for this role' : undefined}
            aria-describedby={required ? 'admin-required-permissions-note' : restricted ? 'admin-restricted-roles-note' : undefined}
            onChange={(event) => changePermission(role.id, area.id, event.target.checked)}
          />
        )
      },
    })),
  ]

  return (
    <section className="admin-roles" aria-labelledby="admin-roles-heading">
      <header className="admin-roles-header">
        <div>
          <h1 id="admin-roles-heading">Roles &amp; permissions</h1>
          <p>Control which console areas each role can access.</p>
        </div>
        <AdminButton onClick={save} disabled={!dirty || !mayEdit}>Save Permissions</AdminButton>
      </header>
      <p className="admin-roles-note">Mock settings apply after saving and are stored in this browser. Starting permissions are sample defaults.</p>
      <p className="admin-roles-note" id="admin-required-permissions-note">
        Administrator access to Dashboard overview and Roles &amp; permissions is required and cannot be removed.
      </p>
      <p className="admin-roles-note" id="admin-restricted-roles-note">Regular Customers and Loyalty Members have no admin-console access. Staff cannot manage roles and permissions.</p>
      {storageWarning && <p role="alert">{storageWarning}</p>}
      {feedback.message && <p role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
      {dirty && <p className="admin-roles-note">Unsaved changes</p>}
      <AdminTable caption="Role permission matrix" hideCaption columns={columns} rows={adminPermissionAreas} />
    </section>
  )
}
