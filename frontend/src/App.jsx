import './App.css'
import { Navigate, Route, Routes } from 'react-router'
import PageLayout from './components/PageLayout'
import MenuPage from './pages/MenuPage'
import ProductDetailPage from './pages/ProductDetailPage'

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/menu/:productId" element={<ProductDetailPage />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </PageLayout>
  )
}

export default App