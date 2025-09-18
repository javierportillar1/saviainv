import React, { useState, useEffect } from 'react';
import { Gasto } from '../types';
import { Receipt, Plus, Edit3, Trash2, Calendar, TrendingDown, Filter } from 'lucide-react';
import { COLORS } from '../data/menu';
import { formatCOP } from '../utils/format';
import * as dataService from '../lib/dataService';

export function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    descripcion: '',
    monto: 0,
    categoria: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const categorias = [
    'Ingredientes',
    'Servicios públicos',
    'Arriendo',
    'Salarios',
    'Equipos',
    'Mantenimiento',
    'Marketing',
    'Transporte',
    'Otros'
  ];

  useEffect(() => {
    fetchGastos();
  }, []);

  const fetchGastos = async () => {
    const data = await dataService.fetchGastos();
    setGastos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gastoData = {
      ...formData,
      monto: parseFloat(formData.monto.toString())
    };

    if (editingId) {
      await dataService.updateGasto({ ...gastoData, id: editingId });
      fetchGastos();
      resetForm();
    } else {
      const newGasto = { 
        ...gastoData, 
        id: crypto.randomUUID(),
        fecha: new Date(gastoData.fecha),
        created_at: new Date()
      };
      await dataService.createGasto(newGasto);
      fetchGastos();
      resetForm();
    }
  };

  const handleEdit = (gasto: Gasto) => {
    setFormData({
      descripcion: gasto.descripcion,
      monto: gasto.monto,
      categoria: gasto.categoria,
      fecha: gasto.fecha.toISOString().split('T')[0]
    });
    setEditingId(gasto.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      await dataService.deleteGasto(id);
      fetchGastos();
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      monto: 0,
      categoria: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getFilteredGastos = () => {
    const today = new Date(selectedDate);
    
    return gastos.filter(gasto => {
      const gastoDate = new Date(gasto.fecha);
      
      switch (viewMode) {
        case 'diario':
          return gastoDate.toDateString() === today.toDateString();
        case 'semanal':
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return gastoDate >= startOfWeek && gastoDate <= endOfWeek;
        case 'mensual':
          return gastoDate.getMonth() === today.getMonth() && 
                 gastoDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  };

  const filteredGastos = getFilteredGastos();
  const totalGastos = filteredGastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  const gastosPorCategoria = filteredGastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.monto;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt size={24} style={{ color: COLORS.dark }} />
          <h2 className="text-2xl font-bold" style={{ color: COLORS.dark }}>
            Control de Gastos
          </h2>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
          style={{ backgroundColor: COLORS.dark }}
        >
          <Plus size={16} />
          Agregar Gasto
        </button>
      </div>

      {/* Filtros y vista */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Vista:</span>
            </div>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {(['diario', 'semanal', 'mensual'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  style={{
                    backgroundColor: viewMode === mode ? COLORS.dark : 'transparent'
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': COLORS.accent } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} style={{ color: COLORS.accent }} />
            <span className="text-lg font-semibold">Total {viewMode}:</span>
          </div>
          <span className="text-2xl font-bold" style={{ color: COLORS.accent }}>
            {formatCOP(totalGastos)}
          </span>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4" style={{ color: COLORS.dark }}>
              {editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <input
                  type="text"
                  required
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': COLORS.accent } as React.CSSProperties}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Monto *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': COLORS.accent } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': COLORS.accent } as React.CSSProperties}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  required
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': COLORS.accent } as React.CSSProperties}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: COLORS.dark }}
                >
                  {editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resumen por categorías */}
      {Object.keys(gastosPorCategoria).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.dark }}>
            Gastos por categoría
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(gastosPorCategoria).map(([categoria, monto]) => (
              <div key={categoria} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{categoria}</span>
                <span className="font-bold" style={{ color: COLORS.accent }}>
                  {formatCOP(monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de gastos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gasto.fecha.toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {gasto.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {gasto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: COLORS.accent }}>
                    {formatCOP(gasto.monto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(gasto)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(gasto.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGastos.length === 0 && (
          <div className="text-center py-12">
            <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No hay gastos para el período seleccionado
            </h3>
            <p className="text-gray-500">
              Los gastos aparecerán aquí cuando los registres
            </p>
          </div>
        )}
      </div>
    </div>
  );
}