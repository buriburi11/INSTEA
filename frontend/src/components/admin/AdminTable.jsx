import './AdminComponents.css'

/**
 * Shared display table. Pages supply their own data, formatting, and action buttons.
 *
 * @param {{
 *   caption: string,
 *   hideCaption?: boolean,
 *   columns: { key: string, label: string, align?: 'left' | 'center' | 'right', render?: (row: Object) => import('react').ReactNode }[],
 *   rows?: Object[] | null,
 *   rowKey?: string | ((row: Object) => string | number),
 *   loading?: boolean,
 *   loadingMessage?: string,
 *   emptyMessage?: string,
 *   error?: string,
 * }} props
 */
export default function AdminTable({
  caption,
  hideCaption = false,
  columns,
  rows = [],
  rowKey = 'id',
  loading = false,
  loadingMessage = 'Loading records…',
  emptyMessage = 'No records to display.',
  error = '',
}) {
  const records = Array.isArray(rows) ? rows : []
  const message = loading ? loadingMessage : error || (records.length === 0 ? emptyMessage : '')

  return (
    <div
      className="admin-table-scroll"
      role="region"
      aria-label={`${caption} table`}
      tabIndex={0}
      aria-busy={loading}
    >
      <table className={`admin-table${hideCaption ? ' admin-table--hidden-caption' : ''}`}>
        <caption className={hideCaption ? 'admin-visually-hidden' : undefined}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className={`admin-table__cell--${column.align || 'left'}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {message ? (
            <tr>
              <td colSpan={columns.length} className="admin-table__message">
                <p role={!loading && error ? 'alert' : 'status'}>{message}</p>
              </td>
            </tr>
          ) : records.map((row) => (
            <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey]}>
              {columns.map((column) => {
                const value = row[column.key]
                const content = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value

                return (
                  <td key={column.key} className={`admin-table__cell--${column.align || 'left'}`}>
                    {column.render ? column.render(row) : (content ?? '—')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
