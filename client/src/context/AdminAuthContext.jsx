import React, {
  createContext,
  useContext,
  useState,
} from "react"

import api from "@/api"

const AdminAuthContext =
  createContext(null)

const ADMIN_TOKEN_KEY =
  "adminToken"

const ADMIN_DATA_KEY =
  "adminData"

export function AdminAuthProvider({
  children,
}) {
  const [token, setToken] =
    useState(() => {
      return localStorage.getItem(
        ADMIN_TOKEN_KEY
      )
    })

  const [admin, setAdmin] =
    useState(() => {
      const storedAdmin =
        localStorage.getItem(
          ADMIN_DATA_KEY
        )

      if (!storedAdmin) {
        return null
      }

      try {
        return JSON.parse(
          storedAdmin
        )
      } catch {
        localStorage.removeItem(
          ADMIN_DATA_KEY
        )

        return null
      }
    })

  const login = async (
    email,
    password
  ) => {
    const response =
      await api.loginAdmin(
        email,
        password
      )

    if (
      response?.status ===
        "error" ||
      !response?.data?.token
    ) {
      return response
    }

    const newToken =
      response.data.token

    const newAdmin =
      response.data.admin

    localStorage.setItem(
      ADMIN_TOKEN_KEY,
      newToken
    )

    localStorage.setItem(
      ADMIN_DATA_KEY,
      JSON.stringify(
        newAdmin
      )
    )

    setToken(newToken)
    setAdmin(newAdmin)

    return response
  }

  const logout = () => {
    localStorage.removeItem(
      ADMIN_TOKEN_KEY
    )

    localStorage.removeItem(
      ADMIN_DATA_KEY
    )

    setToken(null)
    setAdmin(null)
  }

  const isAuthenticated =
    Boolean(token)

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context =
    useContext(
      AdminAuthContext
    )

  if (!context) {
    throw new Error(
      "useAdminAuth must be used inside AdminAuthProvider"
    )
  }

  return context
}