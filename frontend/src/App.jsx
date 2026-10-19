import './App.css'
import { Navigate, Outlet, Route, Routes } from 'react-router'
import PageLayout from './components/PageLayout'
import MenuPage from './pages/MenuPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AdminLayout from './layouts/AdminLayout.jsx'
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx'
import StaffLogin from './pages/admin/StaffLogin.jsx'

function App() {
  return (
    <Routes>
      {/* Staff sign-in is separate from public and admin layouts. */}
      <Route path="/staff_portal" element={<StaffLogin />} />

      {/* Admin pages share the sidebar, header, and content layout. */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={<AdminPlaceholder title="Dashboard" />}
        />
        <Route
          path="orders"
          element={<AdminPlaceholder title="Orders" />}
        />
        <Route
          path="products"
          element={<AdminPlaceholder title="Products" />}
        />
        <Route
          path="customers"
          element={<AdminPlaceholder title="Customers" />}
        />
        <Route
          path="loyalty"
          element={<AdminPlaceholder title="Loyalty" />}
        />
        <Route
          path="community"
          element={<AdminPlaceholder title="Community" />}
        />
        <Route
          path="roles"
          element={<AdminPlaceholder title="Roles & Access" />}
        />
        <Route
          path="*"
          element={<AdminPlaceholder title="Admin page not found" />}
        />
      </Route>

      {/* Public pages use the team's shared header and footer. */}
      <Route
        element={
          <PageLayout>
            <Outlet />
          </PageLayout>
        }
      >
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Route>
    </Routes>
  )
}

export default App;