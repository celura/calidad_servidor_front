import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegistroPage';
import DashboardPage from './pages/DashboardPage';
import RegistroSoftwarePage from './pages/RegistroSofware';
import EvaluacionSoftwarePage from './pages/EvaluacionSoftwarePage';
import ResultadosEvaluacionPage from './pages/ResultadosEvaluacionPage';
import TablaREvaluacionPage from './pages/TablaResultaod';
import RegistroRiesgoPage from './pages/RegistroRiesgoPage';
import DetalleRiesgoPage from './pages/DetalleRiesgoPage';
import TablaRiesgosPage from './pages/TablaRiesgoPage';
import GestionMitigacionPage from './pages/GestionMitigacionPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* General */}
          <Route path="/home" element={
            <ProtectedRoute>
              <MainLayout><HomePage /></MainLayout>
            </ProtectedRoute>
          }/>
          <Route path="/dashboard" element={<ProtectedRoute><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
          <Route path="/software" element={<ProtectedRoute><MainLayout><RegistroSoftwarePage /></MainLayout></ProtectedRoute>} />
          <Route path="/software/evaluar/:softwareId" element={<ProtectedRoute><MainLayout><EvaluacionSoftwarePage /></MainLayout></ProtectedRoute>} />

          {/* Evaluación de calidad */}
          <Route path="/resultados" element={<ProtectedRoute><MainLayout><TablaREvaluacionPage /></MainLayout></ProtectedRoute>} />
          <Route path="/resultados/:softwareId/:evaluationId" element={<ProtectedRoute><MainLayout><ResultadosEvaluacionPage /></MainLayout></ProtectedRoute>} />

          {/* Evaluación de riesgos */}
          <Route path="/riesgos" element={<ProtectedRoute><MainLayout><TablaRiesgosPage /></MainLayout></ProtectedRoute>} />
          <Route path="/riesgos/registrar/:softwareId" element={<ProtectedRoute><MainLayout><RegistroRiesgoPage /></MainLayout></ProtectedRoute>} />
          <Route path="/riesgos/detalle/:softwareId/:riskId" element={<ProtectedRoute><MainLayout><DetalleRiesgoPage /></MainLayout></ProtectedRoute>} />
          <Route path="/riesgos/mitigacion/:riskId" element={<ProtectedRoute><MainLayout><GestionMitigacionPage /></MainLayout></ProtectedRoute>} />


          {/* Redirección y 404 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
            <ProtectedRoute>
              <MainLayout>
                <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <h1>404</h1>
                  <p>Página no encontrada</p>
                </div>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
