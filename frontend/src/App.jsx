
import { Navigate, Outlet, Route, Routes } from 'react-router';

import PageLayout from './layouts/PageLayout';

import Home from './pages/Home';
import About from './pages/About';
import Locations from './pages/Locations';
import Events from './pages/Events';

import MenuPage from './pages/MenuPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ShoppingCart from './pages/ShoppingCart';

import AdminLayout from './layouts/AdminLayout.jsx';
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx';
import StaffLogin from './pages/admin/StaffLogin.jsx';

import LoginPage from './pages/customer/LoginPage.jsx'
import RegisterPage from './pages/customer/RegisterPage.jsx'

import ProtectedRoute from './auth/ProtectedRoute.jsx'
import ProfilePage from './pages/customer/ProfilePage.jsx'
import RewardsPage from './pages/customer/RewardsPage.jsx'

import './App.css';

function App() {
    return (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
            {/* Staff login */}
            <Route path="/staff-portal" element={<StaffLogin />} />

            {/* Admin pages */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminPlaceholder title="Dashboard" />} />
                <Route path="orders" element={<AdminPlaceholder title="Orders" />} />
                <Route path="products" element={<AdminPlaceholder title="Products" />} />
                <Route path="customers" element={<AdminPlaceholder title="Customers" />} />
                <Route path="loyalty" element={<AdminPlaceholder title="Loyalty" />} />
                <Route path="community" element={<AdminPlaceholder title="Community" />} />
                <Route path="roles" element={<AdminPlaceholder title="Roles & Access" />} />
                <Route path="*" element={<AdminPlaceholder title="Admin page not found" />} />
            </Route>

            {/* Public pages share the Header and Footer */}
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
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={<ShoppingCart />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* Rewards shows the member's own balance, so it requires login like Profile. */}
                  <Route path="/rewards" element={<RewardsPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
