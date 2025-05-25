import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/GestionMitigacionPage.css";

export default function GestionMitigacionPage() {
  const navigate = useNavigate();
  const { riskId } = useParams();

  const [mitigaciones, setMitigaciones] = useState([]);
  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    phase: '',
    response_type: '',
    mitigation_plan: ''
  });

  const tiposRespuesta = ['ACEPTAR', 'MITIGAR', 'TRANSFERIR', 'EVITAR'];
  const fases = ['ANÁLISIS', 'DISEÑO', 'DESARROLLO', 'PRUEBAS', 'IMPLEMENTACIÓN', 'MANTENIMIENTO'];

  useEffect(() => {
    // Verificar que riskId existe antes de hacer las peticiones
    if (!riskId || riskId === 'undefined') {
      setError("ID de riesgo no válido. Redirigiendo...");
      setTimeout(() => navigate("/riesgos"), 2000);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          setError("No se encontró token de autenticación");
          setLoading(false);
          return;
        }

        console.log("Cargando datos para riskId:", riskId); // Debug

        // Obtener detalle del riesgo (incluye software y mitigación)
        const detalleRes = await fetch(`http://localhost:5004/riesgo/detalle/${riskId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!detalleRes.ok) {
          throw new Error(`Error al obtener detalle del riesgo: ${detalleRes.status}`);
        }

        const detalleData = await detalleRes.json();
        setSoftware(detalleData.software);
        
        // Obtener mitigación del riesgo específico
        const mitigacionesRes = await fetch(`http://localhost:5004/riesgo/mitigacion/${riskId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!mitigacionesRes.ok) {
          throw new Error(`Error al cargar mitigaciones: ${mitigacionesRes.status}`);
        }
        
        const mitigacionesData = await mitigacionesRes.json();
        const mitigacionesArray = mitigacionesData.mitigations || [];
        setMitigaciones(Array.isArray(mitigacionesArray) ? mitigacionesArray : [mitigacionesArray]);

      } catch (err) {
        console.error("Error en fetchData:", err);
        setError(err.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [riskId, navigate]);

  const handleEdit = (mitigacion) => {
    setEditingId(mitigacion.id);
    setFormData({
      phase: mitigacion.phase || '',
      response_type: mitigacion.response_type || '',
      mitigation_plan: mitigacion.mitigation_plan || ''
    });
  };

  const handleSave = async (mitigacionId) => {
    if (!formData.phase || !formData.response_type || !formData.mitigation_plan.trim()) {
      alert("Por favor completa todos los campos antes de guardar.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5004/riesgo/actualizar/${mitigacionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("Error al actualizar mitigación");

      setMitigaciones(prev => prev.map(m => 
        m.id === mitigacionId ? { ...m, ...formData } : m
      ));

      setSuccess("Cambios guardados correctamente.");
      setEditingId(null);
      setFormData({ phase: '', response_type: '', mitigation_plan: '' });
    } catch (err) {
      console.error(err);
      setError("Error al guardar cambios");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ phase: '', response_type: '', mitigation_plan: '' });
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

  // Mostrar error si no hay riskId válido
  if (!riskId || riskId === 'undefined') {
    return (
      <div className="gestion-mitigacion-container">
        <div className="error-message">
          ID de riesgo no válido. Redirigiendo a la lista de riesgos...
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Cargando mitigaciones...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="gestion-mitigacion-container">
      <h1>Gestión de Mitigaciones</h1>
      {software && <h2>{software.name} - v{software.version}</h2>}

      {success && <p className="success-message">{success}</p>}

      <div className="mitigaciones-list">
        {mitigaciones.length === 0 ? (
          <p>No hay mitigaciones disponibles para este software.</p>
        ) : (
          mitigaciones.map((m) => (
            <div key={m.id} className="mitigacion-card">
              <div className="mitigacion-header">
                <h3>Riesgo: {m.risk_code}</h3>
                <div className="mitigacion-header-actions">
                  <span className="zona-riesgo-badge" style={{ backgroundColor: getZonaRiesgoColor(m.risk_zone) }}>{m.risk_zone}</span>
                  {editingId !== m.id && <button className="btn-edit" onClick={() => handleEdit(m)}>✏️</button>}
                </div>
              </div>

              <div className="mitigacion-content">
                <p><strong>Descripción del Riesgo:</strong> {m.risk_description}</p>
                <p><strong>Responsable:</strong> {m.responsible}</p>

                {editingId === m.id ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Fase:</label>
                      <select value={formData.phase} onChange={(e) => setFormData({...formData, phase: e.target.value})}>
                        <option value="">Seleccionar fase</option>
                        {fases.map((fase) => (
                          <option key={fase} value={fase}>{fase}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Tipo de Respuesta:</label>
                      <select value={formData.response_type} onChange={(e) => setFormData({...formData, response_type: e.target.value})}>
                        <option value="">Seleccionar tipo</option>
                        {tiposRespuesta.map((tipo) => (
                          <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Plan de Mitigación:</label>
                      <textarea
                        value={formData.mitigation_plan}
                        onChange={(e) => setFormData({...formData, mitigation_plan: e.target.value})}
                        rows={4}
                        placeholder="Describe el plan de mitigación..."
                      />
                    </div>

                    <div className="form-actions">
                      <button onClick={() => handleSave(m.id)} className="btn-save">Guardar</button>
                      <button onClick={handleCancel} className="btn-cancel">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="mitigacion-info">
                    <p><strong>Fase:</strong> {m.phase || 'No definida'}</p>
                    <p><strong>Tipo de Respuesta:</strong> {m.response_type || 'No definido'}</p>
                    <p><strong>Plan de Mitigación:</strong> {m.mitigation_plan || 'No definido'}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="actions">
        <button onClick={() => navigate("/riesgos")} className="btn-back">Volver a Riesgos</button>
      </div>
    </div>
  );
}