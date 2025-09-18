import React from 'react';
import { Order, MenuItem, ModuleType } from '../types';
import {
  ShoppingBag,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { COLORS } from '../data/menu';
import { formatCOP } from '../utils/format';

interface DashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  onModuleChange: (module: ModuleType) => void;
}

export function Dashboard({ orders, menuItems, onModuleChange }: DashboardProps) {
  const today = new Date();
  const todayOrders = orders.filter(order => 
    order.timestamp.toDateString() === today.toDateString()
  );
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => 
    order.estado === 'pendiente' || order.estado === 'preparando'
  ).length;
  
  const lowStockItems = menuItems.filter(item => item.stock < 10);

  const stats = [
    {
      label: 'Ventas del día',
      value: formatCOP(todayRevenue),
      icon: DollarSign,
      color: 'green',
      onClick: () => onModuleChange('caja')
    },
    {
      label: 'Pedidos hoy',
      value: todayOrders.length.toString(),
      icon: ShoppingBag,
      color: 'blue',
      onClick: () => onModuleChange('comandas')
    },
    {
      label: 'Pendientes',
      value: pendingOrders.toString(),
      icon: Clock,
      color: 'orange',
      onClick: () => onModuleChange('cocina')
    },
    {
      label: 'Stock bajo',
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      color: 'red',
      onClick: () => onModuleChange('inventario')
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.dark }}>
          Dashboard SAVIA
        </h2>
        <p className="text-gray-600">
          Resumen de operaciones del {today.toLocaleDateString('es-CO')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <button
              key={stat.label}
              onClick={stat.onClick}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1" style={{ color: COLORS.dark }}>
                    {stat.value}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS.accent}20` }}
                >
                  <Icon size={24} style={{ color: COLORS.dark }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Últimos pedidos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.dark }}>
            Últimos pedidos
          </h3>
          <div className="space-y-3">
            {orders.slice(-5).reverse().map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium">#{order.numero}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    order.estado === 'entregado' ? 'bg-green-100 text-green-800' :
                    order.estado === 'listo' ? 'bg-blue-100 text-blue-800' :
                    order.estado === 'preparando' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.estado}
                  </span>
                </div>
                <span className="font-semibold">{formatCOP(order.total)}</span>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay pedidos registrados</p>
            )}
          </div>
        </div>

        {/* Productos con stock bajo */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4" style={{ color: COLORS.dark }}>
            Alertas de inventario
          </h3>
          <div className="space-y-3">
            {lowStockItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <span className="font-medium">{item.nombre}</span>
                  <span className="text-sm text-gray-500 block">{item.categoria}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.stock < 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.stock} unidades
                </span>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">Stock en niveles normales</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
