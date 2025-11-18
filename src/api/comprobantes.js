// CU12: API para comprobantes

import API_BASE_URL from '../config/api.js'

export async function generarComprobante(ventaId, tipo = 'factura') {
  const res = await fetch(`${API_BASE_URL}/ventas/comprobantes/generar/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ venta_id: ventaId, tipo })
  })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'Error al generar comprobante')
  return data.comprobante
}

export async function obtenerComprobante(ventaId) {
  const res = await fetch(`${API_BASE_URL}/ventas/comprobantes/${ventaId}/`, {
    credentials: 'include'
  })
  const data = await res.json().catch(() => ({ success: false }))
  if (!res.ok || !data.success) throw new Error(data.message || 'Error al obtener comprobante')
  return data.comprobante
}

export async function descargarComprobantePDF(ventaId) {
  try {
    const res = await fetch(`${API_BASE_URL}/ventas/comprobantes/${ventaId}/pdf/`, {
      method: 'GET',
      credentials: 'include'
    })
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || `Error al descargar PDF (${res.status})`)
    }
    
    // Obtener el blob del PDF
    const blob = await res.blob()
    
    // Crear URL temporal y descargar
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `factura_${ventaId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error al descargar PDF:', error)
    alert(`Error al descargar el PDF: ${error.message}`)
  }
}


