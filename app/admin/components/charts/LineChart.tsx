import React, { useState, useRef } from "react"

interface ChartDataItem {
  name: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataItem[];
  title: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data: initialData, title }) => {
  // Ordenar los datos por fecha (asumiendo que name es una fecha en formato dd/mm)
  const data = [...initialData].sort((a, b) => {
    const [dayA, monthA] = a.name.split('/').map(Number);
    const [dayB, monthB] = b.name.split('/').map(Number);

    // Comparar primero por mes, luego por día
    if (monthA !== monthB) return monthA - monthB;
    return dayA - dayB;
  });

  // Comprobación de datos vacíos o inválidos
  if (!data || data.length < 2) { // Necesita al menos 2 puntos para una línea
    return <div className="text-center text-gray-500 py-4 h-64 flex items-center justify-center">Datos insuficientes para "{title}".</div>;
  }

  // Estado para el tooltip
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; value: number; name: string }>({
    visible: false,
    x: 0,
    y: 0,
    value: 0,
    name: ""
  });

  // Ya no necesitamos estados para desplazamiento
  const chartRef = useRef<HTMLDivElement>(null);

  // Calcular el valor máximo para la escala
  const maxValue = Math.max(...data.map((d: ChartDataItem) => d.value));
  // Calcular el valor mínimo para la escala
  const minValue = Math.min(...data.map((d: ChartDataItem) => d.value));

  // Calcular un valor base para la escala que no sea cero si todos los valores son muy altos
  // Esto ayuda a que la gráfica no se vea tan plana cuando hay picos muy altos
  const baseValue = minValue > 10 ? minValue * 0.7 : 0;

  // Añadir un 20% de margen al valor máximo para que el gráfico no se vea tan grande
  const safeMaxValue = maxValue <= 0 ? 1 : maxValue * 1.2;

  // Calcular el rango efectivo para la visualización
  const effectiveRange = safeMaxValue - baseValue;

  // Configuración simple sin zoom ni desplazamiento
  const totalWidth = 100;

  // Mostrar tooltip al pasar el mouse sobre un punto
  const showTooltip = (item: ChartDataItem, x: number, y: number) => {
    setTooltip({
      visible: true,
      x,
      y,
      value: item.value,
      name: item.name
    });
  };

  // Ocultar tooltip
  const hideTooltip = () => {
    setTooltip({ ...tooltip, visible: false });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">{title}</h3>
      <div
        ref={chartRef}
        className="h-64 relative bg-gray-50 p-4 rounded-lg border border-gray-100 overflow-hidden"
      >
        {/* Líneas de referencia horizontales */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map((_, i) => (
            <div key={i} className="w-full h-px bg-gray-200" />
          ))}
        </div>

        {/* Valores del eje Y */}
        <div className="absolute left-2 inset-y-0 flex flex-col justify-between text-xs text-gray-500 py-4 pointer-events-none">
          {[0, 1, 2, 3, 4].map((_, i) => {
            const value = baseValue + (effectiveRange / 4) * (4 - i);
            return <div key={i}>{Math.round(value)}</div>;
          })}
        </div>

        {/* Contenedor del gráfico con desplazamiento */}
        <div
          className="w-full h-full relative"
          style={{
            width: `${totalWidth}%`
          }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Área bajo la línea */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0cb7f2" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#0cb7f2" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Área bajo la línea */}
            <path
              d={`
                M0,${100 - ((data[0].value - baseValue) / effectiveRange) * 100}
                ${data.map((item, index) =>
                  `L${(index / (data.length - 1)) * 100},${100 - ((item.value - baseValue) / effectiveRange) * 100}`
                ).join(' ')}
                L100,100 L0,100 Z
              `}
              fill="url(#areaGradient)"
            />

            {/* Línea principal */}
            <path
              d={`
                M0,${100 - ((data[0].value - baseValue) / effectiveRange) * 100}
                ${data.map((item, index) =>
                  `L${(index / (data.length - 1)) * 100},${100 - ((item.value - baseValue) / effectiveRange) * 100}`
                ).join(' ')}
              `}
              fill="none"
              stroke="#0cb7f2"
              strokeWidth="1.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Puntos en la línea */}
            {data.map((item: ChartDataItem, index: number) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.value - baseValue) / effectiveRange) * 100;

              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="3"
                    fill="white"
                    stroke="#0cb7f2"
                    strokeWidth="1.5"
                    onMouseEnter={() => {
                      const rect = chartRef.current?.getBoundingClientRect();
                      if (rect) {
                        const tooltipX = (x / 100) * rect.width;
                        const tooltipY = (y / 100) * rect.height;
                        showTooltip(item, tooltipX, tooltipY);
                      }
                    }}
                    onMouseLeave={hideTooltip}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Etiquetas del eje X */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            width: `${totalWidth}%`
          }}
        >
          <div className="flex w-full">
            {/* Mostrar solo algunas etiquetas para evitar superposición cuando hay muchos datos */}
            {data.map((item: ChartDataItem, index: number) => {
              // Si hay más de 15 puntos, mostrar solo algunos para evitar superposición
              const shouldShow = data.length <= 15 ||
                                index === 0 ||
                                index === data.length - 1 ||
                                index % Math.ceil(data.length / 10) === 0;

              if (!shouldShow) return null;

              return (
                <div
                  key={index}
                  className="text-xs font-medium text-gray-700 flex-shrink-0"
                  style={{
                    position: 'absolute',
                    left: `${(index / (data.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute bg-white shadow-lg rounded-md p-2 z-10 pointer-events-none"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 40}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-xs font-bold">{tooltip.name}</div>
            <div className="text-sm text-blue-500">S/. {tooltip.value.toFixed(2)}</div>
          </div>
        )}

        {/* Ya no necesitamos indicador de desplazamiento */}
      </div>

      {/* Ya no necesitamos instrucciones de uso */}
    </div>
  );
}