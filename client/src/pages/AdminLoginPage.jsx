import React, { useState } from "react"

import { useNavigate } from "react-router-dom"

import Button from "@/components/Button"

import {
  useAdminAuth,
} from "@/context/AdminAuthContext"

export default function AdminLoginPage() {
  const navigate = useNavigate()

  const {
    login,
    isAuthenticated,
  } = useAdminAuth()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [error, setError] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  if (isAuthenticated) {
    navigate(
      "/admin/products",
      {
        replace: true,
      }
    )
  }

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault()

    if (!email.trim()) {
      setError(
        "Ingresa tu correo."
      )

      return
    }

    if (!password) {
      setError(
        "Ingresa tu contraseña."
      )

      return
    }

    try {
      setLoading(true)
      setError("")

      const response =
        await login(
          email,
          password
        )

      if (
        response?.status ===
          "error" ||
        !response?.success
      ) {
        setError(
          response?.message ||
            "Credenciales inválidas."
        )

        return
      }

      navigate(
        "/admin/products",
        {
          replace: true,
        }
      )
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      )

      setError(
        "No fue posible iniciar sesión."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-gray-900 text-center">
          Administrador
        </h1>

        <p className="text-gray-500 text-center mt-2">
          Inicia sesión para administrar los productos.
        </p>

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-8 space-y-5"
        >

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correo
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="correo@ejemplo.com"
              autoComplete="email"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:border-gray-900
              "
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Tu contraseña"
              autoComplete="current-password"
              className="
                w-full
                border
                border-gray-300
                rounded-lg
                px-4
                py-3
                focus:outline-none
                focus:border-gray-900
              "
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Button
            className="w-full"
            disabled={loading}
            type="submit"
          >
            {loading
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </Button>

          <button
              type="button"
              onClick={() => navigate("/")}
              className="
                w-full
                border
                border-gray-800
                text-gray-800
                font-medium
                rounded-lg
                px-4
                py-3
                transition-all
                duration-200
                hover:(border-black text-black)
                focus:outline-none
              "
            >
              ← Volver a la tienda
          </button>

        </form>

      </div>

    </main>
  )
}