import {
  createContext,
} from "react"

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import ScrollToTop from "@/ScrollToTop"

import HomePage from "@/pages/HomePage"
import NotFoundPage from "@/pages/404Page"
import ProductsPage from "@/pages/ProductsPage"
import ProductDetailsPage from "@/pages/ProductDetailsPage"
import CartPage from "@/pages/CartPage"

import AdminLoginPage from "@/pages/AdminLoginPage"
import AdminProductsPage from "@/pages/AdminProductsPage"
import AdminCreateProductPage from "@/pages/AdminCreateProductPage"
import AdminEditProductPage from "@/pages/AdminEditProductPage"
import AdminOrdersPage from "@/pages/AdminOrdersPage"
import AdminOrderDetailsPage from "@/pages/AdminOrderDetailsPage"

import cartReducer, {
  initialCartState,
} from "@/reducers/cartReducer"

import useReducerWithLocalStorage from "@/hooks/useReducerWithLocalStorage"

import UserLayout from "./layouts/UserLayout"

import {
  AdminAuthProvider,
  useAdminAuth,
} from "./context/AdminAuthContext"

export const CartContext =
  createContext()

function AdminProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
  } = useAdminAuth()

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return children
}

export default function App() {
  const [
    cart,
    cartDispatch,
  ] =
    useReducerWithLocalStorage(
      cartReducer,
      initialCartState,
      "cart"
    )

  return (
    <BrowserRouter>

      <AdminAuthProvider>

        <CartContext.Provider
          value={{
            cart,
            cartDispatch,
          }}
        >

          <ScrollToTop />

          <Routes>

            {/* =========================
                TIENDA
            ========================= */}

            <Route
              path="/"
              element={<UserLayout />}
            >

              <Route
                index
                element={<HomePage />}
              />

              <Route
                path="cart"
                element={<CartPage />}
              />

              <Route path="products">

                <Route
                  index
                  element={
                    <ProductsPage />
                  }
                />

                <Route
                  path=":id"
                  element={
                    <ProductDetailsPage />
                  }
                />

              </Route>

            </Route>

            {/* =========================
                ADMIN LOGIN
            ========================= */}

            <Route
              path="/admin/login"
              element={
                <AdminLoginPage />
              }
            />

            {/* =========================
                ADMIN PRODUCTS
            ========================= */}

            <Route
              path="/admin/products"
              element={
                <AdminProtectedRoute>
                  <AdminProductsPage />
                </AdminProtectedRoute>
              }
            />

            {/* CREAR PRODUCTO */}
            <Route
              path="/admin/products/create"
              element={
                <AdminProtectedRoute>
                  <AdminCreateProductPage />
                </AdminProtectedRoute>
              }
            />

            {/* EDITAR PRODUCTO */}
            <Route
              path="/admin/products/:id/edit"
              element={
                <AdminProtectedRoute>
                  <AdminEditProductPage />
                </AdminProtectedRoute>
              }
            />

            {/* =========================
                ADMIN ORDERS
            ========================= */}

            <Route
              path="/admin/orders"
              element={
                <AdminProtectedRoute>
                  <AdminOrdersPage />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/admin/orders/:id"
              element={
                <AdminProtectedRoute>
                  <AdminOrderDetailsPage />
                </AdminProtectedRoute>
              }
            />

            {/* =========================
                404
            ========================= */}

            <Route
              path="*"
              element={
                <NotFoundPage />
              }
            />

          </Routes>

        </CartContext.Provider>

      </AdminAuthProvider>

    </BrowserRouter>
  )
}