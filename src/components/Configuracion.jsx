import React, { useState } from 'react';
import { 
  Settings, Save, Info, Bell, Globe, 
  Mail, Phone, Building, 
  CheckCircle, AlertCircle, RefreshCw, Database
} from 'lucide-react';
import API_BASE_URL from '../config/api.js';
import './Configuracion.css';

const DATA_GENERATION_TOKEN = import.meta.env.VITE_DATA_GENERATION_TOKEN || '';

export default function Configuracion({ user }) {
  // Cargar configuración desde localStorage si existe
  const getInitialConfig = () => {
    try {
      const saved = localStorage.getItem('configuracion_tienda');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          nombre_tienda: parsed.nombre_tienda || 'SmartSales365',
          descripcion: parsed.descripcion || 'Sistema de gestión de ventas inteligente',
          email_contacto: parsed.email_contacto || user?.email || '',
          telefono: parsed.telefono || '',
          ciudad: parsed.ciudad || 'La Paz',
          pais: parsed.pais || 'Bolivia',
          moneda: parsed.moneda || 'BOB',
          zona_horaria: parsed.zona_horaria || 'America/La_Paz',
          notificaciones_sistema: parsed.notificaciones_sistema !== undefined ? parsed.notificaciones_sistema : true,
          actualizacion_automatica: parsed.actualizacion_automatica !== undefined ? parsed.actualizacion_automatica : true
        };
      }
    } catch (e) {
      console.error('Error cargando configuración:', e);
    }
    return {
      nombre_tienda: 'SmartSales365',
      descripcion: 'Sistema de gestión de ventas inteligente',
      email_contacto: user?.email || '',
      telefono: '',
      ciudad: 'La Paz',
      pais: 'Bolivia',
      moneda: 'BOB',
      zona_horaria: 'America/La_Paz',
      notificaciones_sistema: true,
      actualizacion_automatica: true
    };
  };

  const [config, setConfig] = useState(getInitialConfig());

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('');
  const [generandoDatos, setGenerandoDatos] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function guardarConfiguracion() {
    setGuardando(true);
    setMensaje('');
    
    // Guardar en localStorage para que el footer pueda leerlo
    try {
      localStorage.setItem('configuracion_tienda', JSON.stringify(config));
    } catch (e) {
      console.error('Error guardando configuración en localStorage:', e);
    }
    
    // Simular guardado (en producción esto iría al backend)
    setTimeout(() => {
      setGuardando(false);
      setMensaje('Configuración guardada exitosamente');
      setTipoMensaje('success');
      setTimeout(() => setMensaje(''), 3000);
    }, 1000);
  }

  async function generarDatosPrueba() {
    setGenerandoDatos(true);
    setMensaje('');
    setTipoMensaje('');
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (DATA_GENERATION_TOKEN) {
        headers['X-Data-Token'] = DATA_GENERATION_TOKEN;
      }

      const res = await fetch(`${API_BASE_URL}/ventas/admin/generar-datos-prueba/`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify({
          ventas: 120,
          productos: 25,
          clientes: 12,
          limpiar: false
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        const summary = data.summary || {};
        const resumen = `✅ Datos generados exitosamente: ${summary.ventas || 0} ventas, ${summary.productos || 0} productos, ${summary.clientes || 0} clientes, ${summary.categorias || 0} categorías, ${summary.marcas || 0} marcas`;
        setMensaje(resumen);
        setTipoMensaje('success');
      } else if (res.status === 401) {
        setMensaje('⚠️ Debes iniciar sesión nuevamente o configurar VITE_DATA_GENERATION_TOKEN.');
        setTipoMensaje('error');
      } else {
        setMensaje(`❌ Error: ${data.message || 'No se pudieron generar los datos'}`);
        setTipoMensaje('error');
      }
    } catch (error) {
      setMensaje(`❌ Error de conexión: ${error.message}`);
      setTipoMensaje('error');
    } finally {
      setGenerandoDatos(false);
      setTimeout(() => setMensaje(''), 8000);
    }
  }

  return (
    <div className="configuracion-container">
      <div className="configuracion-header">
        <div>
          <h1 className="configuracion-title">
            <Settings className="title-icon" />
            Configuración del Sistema
          </h1>
          <p className="configuracion-subtitle">
            Gestiona la configuración general de tu tienda y preferencias del sistema
          </p>
        </div>
      </div>

      {mensaje && (
        <div className={`configuracion-mensaje ${tipoMensaje}`} style={{ whiteSpace: 'pre-line' }}>
          {tipoMensaje === 'success' ? <CheckCircle /> : <AlertCircle />}
          <span>{mensaje}</span>
        </div>
      )}

      <div className="configuracion-grid">
        {/* Información de la Tienda */}
        <div className="configuracion-seccion">
          <div className="seccion-header">
            <Building className="seccion-icon" />
            <h2>Información de la Tienda</h2>
          </div>
          
          <div className="seccion-content">
            <div className="form-group">
              <label>
                <Info className="label-icon" />
                Nombre de la Tienda
              </label>
              <input
                type="text"
                name="nombre_tienda"
                value={config.nombre_tienda}
                onChange={handleChange}
                className="form-input"
                placeholder="Nombre de tu tienda"
              />
            </div>

            <div className="form-group">
              <label>
                <Info className="label-icon" />
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={config.descripcion}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Descripción de tu tienda"
              />
            </div>

            <div className="form-group">
              <label>
                <Mail className="label-icon" />
                Email de Contacto
              </label>
              <input
                type="email"
                name="email_contacto"
                value={config.email_contacto}
                onChange={handleChange}
                className="form-input"
                placeholder="contacto@tienda.com"
              />
            </div>

            <div className="form-group">
              <label>
                <Phone className="label-icon" />
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={config.telefono}
                onChange={handleChange}
                className="form-input"
                placeholder="+591 12345678"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ciudad</label>
                <input
                  type="text"
                  name="ciudad"
                  value={config.ciudad}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>País</label>
                <input
                  type="text"
                  name="pais"
                  value={config.pais}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Configuración Regional */}
        <div className="configuracion-seccion">
          <div className="seccion-header">
            <Globe className="seccion-icon" />
            <h2>Configuración Regional</h2>
          </div>
          
          <div className="seccion-content">
            <div className="form-group">
              <label>Moneda</label>
              <select
                name="moneda"
                value={config.moneda}
                onChange={handleChange}
                className="form-select"
              >
                <option value="BOB">Boliviano (BOB)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Zona Horaria</label>
              <select
                name="zona_horaria"
                value={config.zona_horaria}
                onChange={handleChange}
                className="form-select"
              >
                <option value="America/La_Paz">La Paz (GMT-4)</option>
                <option value="America/Santa_Cruz">Santa Cruz (GMT-4)</option>
                <option value="America/Cochabamba">Cochabamba (GMT-4)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="configuracion-seccion">
          <div className="seccion-header">
            <Bell className="seccion-icon" />
            <h2>Notificaciones</h2>
          </div>
          
          <div className="seccion-content">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notificaciones_sistema"
                  checked={config.notificaciones_sistema}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <strong>Notificaciones del Sistema</strong>
                  <p>Mostrar notificaciones en el panel de administración</p>
                </div>
              </label>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="actualizacion_automatica"
                  checked={config.actualizacion_automatica}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <strong>Actualización Automática del Modelo IA</strong>
                  <p>El modelo de predicciones se actualizará automáticamente cada 7 días</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Generar Datos de Prueba */}
        <div className="configuracion-seccion">
          <div className="seccion-header">
            <Database className="seccion-icon" />
            <h2>Datos de Prueba</h2>
          </div>
          
          <div className="seccion-content">
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '8px', 
              border: '1px solid #bae6fd',
              marginBottom: '15px'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ display: 'block', marginBottom: '8px', color: '#1e40af' }}>
                  Generar Datos de Prueba
                </strong>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: '1.6' }}>
                  Genera automáticamente categorías, productos, clientes y ventas históricas (últimos 2 meses) 
                  para probar el sistema. Los datos incluyen:
                </p>
                <ul style={{ fontSize: '13px', color: '#64748b', margin: '10px 0 0 20px', padding: 0 }}>
                  <li>9 categorías de electrodomésticos</li>
                  <li>12 marcas reconocidas</li>
                  <li>3 proveedores</li>
                  <li>25 productos con stock</li>
                  <li>12 clientes con credenciales (password: cliente123)</li>
                  <li>120 ventas distribuidas en los últimos 2 meses</li>
                </ul>
              </div>
              <button
                onClick={generarDatosPrueba}
                disabled={generandoDatos}
                className="btn-guardar"
                style={{ 
                  width: '100%', 
                  marginTop: '10px',
                  backgroundColor: generandoDatos ? '#94a3b8' : '#3b82f6',
                  cursor: generandoDatos ? 'not-allowed' : 'pointer'
                }}
              >
                {generandoDatos ? (
                  <>
                    <RefreshCw className="spinning" style={{ animation: 'spin 1s linear infinite' }} /> 
                    Generando datos... (esto puede tardar unos minutos)
                  </>
                ) : (
                  <>
                    <Database /> Generar Datos de Prueba
                  </>
                )}
              </button>
              <p style={{ 
                fontSize: '12px', 
                color: '#64748b', 
                marginTop: '10px', 
                marginBottom: 0,
                fontStyle: 'italic'
              }}>
                ⚠️ Nota: Este proceso puede tardar 1-2 minutos. No cierres esta página.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="configuracion-acciones">
        <button
          onClick={guardarConfiguracion}
          disabled={guardando}
          className="btn-guardar"
        >
          {guardando ? (
            <>
              <RefreshCw className="spinning" /> Guardando...
            </>
          ) : (
            <>
              <Save /> Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
}

