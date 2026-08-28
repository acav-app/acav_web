'use client'

import { useCallback, useEffect, useState } from 'react'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })

  if (response.status === 401) {
    window.location.href = '/admin/login'
    throw new Error('Sesión expirada.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error((data as { error?: string }).error ?? 'Error en la operación.')
  return data as T
}

export function useCollection<T extends { id: string }, TInput>(endpoint: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await request<{ items: T[] }>(endpoint)
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos.')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    reload()
  }, [reload])

  const create = useCallback(
    async (input: TInput) => {
      const data = await request<{ item: T }>(endpoint, { method: 'POST', body: JSON.stringify(input) })
      setItems((prev) => [data.item, ...prev])
      return data.item
    },
    [endpoint]
  )

  const update = useCallback(
    async (id: string, input: TInput) => {
      const data = await request<{ item: T }>(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
      setItems((prev) => prev.map((item) => (item.id === id ? data.item : item)))
      return data.item
    },
    [endpoint]
  )

  const remove = useCallback(
    async (id: string) => {
      await request<{ ok: true }>(`${endpoint}/${id}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [endpoint]
  )

  return { items, loading, error, reload, create, update, remove }
}
