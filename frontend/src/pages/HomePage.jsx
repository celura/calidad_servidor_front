import '../styles/HomePage.css';

export default function HomePage() {
  return (
    <>
      <div className="hero">
        <h1 className="hero-title">Calidad de Software</h1>
        <p className="hero-text">Evalúa tu software siguiendo los principales estándares internacionales de calidad</p>
        <p className="hero-text">Genera la matriz de riesgos</p>
      </div>

      {/* Secciones inferiores */}
      <div className="cards-container">
        <div className="card-R">
          <h2 className="card-title">Evaluación de calidad</h2>
          <p className="card-text">
            Suspendisse Potenti. In Eget Augue Egestas, Gravida Libero Eu.
          </p>
        </div>

        <div className="card card-alt">
          <h2 className="card-title">Matriz de Riesgos</h2>
          <p className="card-text">
            Sed A Rutrum Tortor. Morbi Id Tempor Lacus. Tempor Sed A Rutrum.
          </p>
        </div>
      </div>
    </>
  );
}