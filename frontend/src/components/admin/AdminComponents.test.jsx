import { fireEvent, render, screen, within } from '@testing-library/react'
import AdminTable from './AdminTable.jsx'
import AdminFormField from './AdminFormField.jsx'
import AdminButton from './AdminButton.jsx'

describe('shared admin components', () => {
  it('supports different data sets, custom keys, formatted values, and row actions', () => {
    const onView = vi.fn()
    render(
      <>
        <AdminTable
          caption="Customers"
          columns={[{ key: 'name', label: 'Customer' }, { key: 'points', label: 'Points' }]}
          rows={[{ id: 'customer-1', name: 'Alex', points: 0 }]}
        />
        <AdminTable
          caption="Orders"
          hideCaption
          rowKey="orderNumber"
          columns={[
            { key: 'orderNumber', label: 'Order' },
            { key: 'total', label: 'Total', render: (order) => `$${order.total.toFixed(2)}` },
            { key: 'actions', label: 'Actions', render: (order) => (
              <AdminButton onClick={() => onView(order.orderNumber)}>View order</AdminButton>
            ) },
          ]}
          rows={[{ orderNumber: 'order-1', total: 12.5 }]}
        />
      </>,
    )

    expect(within(screen.getByRole('table', { name: 'Customers' })).getByRole('cell', { name: '0' })).toBeInTheDocument()
    expect(within(screen.getByRole('table', { name: 'Orders' })).getByRole('cell', { name: '$12.50' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View order' }))
    expect(onView).toHaveBeenCalledWith('order-1')
  })

  it('hides stale rows during loading and handles an empty response or failed request', () => {
    const columns = [{ key: 'name', label: 'Customer' }]
    const { rerender } = render(
      <AdminTable caption="Customers" columns={columns} rows={[{ id: 1, name: 'Alex' }]} loading />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading records…')
    expect(screen.queryByText('Alex')).not.toBeInTheDocument()
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true')

    rerender(<AdminTable caption="Customers" columns={columns} rows={null} emptyMessage="No customers found." />)
    expect(screen.getByRole('status')).toHaveTextContent('No customers found.')
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false')

    rerender(<AdminTable caption="Customers" columns={columns} error="Unable to load customers." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load customers.')
  })

  it('connects labels, hints, and errors to unique controls and forwards input events', () => {
    const onChange = vi.fn()
    render(
      <>
        <AdminFormField label="Product name" name="name" required hint="Shown on the menu." error="Enter a name." onChange={onChange} />
        <AdminFormField label="Customer name" />
      </>,
    )

    const input = screen.getByRole('textbox', { name: 'Product name' })
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Shown on the menu. Enter a name.')
    expect(input.id).not.toBe(screen.getByRole('textbox', { name: 'Customer name' }).id)
    fireEvent.change(input, { target: { value: 'Matcha' } })
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('supports selects, textareas, and checkboxes with native disabled behavior', () => {
    const onChange = vi.fn()
    render(
      <>
        <AdminFormField as="select" label="Availability" defaultValue="available" onChange={onChange}>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </AdminFormField>
        <AdminFormField as="textarea" label="Description" defaultValue="Green tea" />
        <AdminFormField type="checkbox" label="Active" defaultChecked disabled />
      </>,
    )

    const select = screen.getByRole('combobox', { name: 'Availability' })
    fireEvent.change(select, { target: { value: 'unavailable' } })
    expect(select).toHaveValue('unavailable')
    expect(onChange).toHaveBeenCalledOnce()
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue('Green tea')
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Active' })).toBeDisabled()
  })

  it('keeps hidden search and permission labels accessible', () => {
    const onChange = vi.fn()
    render(
      <>
        <AdminFormField type="search" label="Search products" hideLabel placeholder="Search products" />
        <AdminFormField type="checkbox" label="Manager can view orders" hideLabel compact onChange={onChange} />
      </>,
    )
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toBeInTheDocument()
    const permission = screen.getByRole('checkbox', { name: 'Manager can view orders' })
    fireEvent.click(permission)
    expect(permission).toBeChecked()
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('names icon actions and keeps saving feedback accessible without changing the button size', () => {
    const { rerender } = render(
      <AdminButton iconOnly size="compact" variant="secondary" aria-label="Archive Matcha">
        <svg aria-hidden="true" />
      </AdminButton>,
    )
    expect(screen.getByRole('button', { name: 'Archive Matcha' })).toBeEnabled()
    rerender(
      <AdminButton iconOnly size="compact" aria-label="Archive Matcha" loading loadingLabel="Archiving Matcha…">
        <svg aria-hidden="true" />
      </AdminButton>,
    )
    expect(screen.getByRole('button', { name: 'Archiving Matcha…' })).toBeDisabled()
  })

  it('prevents duplicate submissions while saving and defaults other actions to button', () => {
    const onClick = vi.fn()
    const { rerender } = render(<AdminButton onClick={onClick}>Save</AdminButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

    rerender(<AdminButton type="submit" loading onClick={onClick}>Save</AdminButton>)
    const button = screen.getByRole('button', { name: 'Saving…' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
