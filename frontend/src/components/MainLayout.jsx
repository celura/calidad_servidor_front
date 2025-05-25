import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const location = useLocation();
  
  // No mostrar navbar ni footer en login y registro
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro';
  
  return (
    <div className="page-container">
      {!isAuthPage && (
        <>
          {/* Fondo con overlay para páginas que no son de autenticación */}
          <div className="background"></div>
          
          {/* Contenido principal */}
          <div className="content">
            <Navbar />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </>
      )}
      
      {isAuthPage && (
        <>
          {children}
        </>
      )}
    </div>
  );
}
