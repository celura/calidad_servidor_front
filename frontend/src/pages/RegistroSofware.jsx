import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegistroSoftwarePage.css";
import { useAuth } from '../context/authContext';
import { Shield} from "lucide-react";
export default function RegistroSoftwarePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [softwareList, setSoftwareList] = useState([]);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    city: "",
    name: "",
    general_objective: "",
    description: "",
    version: "", 
    participants: [],
  });

  const [newParticipants, setNewParticipants] = useState({ name: "", role: "" });
  const [isEditing, setIsEditing] = useState(false);
  
  // Cargar lista de software al iniciar
  useEffect(() => {
    fetchSoftwareList();
  }, [user]);

  // Función para obtener la lista de software
const fetchSoftwareList = async () => {
  if (!user || !user.id) return;

  try {
    // 1. Trae todos los softwares
    const allResponse = await fetch(`http://localhost:5000/software/${user.id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
    });
    const allData = await allResponse.json();
    const allSoftwares = allData.software || [];

    // 2. Trae solo los evaluados
    const evalResponse = await fetch(`http://localhost:5003/evaluacion/software-evaluados/${user.id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
    });
    const evaluated = await evalResponse.json();

    // 3. Combina los datos
    const combined = allSoftwares.map(software => {
      const match = evaluated.find(e => e.software_id === software.id);
      return {
        ...software,
        evaluation_date: match?.evaluation_date || null,
        evaluation_id: match?.evaluation_id || null,
        global_percentage: match?.global_percentage || null,
        result: match?.result || "No evaluado"
      };
    });

    setSoftwareList(combined);
  } catch (error) {
    console.error("Error al obtener o combinar software:", error);
  }
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParticipanteChange = (e) => {
    setNewParticipants({ ...newParticipants, [e.target.name]: e.target.value });
  };

  const addParticipante = () => {
    if (newParticipants.name && newParticipants.role) {
      if (isEditing && newParticipants.index !== undefined) {
        // Estamos editando un participante existente
        const updatedParticipants = [...formData.participants];
        updatedParticipants[newParticipants.index] = {
          name: newParticipants.name,
          role: newParticipants.role
        };
        
        setFormData({ 
          ...formData, 
          participants: updatedParticipants 
        });
        setIsEditing(false);
      } else {
        // Estamos agregando un nuevo participante
        setFormData({ 
          ...formData, 
          participants: [...formData.participants, {
            name: newParticipants.name,
            role: newParticipants.role
          }] 
        });
      }
      setNewParticipants({ name: "", role: "" }); // Limpiar el formulario
    }
  };
  
  const handleEditParticipante = (index) => {
    const selected = formData.participants[index];
    setNewParticipants({ 
      name: selected.name, 
      role: selected.role, 
      index 
    });
    setIsEditing(true);
  };

  const handleDeleteParticipante = (index) => {
    const updated = formData.participants.filter((_, i) => i !== index);
    setFormData({ ...formData, participants: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        user_id: user.id // Incluir user_id en el payload
      };
      
      const response = await fetch("http://localhost:5000/software/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert("Software registrado exitosamente");
        // Actualizar la lista de software
        fetchSoftwareList();
        // Cerrar el modal y limpiar el formulario
        setShowModal(false);
        setFormData({
          city: "",
          name: "",
          general_objective: "",
          description: "",
          version: "", 
          participants: [],
        });
      } else {
        alert(`Error al registrar software: ${result.message || "Error desconocido"}`);
      }
    } catch (error) {
      alert("Error de conexión con el servidor: " + error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No Evaluado";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para ver detalles de un software específico
  const handleViewDetails = async (softwareId) => {
    if (!user || !user.id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/software/${user.id}/${softwareId}`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Aquí puedes implementar lo que necesites con los detalles
        console.log("Detalles del software:", data.software);
        alert(`Detalles del Software: ${data.software.name}`);
        // Por ejemplo, podrías abrir un modal con los detalles
      } else {
        console.error("Error al obtener detalles del software");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
  };

  // Función para navegar a la página de evaluación
  const handleEvaluateSoftware = (softwareId) => {
    setSelectedSoftwareId(softwareId);
    setShowEvaluationModal(true);
  };

  return (
    <div className="registro-container">
      <h1 className="title">Registro de Software</h1>
      <button className="add-button" onClick={() => setShowModal(true)}>Registrar Software</button>

      <table className="software-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre del Software</th>
            <th>Versión</th>
            <th>Ciudad</th>
            <th>Fecha de registro</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {softwareList.length === 0 ? (
            <tr>
              <td colSpan="6" className="no-data">No hay software registrado</td>
            </tr>
          ) : (
            softwareList.map((software) => (
              <tr key={software.id}>
                <td>{software.id}</td>
                <td>{software.name}</td>
                <td>{software.version}</td>
                <td>{software.city}</td>
                <td>{software.registered_at || "No evaluado"}</td>
                <td>
                  <button 
                    className="icon-button evaluate"
                    onClick={() => handleEvaluateSoftware(software.id)}
                  >
                     <Shield size={16} />
                    Evaluar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Registrar Nuevo Software</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group-so">
                <label>Ciudad</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>

              <div className="form-group-so">
                <label>Nombre del Software</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group-so">
                <label>Versión del Software</label>
                <input type="text" name="version" value={formData.version} onChange={handleChange} required />
              </div>

              <div className="form-group-so">
                <label>Objetivo General</label>
                <textarea name="general_objective" value={formData.general_objective} onChange={handleChange} required />
              </div>
              
              <div className="form-group-so">
                <label>Descripción</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
              </div>
              
              <div className="form-group-so">
                <label>Participantes</label>
                {formData.participants.length === 0 ? (
                  <p className="no-participants">No hay participantes agregados</p>
                ) : (
                  formData.participants.map((p, idx) => (
                    <div key={idx} className="participante-item">
                      <p>{p.name} - {p.role}</p>
                      <button type="button" className="edit-button" onClick={() => handleEditParticipante(idx)}>Editar</button>
                      <button type="button" className="delete-button" onClick={() => handleDeleteParticipante(idx)}>Eliminar</button>
                    </div>
                  ))
                )}
                <div className="participante-form">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={newParticipants.name}
                    onChange={handleParticipanteChange}
                  />
                  <input
                    type="text"
                    name="role"
                    placeholder="Cargo"
                    value={newParticipants.role}
                    onChange={handleParticipanteChange}
                  />
                  <button type="button" className="add-sub-button" onClick={addParticipante}>
                    {isEditing ? "Actualizar Participante" : "Agregar Participante"}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="add-item-button">Registrar Software</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEvaluationModal && (
        <div className="modal-overlay-pre">
          <div className="modal-pre">
            <h2 className="modal-title-pre">¿Qué desea evaluar?</h2>
            <p>Seleccione una opción:</p>
            <div className="modal-actions-pre">
              <button 
                className="add-item-button-pre"
                onClick={() => {
                  setShowEvaluationModal(false);
                  navigate(`/riesgos/registrar/${selectedSoftwareId}`);
                }}
              >
                Matriz de Riesgos
              </button>
              <button 
                className="add-item-button-pre"
                onClick={() => {
                  setShowEvaluationModal(false);
                  navigate(`/software/evaluar/${selectedSoftwareId}`);
                }}
              >
                Evaluación de Calidad
              </button>
              <button 
                className="cancel-button-pre"
                onClick={() => setShowEvaluationModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}