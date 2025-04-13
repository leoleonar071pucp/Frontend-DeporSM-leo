export type FacilityIconType = 'droplets' | 'users' | 'dumbbell';

export interface Facility {
  id: number
  name: string
  type: string
  location: string
  description: string
  status: string
  maintenanceStatus: string
  lastMaintenance: string
  nextMaintenance: string | null
  capacity: string
  price: string
  contactNumber?: string
  schedule: string
  features: string[]
  amenities: string[]
  rules: string[]
  image: string
  iconType?: FacilityIconType
  availableTimes?: string[]
}

export const facilitiesDB: Facility[] = [
  {
    id: 1,
    name: "Piscina Municipal",
    type: "piscina",
    location: "Complejo Deportivo Municipal",
    description:
      "Piscina semiolímpica con carriles para natación y área recreativa. Ideal para practicar natación, clases de aquagym y actividades acuáticas.",
    status: "disponible",
    maintenanceStatus: "none",
    lastMaintenance: "15/03/2025",
    nextMaintenance: null,
    capacity: "30 personas",
    price: "S/. 15.00 por hora",
    contactNumber: "987-654-321",
    schedule: "Lunes a Viernes: 6:00 - 21:00, Sábados y Domingos: 8:00 - 18:00",
    features: [
      "Dimensiones: 25m x 12.5m",
      "Profundidad: 1.2m - 2.0m",
      "6 carriles para natación",
      "Temperatura controlada (26-28°C)",
      "Vestuarios y duchas",
      "Salvavidas certificados",
    ],
    amenities: ["Vestuarios con casilleros", "Duchas con agua caliente", "Área de descanso", "Cafetería cercana"],
    rules: [
      "Uso obligatorio de gorro de baño",
      "Ducharse antes de ingresar a la piscina",
      "No correr en el área de la piscina",
      "No consumir alimentos dentro del área de la piscina",
      "Niños menores de 12 años deben estar acompañados por un adulto",
    ],
    image: "/placeholder.svg?height=400&width=800",
    iconType: 'droplets',
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
    ],
  },
  {
    id: 2,
    name: "Cancha de Fútbol (Grass)",
    type: "cancha-futbol-grass",
    location: "Parque Juan Pablo II",
    description:
      "Cancha de fútbol con grass sintético de última generación, ideal para partidos de fútbol 7 o fútbol 11. Cuenta con iluminación para partidos nocturnos.",
    status: "disponible",
    maintenanceStatus: "scheduled",
    lastMaintenance: "10/03/2025",
    nextMaintenance: "10/04/2025",
    capacity: "22 jugadores",
    price: "S/. 120.00 por hora",
    contactNumber: "987-654-322",
    schedule: "Lunes a Domingo: 8:00 - 22:00",
    features: [
      "Dimensiones: 90m x 45m",
      "Grass sintético de alta calidad",
      "Iluminación nocturna",
      "Vestuarios y duchas",
      "Estacionamiento cercano",
    ],
    amenities: [
      "Vestuarios con casilleros",
      "Duchas con agua caliente",
      "Área de calentamiento",
      "Tribunas para espectadores",
      "Alquiler de balones (costo adicional)",
    ],
    rules: [
      "Uso de zapatillas adecuadas (no tacos metálicos)",
      "No consumir alimentos dentro de la cancha",
      "Respetar el horario reservado",
      "Máximo 22 jugadores por reserva",
      "Prohibido el consumo de alcohol",
    ],
    image: "/placeholder.svg?height=400&width=800",
    iconType: 'users',
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
      "20:00 - 21:00",
    ],
  },
  {
    id: 3,
    name: "Gimnasio Municipal",
    type: "gimnasio",
    location: "Complejo Deportivo Municipal",
    description:
      "Gimnasio equipado con máquinas modernas y área de pesas. Ideal para entrenamiento de fuerza, cardio y clases grupales.",
    status: "disponible",
    maintenanceStatus: "none",
    lastMaintenance: "05/03/2025",
    nextMaintenance: null,
    capacity: "50 personas",
    price: "S/. 20.00 por día",
    contactNumber: "987-654-323",
    schedule: "Lunes a Viernes: 6:00 - 22:00, Sábados: 8:00 - 20:00, Domingos: 8:00 - 14:00",
    features: [
      "Área de cardio con 15 máquinas",
      "Área de pesas y máquinas de musculación",
      "Zona de entrenamiento funcional",
      "Salón para clases grupales",
      "Entrenadores certificados disponibles",
    ],
    amenities: [
      "Vestuarios con casilleros",
      "Duchas con agua caliente",
      "Dispensador de agua",
      "Toallas (costo adicional)",
      "Tienda de suplementos",
    ],
    rules: [
      "Uso de toalla obligatorio",
      "Limpiar las máquinas después de usarlas",
      "No reservar máquinas",
      "Uso de calzado deportivo limpio",
      "Prohibido el ingreso con alimentos",
    ],
    image: "/placeholder.svg?height=400&width=800",
    iconType: 'dumbbell',
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
    ],
  },
  {
    id: 4,
    name: "Cancha de Fútbol (Loza)",
    type: "cancha-futbol-loza",
    location: "Parque Simón Bolívar",
    description:
      "Cancha multifuncional de loza para fútbol y otros deportes. Superficie duradera y versátil para diferentes actividades deportivas.",
    status: "mantenimiento",
    maintenanceStatus: "in-progress",
    lastMaintenance: "01/03/2025",
    nextMaintenance: "08/04/2025",
    capacity: "14 jugadores",
    price: "S/. 80.00 por hora",
    contactNumber: "987-654-324",
    schedule: "Lunes a Domingo: 8:00 - 21:00",
    features: [
      "Dimensiones: 40m x 20m",
      "Superficie de concreto pulido",
      "Iluminación nocturna",
      "Marcación para múltiples deportes",
      "Arcos de fútbol y tableros de básquet",
    ],
    amenities: ["Bancas para descanso", "Bebederos de agua", "Baños públicos cercanos", "Estacionamiento gratuito"],
    rules: [
      "Uso de zapatillas deportivas adecuadas",
      "No consumir alimentos dentro de la cancha",
      "Respetar el horario reservado",
      "Prohibido el consumo de alcohol",
      "Mantener limpia la instalación",
    ],
    image: "/placeholder.svg?height=400&width=800",
    iconType: 'users',
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
      "19:00 - 20:00",
    ],
  },
  {
    id: 5,
    name: "Pista de Atletismo",
    type: "pista-atletismo",
    location: "Complejo Deportivo Municipal",
    description:
      "Pista de atletismo profesional con 6 carriles. Ideal para corredores, entrenamientos de resistencia y competencias atléticas.",
    status: "disponible",
    maintenanceStatus: "required",
    lastMaintenance: "20/02/2025",
    nextMaintenance: null,
    capacity: "30 personas",
    price: "S/. 10.00 por hora",
    contactNumber: "987-654-325",
    schedule: "Lunes a Viernes: 6:00 - 21:00, Sábados y Domingos: 7:00 - 19:00",
    features: [
      "Pista de 400m con 6 carriles",
      "Superficie sintética de alta calidad",
      "Áreas para salto largo y lanzamiento",
      "Iluminación para uso nocturno",
      "Cronometraje electrónico disponible",
    ],
    amenities: ["Vestuarios con duchas", "Bebederos de agua", "Área de calentamiento", "Gradas para espectadores"],
    rules: [
      "Uso exclusivo de zapatillas de atletismo o deportivas",
      "Respetar la dirección de carrera",
      "No cruzar por los carriles durante entrenamientos",
      "Ceder el paso a corredores más rápidos",
      "No consumir alimentos en la pista",
    ],
    image: "/placeholder.svg?height=400&width=800",
    iconType: 'users',
    availableTimes: [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
      "17:00 - 18:00",
      "18:00 - 19:00",
    ],
  },
]