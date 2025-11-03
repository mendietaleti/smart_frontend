import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, User, Menu, X, TrendingUp, Zap, Bell, BarChart3, 
  Package, Users, FileText, Brain, Home, Settings, ChevronDown, Plus, 
  Download, Mic, DollarSign, ShoppingBag, AlertCircle, TrendingDown, 
  Edit, Trash2, Eye, Filter, Save, Upload, Calendar, CreditCard, 
  Mail, Phone, MapPin, Clock, CheckCircle, XCircle, AlertTriangle,
  UserPlus, UserMinus, Shield, Database, Activity, Target, PieChart,
  LineChart, BarChart, RefreshCw, Star, Heart, MessageSquare, 
  HelpCircle, LogOut, Lock, Key, Globe, Smartphone, Monitor, 
  Headphones, Camera, Gamepad2, Wrench
} from 'lucide-react';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js';
import './AdminDashboard.css';

export default function AdminDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(5);
  const [isListening, setIsListening] = useState(false);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productViewOpen, setProductViewOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '', descripcion: '', precio: '', imagen: '', categoria: '', marca: '', proveedor: '', stock: ''
  });
  const [uiMessage, setUiMessage] = useState('');
  const [uiError, setUiError] = useState('');
  const [viewItem, setViewItem] = useState(null);

  // Usuario administrador
  const admin = {
    name: user?.nombre || 'Administrador',
    role: 'Administrador',
    avatar: user?.nombre?.charAt(0) || 'A'
  };

  // Datos del dashboard con colores azules
  const stats = [
    {
      title: 'Ventas del Mes',
      value: 'Bs. 127,450',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue'
    },
    {
      title: 'Total Pedidos',
      value: '342',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'blue'
    },
    {
      title: 'Nuevos Clientes',
      value: '89',
      change: '+23.1%',
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Productos Activos',
      value: productos.length.toString(),
      change: '-2.4%',
      trend: 'down',
      icon: Package,
      color: 'blue'
    }
  ];

  const recentSales = [
    { id: 'V-2025-001', client: 'María García', amount: 4299.00, status: 'Completado', date: '27/10/2025' },
    { id: 'V-2025-002', client: 'Juan Pérez', amount: 8999.00, status: 'Pendiente', date: '27/10/2025' },
    { id: 'V-2025-003', client: 'Ana López', amount: 2499.00, status: 'Completado', date: '26/10/2025' },
    { id: 'V-2025-004', client: 'Pedro Sánchez', amount: 5799.00, status: 'En proceso', date: '26/10/2025' },
    { id: 'V-2025-005', client: 'Laura Martínez', amount: 1899.00, status: 'Completado', date: '25/10/2025' }
  ];

  const topProducts = productos.slice(0, 4).map(producto => ({
    name: producto.nombre,
    sales: Math.floor(Math.random() * 50) + 10,
    revenue: producto.precio * (Math.floor(Math.random() * 50) + 10)
  }));

  const aiPredictions = {
    nextMonth: 142300,
    growth: 11.6,
    confidence: 87,
    topCategory: 'Tecnología'
  };

  // Menú del administrador con colores azules
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Vista general del negocio' },
    { id: 'productos', label: 'Gestión de Productos', icon: Package, description: 'CRUD completo de productos' },
    { id: 'categorias', label: 'Categorías', icon: Filter, description: 'Gestionar categorías de productos' },
    { id: 'inventario', label: 'Inventario', icon: Database, description: 'Control de stock y almacén' },
    { id: 'clientes', label: 'Gestión de Clientes', icon: Users, description: 'Administrar usuarios y clientes' },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, description: 'Historial y gestión de ventas' },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, description: 'Seguimiento de pedidos' },
    { id: 'pagos', label: 'Pagos', icon: CreditCard, description: 'Gestión de pagos y facturación' },
    { id: 'reportes', label: 'Reportes', icon: FileText, description: 'Generar reportes dinámicos' },
    { id: 'analytics', label: 'Analytics', icon: BarChart, description: 'Análisis de datos y métricas' },
    { id: 'predicciones', label: 'Predicciones IA', icon: Brain, description: 'Análisis predictivo con IA' },
    { id: 'marketing', label: 'Marketing', icon: Target, description: 'Campañas y promociones' },
    { id: 'notificaciones', label: 'Notificaciones', icon: Bell, description: 'Sistema de alertas' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, description: 'Configuración del sistema' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { items } = await listProducts();
      setProductos(items);
      
      // Simular datos de clientes y ventas
      setClientes([
        { id: 1, nombre: 'María García', email: 'maria@email.com', telefono: '+591 70123456', fecha_registro: '2025-01-15', estado: 'Activo' },
        { id: 2, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '+591 70234567', fecha_registro: '2025-02-20', estado: 'Activo' },
        { id: 3, nombre: 'Ana López', email: 'ana@email.com', telefono: '+591 70345678', fecha_registro: '2025-03-10', estado: 'Inactivo' }
      ]);
      
      setVentas(recentSales);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  // ---- Productos CRUD Handlers ----
  function openNewProduct() {
    setEditingProductId(null);
    setProductForm({ nombre:'', descripcion:'', precio:'', imagen:'', categoria:'', marca:'', proveedor:'', stock:'' });
    setUiMessage(''); setUiError('');
    setProductModalOpen(true);
  }

  function openEditProduct(p) {
    setEditingProductId(p.id);
    setProductForm({
      nombre: p.nombre || '', descripcion: p.descripcion || '', precio: String(p.precio || ''), imagen: p.imagen || '',
      categoria: p.categoria || '', marca: p.marca || '', proveedor: p.proveedor || '', stock: String(p.stock || '')
    });
    setUiMessage(''); setUiError('');
    setProductModalOpen(true);
  }

  async function submitProductForm(e) {
    e.preventDefault();
    setUiMessage(''); setUiError('');
    if (!productForm.nombre.trim() || !productForm.precio) { setUiError('Nombre y precio son obligatorios'); return; }
    try {
      const body = { ...productForm, precio: Number(productForm.precio), stock: Number(productForm.stock) || 0 };
      if (editingProductId) {
        await updateProduct({ id: editingProductId, ...body });
        setUiMessage('Producto actualizado correctamente');
      } else {
        await createProduct(body);
        setUiMessage('Producto creado correctamente');
      }
      setProductModalOpen(false);
      await loadData();
    } catch (err) {
      setUiError(err.message || 'Error');
    }
  }

  async function onDeleteProduct(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;
    setUiError(''); setUiMessage('');
    try {
      await deleteProduct(id);
      setUiMessage('Producto eliminado');
      await loadData();
    } catch (err) {
      setUiError(err.message || 'Error al eliminar');
    }
  }

  const toggleVoiceCommand = () => {
    setIsListening(!isListening);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const renderDashboard = () => (
    <main className="admin-main">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="admin-stat-card">
              <div className="admin-stat-header">
                <div className="admin-stat-icon">
                  <Icon className="admin-stat-icon-svg" />
                </div>
                <span className={`admin-stat-change ${stat.trend === 'up' ? 'admin-stat-up' : 'admin-stat-down'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="admin-stat-title">{stat.title}</p>
              <p className="admin-stat-value">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="admin-charts-grid">
        {/* Ventas Chart */}
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3 className="admin-chart-title">Ventas Mensuales</h3>
            <button className="admin-chart-button">Ver detalles</button>
          </div>
          <div className="admin-chart-content">
            {[65, 78, 85, 72, 90, 88, 95, 82, 75, 92, 88, 85].map((height, index) => (
              <div key={index} className="admin-chart-bar" style={{height: `${height}%`}}></div>
            ))}
          </div>
          <div className="admin-chart-labels">
            <span>Ene</span><span>Feb</span><span>Mar</span><span>Abr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Ago</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dic</span>
          </div>
        </div>

        {/* AI Predictions */}
        <div className="admin-ai-card">
          <div className="admin-ai-header">
            <Brain className="admin-ai-icon" />
            <h3 className="admin-ai-title">Predicciones IA</h3>
          </div>
          <div className="admin-ai-content">
            <div className="admin-ai-section">
              <p className="admin-ai-label">Ventas Próximo Mes</p>
              <p className="admin-ai-value">Bs. {aiPredictions.nextMonth.toLocaleString()}</p>
              <div className="admin-ai-trend">
                <TrendingUp className="admin-ai-trend-icon" />
                <span className="admin-ai-trend-text">+{aiPredictions.growth}% proyectado</span>
              </div>
            </div>
            <div className="admin-ai-divider"></div>
            <div className="admin-ai-section">
              <p className="admin-ai-label">Nivel de Confianza</p>
              <div className="admin-ai-progress">
                <div className="admin-ai-progress-bar">
                  <div className="admin-ai-progress-fill" style={{width: `${aiPredictions.confidence}%`}}></div>
                </div>
                <span className="admin-ai-progress-text">{aiPredictions.confidence}%</span>
              </div>
            </div>
            <div className="admin-ai-divider"></div>
            <div className="admin-ai-section">
              <p className="admin-ai-label">Categoría Top</p>
              <p className="admin-ai-category">{aiPredictions.topCategory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="admin-tables-grid">
        {/* Recent Sales */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Ventas Recientes</h3>
            <button className="admin-table-button">
              <span>Exportar</span>
              <Download className="admin-table-icon" />
            </button>
          </div>
          <div className="admin-table-content">
            <table className="admin-table">
              <thead>
                <tr className="admin-table-header-row">
                  <th className="admin-table-header-cell">ID</th>
                  <th className="admin-table-header-cell">Cliente</th>
                  <th className="admin-table-header-cell">Monto</th>
                  <th className="admin-table-header-cell">Estado</th>
                </tr>
              </thead>
              <tbody className="admin-table-body">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="admin-table-row">
                    <td className="admin-table-cell">{sale.id}</td>
                    <td className="admin-table-cell admin-table-cell-bold">{sale.client}</td>
                    <td className="admin-table-cell admin-table-cell-bold">Bs. {sale.amount.toFixed(2)}</td>
                    <td className="admin-table-cell">
                      <span className={`admin-table-status admin-table-status-${sale.status.toLowerCase().replace(' ', '-')}`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3 className="admin-table-title">Productos Top</h3>
            <button className="admin-table-button">Ver todos</button>
          </div>
          <div className="admin-table-content">
            <div className="admin-products-list">
              {topProducts.map((product, index) => (
                <div key={index} className="admin-product-item">
                  <div className="admin-product-info">
                    <p className="admin-product-name">{product.name}</p>
                    <p className="admin-product-sales">{product.sales} ventas</p>
                  </div>
                  <div className="admin-product-stats">
                    <p className="admin-product-revenue">Bs. {product.revenue.toLocaleString()}</p>
                    <div className="admin-product-bar">
                      <div className="admin-product-bar-fill" style={{width: `${(product.sales / 60) * 100}%`}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions-grid">
        <button 
          onClick={() => setActiveSection('productos')}
          className="admin-action-button admin-action-primary"
        >
          <Plus className="admin-action-icon" />
          <span className="admin-action-text">Nuevo Producto</span>
        </button>
        <button 
          onClick={() => setActiveSection('reportes')}
          className="admin-action-button admin-action-secondary"
        >
          <FileText className="admin-action-icon" />
          <span className="admin-action-text">Generar Reporte</span>
        </button>
        <button 
          onClick={() => setActiveSection('predicciones')}
          className="admin-action-button admin-action-tertiary"
        >
          <Brain className="admin-action-icon" />
          <span className="admin-action-text">Ver Predicciones</span>
        </button>
      </div>
    </main>
  );

  const renderProductos = () => (
    <main className="admin-main">
      <div className="admin-content-card">
        <div className="admin-content-header">
          <div className="admin-content-title-section">
            <h3 className="admin-content-title">Gestión de Productos</h3>
            <p className="admin-content-subtitle">Administra el catálogo de productos</p>
          </div>
          <div className="admin-content-actions">
            <button 
              onClick={openNewProduct}
              className="admin-content-button admin-content-button-primary"
            >
              <Plus className="admin-content-button-icon" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p className="admin-loading-text">Cargando productos...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table admin-table-full">
              <thead>
                <tr className="admin-table-header-row">
                  <th className="admin-table-header-cell">Imagen</th>
                  <th className="admin-table-header-cell">Nombre</th>
                  <th className="admin-table-header-cell">Categoría</th>
                  <th className="admin-table-header-cell">Precio</th>
                  <th className="admin-table-header-cell">Stock</th>
                  <th className="admin-table-header-cell">Estado</th>
                  <th className="admin-table-header-cell">Acciones</th>
                </tr>
              </thead>
              <tbody className="admin-table-body">
                {productos.map((producto) => (
                  <tr key={producto.id} className="admin-table-row">
                    <td className="admin-table-cell">
                      {producto.imagen ? (
                        <img src={producto.imagen} alt={producto.nombre} className="admin-product-image" />
                      ) : (
                        <div className="admin-product-placeholder">
                          <Package className="admin-product-placeholder-icon" />
                        </div>
                      )}
                    </td>
                    <td className="admin-table-cell admin-table-cell-bold">{producto.nombre}</td>
                    <td className="admin-table-cell">{producto.categoria || 'General'}</td>
                    <td className="admin-table-cell admin-table-cell-bold">Bs. {producto.precio.toFixed(2)}</td>
                    <td className="admin-table-cell">
                      <span className={`admin-stock-badge admin-stock-badge-${producto.stock > 10 ? 'high' : producto.stock > 5 ? 'medium' : 'low'}`}>
                        {producto.stock}
                      </span>
                    </td>
                    <td className="admin-table-cell">
                      <span className="admin-status-badge admin-status-active">
                        Activo
                      </span>
                    </td>
                    <td className="admin-table-cell">
                      <div className="admin-action-buttons">
                        <button className="admin-action-button-small admin-action-view" title="Ver detalles" onClick={()=>{ setViewItem(producto); setProductViewOpen(true); }}>
                          <Eye className="admin-action-icon-small" />
                        </button>
                        <button className="admin-action-button-small admin-action-edit" title="Editar" onClick={()=>openEditProduct(producto)}>
                          <Edit className="admin-action-icon-small" />
                        </button>
                        <button className="admin-action-button-small admin-action-delete" title="Eliminar" onClick={()=>onDeleteProduct(producto.id)}>
                          <Trash2 className="admin-action-icon-small" />
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

      {/* Mensajes de operación */}
      {(uiMessage || uiError) && (
        <div style={{ marginTop: 12 }}>
          {uiMessage && <div className="success">{uiMessage}</div>}
          {uiError && <div className="error">{uiError}</div>}
        </div>
      )}

      {/* Modal Crear / Editar Producto */}
      {productModalOpen && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={()=>setProductModalOpen(false)}>
          <div className="card" style={{ width:'95%', maxWidth:720, position:'relative' }} onClick={(e)=>e.stopPropagation()}>
            <button onClick={()=>setProductModalOpen(false)} title="Cerrar" style={{ position:'absolute', top:8, right:8, border:'1px solid #e5e7eb', background:'#fff', width:32, height:32, borderRadius:999, cursor:'pointer' }}>×</button>
            <h3 style={{ marginTop:0 }}>{editingProductId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}</h3>
            <form onSubmit={submitProductForm}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <label>Nombre*
                  <input value={productForm.nombre} onChange={e=>setProductForm({ ...productForm, nombre:e.target.value })} required />
                </label>
                <label>Precio*
                  <input type="number" min="0" step="0.01" value={productForm.precio} onChange={e=>setProductForm({ ...productForm, precio:e.target.value })} required />
                </label>
                <label>Stock
                  <input type="number" min="0" value={productForm.stock} onChange={e=>setProductForm({ ...productForm, stock:e.target.value })} />
                </label>
                <label>Categoría
                  <input value={productForm.categoria} onChange={e=>setProductForm({ ...productForm, categoria:e.target.value })} />
                </label>
                <label>Marca
                  <input value={productForm.marca} onChange={e=>setProductForm({ ...productForm, marca:e.target.value })} />
                </label>
                <label>Proveedor
                  <input value={productForm.proveedor} onChange={e=>setProductForm({ ...productForm, proveedor:e.target.value })} />
                </label>
              </div>
              <label>Descripción
                <textarea rows={3} value={productForm.descripcion} onChange={e=>setProductForm({ ...productForm, descripcion:e.target.value })} />
              </label>
              <label>URL de imagen
                <input type="url" value={productForm.imagen} onChange={e=>setProductForm({ ...productForm, imagen:e.target.value })} />
              </label>
              <div style={{ display:'flex', gap:8, marginTop:12 }}>
                <button type="submit" className="btn-primary">{editingProductId ? '💾 Guardar' : '➕ Crear'}</button>
                <button type="button" className="btn-secondary" onClick={()=>setProductModalOpen(false)}>Cancelar</button>
              </div>
              {uiError && <div className="error" style={{ marginTop:8 }}>{uiError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle */}
      {productViewOpen && viewItem && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={()=>setProductViewOpen(false)}>
          <div className="card" style={{ width:'95%', maxWidth:640, position:'relative' }} onClick={(e)=>e.stopPropagation()}>
            <button onClick={()=>setProductViewOpen(false)} title="Cerrar" style={{ position:'absolute', top:8, right:8, border:'1px solid #e5e7eb', background:'#fff', width:32, height:32, borderRadius:999, cursor:'pointer' }}>×</button>
            <h3 style={{ marginTop:0 }}>👁️ Detalle de Producto</h3>
            <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:16 }}>
              <div>
                {viewItem.imagen ? (
                  <img src={viewItem.imagen} alt={viewItem.nombre} style={{ width:'100%', height:140, objectFit:'cover', borderRadius:8 }} />
                ) : (
                  <div style={{ width:'100%', height:140, background:'#f3f4f6', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>Sin imagen</div>
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
    </main>
  );

  const renderClientes = () => (
    <main className="admin-main">
      <div className="admin-content-card">
        <div className="admin-content-header">
          <div className="admin-content-title-section">
            <h3 className="admin-content-title">Gestión de Clientes</h3>
            <p className="admin-content-subtitle">Administra usuarios y clientes del sistema</p>
          </div>
          <div className="admin-content-actions">
            <button className="admin-content-button admin-content-button-secondary">
              <Download className="admin-content-button-icon" />
              <span>Exportar</span>
            </button>
            <button 
              onClick={() => setActiveSection('clientes')}
              className="admin-content-button admin-content-button-primary"
            >
              <UserPlus className="admin-content-button-icon" />
              <span>Nuevo Cliente</span>
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table admin-table-full">
            <thead>
              <tr className="admin-table-header-row">
                <th className="admin-table-header-cell">ID</th>
                <th className="admin-table-header-cell">Nombre</th>
                <th className="admin-table-header-cell">Email</th>
                <th className="admin-table-header-cell">Teléfono</th>
                <th className="admin-table-header-cell">Fecha Registro</th>
                <th className="admin-table-header-cell">Estado</th>
                <th className="admin-table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="admin-table-row">
                  <td className="admin-table-cell">#{cliente.id}</td>
                  <td className="admin-table-cell admin-table-cell-bold">{cliente.nombre}</td>
                  <td className="admin-table-cell">{cliente.email}</td>
                  <td className="admin-table-cell">{cliente.telefono}</td>
                  <td className="admin-table-cell">{cliente.fecha_registro}</td>
                  <td className="admin-table-cell">
                    <span className={`admin-status-badge admin-status-${cliente.estado.toLowerCase()}`}>
                      {cliente.estado}
                    </span>
                  </td>
                  <td className="admin-table-cell">
                    <div className="admin-action-buttons">
                      <button className="admin-action-button-small admin-action-view" title="Ver perfil">
                        <Eye className="admin-action-icon-small" />
                      </button>
                      <button className="admin-action-button-small admin-action-edit" title="Editar">
                        <Edit className="admin-action-icon-small" />
                      </button>
                      <button className="admin-action-button-small admin-action-delete" title="Desactivar">
                        <UserMinus className="admin-action-icon-small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );

  const renderVentas = () => (
    <main className="admin-main">
      <div className="admin-content-card">
        <div className="admin-content-header">
          <div className="admin-content-title-section">
            <h3 className="admin-content-title">Gestión de Ventas</h3>
            <p className="admin-content-subtitle">Historial y seguimiento de ventas</p>
          </div>
          <div className="admin-content-actions">
            <button className="admin-content-button admin-content-button-secondary">
              <Calendar className="admin-content-button-icon" />
              <span>Filtrar por fecha</span>
            </button>
            <button className="admin-content-button admin-content-button-primary">
              <Download className="admin-content-button-icon" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table admin-table-full">
            <thead>
              <tr className="admin-table-header-row">
                <th className="admin-table-header-cell">ID Venta</th>
                <th className="admin-table-header-cell">Cliente</th>
                <th className="admin-table-header-cell">Productos</th>
                <th className="admin-table-header-cell">Monto Total</th>
                <th className="admin-table-header-cell">Fecha</th>
                <th className="admin-table-header-cell">Estado</th>
                <th className="admin-table-header-cell">Acciones</th>
              </tr>
            </thead>
            <tbody className="admin-table-body">
              {ventas.map((venta) => (
                <tr key={venta.id} className="admin-table-row">
                  <td className="admin-table-cell">{venta.id}</td>
                  <td className="admin-table-cell admin-table-cell-bold">{venta.client}</td>
                  <td className="admin-table-cell">3 productos</td>
                  <td className="admin-table-cell admin-table-cell-bold">Bs. {venta.amount.toFixed(2)}</td>
                  <td className="admin-table-cell">{venta.date}</td>
                  <td className="admin-table-cell">
                    <span className={`admin-table-status admin-table-status-${venta.status.toLowerCase().replace(' ', '-')}`}>
                      {venta.status}
                    </span>
                  </td>
                  <td className="admin-table-cell">
                    <div className="admin-action-buttons">
                      <button className="admin-action-button-small admin-action-view" title="Ver detalles">
                        <Eye className="admin-action-icon-small" />
                      </button>
                      <button className="admin-action-button-small admin-action-edit" title="Procesar">
                        <CheckCircle className="admin-action-icon-small" />
                      </button>
                      <button className="admin-action-button-small admin-action-delete" title="Cancelar">
                        <XCircle className="admin-action-icon-small" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'productos':
        return renderProductos();
      case 'clientes':
        return renderClientes();
      case 'ventas':
        return renderVentas();
      default:
        return (
          <main className="admin-main">
            <div className="admin-placeholder">
              <div className="admin-placeholder-icon">
                {React.createElement(menuItems.find(item => item.id === activeSection)?.icon, {className: "admin-placeholder-icon-svg"})}
              </div>
              <h3 className="admin-placeholder-title">
                {menuItems.find(item => item.id === activeSection)?.label}
              </h3>
              <p className="admin-placeholder-description">
                {menuItems.find(item => item.id === activeSection)?.description}
              </p>
              <p className="admin-placeholder-note">Contenido en desarrollo para esta sección</p>
            </div>
          </main>
        );
    }
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : 'admin-sidebar-closed'}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <Zap className="admin-logo-svg" />
            </div>
            {sidebarOpen && (
              <div className="admin-logo-text">
                <h1 className="admin-logo-title">SmartSales365</h1>
                <p className="admin-logo-subtitle">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`admin-menu-item ${isActive ? 'admin-menu-item-active' : ''}`}
                title={sidebarOpen ? '' : item.label}
              >
                <Icon className="admin-menu-icon" />
                {sidebarOpen && (
                  <div className="admin-menu-content">
                    <span className="admin-menu-label">{item.label}</span>
                    <p className="admin-menu-description">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="admin-sidebar-footer">
          <button className="admin-menu-item">
            <Settings className="admin-menu-icon" />
            {sidebarOpen && <span className="admin-menu-label">Configuración</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`admin-main-content ${sidebarOpen ? 'admin-main-content-open' : 'admin-main-content-closed'}`}>
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="admin-header-button"
              >
                <Menu className="admin-header-icon" />
              </button>
              <div className="admin-header-title">
                <h2 className="admin-header-title-text">
                  {menuItems.find(item => item.id === activeSection)?.label}
                </h2>
                <p className="admin-header-subtitle">
                  {menuItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>

            <div className="admin-header-right">
              {/* Voice Command */}
              <button
                onClick={toggleVoiceCommand}
                className={`admin-header-button ${isListening ? 'admin-header-button-active' : ''}`}
                title="Comando de voz"
              >
                <Mic className="admin-header-icon" />
              </button>

              {/* Notifications */}
              <button className="admin-header-button admin-header-button-notification">
                <Bell className="admin-header-icon" />
                {notifications > 0 && (
                  <span className="admin-notification-badge">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="admin-user-menu">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="admin-user-button"
                >
                  <div className="admin-user-avatar">
                    {admin.avatar}
                  </div>
                  <div className="admin-user-info">
                    <p className="admin-user-name">{admin.name}</p>
                    <p className="admin-user-role">{admin.role}</p>
                  </div>
                  <ChevronDown className="admin-user-chevron" />
                </button>

                {isUserMenuOpen && (
                  <div className="admin-user-dropdown">
                    <button className="admin-user-dropdown-item">
                      <User className="admin-user-dropdown-icon" />
                      <span>Mi Perfil</span>
                    </button>
                    <button className="admin-user-dropdown-item">
                      <Settings className="admin-user-dropdown-icon" />
                      <span>Configuración</span>
                    </button>
                    <div className="admin-user-dropdown-divider"></div>
                    <button onClick={handleLogout} className="admin-user-dropdown-item admin-user-dropdown-logout">
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Command Input - Reportes dinámicos */}
          {(activeSection === 'reportes' || activeSection === 'predicciones') && (
            <div className="admin-command-input">
              <div className="admin-command-container">
                <input
                  type="text"
                  placeholder="Escribe o habla tu consulta: 'Quiero un reporte de ventas de octubre en PDF' o 'Predice ventas de noviembre'"
                  className="admin-command-field"
                />
                <Search className="admin-command-search-icon" />
                <button
                  onClick={toggleVoiceCommand}
                  className={`admin-command-voice ${isListening ? 'admin-command-voice-active' : ''}`}
                >
                  <Mic className="admin-command-voice-icon" />
                </button>
              </div>
              <p className="admin-command-hint">💡 Genera reportes dinámicos con texto o voz</p>
            </div>
          )}
        </header>

        {/* Dynamic Content */}
        {renderSection()}
      </div>
    </div>
  );
}