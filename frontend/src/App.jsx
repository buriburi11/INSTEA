import { Navigate, Outlet, Route, Routes } from 'react-router'

import PageLayout from './layouts/PageLayout'
import MemberLayout from './layouts/MemberLayout.jsx'

import Home from './pages/Home'
import About from './pages/About'
import Locations from './pages/Locations'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails.jsx'
import Community from './pages/Community'
import MenuPage from './pages/MenuPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ShoppingCart from './pages/ShoppingCart'

import CheckoutPickup from './pages/checkout/CheckoutPickup'
import CheckoutContact from './pages/checkout/CheckoutContact'
import CheckoutPayment from './pages/checkout/CheckoutPayment'
import CheckoutReview from './pages/checkout/CheckoutReview'
import CheckoutConfirmation from './pages/checkout/CheckoutConfirmation'

import AdminLayout from './layouts/AdminLayout.jsx'
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx'
import StaffLogin from './pages/admin/StaffLogin.jsx'
import AdminCommunity from './pages/admin/AdminCommunity'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminRoles from './pages/admin/AdminRoles.jsx'

import LoginPage from './pages/customer/LoginPage.jsx'
import RegisterPage from './pages/customer/RegisterPage.jsx'
import VerifyPage from './pages/customer/VerifyPage.jsx'
import VerifyCodePage from './pages/customer/VerifyCodePage.jsx'
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage.jsx'
import ResetPasswordPage from './pages/customer/ResetPasswordPage.jsx'
import ProfilePage from './pages/customer/ProfilePage.jsx'
import RewardsPage from './pages/customer/RewardsPage.jsx'
import NotificationsPage from './pages/customer/NotificationsPage.jsx'
import NotificationPreferencesPage from './pages/customer/NotificationPreferencesPage.jsx'
import MemberDashboardPage from './pages/customer/MemberDashboardPage.jsx'
import MemberCardPage from './pages/customer/MemberCardPage.jsx'
import OrderHistoryPage from './pages/customer/OrderHistoryPage.jsx'

import ProtectedRoute from './auth/ProtectedRoute.jsx'


import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/verify/code" element={<VerifyCodePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/staff-portal" element={<StaffLogin />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPlaceholder title="Dashboard" />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="loyalty" element={<AdminPlaceholder title="Loyalty" />} />
        <Route path="community" element={<AdminCommunity />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route
          path="*"
          element={<AdminPlaceholder title="Admin page not found" />}
        />
      </Route>

      <Route
        element={
          <PageLayout>
            <Outlet />
          </PageLayout>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId" element={<EventDetails />} />
        <Route path="/community" element={<Community />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/checkout" element={<CheckoutPickup />} />
        <Route path="/checkout/contact" element={<CheckoutContact />} />
        <Route path="/checkout/payment" element={<CheckoutPayment />} />
        <Route path="/checkout/review" element={<CheckoutReview />} />
        <Route
          path="/checkout/confirmation/:orderId"
          element={<CheckoutConfirmation />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<MemberLayout />}>
            <Route
                path="/member"
                element={<MemberDashboardPage />}
            />
            <Route
            path="/member-card"
            element={<MemberCardPage />}
            />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route
            path="/orders"
            element={<OrderHistoryPage />}
            />
            <Route
              path="/notifications"
              element={<NotificationsPage />}
            />
            <Route
              path="/notifications/preferences"
              element={<NotificationPreferencesPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App