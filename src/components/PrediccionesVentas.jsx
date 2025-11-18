import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, BarChart3, 
  Calendar, RefreshCw, Filter, Download, 
  Info, AlertCircle, CheckCircle, Sparkles,
  LineChart, PieChart, Target, Zap, Activity,
  FileText, FileSpreadsheet
} from 'lucide-react';
import { generarPredicciones, listarPredicciones } from '../api/predicciones.js';
import { obtenerEstadoModelo, entrenarModelo as apiEntrenarModelo } from '../api/modeloIA.js';
import { obtenerHistorialAgregado } from '../api/historial.js';
import { listCategorias } from '../api/products.js';
import './PrediccionesVentas.css';

export default function PrediccionesVentas() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predicciones, setPredicciones] = useState([]);
  const [estadoModelo, setEstadoModelo] = useState(null);
  const [historialAgregado, setHistorialAgregado] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [entrenando, setEntrenando] = useState(false);
  
  // Parámetros de generación
  const [periodo, setPeriodo] = useState('mes');
  const [mesesFuturos, setMesesFuturos] = useState(3);
  const [categoriaId, setCategoriaId] = useState('');
  const [categorias, setCategorias] = useState([]);
  
  // Predicciones recientes generadas (para reportes específicos)
  const [prediccionesRecientes, setPrediccionesRecientes] = useState([]);
  
  // Resumen de predicciones
  const [resumen, setResumen] = useState(null);
  const [tendencias, setTendencias] = useState(null);

  useEffect(() => {
    cargarEstadoModelo();
    cargarHistorialAgregado();
    cargarPrediccionesExistentes();
    cargarCategorias();
  }, []);

  // Polling separado para actualizar estado si está entrenando
  useEffect(() => {
    const enCurso = estadoModelo?.entrenamiento_activo?.en_curso || entrenando;
    
    if (!enCurso) {
      return;
    }
    
    const interval = setInterval(() => {
      cargarEstadoModelo();
    }, 3000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estadoModelo?.entrenamiento_activo?.en_curso, entrenando]);

  async function cargarEstadoModelo() {
    try {
      const data = await obtenerEstadoModelo();
      setEstadoModelo(data);
      
      // Si el modelo terminó de entrenar, actualizar estado
      if (entrenando && data?.modelo?.estado === 'activo') {
        setEntrenando(false);
      }
    } catch (err) {
      console.error('Error cargando estado del modelo:', err);
    }
  }

  async function entrenarModelo() {
    try {
      setEntrenando(true);
      setError('');
      
      await apiEntrenarModelo();
      
      // Iniciar polling para ver el progreso
      setTimeout(() => {
        cargarEstadoModelo();
      }, 2000);
    } catch (err) {
      console.error('Error entrenando modelo:', err);
      setError(err.message || 'Error al entrenar el modelo');
      setEntrenando(false);
    }
  }

  async function cargarHistorialAgregado() {
    try {
      const data = await obtenerHistorialAgregado({ agrupar_por: 'mes', periodo: 12 });
      if (data && data.success) {
        // Normalizar los datos del historial
        const historialNormalizado = (data.historial || []).map(h => ({
          fecha: h.fecha || h.mes || h.periodo || '',
          total_ventas: parseFloat(h.total_ventas || h.ventas || h.total || 0),
          tipo: 'historico'
        }));
        setHistorialAgregado(historialNormalizado);
      }
    } catch (err) {
      console.warn('Error cargando historial agregado:', err);
      setHistorialAgregado([]);
    }
  }

  async function cargarCategorias() {
    try {
      const data = await listCategorias();
      if (data && data.success) {
        setCategorias(data.categorias || []);
      }
    } catch (err) {
      console.warn('Error cargando categorías:', err);
      setCategorias([]);
    }
  }

  async function cargarPrediccionesExistentes() {
    try {
      const data = await listarPredicciones({ limite: 100 });
      if (data && data.success) {
        // Si hay predicciones recientes, combinarlas con las existentes
        setPrediccionesRecientes(currentRecent => {
          if (currentRecent.length > 0) {
            // Combinar predicciones recientes con las existentes, evitando duplicados
            const recentIds = new Set(currentRecent.map(p => p.id).filter(Boolean));
            const otrasPredicciones = (data.predicciones || []).filter(p => !recentIds.has(p.id));
            const todas = [...currentRecent, ...otrasPredicciones];
            setPredicciones(todas);
            return currentRecent; // Mantener las recientes
          } else {
            setPredicciones(data.predicciones || []);
            return [];
          }
        });
      }
    } catch (err) {
      console.warn('Error cargando predicciones existentes:', err);
    }
  }

  async function generarNuevasPredicciones() {
    try {
      setGenerando(true);
      setError('');
      
      // Asegurar que categoriaId se envíe correctamente
      const categoriaIdToSend = categoriaId && categoriaId !== '' && categoriaId !== '0' ? parseInt(categoriaId) : null;
      
      const data = await generarPredicciones({
        periodo,
        meses_futuros: mesesFuturos,
        categoria_id: categoriaIdToSend,
        guardar: true
      });
      
      if (data && data.success) {
        const nuevasPredicciones = data.predicciones || [];
        
        // Guardar las predicciones recientes generadas (para reportes específicos)
        setPrediccionesRecientes(nuevasPredicciones);
        
        // Mostrar inmediatamente las nuevas predicciones generadas
        setPredicciones(nuevasPredicciones);
        
        setResumen(data.resumen || null);
        setTendencias(data.tendencias || null);
        
        // Recargar todas las predicciones en segundo plano para tener el historial completo
        setTimeout(() => {
          cargarPrediccionesExistentes();
        }, 1000);
      }
    } catch (err) {
      console.error('Error generando predicciones:', err);
      setError(err.message || 'Error al generar predicciones');
    } finally {
      setGenerando(false);
    }
  }

  function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(valor);
  }

  function formatearFecha(fechaISO, incluirHora = false) {
    if (!fechaISO) return 'N/A';
    try {
      const fecha = new Date(fechaISO);
      if (incluirHora) {
        return fecha.toLocaleString('es-BO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return fecha.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return fechaISO;
    }
  }

  function formatearMes(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-BO', {
      month: 'short',
      year: 'numeric'
    });
  }

  // Preparar datos para gráficos
  const datosGrafico = React.useMemo(() => {
    const historial = historialAgregado.map(h => ({
      fecha: h.fecha || '',
      valor: parseFloat(h.total_ventas || 0),
      tipo: 'historico'
    })).filter(h => h.fecha); // Filtrar fechas vacías

    const preds = predicciones.map(p => ({
      fecha: p.fecha_prediccion,
      valor: parseFloat(p.valor_predicho || 0),
      confianza: parseFloat(p.confianza || 0),
      tipo: 'prediccion'
    }));

    const todos = [...historial, ...preds].filter(d => d.fecha).sort((a, b) => {
      try {
        const fechaA = new Date(a.fecha);
        const fechaB = new Date(b.fecha);
        return fechaA - fechaB;
      } catch {
        return 0;
      }
    });

    return todos;
  }, [historialAgregado, predicciones]);

  async function exportarReporte(formato, soloRecientes = false) {
    try {
      const prediccionesAExportar = soloRecientes ? prediccionesRecientes : predicciones;
      
      if (prediccionesAExportar.length === 0) {
        alert('No hay predicciones para exportar. Por favor, genera predicciones primero.');
        return;
      }

      setLoading(true);
      
      // Si hay predicciones recientes, exportar solo esas; si no, exportar todas
      const idsPredicciones = soloRecientes && prediccionesRecientes.length > 0 
        ? prediccionesRecientes.map(p => p.id).filter(Boolean).join(',')
        : null;
      
      let url = `/api/dashboard/predicciones/exportar/?formato=${formato}`;
      if (idsPredicciones) {
        url += `&ids=${idsPredicciones}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al generar el reporte');
      }
      
      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      const fechaStr = new Date().toISOString().slice(0, 10);
      const categoriaStr = categoriaId ? `_cat_${categoriaId}` : '';
      a.download = `predicciones_ia${categoriaStr}_${fechaStr}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_blob);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exportando reporte:', err);
      alert(`Error al exportar el reporte: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const modelo = estadoModelo?.modelo;
  const modeloActivo = modelo?.estado === 'activo';

  return (
    <div className="predicciones-container">
      {/* Header */}
      <div className="predicciones-header">
        <div>
          <h1 className="predicciones-title">
            <Brain className="title-icon" />
            Predicciones de Ventas
          </h1>
          <p className="predicciones-subtitle">
            Genera proyecciones de ventas futuras usando inteligencia artificial
          </p>
        </div>
        <div className="predicciones-header-actions">
          <button 
            onClick={cargarPrediccionesExistentes} 
            className="btn-refresh"
            title="Actualizar predicciones"
          >
            <RefreshCw /> Actualizar
          </button>
          {predicciones.length > 0 && (
            <div className="predicciones-export">
              {prediccionesRecientes.length > 0 && (
                <>
                  <button 
                    onClick={() => exportarReporte('pdf', true)}
                    className="btn-export btn-export-pdf"
                    title="Exportar predicciones recientes a PDF"
                  >
                    <FileText size={18} /> PDF (Recientes)
                  </button>
                  <button 
                    onClick={() => exportarReporte('excel', true)}
                    className="btn-export btn-export-excel"
                    title="Exportar predicciones recientes a Excel"
                  >
                    <FileSpreadsheet size={18} /> Excel (Recientes)
                  </button>
                </>
              )}
              <button 
                onClick={() => exportarReporte('pdf', false)}
                className="btn-export btn-export-pdf"
                title="Exportar todas las predicciones a PDF"
              >
                <FileText size={18} /> PDF (Todas)
              </button>
              <button 
                onClick={() => exportarReporte('excel', false)}
                className="btn-export btn-export-excel"
                title="Exportar todas las predicciones a Excel"
              >
                <FileSpreadsheet size={18} /> Excel (Todas)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estado del Modelo */}
      {modelo && (
        <div className="predicciones-modelo-card">
          <div className="modelo-card-header">
            <Brain className="modelo-card-icon" />
            <div>
              <h3>Estado del Modelo de IA</h3>
              <p className="modelo-card-subtitle">{modelo.nombre} v{modelo.version}</p>
            </div>
            <div className={`modelo-estado-badge ${modelo.estado}`}>
              {modelo.estado === 'activo' && <CheckCircle size={16} />}
              {modelo.estado === 'entrenando' && <RefreshCw size={16} className="spinning" />}
              {modelo.estado === 'error' && <AlertCircle size={16} />}
              {modelo.estado === 'retirado' && <AlertCircle size={16} />}
              <span>{modelo.estado.toUpperCase()}</span>
            </div>
          </div>
          
          {modelo.metricas && (
            <div className="modelo-metricas-grid">
              <div className="modelo-metrica">
                <span className="metrica-label">R² Score</span>
                <span className="metrica-valor">
                  {modelo.metricas.r2_score ? modelo.metricas.r2_score.toFixed(3) : 'N/A'}
                </span>
                <span className="metrica-desc">Calidad del modelo</span>
              </div>
              <div className="modelo-metrica">
                <span className="metrica-label">Registros</span>
                <span className="metrica-valor">{modelo.registros_entrenamiento || 0}</span>
                <span className="metrica-desc">Ventas usadas</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alerta si el modelo no está activo */}
      {!modeloActivo && (
        <div className="predicciones-alerta">
          <AlertCircle className="alerta-icon" />
          <div style={{ flex: 1 }}>
            <p className="alerta-titulo">Modelo no disponible</p>
            <p className="alerta-texto">
              {estadoModelo?.datos_disponibles?.suficientes_datos 
                ? 'El modelo de predicción no está activo. Entrena el modelo ahora para poder generar predicciones de ventas.'
                : `Datos insuficientes. Se requieren al menos 5 ventas para entrenar el modelo. Actualmente hay ${estadoModelo?.datos_disponibles?.ventas_totales || 0} ventas.`}
            </p>
            {estadoModelo?.datos_disponibles?.suficientes_datos && (
              <button
                onClick={entrenarModelo}
                disabled={entrenando}
                className="btn-entrenar-modelo"
                style={{
                  marginTop: '12px',
                  padding: '10px 20px',
                  background: entrenando ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: entrenando ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {entrenando ? (
                  <>
                    <RefreshCw className="spinning" size={18} />
                    Entrenando modelo...
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    Entrenar Modelo Ahora
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="predicciones-error">
          <AlertCircle /> {error}
        </div>
      )}

      {/* Información breve sobre cómo funciona */}
      {modeloActivo && (
        <div className="predicciones-info-card" style={{ padding: '20px', marginBottom: '24px' }}>
          <div className="info-card-header" style={{ marginBottom: '12px' }}>
            <Info className="info-card-icon" size={20} />
            <h3 style={{ fontSize: '16px', margin: 0 }}>¿Cómo funciona?</h3>
          </div>
          <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              El sistema analiza tus ventas históricas de los últimos 3 meses, calcula tendencias comparando períodos recientes, 
              y usa el modelo de IA entrenado para proyectar ventas futuras con niveles de confianza.
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
              <strong>Tip:</strong> Selecciona un período (mensual/semanal/diario) y opcionalmente una categoría para predicciones específicas.
            </p>
          </div>
        </div>
      )}

      {/* Panel de Generación */}
      {modeloActivo && (
        <div className="predicciones-panel-generacion">
          <div className="panel-header">
            <Sparkles className="panel-icon" />
            <h2>Generar Nuevas Predicciones</h2>
          </div>
          
          {/* Ejemplos rápidos */}
          <div className="ejemplos-rapidos">
            <p className="ejemplos-titulo">Ejemplos rápidos:</p>
            <div className="ejemplos-botones">
              <button
                onClick={() => {
                  setPeriodo('mes');
                  setMesesFuturos(3);
                  setCategoriaId(null);
                }}
                className="ejemplo-btn"
                title="Predicción para los próximos 3 meses"
              >
                <Calendar size={16} />
                <span>Próximos 3 meses</span>
              </button>
              <button
                onClick={() => {
                  setPeriodo('mes');
                  setMesesFuturos(6);
                  setCategoriaId(null);
                }}
                className="ejemplo-btn"
                title="Predicción para los próximos 6 meses"
              >
                <Calendar size={16} />
                <span>Próximos 6 meses</span>
              </button>
              <button
                onClick={() => {
                  setPeriodo('semana');
                  setMesesFuturos(4);
                  setCategoriaId(null);
                }}
                className="ejemplo-btn"
                title="Predicción para las próximas 4 semanas"
              >
                <Calendar size={16} />
                <span>Próximas 4 semanas</span>
              </button>
            </div>
          </div>
          
          <div className="panel-contenido">
            <div className="parametros-grid">
              <div className="parametro-item">
                <label className="parametro-label">
                  <Calendar className="label-icon" />
                  Período
                </label>
                <select 
                  value={periodo} 
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="parametro-select"
                >
                  <option value="mes">Mensual</option>
                  <option value="semana">Semanal</option>
                  <option value="dia">Diario</option>
                </select>
                <p className="parametro-hint">Selecciona la frecuencia de las predicciones</p>
              </div>

              <div className="parametro-item">
                <label className="parametro-label">
                  <Target className="label-icon" />
                  Períodos a Predecir
                </label>
                <input
                  type="number"
                  min="1"
                  max={periodo === 'mes' ? 12 : periodo === 'semana' ? 12 : 30}
                  value={mesesFuturos}
                  onChange={(e) => setMesesFuturos(parseInt(e.target.value) || 1)}
                  className="parametro-input"
                />
                <p className="parametro-hint">
                  {periodo === 'mes' ? 'Máximo 12 meses' : periodo === 'semana' ? 'Máximo 12 semanas' : 'Máximo 30 días'}
                </p>
              </div>

              <div className="parametro-item">
                <label className="parametro-label">
                  <Filter className="label-icon" />
                  Categoría (Opcional)
                </label>
                <select
                  value={categoriaId || ''}
                  onChange={(e) => setCategoriaId(e.target.value || '')}
                  className="parametro-select"
                >
                  <option key="todas" value="">Todas las categorías</option>
                  {categorias.map(cat => (
                    <option key={`cat-${cat.id_categoria}`} value={cat.id_categoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
                <p className="parametro-hint">Filtrar predicciones por categoría específica</p>
              </div>
            </div>

            <div className="panel-acciones">
              <button
                onClick={generarNuevasPredicciones}
                disabled={generando}
                className="btn-generar"
              >
                {generando ? (
                  <>
                    <RefreshCw className="spinning" /> Generando Predicciones...
                  </>
                ) : (
                  <>
                    <Zap /> Generar Predicciones
                  </>
                )}
              </button>
              
              {predicciones.length > 0 && (
                <div className="resumen-rapido">
                  <CheckCircle className="resumen-icon" size={20} />
                  <div>
                    <p className="resumen-texto">
                      <strong>{predicciones.length}</strong> predicciones generadas
                    </p>
                    <p className="resumen-subtexto">
                      Total: {formatearMoneda(predicciones.reduce((sum, p) => sum + (parseFloat(p.valor_predicho) || 0), 0))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Predicciones */}
      {resumen && (
        <div className="predicciones-resumen">
          <div className="resumen-header">
            <BarChart3 className="resumen-icon" />
            <h2>Resumen de Predicciones</h2>
          </div>
          
          <div className="resumen-grid">
            <div className="resumen-card">
              <div className="resumen-card-header">
                <TrendingUp className="resumen-card-icon" />
                <span className="resumen-card-label">Total Predicho</span>
              </div>
              <div className="resumen-card-value">
                {formatearMoneda(resumen.total_valor_predicho || 0)}
              </div>
              <div className="resumen-card-info">
                {resumen.total_predicciones} períodos
              </div>
            </div>

            <div className="resumen-card">
              <div className="resumen-card-header">
                <Activity className="resumen-card-icon" />
                <span className="resumen-card-label">Confianza Promedio</span>
              </div>
              <div className="resumen-card-value">
                {((resumen.confianza_promedio || 0) * 100).toFixed(1)}%
              </div>
              <div className="resumen-card-info">
                Nivel de confianza del modelo
              </div>
            </div>

            {tendencias && (
              <>
                <div className="resumen-card">
                  <div className="resumen-card-header">
                    <TrendingUp className="resumen-card-icon" />
                    <span className="resumen-card-label">Factor de Crecimiento</span>
                  </div>
                  <div className={`resumen-card-value ${tendencias.factor_crecimiento >= 0 ? 'positivo' : 'negativo'}`}>
                    {tendencias.factor_crecimiento >= 0 ? '+' : ''}{tendencias.factor_crecimiento?.toFixed(1)}%
                  </div>
                  <div className="resumen-card-info">
                    Tendencias históricas
                  </div>
                </div>

                <div className="resumen-card">
                  <div className="resumen-card-header">
                    <BarChart3 className="resumen-card-icon" />
                    <span className="resumen-card-label">Promedio Mensual</span>
                  </div>
                  <div className="resumen-card-value">
                    {formatearMoneda(tendencias.promedio_mensual_historico || 0)}
                  </div>
                  <div className="resumen-card-info">
                    Basado en últimos 3 meses
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Gráfico de Predicciones */}
      {predicciones.length > 0 && (
        <div className="predicciones-grafico-container">
          <div className="grafico-header">
            <LineChart className="grafico-icon" />
            <h2>Proyección de Ventas</h2>
            <div className="grafico-leyenda">
              <div className="leyenda-item">
                <div className="leyenda-color historico"></div>
                <span>Histórico</span>
              </div>
              <div className="leyenda-item">
                <div className="leyenda-color prediccion"></div>
                <span>Predicción</span>
              </div>
            </div>
          </div>
          
          <div className="grafico-wrapper">
            <GraficoPredicciones datos={datosGrafico} />
          </div>
        </div>
      )}

      {/* Lista de Predicciones */}
      {predicciones.length > 0 && (
        <div className="predicciones-lista-container">
          <div className="lista-header">
            <BarChart3 className="lista-icon" />
            <h2>Predicciones Generadas</h2>
            <span className="lista-count">{predicciones.length} predicciones</span>
          </div>
          
          <div className="predicciones-tabla">
            <div className="tabla-header">
              <div className="tabla-col-fecha">Fecha</div>
              <div className="tabla-col-valor">Valor Predicho</div>
              <div className="tabla-col-confianza">Confianza</div>
              <div className="tabla-col-categoria">Categoría</div>
            </div>
            
            <div className="tabla-body">
              {predicciones.map((pred, index) => (
                <div key={pred.id || index} className="tabla-fila">
                  <div className="tabla-col-fecha">
                    {formatearFecha(pred.fecha_ejecucion || pred.fecha_prediccion, true)}
                  </div>
                  <div className="tabla-col-valor">
                    {formatearMoneda(pred.valor_predicho || 0)}
                  </div>
                  <div className="tabla-col-confianza">
                    <div className="confianza-badge" style={{
                      backgroundColor: `rgba(0, 102, 255, ${pred.confianza || 0})`
                    }}>
                      {((pred.confianza || 0) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="tabla-col-categoria">
                    {pred.categoria?.nombre || 'General'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {predicciones.length === 0 && !generando && modeloActivo && (
        <div className="predicciones-empty">
          <Brain className="empty-icon" />
          <h3>No hay predicciones generadas</h3>
          <p>Genera nuevas predicciones usando el panel de arriba para ver proyecciones de ventas futuras.</p>
        </div>
      )}
    </div>
  );
}

// Funciones auxiliares para el gráfico
function formatearMonedaGrafico(valor) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

function formatearMesGrafico(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-BO', {
    month: 'short',
    year: '2-digit'
  });
}

// Componente de gráfico simple
function GraficoPredicciones({ datos }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="grafico-vacio">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  const valores = datos.map(d => d.valor);
  const maxValor = Math.max(...valores, 1);
  const minValor = Math.min(...valores, 0);

  return (
    <div className="grafico-simple">
      <div className="grafico-barras">
        {datos.map((dato, index) => {
          const altura = ((dato.valor - minValor) / (maxValor - minValor || 1)) * 100;
          const esPrediccion = dato.tipo === 'prediccion';
          
          return (
            <div key={index} className="grafico-bar-wrapper">
              <div 
                className={`grafico-barra ${esPrediccion ? 'prediccion' : 'historico'}`}
                style={{ height: `${Math.max(altura, 5)}%` }}
                title={`${formatearMesGrafico(dato.fecha)}: ${formatearMonedaGrafico(dato.valor)}${esPrediccion ? ` (Confianza: ${((dato.confianza || 0) * 100).toFixed(0)}%)` : ''}`}
              >
                {esPrediccion && (
                  <div className="barra-prediccion-indicator">
                    <Sparkles size={12} />
                  </div>
                )}
              </div>
              <div className="grafico-label">
                {formatearMesGrafico(dato.fecha)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

