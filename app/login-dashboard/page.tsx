"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, Lock, AlertCircle } from "lucide-react"

const API_BASE = "/api"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store token in localStorage or sessionStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            router.push("/admin-dashboard")
            break
          case "monitor":
            router.push("/monitor-dashboard")
            break
          case "student":
            router.push("/estudiante-dashboard")
            break
          default:
            setError("Rol de usuario no reconocido")
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Credenciales inválidas")
      }
    } catch (error) {
      setError("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Header Institucional */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-800 p-3 rounded-full">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Monitorías</h1>
          <p className="text-gray-600 text-sm">Universidad Católica de Pereira - PAC</p>
        </div>

        {/* Formulario de Login */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales institucionales
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo Institucional</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="estudiante@ucp.edu.co"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-800 hover:bg-red-900"
                disabled={loading}
              >
                {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="text-center">
              <a href="#" className="text-sm text-red-800 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* 🚀 Botones Provisionales para acceder a los paneles */}
            <div className="mt-6 space-y-2">
              <p className="text-center text-sm text-gray-600 mb-2">
                Accesos provisionales para desarrollo:
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-700 text-red-800 hover:bg-red-50"
                  onClick={() => router.push("/admin-dashboard")}
                >
                  Entrar como Administrador
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-amber-600 text-amber-700 hover:bg-amber-50"
                  onClick={() => router.push("/monitor-dashboard")}
                >
                  Entrar como Monitor
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() => router.push("/estudiante-dashboard")}
                >
                  Entrar como Estudiante
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>© 2024 Universidad Católica de Pereira</p>
          <p>Programa de Acompañamiento Académico</p>
        </div>
      </div>
    </div>
  )
}
