import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/DetallesRiesgoPage.css";
import MatrizRiesgo from "../components/MatrizRiesgo";

export default function DetalleRiesgoPage() {
  const { softwareId, riskId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");

        // Cargar software
        const softwareRes = await fetch(`http://localhost:5000/software/${softwareId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!softwareRes.ok) throw new Error("Error al obtener software");

        const softwareData = await softwareRes.json();
        setSoftware(softwareData.software);

        // Cargar detalle del riesgo
        const response = await fetch(`http://localhost:5004/riesgo/detalle/${riskId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Error al cargar resultados");

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar resultados");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [softwareId, riskId]);

  if (loading) return <div className="loading">Cargando resultados de riesgo...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data || !software) return <div className="error-message">No hay datos disponibles</div>;

  return (
    
    <div className="riesgo-detalle-container">
    <h1>Resultado Evaluación de Riesgo</h1>
    <h2>{software.name} - v{software.version}</h2>

    {/* Mostrar la matriz visual del riesgo */}
    <MatrizRiesgo 
      likelihood={data.evaluation.likelihood} 
      impact={data.evaluation.impact} 
    />

      <div className="riesgo-resumen">
        <h3>{data.risk?.title}</h3>
        <p><strong>Código:</strong> {data.risk?.risk_code}</p>
        <p><strong>Fecha Identificación:</strong> {data.risk?.identified_at}</p>
        <p><strong>Zona de Riesgo:</strong> {data.evaluation.risk_zone}</p>
        <p><strong>¿Aceptado?:</strong> {data.evaluation.acceptance}</p>
        <p><strong>Descripción:</strong> {data.risk?.description}</p>
        <p><strong>Causas:</strong> {data.risk?.causes}</p>
        <p><strong>Proceso:</strong> {data.risk?.process}</p>
        <p><strong>Infraestructura Crítica:</strong> {data.risk?.affects_critical_infrastructure ? "Sí" : "No"}</p>
      </div>

      <div className="riesgo-clasificacion">
        <h3>Clasificación</h3>
        <p><strong>Tipo:</strong> {data.classification.risk_type}</p>
        <p><strong>Impacto:</strong> {data.classification.impact_type}</p>
        <p><strong>Confidencialidad:</strong> {data.classification.confidentiality ? "✔" : "✘"}</p>
        <p><strong>Integridad:</strong> {data.classification.integrity ? "✔" : "✘"}</p>
        <p><strong>Disponibilidad:</strong> {data.classification.availability ? "✔" : "✘"}</p>
      </div>

      <div className="riesgo-evaluacion">
        <h3>Evaluación</h3>
        <p><strong>Probabilidad:</strong> {data.evaluation.likelihood}</p>
        <p><strong>Impacto:</strong> {data.evaluation.impact}</p>
        <p><strong>Zona:</strong> {data.evaluation.risk_zone}</p>
        <p><strong>Aceptación:</strong> {data.evaluation.acceptance}</p>
      </div>

      <div className="riesgo-controles">
        <h3>Controles</h3>
        <p><strong>Tipo:</strong> {data.controls.control_type}</p>
        <p><strong>Mecanismo:</strong> {data.controls.has_mechanism ? "✔" : "✘"}</p>
        <p><strong>Manuales:</strong> {data.controls.has_manuals ? "✔" : "✘"}</p>
        <p><strong>Efectivo:</strong> {data.controls.control_effective ? "✔" : "✘"}</p>
        <p><strong>Responsable Definido:</strong> {data.controls.responsible_defined ? "✔" : "✘"}</p>
        <p><strong>Frecuencia Adecuada:</strong> {data.controls.control_frequency_adequate ? "✔" : "✘"}</p>
        <p><strong>Valor del Riesgo:</strong> {data.evaluation.valor_riesgo}</p>
        <p><strong>Puntaje Total:</strong> {data.controls.control_rating}</p>
        <p><strong>Cuadrante Probabilidad:</strong> {data.controls.reduce_likelihood_quadrants}</p>
        <p><strong>Cuadrante Impacto:</strong> {data.controls.reduce_impact_quadrants}</p>
      </div>

      <div className="resultados-actions">
        <button onClick={() => navigate("/resultados")} className="action-button">Volver a resultados</button>
        <button onClick={() => window.print()} className="action-button print-button">Imprimir</button>
      </div>
    </div>
  );
}
