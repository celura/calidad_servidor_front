import { Github, Twitter, Mail, Linkedin } from 'lucide-react';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">© 2025 Software Quality Evaluator. Todos los derechos reservados.</p>
        
        <div className="footer-links">
          <a href="#" className="footer-link">Términos y Condiciones</a>
          <a href="#" className="footer-link">Política de Privacidad</a>
          <a href="#" className="footer-link">Sobre Nosotros</a>
          <a href="#" className="footer-link">Contacto</a>
        </div>
        
        <div className="footer-social">
          <a href="#" className="social-link">
            <Github size={24} />
          </a>
          <a href="#" className="social-link">
            <Twitter size={24} />
          </a>
          <a href="#" className="social-link">
            <Mail size={24} />
          </a>
          <a href="#" className="social-link">
            <Linkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}