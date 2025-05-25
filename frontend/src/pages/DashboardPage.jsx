import { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../context/authContext';
import '../styles/DashboardPage.css';
export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [expandedSubIndices, setExpandedSubIndices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight_percentage: '',
    subcharacteristics: []
  });

  const [newSubcaracteristica, setNewSubcaracteristica] = useState({
    name: '',
    description: ''
  });

  const loadCharacteristics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5002/modelo/caracteristica");
      const data = await res.json();
      const enriched = await Promise.all(
        data.map(async (char) => {
          const subRes = await fetch(`http://localhost:5002/modelo/caracteristica/${char.id}`);
          const subData = await subRes.json();
          return { ...char, subcharacteristics: subData.subcharacteristics || [] };
        })
      );
      setItems(enriched);
    } catch (error) {
      console.error("Error cargando características:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacteristics();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubcaracteristicaChange = e => {
    setNewSubcaracteristica({ ...newSubcaracteristica, [e.target.name]: e.target.value });
  };

  const addSubcaracteristica = () => {
    if (newSubcaracteristica.name && newSubcaracteristica.description) {
      setFormData({
        ...formData,
        subcharacteristics: [...formData.subcharacteristics, { ...newSubcaracteristica }]
      });
      setNewSubcaracteristica({ name: '', description: '' });
    }
  };

  const removeSubcaracteristica = (index) => {
    const updated = [...formData.subcharacteristics];
    updated.splice(index, 1);
    setFormData({ ...formData, subcharacteristics: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.subcharacteristics.length === 0) {
      alert("Debes agregar al menos una subcaracterística.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5002/modelo/caracteristica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          weight_percentage: parseFloat(formData.weight_percentage),
          subcharacteristics: formData.subcharacteristics
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Item creado correctamente");
        resetForm();
        loadCharacteristics();
      } else {
        alert(data.error || "Error al crear item");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta característica?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/modelo/caracteristica/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Item eliminado correctamente");
        loadCharacteristics();
      } else {
        alert("Error al eliminar el item");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (item) => {
    setEditMode(true);
    setEditItem(item);
    try {
      const res = await fetch(`http://localhost:5002/modelo/caracteristica/${item.id}`);
      const data = await res.json();
      setFormData({
        name: data.name,
        description: data.description,
        weight_percentage: data.weight_percentage,
        subcharacteristics: data.subcharacteristics || []
      });
      setShowModal(true);
    } catch (err) {
      alert("Error al cargar datos del item");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/modelo/caracteristica/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          weight_percentage: parseFloat(formData.weight_percentage),
          subcharacteristics: formData.subcharacteristics
        })
      });
      if (res.ok) {
        alert("Item actualizado correctamente");
        resetForm();
        loadCharacteristics();
      } else {
        const errData = await res.json();
        alert(errData.message || "Error al actualizar");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditMode(false);
    setEditItem(null);
    setFormData({
      name: '',
      description: '',
      weight_percentage: '',
      subcharacteristics: []
    });
  };

  return (
    <div className="dashboard-container">
      <h1 className="title">ISO/IEC 25010</h1>
      <button className="add-button" onClick={() => setShowModal(true)}>Agregar nuevo ítem</button>
      {isLoading ? (
        <div className="loading">Cargando...</div>
      ) : (
        <table className="item-table">
          <thead>
            <tr>
              <th>ITEM</th>
              <th>DESCRIPCIÓN</th>
              <th>SUBCARACTERÍSTICAS</th>
              <th>PESO (%)</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5">No hay ítems registrados.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.subcharacteristics.length}</td>
                  <td>{item.weight_percentage}%</td>
                  <td>
                    <button className='btn' onClick={() => handleEdit(item)}><Pencil size={15} /></button>
                    <button className="btn" onClick={() => handleDelete(item.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">{editMode ? 'Editar Ítem' : 'Nuevo Ítem'}</h2>
            <form onSubmit={editMode ? handleUpdate : handleSubmit}>
              <div className="form-group-da">
                <label>Nombre del ítem</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-da">
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-da">
                <label>Peso (%)</label>
                <input
                  type="number"
                  name="weight_percentage"
                  value={formData.weight_percentage}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div className="form-group-da">
                <label>Subcaracterísticas ({formData.subcharacteristics.length})</label>
                {formData.subcharacteristics.map((sub, idx) => (
                  <div key={idx} className="subcaracteristica-item">
                    <div className="subcaracteristica-header" onClick={() => setExpandedSubIndices(expandedSubIndices.includes(idx) ? expandedSubIndices.filter(i => i !== idx) : [...expandedSubIndices, idx])}>
                      <span className="subcaracteristica-name">{sub.name}</span>
                      <span className="toggle-icon">{expandedSubIndices.includes(idx) ? '▼' : '►'}</span>
                    </div>
                    {expandedSubIndices.includes(idx) && (
                      <div className="subcaracteristica-details">
                        <div className="form-group-da">
                          <label>Nombre</label>
                          <input type="text" value={sub.name} readOnly />
                        </div>
                        <div className="form-group-da">
                          <label>Descripción</label>
                          <input type="text" value={sub.description} readOnly />
                        </div>
                        <button
                          type="button"
                          className="remove-sub-button"
                          onClick={() => removeSubcaracteristica(idx)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <div className="subcaracteristica-form">
                  <input
                    type="text"
                    name="name"
                    value={newSubcaracteristica.name}
                    onChange={handleSubcaracteristicaChange}
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    name="description"
                    value={newSubcaracteristica.description}
                    onChange={handleSubcaracteristicaChange}
                    placeholder="Descripción"
                  />
                  <button
                    type="button"
                    className="add-sub-button"
                    onClick={addSubcaracteristica}
                  >
                    Agregar Subcaracterística
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={resetForm}>Cancelar</button>
                <button type="submit" className="add-item-button" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : (editMode ? 'Guardar Cambios' : 'Agregar Ítem')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}