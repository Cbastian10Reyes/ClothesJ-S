import { createContext } from "react"

import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom"

import ScrollToTop from "@/ScrollToTop"

import HomePage from "@/pages/HomePage"
import NotFoundPage from "@/pages/404Page"
import ProductsPage from "@/pages/ProductsPage"
import ProductDetailsPage from "@/pages/ProductDetailsPage"
import CartPage from "@/pages/CartPage"

import cartReducer, {
  initialCartState,
} from "@/reducers/cartReducer"

import useReducerWithLocalStorage from "@/hooks/useReducerWithLocalStorage"

import UserLayout from "./layouts/UserLayout"

export const CartContext = createContext()

export default function App() {
  const [cart, cartDispatch] =
    useReducerWithLocalStorage(
      cartReducer,
      initialCartState,
      "cart"
    )

  return (
    <BrowserRouter>
      <CartContext.Provider
        value={{
          cart,
          cartDispatch,
        }}
      >
        <ScrollToTop />

        <Routes>
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
                element={<ProductsPage />}
              />

              <Route
                path=":id"
                element={
                  <ProductDetailsPage />
                }
              />
            </Route>
          </Route>

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </CartContext.Provider>
    </BrowserRouter>
  )
}