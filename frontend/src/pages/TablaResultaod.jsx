import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ResultadosTabla.css';
import { Eye } from "lucide-react";
export default function ResultadosTabla() {
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
        
        const url = `http://localhost:5003/evaluacion/software-evaluados/${userId}`;
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
          fechaEvaluacion: item.evaluation_date,
          porcentajeGlobal: item.global_percentage,
          resultado: item.result,
          evaluationId: item.evaluation_id
        }));

        setDatos(formateado);
        setError(null);
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError(`No se pudieron cargar los resultados de calidad: ${err.message}`);
        setDatos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResultados();
  }, [userId]);

  const handleVerDetalle = (item) => {
    navigate(`/resultados/${item.codigo}/${item.evaluationId}`);
  };

  const getResultadoColor = (resultado) => {
    switch (resultado) {
      case 'Excelente': return '#4caf50';
      case 'Sobresaliente': return '#8bc34a';
      case 'Aceptable': return '#ffeb3b';
      case 'Insuficiente': return '#ff9800';
      case 'Deficiente': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="container">
      <h1 className="titulo">Resultados de Evaluación de Calidad</h1>

      {loading ? (
        <p>Cargando evaluaciones de calidad...</p>
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
                <th>Fecha de Evaluación</th>
                <th>Porcentaje Global</th>
                <th>Resultado</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, index) => (
                <tr key={`${item.codigo}-${item.evaluationId}-${index}`}>
                  <td>{item.codigo}</td>
                  <td>{item.nombreSoftware}</td>
                  <td>{item.fechaEvaluacion}</td>
                  <td>{item.porcentajeGlobal}</td>
                  <td>
                    <span 
                      className="resultado-badge"
                      style={{ 
                        backgroundColor: getResultadoColor(item.resultado),
                        color: item.resultado === 'Aceptable' ? '#333' : 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {item.resultado}
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
                  </td>
                </tr>
              ))}
              {datos.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-datos">
                    No hay evaluaciones de calidad disponibles
                  </td>
                </tr>
              )}
              {datos.length > 0 && Array(Math.max(0, 8 - datos.length)).fill().map((_, index) => (
                <tr key={`empty-${index}`} className="fila-vacia">
                  <td colSpan="6"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}