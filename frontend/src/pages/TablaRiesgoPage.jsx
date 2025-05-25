import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResultadosTabla.css';
import { Eye, Settings  } from "lucide-react";

export default function TablaRiesgosPage() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener userId del localStorage o del token
  const getUserId = () => {
    const userId = localStorage.getItem('userId');
    if (userId) return userId;
    
    // Si no hay userId, intentar obtenerlo del token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.user_id || tokenPayload.id || tokenPayload.sub || '1';
      } catch (e) {
        console.error('Error al decodificar token:', e);
        return '1';
      }
    }
    return '1';
  };

  const userId = getUserId();

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = `http://localhost:5004/riesgo/evaluaciones/${userId}`;
        console.log(`Fetching from: ${url}`); // Para debugging

        const response = await fetch(url, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data); // Para debugging

        const formateado = data.map(item => ({
          codigo: item.software_id,
          nombreSoftware: item.software_name,
          codigoRiesgo: item.risk_code,
          fechaEvaluacion: item.evaluation_date,
          valorRiesgo: item.valor_riesgo || 'N/A',
          zonaRiesgo: item.zona_riesgo,
          aceptacion: item.acceptance,
          riskId: item.risk_id
        }));

        setDatos(formateado);
        setError(null);
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError(`No se pudieron cargar los resultados de riesgo: ${err.message}`);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultados();
  }, [userId]);

  const handleVerDetalle = (item) => {
    navigate(`/riesgos/detalle/${item.codigo}/${item.riskId}`);
  };

  const handleGestionarMitigacion = (item) => {
    // Navegar a la página de gestión de mitigación
    navigate(`/riesgos/mitigacion/${item.riskId}`);
  };

  const getZonaRiesgoColor = (zona) => {
    switch (zona?.toUpperCase()) {
      case 'BAJA': return '#4caf50';
      case 'MODERADA': return '#ff9800';
      case 'ALTA': return '#f44336';
      case 'EXTREMA': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getAceptacionColor = (aceptacion) => {
    return aceptacion === 'Si' ? '#4caf50' : '#f44336';
  };

  return (
    <div className="container">
      <h1 className="titulo">Evaluaciones de Riesgo</h1>

      {loading ? (
        <p>Cargando evaluaciones de riesgo...</p>
      ) : error ? (
        <div className="error-mensaje">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      ) : (
        <div className="tabla-container">
          <table className="tabla-resultados">
            <thead>
              <tr>
                <th>ID SOFTWARE</th>
                <th>Nombre del Software</th>
                <th>Código de Riesgo</th>
                <th>Fecha de Evaluación</th>
                <th>Valor de Riesgo</th>
                <th>Zona de Riesgo</th>
                <th>Aceptación</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, index) => (
                <tr key={`${item.codigo}-${item.riskId}-${index}`}>
                  <td>{item.codigo}</td>
                  <td>{item.nombreSoftware}</td>
                  <td>{item.codigoRiesgo}</td>
                  <td>{item.fechaEvaluacion}</td>
                  <td>{item.valorRiesgo}</td>
                  <td>
                    <span 
                      className="zona-riesgo-badge"
                      style={{ 
                        backgroundColor: getZonaRiesgoColor(item.zonaRiesgo),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {item.zonaRiesgo}
                    </span>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        color: getAceptacionColor(item.aceptacion),
                        fontWeight: 'bold'
                      }}
                    >
                      {item.aceptacion}
                    </span>
                  </td>
                  <td className="acciones">
                    <button
                      onClick={() => handleVerDetalle(item)}
                      className="boton-accion boton-detalle"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => handleGestionarMitigacion(item)}
                      className="boton-accion boton-mitigacion"
                      title="Gestionar mitigación"
                    >
                      <Settings size={16} />
                      Gestionar Mitigación
                    </button>
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-datos">
                    No hay evaluaciones de riesgo disponibles
                  </td>
                </tr>
              )}
              {datos.length > 0 && Array(Math.max(0, 8 - datos.length)).fill().map((_, index) => (
                <tr key={`empty-${index}`} className="fila-vacia">
                  <td colSpan="8"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}