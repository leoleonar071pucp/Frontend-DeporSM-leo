import React from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartDataItem[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  // Comprobación de datos vacíos o inválidos
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-4 h-32 flex items-center justify-center">No hay datos para "{title}".</div>;
  }

  // Filtrar valores nulos o indefinidos y convertir strings a números si es necesario
  const cleanData = data.map(item => ({
    name: item.name,
    value: typeof item.value === 'string' ? parseInt(item.value, 10) || 0 : (item.value || 0)
  }));

  const maxValue = Math.max(...cleanData.map((d: ChartDataItem) => d.value));

  // Solo mostrar mensaje si todos los valores son cero
  if (cleanData.every(d => d.value === 0)) {
    return (
      <div className="text-center text-gray-500 py-4 h-32 flex flex-col items-center justify-center">
        <p>No hay datos registrados para "{title}".</p>
        <p className="text-xs mt-2">Realiza algunas reservas para ver estadísticas aquí.</p>
      </div>
    );
  }

  // Usar 1 si maxValue es 0 o negativo para evitar división por cero en style
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue;

  // Colores para las barras (azul con diferentes tonalidades)
  const colors = ["#0cb7f2", "#0ca5f2", "#0c95f2", "#0c85f2", "#0c75f2", "#0c65f2", "#0c55f2"];

  return (
    <div className="space-y-4 bg-white w-full h-full p-1">
      <h3 className="font-medium text-lg">{title}</h3>
      <div className="space-y-3 bg-white">
        {cleanData.map((item: ChartDataItem, index: number) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="font-bold">{item.value}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-md h-6">
              <div
                className="rounded-md h-6"
                style={{
                  width: `${Math.max(15, (item.value / safeMaxValue) * 100)}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              >
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}