import { useEffect, useRef, useState } from 'react'
import { Archive, Eye, Pencil, Plus, RotateCcw } from 'lucide-react'
import AdminTable from '../../components/admin/AdminTable.jsx'
import AdminFormField from '../../components/admin/AdminFormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import { getRewards } from '../../services/rewardService.js'
import './AdminLoyalty.css'

// INST-81: rewards management on the admin Loyalty page, based on the "Reward catalog" card
// on the Figma "Admin loyalty" screen. Follows the list/edit/deactivate pattern in AdminProducts.
// Changes are a preview: they stay on this page until you leave or refresh.

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const leavesFormat = new Intl.NumberFormat('en-US')

function RewardForm({ reward, onSave, onCancel }) {
  const formRef = useRef(null)
  const [values, setValues] = useState(() => ({
    name: reward?.name ?? '',
    description: reward?.description ?? '',
    leavesRequired: reward ? String(reward.leavesRequired) : '',
    value: reward ? String(reward.value) : '',
  }))
  const [errors, setErrors] = useState({})

  useEffect(() => { formRef.current?.querySelector('input')?.focus() }, [])

  function change(field) {
    return (event) => setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter a reward name.'
    if (!/^\d+$/.test(values.leavesRequired) || Number(values.leavesRequired) < 1) {
      nextErrors.leavesRequired = 'Enter a whole number of leaves, 1 or more.'
    }
    if (!/^\d+(\.\d{1,2})?$/.test(values.value)) {
      nextErrors.value = 'Enter a non-negative dollar value with up to two decimal places.'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      formRef.current?.elements.namedItem(Object.keys(nextErrors)[0])?.focus()
      return
    }
    onSave({
      name: values.name.trim(),
      description: values.description.trim(),
      leavesRequired: Number(values.leavesRequired),
      value: Number(values.value),
    })
  }

  return (
    <section className="admin-loyalty-panel" aria-labelledby="admin-reward-form-heading">
      <h2 id="admin-reward-form-heading">{reward ? 'Edit reward' : 'New reward'}</h2>
      <form ref={formRef} className="admin-loyalty-form" onSubmit={submit} noValidate>
        <AdminFormField label="Reward name" name="name" value={values.name} onChange={change('name')} required error={errors.name} />
        <AdminFormField as="textarea" label="Description" name="description" value={values.description} onChange={change('description')} />
        <div className="admin-loyalty-form-row">
          <AdminFormField
            label="Leaves required"
            name="leavesRequired"
            type="number"
            min="1"
            step="1"
            hint="Tea Leaves a customer spends to redeem this reward."
            value={values.leavesRequired}
            onChange={change('leavesRequired')}
            required
            error={errors.leavesRequired}
          />
          <AdminFormField
            label="Value (USD)"
            name="value"
            type="number"
            min="0"
            step="0.01"
            hint="What the reward is worth."
            value={values.value}
            onChange={change('value')}
            required
            error={errors.value}
          />
        </div>
        <div className="admin-loyalty-actions">
          <AdminButton variant="secondary" onClick={onCancel}>Cancel</AdminButton>
          <AdminButton type="submit">{reward ? 'Save changes' : 'Add reward'}</AdminButton>
        </div>
      </form>
    </section>
  )
}

function RewardDetails({ reward, onEdit, onDeactivate, onReactivate, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => { closeRef.current?.focus() }, [])

  return (
    <section className="admin-loyalty-panel" aria-labelledby="admin-reward-details-heading">
      <h2 id="admin-reward-details-heading">{reward.name}</h2>
      <dl className="admin-loyalty-details">
        <div>
          <dt>Description</dt>
          <dd>{reward.description || 'No description'}</dd>
        </div>
        <div>
          <dt>Leaves required</dt>
          <dd>{leavesFormat.format(reward.leavesRequired)} leaves</dd>
        </div>
        <div>
          <dt>Value</dt>
          <dd>{money.format(reward.value)}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`admin-reward-status admin-reward-status--${reward.active ? 'active' : 'inactive'}`}>
              {reward.active ? 'Active' : 'Deactivated'}
            </span>
          </dd>
        </div>
      </dl>
      <div className="admin-loyalty-actions">
        <AdminButton ref={closeRef} variant="secondary" onClick={onClose}>Close</AdminButton>
        <AdminButton variant="secondary" onClick={onEdit}>
          <Pencil size={16} aria-hidden="true" /> Edit
        </AdminButton>
        {reward.active ? (
          <AdminButton variant="danger" onClick={onDeactivate}>
            <Archive size={16} aria-hidden="true" /> Deactivate
          </AdminButton>
        ) : (
          <AdminButton onClick={onReactivate}>
            <RotateCcw size={16} aria-hidden="true" /> Reactivate
          </AdminButton>
        )}
      </div>
    </section>
  )
}

function DeactivateConfirmation({ reward, onConfirm, onCancel }) {
  const cancelRef = useRef(null)
  useEffect(() => { cancelRef.current?.focus() }, [])

  return (
    <section className="admin-loyalty-panel admin-loyalty-confirm" aria-labelledby="admin-reward-deactivate-heading">
      <h2 id="admin-reward-deactivate-heading">Deactivate {reward.name}?</h2>
      <p>Customers won&apos;t be able to redeem it in this preview. Its record will be kept, and you can reactivate it later.</p>
      <div className="admin-loyalty-actions">
        <AdminButton ref={cancelRef} variant="secondary" onClick={onCancel}>Keep reward</AdminButton>
        <AdminButton variant="danger" onClick={onConfirm}>Confirm deactivation</AdminButton>
      </div>
    </section>
  )
}

export default function AdminLoyalty() {
  const [request, setRequest] = useState({ status: 'loading', rewards: [], error: '' })
  const [attempt, setAttempt] = useState(0)
  // At most one panel is open: { type: 'details' | 'form' | 'deactivate', reward }
  const [panel, setPanel] = useState(null)
  const [notice, setNotice] = useState('')
  const returnFocusRef = useRef(null)

  useEffect(() => {
    let ignore = false
    getRewards()
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('Invalid rewards response')
        if (!ignore) setRequest({ status: 'ready', rewards: data, error: '' })
      })
      .catch(() => {
        if (!ignore) setRequest({ status: 'error', rewards: [], error: 'We couldn’t load rewards. Please try again.' })
      })
    return () => { ignore = true }
  }, [attempt])

  function openPanel(type, reward, trigger) {
    if (trigger) returnFocusRef.current = trigger
    setNotice('')
    setPanel({ type, reward })
  }

  function closePanel() {
    setPanel(null)
    returnFocusRef.current?.focus()
  }

  function updateReward(id, changes) {
    setRequest((previous) => ({
      ...previous,
      rewards: previous.rewards.map((reward) => (reward.id === id ? { ...reward, ...changes } : reward)),
    }))
  }

  function saveReward(fields) {
    const existing = panel.reward
    if (existing) {
      updateReward(existing.id, fields)
    } else {
      setRequest((previous) => ({
        ...previous,
        rewards: [...previous.rewards, { id: `reward-${crypto.randomUUID()}`, active: true, ...fields }],
      }))
    }
    setNotice(`${fields.name} ${existing ? 'updated' : 'added'} in this preview.`)
    closePanel()
  }

  function setActive(reward, active) {
    updateReward(reward.id, { active })
    setNotice(`${reward.name} ${active ? 'reactivated' : 'deactivated'} in this preview.`)
    closePanel()
  }

  // Lowest leaves first, like the Figma catalog.
  const sortedRewards = [...request.rewards].sort((a, b) => a.leavesRequired - b.leavesRequired)
  const activeRewards = sortedRewards.filter((reward) => reward.active)
  const deactivatedRewards = sortedRewards.filter((reward) => !reward.active)

  const columns = [
    { key: 'name', label: 'Reward', render: (reward) => <strong>{reward.name}</strong> },
    {
      key: 'leavesRequired',
      label: 'Leaves required',
      align: 'right',
      render: (reward) => <span className="admin-reward-leaves">{leavesFormat.format(reward.leavesRequired)}</span>,
    },
    { key: 'value', label: 'Value', align: 'right', render: (reward) => money.format(reward.value) },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (reward) => (
        <div className="admin-loyalty-row-actions">
          <AdminButton variant="secondary" size="compact" iconOnly aria-label={`View ${reward.name} details`} onClick={(event) => openPanel('details', reward, event.currentTarget)}>
            <Eye size={16} aria-hidden="true" />
          </AdminButton>
          <AdminButton variant="secondary" size="compact" iconOnly aria-label={`Edit ${reward.name}`} onClick={(event) => openPanel('form', reward, event.currentTarget)}>
            <Pencil size={16} aria-hidden="true" />
          </AdminButton>
          {reward.active ? (
            <AdminButton variant="secondary" size="compact" iconOnly aria-label={`Deactivate ${reward.name}`} onClick={(event) => openPanel('deactivate', reward, event.currentTarget)}>
              <Archive size={16} aria-hidden="true" />
            </AdminButton>
          ) : (
            <AdminButton variant="secondary" size="compact" iconOnly aria-label={`Reactivate ${reward.name}`} onClick={() => setActive(reward, true)}>
              <RotateCcw size={16} aria-hidden="true" />
            </AdminButton>
          )}
        </div>
      ),
    },
  ]

  const hasNoRewards = request.status === 'ready' && request.rewards.length === 0

  return (
    <section className="admin-loyalty" aria-labelledby="admin-loyalty-heading">
      <header className="admin-loyalty-header">
        <h1 id="admin-loyalty-heading">Loyalty program</h1>
      </header>

      <section className="admin-loyalty-card" aria-labelledby="admin-reward-catalog-heading">
        <div className="admin-loyalty-card-header">
          <h2 id="admin-reward-catalog-heading">Reward catalog</h2>
          <AdminButton variant="secondary" disabled={request.status !== 'ready'} onClick={(event) => openPanel('form', null, event.currentTarget)}>
            <Plus size={16} aria-hidden="true" /> Add reward
          </AdminButton>
        </div>

        <p className="admin-loyalty-preview-note">
          Preview changes stay on this page until you leave or refresh. They do not update the customer Rewards page.
        </p>
        <p role="status" aria-live="polite" className="admin-loyalty-notice">{notice}</p>

        {hasNoRewards ? (
          <div className="admin-loyalty-empty">
            <h3>No rewards yet</h3>
            <p>Create a reward customers can redeem with their Tea Leaves.</p>
            <AdminButton onClick={(event) => openPanel('form', null, event.currentTarget)}>
              <Plus size={16} aria-hidden="true" /> Create your first reward
            </AdminButton>
          </div>
        ) : (
          <>
            <AdminTable
              caption="Active rewards"
              hideCaption
              columns={columns}
              rows={activeRewards}
              loading={request.status === 'loading'}
              loadingMessage="Loading rewards…"
              error={request.error}
              emptyMessage="No active rewards. Add one or reactivate a deactivated reward."
            />
            {request.status === 'ready' && (
              <AdminTable
                caption="Deactivated rewards"
                columns={columns}
                rows={deactivatedRewards}
                emptyMessage="No deactivated rewards."
              />
            )}
          </>
        )}

        {request.status === 'error' && (
          <AdminButton variant="secondary" onClick={() => {
            setRequest({ status: 'loading', rewards: [], error: '' })
            setAttempt((previous) => previous + 1)
          }}>Try again</AdminButton>
        )}
      </section>

      {panel?.type === 'details' && (
        <RewardDetails
          key={panel.reward.id}
          reward={request.rewards.find((reward) => reward.id === panel.reward.id) ?? panel.reward}
          onEdit={() => openPanel('form', panel.reward)}
          onDeactivate={() => openPanel('deactivate', panel.reward)}
          onReactivate={() => setActive(panel.reward, true)}
          onClose={closePanel}
        />
      )}
      {panel?.type === 'form' && (
        <RewardForm key={panel.reward?.id || 'new'} reward={panel.reward} onSave={saveReward} onCancel={closePanel} />
      )}
      {panel?.type === 'deactivate' && (
        <DeactivateConfirmation reward={panel.reward} onConfirm={() => setActive(panel.reward, false)} onCancel={closePanel} />
      )}
    </section>
  )
}
