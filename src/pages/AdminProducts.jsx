import { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js'
import ImageUpload from '../components/ImageUpload.jsx'

export default function AdminProducts() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ 
    nombre:'', 
    descripcion:'', 
    precio:'', 
    imagen:'', 
    categoria:'', 
    marca:'', 
    proveedor:'',
    stock: ''
  })
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [viewItem, setViewItem] = useState(null)

  async function reload() {
    try {
      setLoading(true)
      setError('')
      const { items } = await listProducts({ order: 'nombre', page_size: 100 })
      setItems(items)
    } catch (e) {
      setError('Error al cargar productos: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  async function onSubmit(e){
    e.preventDefault()
    setMessage('')
    setError('')
    
    if (!form.nombre.trim() || !form.precio) {
      setError('Nombre y precio son obligatorios')
      return
    }
    
    try {
      setLoading(true)
      const body = { 
        ...form, 
        precio: Number(form.precio),
        stock: Number(form.stock) || 0
      }
      
      if (editingId) {
        await updateProduct({ id: editingId, ...body })
        setMessage('✅ Producto actualizado correctamente')
      } else {
        await createProduct(body)
        setMessage('✅ Producto creado correctamente')
      }
      
      setForm({ 
        nombre:'', 
        descripcion:'', 
        precio:'', 
        imagen:'', 
        categoria:'', 
        marca:'', 
        proveedor:'',
        stock: ''
      })
      setEditingId(null)
      await reload()
    } catch (e){ 
      setError('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  function onEdit(p){
    setEditingId(p.id)
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: String(p.precio || ''),
      imagen: p.imagen || '',
      categoria: p.categoria || '',
      marca: p.marca || '',
      proveedor: p.proveedor || '',
      stock: String(p.stock || '')
    })
    setMessage('')
    setError('')
  }

  function onCancel() {
    setEditingId(null)
    setForm({ 
      nombre:'', 
      descripcion:'', 
      precio:'', 
      imagen:'', 
      categoria:'', 
      marca:'', 
      proveedor:'',
      stock: ''
    })
    setMessage('')
    setError('')
  }

  function handleImageUpload(imageUrl) {
    setForm({ ...form, imagen: imageUrl })
  }

  async function onDelete(id){
    if (!confirm('¿Estás seguro de eliminar este producto?')) return
    try { 
      setLoading(true)
      await deleteProduct(id)
      setMessage('✅ Producto eliminado correctamente')
      await reload() 
    } catch(e){ 
      setError('Error al eliminar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="shop" style={{ marginTop: 24, paddingBottom: 32 }}>
      <div className="card" style={{ background: '#f0f9ff', border: '2px solid #0ea5e9', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
        <div>
          <h2 style={{ margin:'0 0 4px 0' }}>🔧 Gestión de Productos</h2>
          <p style={{ margin:0 }}>Administra el catálogo: crear, editar y eliminar productos.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button 
            className="btn-primary" 
            onClick={() => { onCancel(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          >
            ➕ Nuevo Producto
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card" style={{ textAlign:'left' }}>
        <h3>{editingId ? '✏️ Editar Producto' : '➕ Crear Nuevo Producto'}</h3>
        
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <label>
            Nombre *
            <input 
              value={form.nombre} 
              onChange={e=>setForm({ ...form, nombre:e.target.value })} 
              required 
              placeholder="Ej: Laptop Gaming"
            />
          </label>
          
          <label>
            Precio de Venta *
            <input 
              type="number" 
              step="0.01" 
              min="0"
              value={form.precio} 
              onChange={e=>setForm({ ...form, precio:e.target.value })} 
              required 
              placeholder="199.99"
            />
          </label>
          
          <label>
            Stock Inicial
            <input 
              type="number" 
              min="0"
              value={form.stock} 
              onChange={e=>setForm({ ...form, stock:e.target.value })} 
              placeholder="10"
            />
          </label>
          
          <label>
            Categoría
            <input 
              value={form.categoria} 
              onChange={e=>setForm({ ...form, categoria:e.target.value })} 
              placeholder="Ej: Tecnología"
            />
          </label>
          
          <label>
            Marca
            <input 
              value={form.marca} 
              onChange={e=>setForm({ ...form, marca:e.target.value })} 
              placeholder="Ej: Apple"
            />
          </label>
          
          <label>
            Proveedor
            <input 
              value={form.proveedor} 
              onChange={e=>setForm({ ...form, proveedor:e.target.value })} 
              placeholder="Ej: TechSupply Corp"
            />
          </label>
        </div>
        
        <label>
          Descripción
          <textarea 
            value={form.descripcion} 
            onChange={e=>setForm({ ...form, descripcion:e.target.value })} 
            placeholder="Descripción detallada del producto..."
            rows={3}
          />
        </label>
        
        <label>
          URL de Imagen
          <input 
            type="url"
            value={form.imagen} 
            onChange={e=>setForm({ ...form, imagen:e.target.value })} 
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </label>
        
        {/* Nueva funcionalidad: Subir imagen */}
        <div>
          <label>Subir Imagen desde Archivo</label>
          <ImageUpload 
            onImageUploaded={handleImageUpload}
            currentImage={form.imagen}
          />
        </div>
        
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '⏳' : editingId ? '💾 Actualizar' : '➕ Crear'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              ❌ Cancelar
            </button>
          )}
        </div>
        
        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}
      </form>

      <div className="card">
        <h3>📋 Lista de Productos</h3>
        {loading && <div>Cargando...</div>}
        {!loading && items.length === 0 && <div>No hay productos registrados</div>}
        {!loading && items.length > 0 && (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8f9fa' }}>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>ID</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Nombre</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Categoría</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Marca</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Precio</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Stock</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Estado</th>
                  <th style={{ padding:8, border:'1px solid #dee2e6', textAlign:'left' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>{p.id}</td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>
                      <div style={{ fontWeight:'bold' }}>{p.nombre}</div>
                      {p.descripcion && (
                        <div style={{ fontSize:'0.8em', color:'#666' }}>
                          {p.descripcion.substring(0, 50)}...
                        </div>
                      )}
                    </td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>{p.categoria || '-'}</td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>{p.marca || '-'}</td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>Bs. {p.precio}</td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>{p.stock}</td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>
                      <span style={{ 
                        color: p.estado ? '#22c55e' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {p.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ padding:8, border:'1px solid #dee2e6' }}>
                      <div style={{ display:'flex', gap:8 }}>
                        <button 
                          onClick={()=>setViewItem(p)} 
                          className="btn-secondary"
                          disabled={loading}
                          title="Ver"
                        >
                          👁️ Ver
                        </button>
                        <button 
                          onClick={()=>onEdit(p)} 
                          className="btn-primary"
                          disabled={loading}
                          title="Editar"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          onClick={()=>onDelete(p.id)} 
                          className="btn-secondary"
                          disabled={loading}
                          title="Eliminar"
                          style={{ borderColor:'#ef4444', color:'#ef4444' }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewItem && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={()=>setViewItem(null)}>
          <div className="card" style={{ maxWidth:600, width:'90%', position:'relative' }} onClick={(e)=>e.stopPropagation()}>
            <button onClick={()=>setViewItem(null)} title="Cerrar" style={{ position:'absolute', top:8, right:8, border:'1px solid #e5e7eb', background:'#fff', width:32, height:32, borderRadius:999, cursor:'pointer' }}>×</button>
            <h3 style={{ marginTop:0 }}>👁️ Detalle de Producto</h3>
            <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:16 }}>
              <div>
                {viewItem.imagen ? (
                  <img src={viewItem.imagen} alt={viewItem.nombre} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:8 }} />
                ) : (
                  <div style={{ width:'100%', height:120, background:'#f3f4f6', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>Sin imagen</div>
                )}
              </div>
              <div>
                <p style={{ margin:'4px 0' }}><strong>Nombre:</strong> {viewItem.nombre}</p>
                <p style={{ margin:'4px 0' }}><strong>Precio:</strong> Bs. {viewItem.precio}</p>
                <p style={{ margin:'4px 0' }}><strong>Stock:</strong> {viewItem.stock}</p>
                <p style={{ margin:'4px 0' }}><strong>Categoría:</strong> {viewItem.categoria || '-'}</p>
                <p style={{ margin:'4px 0' }}><strong>Marca:</strong> {viewItem.marca || '-'}</p>
                <p style={{ margin:'4px 0' }}><strong>Proveedor:</strong> {viewItem.proveedor || '-'}</p>
                {viewItem.descripcion && <p style={{ margin:'8px 0 0 0' }}><strong>Descripción:</strong> {viewItem.descripcion}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}