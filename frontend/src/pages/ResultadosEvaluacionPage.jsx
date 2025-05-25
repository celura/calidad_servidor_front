import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ResultadosEvaluacionPage.css';

export default function ResultadosEvaluacionPage() {
  const { softwareId, evaluationId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [software, setSoftware] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Decodificar el token para obtener el user_id
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenPayload.sub; // o tokenPayload.user_id, dependiendo de cómo esté estructurado tu JWT

        // 1. Obtener el software por ID usando el endpoint correcto
        const softwareRes = await fetch(`http://localhost:5000/software/${userId}/${softwareId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!softwareRes.ok) throw new Error("Error al obtener software");
        const softwareResponse = await softwareRes.json();
        setSoftware(softwareResponse.software); // Nota: la respuesta viene en { software: {...} }

        // 2. Obtener resultados de evaluación
        const resultsResponse = await fetch(`http://localhost:5003/evaluacion/resultados/${softwareId}/${evaluationId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!resultsResponse.ok) {
          throw new Error('Error al cargar resultados de la evaluación');
        }
        const resultsData = await resultsResponse.json();
        setResults(resultsData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading results:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [softwareId, evaluationId]);

  const getResultColor = (percentage) => {
    const numericPercentage = parseFloat(percentage);
    if (numericPercentage <= 30) return '#d32f2f'; // Deficiente - Rojo
    if (numericPercentage <= 50) return '#f57c00'; // Insuficiente - Naranja
    if (numericPercentage <= 70) return '#ffca28'; // Aceptable - Amarillo
    if (numericPercentage <= 81) return '#7cb342'; // Sobresaliente - Verde claro
    return '#388e3c'; // Excelente - Verde oscuro
  };

  const getResultLabel = (percentage) => {
    const numericPercentage = parseFloat(percentage);
    if (numericPercentage <= 30) return "Deficiente";
    if (numericPercentage <= 50) return "Insuficiente";
    if (numericPercentage <= 70) return "Aceptable";
    if (numericPercentage <= 81) return "Sobresaliente";
    return "Excelente";
  };

  if (isLoading) return <div className="loading">Cargando resultados de la evaluación...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!results || !software) return <div className="error-message">No se encontraron resultados para esta evaluación</div>;

  // Calculate global score
  const globalScore = results.summaries.reduce(
    (total, summary) => total + parseFloat(summary.weighted_percentage), 
    0
  ).toFixed(2);

  return (
    <div className="resultados-container">
      <div className="resultados-header">
        <h1>Resultados de Evaluación</h1>
        <h2>{software.name} - v{software.version}</h2>
      </div>
      
      <div className="global-score">
        <div className="score-circle" style={{ backgroundColor: getResultColor(globalScore) }}>
          <span className="score-value">{globalScore}%</span>
        </div>
        <div className="score-info">
          <h3>Calificación Global</h3>
          <p className="score-label">{getResultLabel(globalScore)}</p>
        </div>
      </div>
      
      <div className="characteristics-results">
        <h3>Desglose por Características</h3>
        
        <div className="results-grid">
          <div className="results-header-row">
            <div className="header-cell">Característica</div>
            <div className="header-cell">Puntaje</div>
            <div className="header-cell">Máximo</div>
            <div className="header-cell">Resultado</div>
            <div className="header-cell">Peso</div>
            <div className="header-cell">Ponderado</div>
          </div>
          
          {results.summaries.map((summary, index) => {
            const resultPercentage = summary.result_percentage.replace('%', '');
            
            return (
              <div key={index} className="result-row">
                <div className="result-cell">{summary.characteristic_name}</div>
                <div className="result-cell">{summary.value}</div>
                <div className="result-cell">{summary.max_value}</div>
                <div className="result-cell">
                  <div className="percentage-bar-container">
                    <div 
                      className="percentage-bar" 
                      style={{ 
                        width: `${resultPercentage}%`, 
                        backgroundColor: getResultColor(resultPercentage) 
                      }}
                    ></div>
                    <span>{summary.result_percentage}</span>
                  </div>
                </div>
                <div className="result-cell">{summary.max_possible_percentage}%</div>
                <div className="result-cell">{summary.weighted_percentage}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="results-actions">
        <button className="action-button print-button" onClick={() => window.print()}>
          Imprimir Resultados
        </button>
        <button className="action-button" onClick={() => window.location.href = '/dashboard'}>
          Volver al Tablero
        </button>
      </div>
    </div>
  );
}