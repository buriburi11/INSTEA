
import { Navigate, Outlet, Route, Routes } from 'react-router';

import PageLayout from './components/PageLayout';
import Home from './components/Home';
import About from './components/About';
import Locations from './components/Locations';
import Events from './components/Events';

import MenuPage from './pages/MenuPage';
import ProductDetailPage from './pages/ProductDetailPage';

import AdminLayout from './layouts/AdminLayout.jsx';
import AdminPlaceholder from './pages/admin/AdminPlaceholder.jsx';
import StaffLogin from './pages/admin/StaffLogin.jsx';

import './App.css';

function App() {
    return (
        <Routes>
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
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

export default App;
