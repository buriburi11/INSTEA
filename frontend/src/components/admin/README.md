# Shared admin components

Use these components inside the existing `AdminLayout`. Each imports
`AdminComponents.css`, which uses the admin layout's color variables. These are
building blocks for management pages, not standalone routes.

## Tables

`AdminTable` accepts a caption, column definitions, and rows returned by any mock
or service. It does not fetch data or change records. Row keys default to `id`;
use `rowKey="otherId"` or `rowKey={(row) => row.otherId}` when needed. Columns
support `align="left"`, `"center"`, or `"right"`. Use `render(row)` for formatted
values, status badges, and action buttons.
Set `hideCaption` when the page heading already identifies the table; its caption
remains available to screen readers. Header and row spacing follow the supplied
Menu and Roles & permissions references.

```jsx
import AdminTable from '../../components/admin/AdminTable.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'

const customerColumns = [
  { key: 'firstName', label: 'First name' },
  { key: 'email', label: 'Email' },
  { key: 'accountStatus', label: 'Status' },
]

const orderColumns = [
  { key: 'id', label: 'Order' },
  { key: 'total', label: 'Total', align: 'right', render: (order) => `$${order.total.toFixed(2)}` },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', render: (order) => (
    <AdminButton variant="secondary" onClick={() => openOrder(order.id)}>View order</AdminButton>
  ) },
]

// Inside a page, supply rows and request state from that page's service call:
<AdminTable
  caption="Customer accounts"
  hideCaption
  columns={customerColumns}
  rows={customers}
  loading={loading}
  error={error}
  emptyMessage="No customers found."
/>
// The orders page can use the same component with columns={orderColumns}.
```

Loading hides stale rows. Errors take priority over the empty state after loading
finishes. Missing cell values show a dash; zero remains zero. Wide tables scroll
within the content area and can be focused with the keyboard.

## Form controls and actions

`AdminFormField` renders an input by default. Set `as="select"` or
`as="textarea"`, or `type="checkbox"`. Native props such as `value`, `checked`,
`onChange`, `required`, and `disabled` pass through. Labels, hints, and errors
are associated with automatically generated IDs; an explicit `id` is optional.
Validation and form submission belong to the consuming page.
Use `type="search"` for the rounded search style and `hideLabel` to hide the
visible label while retaining an accessible name. `compact` reduces control size;
combine it with `type="checkbox"` and `hideLabel` for permission-matrix cells.
Give each permission checkbox a label naming both the role and permission.

```jsx
import AdminFormField from '../../components/admin/AdminFormField.jsx'

<AdminFormField label="Name" name="name" value={name} onChange={handleNameChange} required error={nameError} />
<AdminFormField label="Price" type="number" min="0" step="0.01" hint="Price in USD." />
<AdminFormField as="select" label="Availability" name="availability">
  <option value="available">Available</option>
  <option value="unavailable">Unavailable</option>
</AdminFormField>
<AdminFormField as="textarea" label="Description" name="description" />
<AdminFormField type="checkbox" label="Active" name="active" />
<AdminFormField type="search" label="Search products" hideLabel placeholder="Search products" />
<AdminFormField type="checkbox" label="Manager can view orders" hideLabel compact />
<AdminButton type="submit" loading={saving}>Save product</AdminButton>
<AdminButton variant="secondary" onClick={closeForm}>Cancel</AdminButton>
```

Buttons support `primary`, `secondary`, and `danger` variants. They default to
`type="button"` to avoid accidental form submission. A loading button is disabled;
use `loadingLabel` to override "Saving…". Disable fields or a containing fieldset
while saving. Destructive confirmation and permission checks belong to the page;
the danger variant only styles the action.

Use `size="compact"` for small card actions or `iconOnly` for square icon buttons.
Every icon-only button must have an `aria-label` naming the action and record;
mark the icon `aria-hidden`. While loading, icon-only buttons retain their size
and use `loadingLabel` as their accessible name.

```jsx
<AdminButton size="compact">Accept</AdminButton>
<AdminButton iconOnly size="compact" variant="secondary" aria-label="Archive Matcha" onClick={confirmArchive}>
  <Archive size={16} aria-hidden="true" />
</AdminButton>
```

## Mock role permissions

`AdminLayout` supplies `AdminPermissionsProvider`. Permission identifiers, roles,
sample defaults, and the route map live in `src/data/adminPermissions.js`.
`useAdminPermissions()` exposes `can(permission)`, the saved matrix, and the current
preview role. Add new console routes to `adminRoutePermissions`; unmapped routes
are denied. Sidebar links and page access use that same map. Customer points and
reward controls also check their corresponding loyalty permissions.

The Roles & permissions page edits a draft. Save Permissions validates the draft
and writes versioned mock settings through `adminPermissionService.js` before
applying them. Write failures leave the prior applied settings intact. Only known
boolean permissions are accepted, and required Administrator dashboard and role
management grants are restored during both reading and saving.
All admin-console grants are locked off for Regular Customers and Loyalty Members;
Staff role management is also locked off. These restrictions apply when checking,
reading, and saving, including previously stored grants.

The header's Preview role selector is a demonstration tool independent of
customer login. Settings persist in this browser; the selected preview role resets
to Administrator when the admin layout reloads. Production authentication and
server authorization are still future work. Browser storage is not an authority
for real staff access. Confirm the sample default grants with the project owner.
