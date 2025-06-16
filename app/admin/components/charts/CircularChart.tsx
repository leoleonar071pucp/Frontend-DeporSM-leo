"use client"

import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface CircularChartProps {
  data: ChartDataItem[];
  title: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  height?: number;
}

// Colores predefinidos para los gráficos
const DEFAULT_COLORS = [
  "#8884d8", // Azul
  "#82ca9d", // Verde
  "#ffc658", // Amarillo
  "#ff7c7c", // Rojo
  "#8dd1e1", // Azul claro
  "#d084d0", // Morado
  "#ffb347", // Naranja
  "#87ceeb", // Azul cielo
  "#dda0dd", // Ciruela
  "#98fb98"  // Verde claro
];

export const CircularChart: React.FC<CircularChartProps> = ({
  data,
  title,
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 150,
  height = 300
}) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 flex items-center justify-center" style={{ height }}>
        <div>
          <p className="text-lg font-medium">No hay datos disponibles</p>
          <p className="text-sm">"{title}"</p>
        </div>
      </div>
    );
  }

  // Filtrar datos válidos (valores mayores a 0 y números válidos)
  const validData = data.filter(item =>
    item &&
    typeof item.value === 'number' &&
    !isNaN(item.value) &&
    item.value > 0 &&
    item.name
  );

  if (validData.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 flex items-center justify-center" style={{ height }}>
        <div>
          <p className="text-lg font-medium">Sin datos para mostrar</p>
          <p className="text-sm">"{title}"</p>
        </div>
      </div>
    );
  }

  const total = validData.reduce((acc: number, item: ChartDataItem) => acc + item.value, 0);

  if (total <= 0) {
    return (
      <div className="text-center text-gray-500 py-4 flex items-center justify-center" style={{ height }}>
        <div>
          <p className="text-lg font-medium">Total es cero</p>
          <p className="text-sm">"{title}"</p>
        </div>
      </div>
    );
  }

  // Asignar colores a los datos si no los tienen
  const dataWithColors = validData.map((item, index) => ({
    ...item,
    value: Math.max(0, item.value), // Asegurar que el valor no sea negativo
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }));

  // Componente personalizado para el tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      if (data && data.payload && typeof data.value === 'number') {
        const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-medium">{data.payload.name || data.name}</p>
            <p className="text-sm text-gray-600">
              Valor: <span className="font-bold">{data.value}</span>
            </p>
            <p className="text-sm text-gray-600">
              Porcentaje: <span className="font-bold">{percentage}%</span>
            </p>
          </div>
        );
      }
    }
    return null;
  };

  // Nota: Ya no necesitamos el CustomLegend porque hemos incorporado la leyenda
  // directamente en el renderizado principal con un diseño de cuadrícula inferior

  return (
    <div className="w-full">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">Total: {total.toLocaleString()}</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Gráfico circular */}
        <div style={{ width: '100%', height: height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={dataWithColors}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={Math.min(outerRadius, Math.min(height * 0.45, 180))}
                paddingAngle={dataWithColors.length > 1 ? 2 : 0}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {dataWithColors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {showTooltip && (
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'transparent' }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda inferior - Ordenada verticalmente */}
        {showLegend && (
          <div className="w-full mt-1 flex justify-center">
            <div className="flex flex-col gap-1">
              {dataWithColors.map((item, index) => (
                <div key={`legend-${index}`} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">{item.name}</span>
                    <span className="text-xs text-gray-600">{item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0'}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
