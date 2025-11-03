"use client";

// Importaciones necesarias para el componente React
// "use client" indica que este componente se ejecuta en el cliente (Next.js)
import { useState } from "react"; // Hook para manejar estado local en el componente
import { useRouter } from "next/navigation"; // Hook para navegación programática en Next.js
import { Button } from "@/components/ui/button"; // Componente de botón reutilizable
import { Input } from "@/components/ui/input"; // Componente de entrada de texto reutilizable
import { Label } from "@/components/ui/label"; // Componente de etiqueta para inputs
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Componentes para tarjetas UI
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react"; // Iconos de Lucide React para UI

// Constante para la base de la API, definida como ruta relativa
const API_BASE = "/api";

// Componente principal de la página de login
// Este componente maneja el formulario de inicio de sesión, validación y redirección basada en el rol del usuario
export default function LoginPage() {
  // Hook de navegación para redirigir al usuario después del login exitoso
  const router = useRouter();

  // Estados locales para manejar los valores del formulario y el estado de la aplicación
  const [email, setEmail] = useState(""); // Estado para el email del usuario
  const [password, setPassword] = useState(""); // Estado para la contraseña del usuario
  const [loading, setLoading] = useState(false); // Estado para indicar si la solicitud está en progreso (deshabilita el botón)
  const [error, setError] = useState(""); // Estado para mostrar mensajes de error al usuario

  // Función que maneja el envío del formulario de login
  // Se ejecuta cuando el usuario hace submit en el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario (recarga de página)
    setLoading(true); // Activa el estado de carga
    setError(""); // Limpia cualquier error previo

    try {
      // Realiza una solicitud POST a la API de login
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST", // Método HTTP POST
        headers: { "Content-Type": "application/json" }, // Cabecera para indicar que el cuerpo es JSON
        body: JSON.stringify({ email, password }), // Cuerpo de la solicitud con email y password
      });

      // Verifica si la respuesta es exitosa
      if (response.ok) {
        const data = await response.json(); // Parsea la respuesta JSON

        // Almacena el token y datos del usuario en localStorage (para persistencia)
        localStorage.setItem("token", data.token); // Token JWT para autenticación
        localStorage.setItem("user", JSON.stringify(data.user)); // Datos del usuario como string JSON

        // Redirección basada en el rol del usuario (viene en data.user.role)
        switch (data.user.role) {
          case "admin": // Si es administrador, redirige al dashboard de admin
            router.push("/admin-dashboard");
            break;
          case "monitor": // Si es monitor, redirige al dashboard de monitor
            router.push("/monitor-dashboard");
            break;
          case "student": // Si es estudiante, redirige al dashboard de estudiante
            router.push("/estudiante-dashboard");
            break;
          default: // Si el rol no es reconocido, muestra error
            setError("Rol de usuario no reconocido");
        }
      } else {
        // Si la respuesta no es exitosa, obtiene los datos de error
        const errorData = await response.json();
        setError(errorData.message || "Credenciales inválidas"); // Muestra el error específico o uno genérico
      }
    } catch (error) {
      // Manejo de errores de conexión (ej. red caída)
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      // Siempre se ejecuta al final, desactiva el estado de carga
      setLoading(false);
    }
  };

  // Renderizado del componente (JSX)
  return (
    // Contenedor principal con fondo degradado y centrado
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Sección del logo y header institucional */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {/* Icono del logo institucional */}
            <div className="bg-red-800 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          {/* Título y subtítulo de la aplicación */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Monitorías</h1>
          <p className="text-gray-600 text-sm">Universidad Católica de Pereira - PAC</p>
        </div>

        {/* Tarjeta del formulario de login */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            {/* Título y descripción del formulario */}
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales institucionales
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Formulario de login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Muestra mensaje de error si existe */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="h-4 w-4" /> {/* Icono de alerta */}
                  <span className="text-sm">{error}</span> {/* Texto del error */}
                </div>
              )}

              {/* Campo de email */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label> {/* Etiqueta del campo */}
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> {/* Icono de email */}
                  <Input
                    id="email"
                    type="email" // Tipo de input para validación automática
                    placeholder="estudiante@ucp.edu.co" // Placeholder de ejemplo
                    className="pl-10" // Padding izquierdo para el icono
                    value={email} // Valor controlado por estado
                    onChange={(e) => setEmail(e.target.value)} // Actualiza estado al cambiar
                    required // Campo obligatorio
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label> {/* Etiqueta del campo */}
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> {/* Icono de candado */}
                  <Input
                    id="password"
                    type="password" // Tipo de input para ocultar texto
                    placeholder="••••••••" // Placeholder genérico
                    className="pl-10" // Padding izquierdo para el icono
                    value={password} // Valor controlado por estado
                    onChange={(e) => setPassword(e.target.value)} // Actualiza estado al cambiar
                    required // Campo obligatorio
                  />
                </div>
              </div>

              {/* Botón de submit */}
              <Button
                type="submit" // Tipo submit para el formulario
                className="w-full bg-red-800 hover:bg-red-900" // Estilos del botón
                disabled={loading} // Deshabilitado durante carga
              >
                {loading ? "Iniciando Sesión..." : "Iniciar Sesión"} {/* Texto dinámico basado en estado */}
              </Button>
            </form>

            {/* Enlace para recuperar contraseña (no funcional en este código) */}
            <div className="text-center">
              <a href="#" className="text-sm text-red-800 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer con información institucional */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2025 Universidad Católica de Pereira</p>
          <p>Programa de Acompañamiento Académico</p>
        </div>
      </div>
    </div>
  );
}
