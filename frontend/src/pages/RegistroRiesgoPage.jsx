// RegistroRiesgoPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/RegistroRiesgoPage.css";

export default function RegistroRiesgoPage() {
  const navigate = useNavigate();
  const { softwareId } = useParams(); // Obtener el ID del software desde la URL

  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [softwareInfo, setSoftwareInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    software_id: null,
    risk_code: "",
    identified_at: "",
    title: "",
    description: "",
    causes: "",
    affects_critical_infrastructure: false,
    process: "",
    ownership: {
      owner_name: "",
      owner_role: ""
    },
    classification: {
      risk_type: "Logico",
      confidentiality: false,
      integrity: false,
      availability: false
    },
    evaluation: {
      likelihood: "RARO",
      impact: "INSIGNIFICANTE"
    },
    controls: {
      control_type: "PREVENTIVO",
      has_mechanism: false,
      has_manuals: false,
      control_effective: false,
      responsible_defined: false,
      control_frequency_adequate: false
    }
  });

  const LikelihoodOptions = ["RARO", "IMPROBABLE", "POSIBLE", "PROBABLE", "CASI_SEGURO"];
  const ImpactOptions = ["INSIGNIFICANTE", "MENOR", "MODERADO", "MAYOR", "CATASTROFICO"];

  // Cargar información del software al iniciar
  useEffect(() => {
    const fetchSoftwareInfo = async () => {
      if (!softwareId) {
        setError("No se proporcionó ID de software");
        setLoading(false);
        return;
      }

      try {
        // Obtener información del usuario del localStorage o contexto
        const token = localStorage.getItem('token');
        if (!token) {
          setError("No hay token de autenticación");
          setLoading(false);
          return;
        }

        // Decodificar el token para obtener el user_id (simplificado)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.user_id || tokenPayload.id || tokenPayload.sub;

        const response = await fetch(`http://localhost:5000/software/${userId}/${softwareId}`, {
          headers: { 
            "Authorization": `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSoftwareInfo(data.software);
          setFormData(prev => ({
            ...prev,
            software_id: parseInt(softwareId)
          }));
        } else {
          setError("Error al cargar información del software");
        }
      } catch (err) {
        setError("Error de conexión: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSoftwareInfo();
  }, [softwareId]);

  const handleInputChange = (e, path = []) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = { ...prev };
      let ref = updated;
      for (const key of path) ref = ref[key];
      ref[name] = type === "checkbox" ? checked : value;
      return updated;
    });
  };

  const calcularNivelRiesgo = () => {
    const likelihood = LikelihoodOptions.indexOf(formData.evaluation.likelihood) + 1;
    const impact = ImpactOptions.indexOf(formData.evaluation.impact) + 1;
    const valor = likelihood * impact;

    if (valor <= 3) return { zona: "BAJA", aceptacion: "Sí" };
    if (valor <= 6) return { zona: "MODERADA", aceptacion: "Sí" };
    if (valor <= 12) return { zona: "ALTA", aceptacion: "No" };
    return { zona: "EXTREMA", aceptacion: "No" };
  };

  const handleSubmit = async () => {
    const riskInfo = calcularNivelRiesgo();

    try {
      const response = await fetch("http://localhost:5004/riesgo/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ...formData,
          evaluation: {
            ...formData.evaluation,
            ...riskInfo
          }
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error al registrar riesgo");

      setSuccessMsg("Riesgo registrado exitosamente");
      setTimeout(() => navigate("/software"), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2>Información Básica del Riesgo</h2>
            <div className="form-group">
              <label>Código del Riesgo</label>
              <input 
                name="risk_code" 
                placeholder="Código del Riesgo" 
                value={formData.risk_code}
                onChange={handleInputChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Fecha de Identificación</label>
              <input 
                name="identified_at" 
                type="date" 
                value={formData.identified_at}
                onChange={handleInputChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Título del Riesgo</label>
              <input 
                name="title" 
                placeholder="Título del Riesgo" 
                value={formData.title}
                onChange={handleInputChange} 
                required
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                name="description" 
                placeholder="Descripción del riesgo" 
                value={formData.description}
                onChange={handleInputChange} 
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Causas</label>
              <textarea 
                name="causes" 
                placeholder="Causas del riesgo" 
                value={formData.causes}
                onChange={handleInputChange} 
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Proceso</label>
              <input 
                name="process" 
                placeholder="Proceso afectado" 
                value={formData.process}
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="affects_critical_infrastructure" 
                  checked={formData.affects_critical_infrastructure}
                  onChange={handleInputChange} 
                />
                ¿Afecta infraestructura crítica?
              </label>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2>Propiedad y Clasificación</h2>
            <div className="form-group">
              <label>Responsable</label>
              <input 
                name="owner_name" 
                placeholder="Nombre del responsable" 
                value={formData.ownership.owner_name}
                onChange={(e) => handleInputChange(e, ["ownership"])} 
                required
              />
            </div>
            <div className="form-group">
              <label>Rol del Responsable</label>
              <input 
                name="owner_role" 
                placeholder="Rol o cargo" 
                value={formData.ownership.owner_role}
                onChange={(e) => handleInputChange(e, ["ownership"])} 
                required
              />
            </div>
            <div className="form-group">
              <label>Tipo de Riesgo</label>
              <select 
                name="risk_type" 
                value={formData.classification.risk_type}
                onChange={(e) => handleInputChange(e, ["classification"])}
              >
                <option value="Logico">Lógico</option>
                <option value="Fisico">Físico</option>
                <option value="Locativo">Locativo</option>
                <option value="Legal">Legal</option>
                <option value="Reputacional">Reputacional</option>
                <option value="Financiero">Financiero</option>
              </select>
            </div>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="confidentiality" 
                  checked={formData.classification.confidentiality}
                  onChange={(e) => handleInputChange(e, ["classification"])} 
                />
                Confidencialidad
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="integrity" 
                  checked={formData.classification.integrity}
                  onChange={(e) => handleInputChange(e, ["classification"])} 
                />
                Integridad
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="availability" 
                  checked={formData.classification.availability}
                  onChange={(e) => handleInputChange(e, ["classification"])} 
                />
                Disponibilidad
              </label>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2>Evaluación del Riesgo</h2>
            <div className="form-group">
              <label>Probabilidad</label>
              <select 
                name="likelihood" 
                value={formData.evaluation.likelihood}
                onChange={(e) => handleInputChange(e, ["evaluation"])}
              >
                {LikelihoodOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Impacto</label>
              <select 
                name="impact" 
                value={formData.evaluation.impact}
                onChange={(e) => handleInputChange(e, ["evaluation"])}
              >
                {ImpactOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="risk-preview">
              <h3>Vista Previa del Riesgo</h3>
              <p><strong>Nivel calculado:</strong> {calcularNivelRiesgo().zona}</p>
              <p><strong>Aceptable:</strong> {calcularNivelRiesgo().aceptacion}</p>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2>Controles del Riesgo</h2>
            <div className="form-group">
              <label>Tipo de Control</label>
              <select 
                name="control_type" 
                value={formData.controls.control_type}
                onChange={(e) => handleInputChange(e, ["controls"])}
              >
                <option value="PREVENTIVO">PREVENTIVO</option>
                <option value="CORRECTIVO">CORRECTIVO</option>
              </select>
            </div>
            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="has_mechanism" 
                  checked={formData.controls.has_mechanism}
                  onChange={(e) => handleInputChange(e, ["controls"])} 
                />
                ¿Tiene mecanismo de control?
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="has_manuals" 
                  checked={formData.controls.has_manuals}
                  onChange={(e) => handleInputChange(e, ["controls"])} 
                />
                ¿Tiene manuales de procedimiento?
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="control_effective" 
                  checked={formData.controls.control_effective}
                  onChange={(e) => handleInputChange(e, ["controls"])} 
                />
                ¿El control es efectivo?
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="responsible_defined" 
                  checked={formData.controls.responsible_defined}
                  onChange={(e) => handleInputChange(e, ["controls"])} 
                />
                ¿Responsable claramente definido?
              </label>
              <label>
                <input 
                  type="checkbox" 
                  name="control_frequency_adequate" 
                  checked={formData.controls.control_frequency_adequate}
                  onChange={(e) => handleInputChange(e, ["controls"])} 
                />
                ¿Frecuencia de control adecuada?
              </label>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="registro-riesgo-container">
        <div className="loading">Cargando información del software...</div>
      </div>
    );
  }

  return (
    <div className="registro-riesgo-container">
      <div className="header-section">
        <h1>Registro de Riesgo</h1>
        {softwareInfo && (
          <div className="software-info">
            <h3>Software: {softwareInfo.name} (v{softwareInfo.version})</h3>
            <p>Ciudad: {softwareInfo.city}</p>
          </div>
        )}
      </div>

      <div className="step-indicator">
        <div className="steps">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
              {num}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        {renderStep()}
      </div>

      <div className="wizard-nav">
        {step > 1 && (
          <button 
            className="nav-button prev-button" 
            onClick={() => setStep(step - 1)}
          >
            Anterior
          </button>
        )}
        {step < 4 && (
          <button 
            className="nav-button next-button" 
            onClick={() => setStep(step + 1)}
          >
            Siguiente
          </button>
        )}
        {step === 4 && (
          <button 
            className="nav-button submit-button" 
            onClick={handleSubmit}
          >
            Registrar Riesgo
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMsg && <div className="success-message">{successMsg}</div>}
    </div>
  );
}