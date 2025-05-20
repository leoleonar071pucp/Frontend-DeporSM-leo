import React from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface PieChartProps {
  data: ChartDataItem[];
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-4 h-48 flex items-center justify-center">No hay datos para "{title}".</div>;
  }
  const total = data.reduce((acc: number, item: ChartDataItem) => acc + item.value, 0);
  // Permitir gráfico si total es 0, pero mostrar mensaje
  if (total <= 0) {
    return <div className="text-center text-gray-500 py-4 h-48 flex items-center justify-center">El total para "{title}" es cero o negativo.</div>;
  }

  // Colores más vibrantes y distinguibles
  const colors = ["#0cb7f2", "#4361ee", "#3a0ca3", "#7209b7", "#f72585", "#4cc9f0", "#4895ef"];

  // Ordenar los datos de mayor a menor para mejor visualización
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">{title}</h3>

      {/* Barras horizontales en lugar de gráfico circular */}
      <div className="space-y-3">
        {sortedData.map((item: ChartDataItem, index: number) => {
          const percentage = (item.value / total) * 100;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="font-bold">{item.value} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-md h-8">
                <div
                  className="rounded-md h-8 flex items-center px-2 text-white font-medium"
                  style={{
                    width: `${Math.max(percentage, 5)}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                >
                  {percentage > 15 ? `${percentage.toFixed(1)}%` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de totales */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total de reservas:</span>
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
    </div>
  )
}