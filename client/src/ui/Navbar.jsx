import React, {
  useContext,
  useState,
} from "react"

import clsx from "clsx"

import { Link } from "react-router-dom"

import {
  Menu,
  Search,
  X,
  ShoppingCart,
  LogIn,
  Settings,
} from "react-feather"

import { CartContext } from "@/App"

import Input from "@/components/Input"

import Button from "@/components/Button"

import useClickOutside from "@/hooks/useClickOutside"

import {
  useAdminAuth,
} from "@/context/AdminAuthContext"

export default function Navbar() {
  const { cart } =
    useContext(CartContext)

  const {
    isAuthenticated,
  } = useAdminAuth()

  const [showMenu, setShowMenu] =
    useState(false)

  const navbarRef =
    useClickOutside(() =>
      setShowMenu(false)
    )

  const totalItems =
    cart?.products?.reduce(
      (sum, product) =>
        sum +
        (Number(product.quantity) || 0),
      0
    ) || 0

  return (
    <nav
      className={clsx(
        "w-full flex flex-wrap justify-between items-center",
        "sticky top-0 z-40 py-3 px-4",
        "bg-gray-200/90 border-b border-gray-300",
        "backdrop-filter backdrop-blur-lg shadow-sm",
        "md:(py-1)"
      )}
      ref={navbarRef}
    >

      {/* LOGO */}
      <div className="flex justify-between items-center md:mx-0">

        <Link to="/">
          <h3 className="text-medium text-2xl">
            CLOTHES J&S
          </h3>
        </Link>

      </div>

      {/* CARRITO + LOGIN + MENÚ MÓVIL */}
      <div className="flex items-center ml-2 space-x-4 md:order-2">

        {/* CARRITO */}
        <Link
          to="/cart"
          className="relative flex items-center pr-2"
        >
          <ShoppingCart
            width={24}
            height={24}
          />

          {totalItems > 0 && (
            <div
              className="
                absolute
                flex
                justify-center
                items-center
                min-w-4
                h-4
                px-1
                bg-red-500
                text-white
                rounded-full
                top-0
                right-0
                text-xs
                font-semibold
              "
            >
              {totalItems}
            </div>
          )}

        </Link>

        {/* LOGIN / ADMIN */}
        {isAuthenticated ? (
          <Link
            to="/admin/products"
            className="hidden md:block"
          >
            <Button secondary>
              <Settings
                width={18}
                height={18}
                className="mr-2"
              />

              Panel admin
            </Button>
          </Link>
        ) : (
          <Link
            to="/admin/login"
            className="hidden md:block"
          >
            <Button secondary>
              <LogIn
                width={18}
                height={18}
                className="mr-2"
              />

              Iniciar sesión
            </Button>
          </Link>
        )}

        {/* MENÚ MÓVIL */}
        <button
          type="button"
          className="md:hidden flex items-center focus:outline-none"
          onClick={() =>
            setShowMenu(
              (previous) =>
                !previous
            )
          }
        >
          {showMenu ? (
            <X
              width={24}
              height={24}
            />
          ) : (
            <Menu
              width={24}
              height={24}
            />
          )}
        </button>

      </div>

      {/* NAVEGACIÓN */}
      <div
        className={clsx(
          "hidden w-full",

          showMenu &&
            "!flex flex-col mt-8",

          "md:(flex flex-row mt-0 ml-auto order-1 w-auto)"
        )}
      >

        <ul
          className={clsx(
            "flex flex-col items-center order-2",
            "mt-8 mb-2 text-xl space-y-1 divide-y-2 divide-gray-200",
            "md:(flex-row text-base m-0 space-y-0 divide-y-0 divide-x)"
          )}
          onClick={() =>
            setShowMenu(false)
          }
        >

          <NavLink to="/products?gender=Masculino">
            Hombre
          </NavLink>

          <NavLink to="/products?gender=Femenino">
            Mujer
          </NavLink>

          <NavLink to="/products">
            Todos los Productos
          </NavLink>

          {/* LOGIN EN MÓVIL */}
          <li className="md:hidden hover:text-gray-800 text-gray-700 block px-4 py-2 truncate">

            {isAuthenticated ? (
              <Link
                to="/admin/products"
                className="flex items-center"
              >
                <Settings
                  size={20}
                  className="mr-2"
                />

                Panel admin
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center"
              >
                <LogIn
                  size={20}
                  className="mr-2"
                />

                Iniciar sesión
              </Link>
            )}

          </li>

        </ul>

        {/* BUSCADOR */}
        <div className="flex items-center order-1 md:order-2">

          <Input
            className="md:max-w-min bg-opacity-40"
            icon={<Search />}
            placeholder="Buscar..."
          />

        </div>

      </div>

    </nav>
  )
}

function NavLink({
  children,
  to,
}) {
  return (
    <li className="hover:text-gray-800 text-gray-700 block px-4 py-2 truncate">

      <Link to={to}>
        {children}
      </Link>

    </li>
  )
}