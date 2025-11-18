// API para gestión de clientes

import API_BASE_URL from '../config/api.js'

function buildQuery(params) {
  const q = new URLSearchParams()
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length > 0) q.append(k, v)
  })
  const s = q.toString()
  return s ? `?${s}` : ''
}

export async function listClients(params = {}) {
  const query = buildQuery(params)
  const res = await fetch(`${API_BASE_URL}/clientes/${query}`, { credentials: 'include' })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudieron obtener los clientes')
  return data
}

export async function getClient(id) {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}/`, { credentials: 'include' })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo obtener el cliente')
  return data
}

export async function getClientVentas(id, params = {}) {
  const query = buildQuery(params)
  const res = await fetch(`${API_BASE_URL}/clientes/${id}/ventas/${query}`, { credentials: 'include' })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo obtener el historial de compras')
  return data
}

export async function updateClient(body) {
  const res = await fetch(`${API_BASE_URL}/clientes/${body.id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo actualizar el cliente')
  return data
}

export async function deleteClient(id) {
  const res = await fetch(`${API_BASE_URL}/clientes/${id}/`, {
    method: 'DELETE',
    credentials: 'include'
  })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo desactivar el cliente')
  return data
}

