// components/MatrizRiesgo.jsx
import React from "react";
import "../styles/MatrizRiesgo.css"; // Asegúrate de tener este archivo CSS para estilos

export default function MatrizRiesgo({ likelihood, impact }) {
  const likelihoodValue = getEnumValue(likelihood);
  const impactValue = getEnumValue(impact);

  // Calculamos posición de la celda
  const positionId = `cell-${impactValue}-${likelihoodValue}`;

  return (
    <div className="matriz-container">
      <div className="matriz-titulo">Matriz de Riesgo</div>
      <div className="matriz">
        {[5, 4, 3, 2, 1].map((i) => (
          <div key={i} className="fila">
            {[1, 2, 3, 4, 5].map((j) => {
              const id = `cell-${i}-${j}`;
              return (
                <div key={id} className={`celda ${id === positionId ? "activo" : ""}`}>
                  {id === positionId && <span className="marcador">⚠️</span>}
                </div>
              );
            })}
          </div>
        ))}
        <div className="eje-x">Probabilidad →</div>
        <div className="eje-y">↑ Impacto</div>
      </div>
    </div>
  );
}

function getEnumValue(nombre) {
  const enums = {
    RARO: 1,
    IMPROBABLE: 2,
    POSIBLE: 3,
    PROBABLE: 4,
    CASI_SEGURO: 5,
    INSIGNIFICANTE: 1,
    MENOR: 2,
    MODERADO: 3,
    MAYOR: 4,
    CATASTROFICO: 5
  };
  return enums[nombre] || 1;
}
