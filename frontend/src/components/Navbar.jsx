import { useState, useEffect, useContext, useRef } from 'react';
import { User, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../context/authContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();
  // Cerrar el menú cuando el ancho de la ventana cambia a más de 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Cerrar el menú de usuario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  // Función para manejar el logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Verificar si un enlace está activo
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          
          <div className="nav-links desktop-menu">
            <Link to="/home" className={`nav-link ${isActive('/home')}`}>Home</Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/sobrenosotros" className={`nav-link ${isActive('/sobrenosotros')}`}>Sobre Nosotros</Link>
            <Link to="/contactenos" className={`nav-link ${isActive('/contactenos')}`}>Contáctenos</Link>
            <Link to="/software" className={`nav-link ${isActive('/software')}`}>Evaluación</Link>
            <Link to="/resultados" className={`nav-link ${isActive('/resultados')}`}>Resultados</Link>
            <Link to="/riesgos" className={`nav-link ${isActive('/riesgos')}`}>Plan Mitigacion</Link>
          </div>
          
          <div className="auth-buttons">
            <div className="user-menu-container" ref={userMenuRef}>
              <button className="icon-button" onClick={toggleUserMenu}>
                <User size={20} />
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                    <div className="user-info">
                      <span className="user-name">{user?.username}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/perfil" className="dropdown-item">Mi Perfil</Link>
                  <Link to="/configuracion" className="dropdown-item">Configuración</Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
            
            <button className="mobile-menu-button" onClick={toggleMenu}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="mobile-nav-links">
          <Link to="/home" className={`mobile-menu-link ${isActive('/home')}`}>Home</Link>
          <Link to="/dashboard" className={`mobile-menu-link ${isActive('/dashboard')}`}>Dashboard</Link>
          <a href="#sobrenosotros" className="mobile-menu-link">Sobre Nosotros</a>
          <a href="#contactenos" className="mobile-menu-link">Contáctenos</a>
          <a href="#evaluacion" className="mobile-menu-link">Evaluación</a>
          <a href="#resultados" className="mobile-menu-link">Resultados</a>
          <button className="mobile-menu-link logout-mobile" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}