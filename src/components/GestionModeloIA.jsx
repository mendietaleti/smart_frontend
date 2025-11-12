import React, { useState, useEffect } from 'react';
import { 
  Brain, RefreshCw, Play, Clock, CheckCircle, 
  XCircle, AlertCircle, Activity, TrendingUp,
  Database, Zap, Settings
} from 'lucide-react';
import { 
  obtenerEstadoModelo, 
  entrenarModelo as apiEntrenarModelo,
  actualizarModelo as apiActualizarModelo,
  obtenerHistorialEntrenamientos
} from '../api/modeloIA.js';
import './GestionModeloIA.css';

export default function GestionModeloIA() {
  const [estadoModelo, setEstadoModelo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entrenando, setEntrenando] = useState(false);
  const [error, setError] = useState('');
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarEstado();
    cargarHistorial();
    
    // Polling para actualizar estado si está entrenando
    const interval = setInterval(() => {
      if (estadoModelo?.entrenamiento_activo?.en_curso) {
        cargarEstado();
        cargarHistorial();
      }
    }, 3000); // Actualizar cada 3 segundos si está entrenando

    return () => clearInterval(interval);
  }, [estadoModelo?.entrenamiento_activo?.en_curso]);

  async function cargarEstado() {
    try {
      const data = await obtenerEstadoModelo();
      setEstadoModelo(data);
    } catch (err) {
      console.error('Error cargando estado:', err);
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  async function cargarHistorial() {
    try {
      const data = await obtenerHistorialEntrenamientos();
      setHistorial(data.historiales || []);
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  }

  async function entrenarModelo() {
    try {
      setEntrenando(true);
      setError('');
      
      const data = await apiEntrenarModelo();
      
      // Iniciar polling para ver el progreso
      setTimeout(() => {
        cargarEstado();
        cargarHistorial();
      }, 2000);
    } catch (err) {
      console.error('Error entrenando modelo:', err);
      setError(err.message || 'Error al conectar con el servidor');
      setEntrenando(false);
    }
  }

  async function actualizarModelo() {
    try {
      setActualizando(true);
      setError('');
      
      const data = await apiActualizarModelo();
      
      // Iniciar polling para ver el progreso
      setTimeout(() => {
        cargarEstado();
        cargarHistorial();
      }, 2000);
    } catch (err) {
      console.error('Error actualizando modelo:', err);
      setError(err.message || 'Error al conectar con el servidor');
      setActualizando(false);
    }
  }

  function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getEstadoIcon(estado) {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="estado-icon estado-activo" />;
      case 'entrenando':
        return <RefreshCw className="estado-icon estado-entrenando spinning" />;
      case 'error':
        return <XCircle className="estado-icon estado-error" />;
      default:
        return <AlertCircle className="estado-icon estado-retirado" />;
    }
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case 'activo':
        return '#10B981';
      case 'entrenando':
        return '#0066FF';
      case 'error':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  }

  if (loading) {
    return (
      <div className="gestion-modelo-container">
        <div className="gestion-modelo-loading">
          <div className="spinner"></div>
          <p>Cargando información del modelo...</p>
        </div>
      </div>
    );
  }

  const modelo = estadoModelo?.modelo;
  const entrenamientoActivo = estadoModelo?.entrenamiento_activo;
  const datosDisponibles = estadoModelo?.datos_disponibles;

  return (
    <div className="gestion-modelo-container">
      {/* Header */}
      <div className="gestion-modelo-header">
        <div>
          <h1 className="gestion-modelo-title">
            <Brain className="title-icon" />
            Gestión de Modelo de IA
          </h1>
          <p className="gestion-modelo-subtitle">
            Entrenar y actualizar el modelo de predicción de ventas
          </p>
        </div>
        <button onClick={cargarEstado} className="btn-refresh" title="Actualizar estado">
          <RefreshCw /> Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="gestion-modelo-error">
          <AlertCircle /> {error}
        </div>
      )}

      {/* Estado del Modelo */}
      {modelo && (
        <div className="modelo-estado-card">
          <div className="modelo-estado-header">
            <div className="modelo-estado-info">
              {getEstadoIcon(modelo.estado)}
              <div>
                <h2 className="modelo-nombre">{modelo.nombre}</h2>
                <p className="modelo-version">Versión {modelo.version} • {modelo.algoritmo}</p>
              </div>
            </div>
            <div 
              className="modelo-estado-badge"
              style={{ backgroundColor: getEstadoColor(modelo.estado) }}
            >
              {modelo.estado.toUpperCase()}
            </div>
          </div>

          {/* Métricas */}
          {modelo.metricas && (
            <div className="modelo-metricas">
              <div className="metrica-item">
                <span className="metrica-label">R² Score</span>
                <span className="metrica-value">
                  {modelo.metricas.r2_score ? modelo.metricas.r2_score.toFixed(3) : 'N/A'}
                </span>
              </div>
              <div className="metrica-item">
                <span className="metrica-label">RMSE</span>
                <span className="metrica-value">
                  {modelo.metricas.rmse ? modelo.metricas.rmse.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="metrica-item">
                <span className="metrica-label">MAE</span>
                <span className="metrica-value">
                  {modelo.metricas.mae ? modelo.metricas.mae.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="metrica-item">
                <span className="metrica-label">Registros</span>
                <span className="metrica-value">{modelo.registros_entrenamiento || 0}</span>
              </div>
            </div>
          )}

          {/* Información de fechas */}
          <div className="modelo-fechas">
            <div className="fecha-item">
              <Clock className="fecha-icon" />
              <div>
                <span className="fecha-label">Último Entrenamiento</span>
                <span className="fecha-value">
                  {formatearFecha(modelo.fecha_entrenamiento)}
                </span>
              </div>
            </div>
            {modelo.fecha_ultima_actualizacion && (
              <div className="fecha-item">
                <RefreshCw className="fecha-icon" />
                <div>
                  <span className="fecha-label">Última Actualización</span>
                  <span className="fecha-value">
                    {formatearFecha(modelo.fecha_ultima_actualizacion)}
                  </span>
                </div>
              </div>
            )}
            {modelo.proxima_actualizacion && (
              <div className="fecha-item">
                <Zap className="fecha-icon" />
                <div>
                  <span className="fecha-label">Próxima Actualización</span>
                  <span className="fecha-value">
                    {formatearFecha(modelo.proxima_actualizacion)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Entrenamiento en curso */}
          {entrenamientoActivo?.en_curso && (
            <div className="entrenamiento-progreso">
              <div className="progreso-header">
                <RefreshCw className="spinning" />
                <span>Entrenamiento en curso...</span>
              </div>
              <div className="progreso-info">
                <span>Registros procesados: {entrenamientoActivo.registros_procesados}</span>
                <span>Iniciado: {formatearFecha(entrenamientoActivo.fecha_inicio)}</span>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="modelo-acciones">
            <button
              onClick={entrenarModelo}
              disabled={entrenando || entrenamientoActivo?.en_curso || actualizando}
              className="btn-accion btn-entrenar"
              title="CU: Entrenar modelo de predicción - Recopila datos históricos y entrena el modelo"
            >
              <Play /> {entrenando ? 'Iniciando...' : 'Entrenar Modelo'}
            </button>
            <button
              onClick={actualizarModelo}
              disabled={actualizando || entrenamientoActivo?.en_curso || modelo.estado === 'retirado'}
              className="btn-accion btn-actualizar"
              title="CU: Actualizar modelo IA periódicamente - Reentrena con datos recientes"
            >
              <RefreshCw /> {actualizando ? 'Actualizando...' : 'Actualizar Modelo'}
            </button>
          </div>

          {/* Información sobre actualización automática */}
          {modelo.proxima_actualizacion && (
            <div className="info-automatica">
              <Settings className="info-icon" />
              <div>
                <p className="info-title">Actualización Automática</p>
                <p className="info-text">
                  El sistema actualizará automáticamente el modelo cada 7 días con los datos más recientes.
                  La próxima actualización está programada para: <strong>{formatearFecha(modelo.proxima_actualizacion)}</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de datos */}
      {datosDisponibles && (
        <div className="datos-disponibles-card">
          <div className="datos-header">
            <Database className="datos-icon" />
            <h3>Datos Disponibles para Entrenamiento</h3>
          </div>
          <div className="datos-content">
            <div className="dato-item">
              <span className="dato-label">Total de Ventas:</span>
              <span className="dato-value">{datosDisponibles.ventas_totales}</span>
            </div>
            <div className="dato-item">
              <span className="dato-label">Suficientes Datos:</span>
              <span className={`dato-value ${datosDisponibles.suficientes_datos ? 'positivo' : 'negativo'}`}>
                {datosDisponibles.suficientes_datos ? '✓ Sí' : '✗ No (mínimo 50 ventas)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Entrenamientos */}
      <div className="historial-card">
        <div className="historial-header">
          <Activity className="historial-icon" />
          <h3>Historial de Entrenamientos</h3>
        </div>
        <div className="historial-content">
          {historial.length === 0 ? (
            <div className="historial-empty">
              <p>No hay historial de entrenamientos aún.</p>
            </div>
          ) : (
            <div className="historial-list">
              {historial.map((item) => (
                <div key={item.id} className="historial-item">
                  <div className="historial-item-header">
                    <div className="historial-estado">
                      {item.estado === 'completado' && <CheckCircle className="icon-success" />}
                      {item.estado === 'error' && <XCircle className="icon-error" />}
                      {item.estado === 'iniciado' && <RefreshCw className="icon-proceso spinning" />}
                      <span className={`estado-text estado-${item.estado}`}>
                        {item.estado.toUpperCase()}
                      </span>
                    </div>
                    <span className="historial-fecha">
                      {formatearFecha(item.fecha_inicio)}
                    </span>
                  </div>
                  <div className="historial-details">
                    <div className="historial-metricas">
                      {item.metricas && (
                        <>
                          {item.metricas.r2_score && (
                            <span>R²: {item.metricas.r2_score.toFixed(3)}</span>
                          )}
                          {item.metricas.rmse && (
                            <span>RMSE: {item.metricas.rmse.toFixed(2)}</span>
                          )}
                          {item.metricas.mae && (
                            <span>MAE: {item.metricas.mae.toFixed(2)}</span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="historial-info">
                      <span>Registros: {item.registros_procesados}</span>
                      {item.duracion_segundos && (
                        <span>Duración: {Math.round(item.duracion_segundos)}s</span>
                      )}
                      {item.mensaje_error && (
                        <span className="error-text">Error: {item.mensaje_error}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

