import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-white py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">DeporSM</h3>
            <p className="text-primary-pale">
              Sistema de reserva de canchas y servicios deportivos para la Municipalidad de San Miguel.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/instalaciones" className="text-primary-pale hover:text-white">
                  Instalaciones
                </Link>
              </li>
              <li>
                {/* Considerar proteger este enlace o mostrarlo condicionalmente si es necesario */}
                <Link href="/mis-reservas" className="text-primary-pale hover:text-white">
                  Mis Reservas
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-primary-pale hover:text-white">
                  Contacto
                </Link>
              </li>
              {/* Podrías añadir enlaces a login/registro aquí si no está autenticado */}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <address className="not-italic text-primary-pale">
              <p>Av. Federico Gállese Nº 370</p>
              <p>San Miguel, Lima</p>
              <p>Teléfono: (01) 263-3392</p>
              <p>Email: deportes@munisanmiguel.gob.pe</p>
            </address>
          </div>
        </div>
        <div className="border-t border-primary-light mt-8 pt-8 text-center">
          <p className="text-primary-pale">
            &copy; {new Date().getFullYear()} Municipalidad de San Miguel. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}