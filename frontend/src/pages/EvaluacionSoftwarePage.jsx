import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/EvaluacionSoftwarePage.css';
import { useAuth } from '../context/authContext';

export default function EvaluacionSoftwarePage() {
  const { softwareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [software, setSoftware] = useState(null);
  const [characteristics, setCharacteristics] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [evaluationData, setEvaluationData] = useState({});
  const [error, setError] = useState(null);

  const valorOptions = [
    { value: 0, label: "No cumple (0)" },
    { value: 1, label: "Cumple parcialmente (1)" },
    { value: 2, label: "Cumple mayormente (2)" },
    { value: 3, label: "Cumple totalmente (3)" }
  ];

  useEffect(() => {
    const fetchSoftwareDetails = async () => {
      try {
        const softwareResponse = await fetch(`http://localhost:5000/software/${user.id}/${softwareId}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
        });

        if (!softwareResponse.ok) throw new Error('Error al cargar detalles del software');
        const softwareData = await softwareResponse.json();
        setSoftware(softwareData.software);

        const characteristicsResponse = await fetch(`http://localhost:5002/modelo/caracteristicas-con-subcaracteristicas`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
        });

        if (!characteristicsResponse.ok) throw new Error('Error al cargar características');
        const characteristicsData = await characteristicsResponse.json();
        setCharacteristics(characteristicsData);

        const initialEvaluationData = {
          software_id: parseInt(softwareId),
          details: []
        };

        for (const char of characteristicsData) {
          for (const sub of char.subcharacteristics) {
            initialEvaluationData.details.push({
              characteristic_id: char.id,
              characteristic_percentage: char.weight_percentage,
              subcharacteristic_id: sub.id,
              score: 0,
              comment: ''
            });
          }
        }

        setEvaluationData(initialEvaluationData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (user && user.id) fetchSoftwareDetails();
  }, [softwareId, user]);

  const handleTabChange = (index) => setActiveTab(index);

  const handleScoreChange = (detailIndex, value) => {
    setEvaluationData(prev => {
      const newDetails = [...prev.details];
      newDetails[detailIndex].score = parseInt(value);
      return { ...prev, details: newDetails };
    });
  };

  const handleCommentChange = (detailIndex, comment) => {
    setEvaluationData(prev => {
      const newDetails = [...prev.details];
      newDetails[detailIndex].comment = comment;
      return { ...prev, details: newDetails };
    });
  };

  const submitEvaluation = async () => {
    try {
      // Aquí está la corrección: URL /evaluar en lugar de /resultado/{software_id}/{evaluation_id}
      const response = await fetch('http://localhost:5003/evaluacion/evaluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(evaluationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar la evaluación');
      }

      const result = await response.json();
      navigate(`/resultados/${softwareId}/${result.evaluation_id}`);
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      setError(err.message);
    }
  };

  const getDetailsForCharacteristic = (characteristicId) => (
    evaluationData.details?.filter(detail => detail.characteristic_id === characteristicId) || []
  );

  const getSubcharacteristicName = (subcharacteristicId) => {
    for (const char of characteristics) {
      const sub = char.subcharacteristics?.find(s => s.id === subcharacteristicId);
      if (sub) return sub.name;
    }
    return 'Subcaracterística';
  };

  if (isLoading) return <div className="loading">Cargando datos de evaluación...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!software || characteristics.length === 0) return <div className="error-message">No se encontró información para este software</div>;

  return (
    <div className="evaluacion-container">
      <h1>Evaluación de Software: {software.name}</h1>

      <div className="tabs-container">
        {characteristics.map((char, index) => (
          <button 
            key={char.id}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
            onClick={() => handleTabChange(index)}
          >
            {char.name}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {characteristics.map((char, charIndex) => (
          <div 
            key={char.id} 
            className={`characteristic-panel ${activeTab === charIndex ? 'active' : 'hidden'}`}
          >
            <h2>{char.name}</h2>
            <p className="characteristic-description">{char.description}</p>

            <div className="subcharacteristics-list">
              {getDetailsForCharacteristic(char.id).map((detail, detailIndex) => {
                const globalDetailIndex = evaluationData.details.findIndex(d => 
                  d.characteristic_id === detail.characteristic_id && 
                  d.subcharacteristic_id === detail.subcharacteristic_id
                );

                return (
                  <div key={`${detail.characteristic_id}-${detail.subcharacteristic_id}`} className="subcharacteristic-item">
                    <div className="subcharacteristic-row">
                      <div className="subcharacteristic-field">
                        <input 
                          type="text" 
                          value={getSubcharacteristicName(detail.subcharacteristic_id)} 
                          readOnly 
                          className="subchar-name"
                        />
                      </div>
                      <div className="subcharacteristic-field">
                        <input 
                          type="text" 
                          placeholder="Descripción" 
                          value={
                            characteristics
                              .find(c => c.id === detail.characteristic_id)
                              ?.subcharacteristics
                              ?.find(s => s.id === detail.subcharacteristic_id)
                              ?.description || ''
                          } 
                          readOnly 
                          className="subchar-description"
                        />
                      </div>
                      <div className="subcharacteristic-field">
                        <select 
                          value={detail.score} 
                          onChange={(e) => handleScoreChange(globalDetailIndex, e.target.value)}
                          className="subchar-value"
                        >
                          {valorOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="subcharacteristic-field">
                        <input 
                          type="text" 
                          placeholder="Observaciones" 
                          value={detail.comment} 
                          onChange={(e) => handleCommentChange(globalDetailIndex, e.target.value)}
                          className="subchar-comment"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="navigation-buttons">
              {charIndex > 0 && (
                <button 
                  className="nav-button prev-button"
                  onClick={() => handleTabChange(charIndex - 1)}
                >
                  Anterior
                </button>
              )}

              {charIndex < characteristics.length - 1 ? (
                <button 
                  className="nav-button next-button"
                  onClick={() => handleTabChange(charIndex + 1)}
                >
                  Siguiente
                </button>
              ) : (
                <button 
                  className="finish-button"
                  onClick={submitEvaluation}
                >
                  Finalizar Evaluación
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}