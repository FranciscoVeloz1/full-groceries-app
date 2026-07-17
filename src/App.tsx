import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { CartProvider } from './cart/CartProvider'
import { CartPage } from './pages/CartPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { LoginPage } from './pages/LoginPage'
import { ProductListPage } from './pages/ProductListPage'

const App = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <CartProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<CategoriesPage />} />
            <Route path="/products/:categoryId" element={<ProductListPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App
