import { useEffect, useReducer } from "react"

export default function useReducerWithLocalStorage(
  reducer,
  initialState,
  storageKey
) {
  const [storedState, dispatch] = useReducer(
    reducer,
    initialState,
    (initialState) => {
      try {
        const persisted =
          window.localStorage.getItem(storageKey)

        return persisted
          ? JSON.parse(persisted)
          : initialState
      } catch (error) {
        console.error(
          "Error leyendo localStorage:",
          error
        )

        return initialState
      }
    }
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(storedState)
      )
    } catch (error) {
      console.error(
        "Error guardando localStorage:",
        error
      )
    }
  }, [storedState, storageKey])

  return [storedState, dispatch]
}