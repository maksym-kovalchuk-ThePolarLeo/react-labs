import { useEffect, useState } from 'react'

/**
 * Стан, що зберігається в localStorage під ключем `key` у форматі JSON.
 *
 * Використання, як у useState:
 *   const [value, setValue] = useLocalStorage('grind', 'beans')
 *
 * Вимоги — у тестах tests/useLocalStorage.test.jsx.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key)
    if (saved === null) return initialValue
    try {
      return JSON.parse(saved)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
