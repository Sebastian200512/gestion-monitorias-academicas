"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  GraduationCap,
  Home,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageCircle,
  Star,
  Save,
  Download,
  TrendingUp,
  Award,
  MapPin,
  XCircle,
  Camera,
  Shield,
  Eye,
  EyeOff,
  Search,
  Filter,
} from "lucide-react"

function MonitorSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const router = useRouter()
  // ✅ Función para cerrar sesión
  const handleLogout = () => {
    // 🔒 Aquí limpiarás los datos del usuario cuando tengas autenticación real
    // localStorage.removeItem("token")
    // sessionStorage.clear()
    // await logoutUser() // Si tienes backend

    // 🚪 Redirige al login y evita volver atrás con el botón del navegador
    router.replace("/login-dashboard")
  }
  const menuItems = [
    { title: "Inicio", icon: Home, value: "home" },
    { title: "Mis Citas", icon: CalendarDays, value: "appointments" },
    { title: "Disponibilidad", icon: Clock, value: "availability" },
    { title: "Reportes", icon: BarChart3, value: "reports" },
    { title: "Configuración", icon: Settings, value: "settings" },
  ]

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="border-b border-gray-200 p-4 bg-red-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Monitorías UCP</h2>
            <p className="text-xs text-red-100">Monitor</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={activeTab === item.value}>
                <button
                  onClick={() => setActiveTab(item.value)}
                  className="flex items-center gap-3 w-full data-[active=true]:bg-red-50 data-[active=true]:text-red-800"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="mt-auto pt-4 border-t border-gray-200">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
              onClick={handleLogout}
              className="flex items-center gap-3 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

interface MonitorAppointment {
  id: string
  student: {
    name: string
    email: string
    phone: string
    program: string
    semester: string
    photo?: string
  }
  subject: string
  subjectCode: string
  date: string
  time: string
  endTime: string
  location: string
  status: "confirmada" | "pendiente" | "completada" | "cancelada"
  details: string
  studentNotes?: string
  monitorNotes?: string
  createdAt: string
}

interface AvailabilitySlot {
  ids: string[]
  day: string
  startTime: string
  endTime: string
  location: string
  subjects: string[]
  isActive: boolean
}

const API_BASE = "/api"

export default function MonitorDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<MonitorAppointment | null>(null)
  const [monitorNotes, setMonitorNotes] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // Load user data and available subjects on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserId(parsedUser.id)
      // Set initial monitor data from user
      const [firstName, ...lastNameParts] = parsedUser.nombre.split(" ")
      setMonitorData({
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        email: parsedUser.email || "",
        phone: parsedUser.telefono || "",
        employeeId: parsedUser.id.toString(),
        subjects: [],
      })
    }

    // Fetch available subjects
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_BASE}/materias`)
        if (response.ok) {
          const subjectsData = await response.json()
          setAvailableSubjects(subjectsData || [])
        }
      } catch (error) {
        console.error("Error fetching subjects:", error)
      }
    }

    fetchSubjects()
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return

      try {
        // Fetch monitor profile
        const profileResponse = await fetch(`${API_BASE}/monitor/profile?userId=${userId}`)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setMonitorData(prev => ({ ...prev, ...profileData }))
        }

    // Fetch appointments
    const appointmentsResponse = await fetch(`${API_BASE}/citas?monitor_id=${userId}`)
    if (appointmentsResponse.ok) {
      const appointmentsJson = await appointmentsResponse.json()
      if (appointmentsJson.ok && appointmentsJson.data) {
        // Map data to MonitorAppointment interface
        const appointmentsData = appointmentsJson.data.map((apt: any) => ({
          id: apt.id.toString(),
          student: {
            name: apt.estudiante.nombre_completo,
            email: apt.estudiante.correo,
            phone: apt.estudiante.telefono || '',
            program: apt.estudiante.programa || '',
            semester: apt.estudiante.semestre || '',
            photo: '/placeholder.svg?height=100&width=100',
          },
          subject: apt.materia.nombre,
          subjectCode: apt.materia.codigo,
          date: apt.fecha_cita,
          time: apt.hora_inicio,
          endTime: apt.hora_fin,
          location: apt.ubicacion,
          status: apt.estado,
          details: apt.detalles || '',
          studentNotes: apt.notas_estudiante,
          monitorNotes: apt.notas_monitor,
          createdAt: apt.created_at,
        }))
        setAppointments(appointmentsData)
      } else {
        setAppointments([])
      }
    }

        // Fetch availability slots
        const availabilityResponse = await fetch(`${API_BASE}/monitor/availability?userId=${userId}`)
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json()
          setAvailabilitySlots(availabilityData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchData()
  }, [userId])

  // Monitor profile data
  const [monitorData, setMonitorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "",
    subjects: [],
  })

  // Availability slots
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])

  // New availability form
  const [newAvailability, setNewAvailability] = useState({
    day: "",
    startTime: "",
    endTime: "",
    location: "",
    subjects: [] as string[],
  })

  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null)
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])

  const [appointments, setAppointments] = useState<MonitorAppointment[]>([])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-amber-600 hover:bg-amber-700"
      case "pendiente":
        return "bg-gray-500 hover:bg-gray-600"
      case "completada":
        return "bg-green-600 hover:bg-green-700"
      case "cancelada":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="h-4 w-4" />
      case "pendiente":
        return <AlertCircle className="h-4 w-4" />
      case "completada":
        return <CheckCircle className="h-4 w-4" />
      case "cancelada":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleAddAvailability = async () => {
    if (!userId || newAvailability.subjects.length === 0) return

    try {
      // Create slots for each selected subject
      const promises = newAvailability.subjects.map(async (subjectName) => {
        // Get subject ID by name
        const subjectsResponse = await fetch(`${API_BASE}/materias`)
        const subjectsData = await subjectsResponse.json()
        const subject = subjectsData.find((s: any) => s.name === subjectName)

        if (!subject) {
          console.error(`Subject ${subjectName} not found`)
          return null
        }

        const response = await fetch(`${API_BASE}/disponibilidades`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            monitor_id: userId,
            materia_id: subject.id,
            dia: newAvailability.day,
            hora_inicio: newAvailability.startTime,
            hora_fin: newAvailability.endTime,
            ubicacion: newAvailability.location
          })
        })

        if (response.ok) {
          const result = await response.json()
          return {
            ids: [result.data.id.toString()],
            day: newAvailability.day,
            startTime: newAvailability.startTime,
            endTime: newAvailability.endTime,
            location: newAvailability.location,
            subjects: [subjectName],
            isActive: true,
          }
        }
        return null
      })

      const newSlots = (await Promise.all(promises)).filter(slot => slot !== null)
      setAvailabilitySlots([...availabilitySlots, ...newSlots])

      setNewAvailability({
        day: "",
        startTime: "",
        endTime: "",
        location: "",
        subjects: [],
      })
      setShowAvailabilityDialog(false)
    } catch (error) {
      console.error("Error adding availability:", error)
    }
  }

  const handleEditAvailability = (slot: AvailabilitySlot) => {
    setEditingSlot(slot)
    setNewAvailability({
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      location: slot.location,
      subjects: slot.subjects,
    })
    setShowAvailabilityDialog(true)
  }

  const handleDeleteAvailability = async (slot: AvailabilitySlot) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este horario?")) return

    try {
      // Delete all database entries for this slot
      const deletePromises = slot.ids.map(id =>
        fetch(`${API_BASE}/disponibilidades/${id}`, {
          method: 'DELETE',
        })
      )

      const results = await Promise.all(deletePromises)
      const allSuccessful = results.every(response => response.ok)

      if (allSuccessful) {
        setAvailabilitySlots(availabilitySlots.filter(s =>
          s.day !== slot.day ||
          s.startTime !== slot.startTime ||
          s.endTime !== slot.endTime ||
          s.location !== slot.location
        ))
      } else {
        console.error("Error deleting some availability slots")
      }
    } catch (error) {
      console.error("Error deleting availability:", error)
    }
  }

  const handleSaveEditAvailability = async () => {
    if (!editingSlot || !userId) return

    if (!confirm("¿Estás seguro de que quieres editar esta disponibilidad?")) return

    try {
      // Update existing entries and handle subject changes
      const oldSubjects = editingSlot.subjects
      const newSubjects = newAvailability.subjects

      // Get subject IDs
      const subjectsResponse = await fetch(`${API_BASE}/materias`)
      const subjectsData = await subjectsResponse.json()

      // Update existing entries
      const updatePromises = []
      const minLength = Math.min(editingSlot.ids.length, newSubjects.length)

      for (let i = 0; i < minLength; i++) {
        const subject = subjectsData.find((s: any) => s.name === newSubjects[i])
        if (subject) {
          updatePromises.push(
            fetch(`${API_BASE}/disponibilidades/${editingSlot.ids[i]}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                monitor_id: userId,
                materia_id: subject.id,
                dia: newAvailability.day,
                hora_inicio: newAvailability.startTime,
                hora_fin: newAvailability.endTime,
                ubicacion: newAvailability.location
              })
            })
          )
        }
      }

      // Delete extra old entries
      for (let i = newSubjects.length; i < editingSlot.ids.length; i++) {
        updatePromises.push(
          fetch(`${API_BASE}/disponibilidades/${editingSlot.ids[i]}`, {
            method: 'DELETE',
          })
        )
      }

      // Create new entries for extra subjects
      const newIds: string[] = []
      for (let i = editingSlot.ids.length; i < newSubjects.length; i++) {
        const subject = subjectsData.find((s: any) => s.name === newSubjects[i])
        if (subject) {
          const response = await fetch(`${API_BASE}/disponibilidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              monitor_id: userId,
              materia_id: subject.id,
              dia: newAvailability.day,
              hora_inicio: newAvailability.startTime,
              hora_fin: newAvailability.endTime,
              ubicacion: newAvailability.location
            })
          })
          if (response.ok) {
            const result = await response.json()
            newIds.push(result.data.id.toString())
          }
        }
      }

      // Update the slot in state
      const updatedSlot = {
        ids: [...editingSlot.ids.slice(0, newSubjects.length), ...newIds],
        day: newAvailability.day,
        startTime: newAvailability.startTime,
        endTime: newAvailability.endTime,
        location: newAvailability.location,
        subjects: newSubjects,
        isActive: true,
      }

      setAvailabilitySlots(availabilitySlots.map(slot =>
        slot.ids.join('-') === editingSlot.ids.join('-') ? updatedSlot : slot
      ))

      setEditingSlot(null)
      setShowAvailabilityDialog(false)
    } catch (error) {
      console.error("Error editing availability:", error)
    }
  }

  const handleAddNotes = (appointment: MonitorAppointment) => {
    setSelectedAppointment(appointment)
    setMonitorNotes(appointment.monitorNotes || "")
    setShowNotesDialog(true)
  }

  const handleSaveNotes = () => {
    // Aquí iría la lógica para guardar las notas
    console.log("Saving notes for appointment:", selectedAppointment?.id, monitorNotes)
    setShowNotesDialog(false)
    setSelectedAppointment(null)
    setMonitorNotes("")
  }

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    console.log("Changing password")
    setShowPasswordDialog(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  // Handler functions
  const handleViewStudentProfile = (appointment: MonitorAppointment) => {
    console.log("Viewing student profile:", appointment.student)
    // Aquí iría la lógica para mostrar el perfil del estudiante
  }

  const handleContactStudent = (appointment: MonitorAppointment) => {
    console.log("Contacting student:", appointment.student)
    // Aquí iría la lógica para contactar al estudiante
  }

  const handleConfirmAppointment = async (appointment: MonitorAppointment) => {
    if (!confirm("¿Estás seguro de que quieres confirmar esta cita?")) return

    try {
      const response = await fetch(`${API_BASE}/citas/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'confirmada' })
      })

      if (response.ok) {
        setAppointments(appointments.map(apt =>
          apt.id === appointment.id ? { ...apt, status: 'confirmada' } : apt
        ))
      } else {
        console.error("Error confirming appointment")
      }
    } catch (error) {
      console.error("Error confirming appointment:", error)
    }
  }

  const handleCompleteAppointment = async (appointment: MonitorAppointment) => {
    if (!confirm("¿Estás seguro de que quieres marcar esta cita como completada?")) return

    try {
      const response = await fetch(`${API_BASE}/citas/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'completada' })
      })

      if (response.ok) {
        setAppointments(appointments.map(apt =>
          apt.id === appointment.id ? { ...apt, status: 'completada' } : apt
        ))
      } else {
        console.error("Error completing appointment")
      }
    } catch (error) {
      console.error("Error completing appointment:", error)
    }
  }

  const upcomingAppointments = appointments.filter((apt) => apt.status !== "completada")
  const completedAppointments = appointments.filter((apt) => apt.status === "completada")

  // Filter functions
  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Debug: log appointments data
  console.log('All appointments:', appointments)
  console.log('Upcoming appointments:', upcomingAppointments)
  console.log('Completed appointments:', completedAppointments)

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
        <MonitorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1 w-full min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Panel de Monitor</h1>
                  <p className="text-sm text-gray-500">
                    {monitorData.firstName} {monitorData.lastName} 
                  </p>
                </div>
              </div>
              {activeTab === "home" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => router.push('/estudiante-dashboard')}>
                    <User className="h-4 w-4 mr-2" />
                    Estudiante
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6">
            {/* Home Tab */}
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Citas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingAppointments.length}
                  </p>
                        </div>
                        <Calendar className="h-8 w-8 text-red-800" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Este Mes</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <Users className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Gestionar Disponibilidad
                      </CardTitle>
                      <CardDescription>Configura tus horarios disponibles para monitorías</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>Horarios activos: {availabilitySlots.filter((slot) => slot.isActive).length}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-amber-600 hover:bg-amber-700"
                          onClick={() => setShowAvailabilityDialog(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Horarios
                        </Button>
                        <Button variant="outline" onClick={() => setActiveTab("availability")}>
                          Ver Todos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Resumen Semanal
                      </CardTitle>
                      <CardDescription>Revisa tu desempeño y estadísticas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Horas trabajadas:</span>
                          <span className="font-medium">{completedAppointments.reduce((sum, apt) => sum + (parseInt(apt.endTime.split(':')[0]) - parseInt(apt.time.split(':')[0])), 0)}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Estudiantes atendidos:</span>
                          <span className="font-medium">{new Set(completedAppointments.map(apt => apt.student.name)).size}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4 bg-transparent"
                          onClick={() => setActiveTab("reports")}
                        >
                          Ver Reportes Completos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Próximas Citas</CardTitle>
                    <CardDescription>Tus monitorías programadas para los próximos días</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas próximas</h3>
                        <p className="text-gray-500 mb-4">Aún no tienes monitorías programadas</p>
                      </div>
                    ) : (
                      upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.student.name}</h4>
                              <p className="text-sm text-gray-600">{appointment.subject}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(appointment.date).toLocaleDateString("es-ES")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {appointment.time} - {appointment.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {appointment.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setActiveTab("appointments")}
                    >
                      Ver Todas las Citas
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mis Citas</h2>
                    <p className="text-gray-600">Gestiona tus monitorías asignadas</p>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por materia o estudiante..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setFilterStatus("all")}>Todas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("confirmada")}>Confirmadas</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("pendiente")}>Pendientes</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus("cancelada")}>Canceladas</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Tabs defaultValue="upcoming" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="upcoming">Próximas ({upcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completadas ({completedAppointments.length})</TabsTrigger>
                    <TabsTrigger value="all">Todas ({appointments.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {filteredUpcomingAppointments.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas próximas</h3>
                          <p className="text-gray-500 mb-4">No hay monitorías programadas para los próximos días</p>
                          <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("availability")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Configurar Disponibilidad
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredUpcomingAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900">{appointment.student.name}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {appointment.student.program}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {appointment.subject} ({appointment.subjectCode})
                                  </p>
                                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{new Date(appointment.date).toLocaleDateString("es-ES")}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        {appointment.time} - {appointment.endTime}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{appointment.location}</span>
                                    </div>
                                  </div>
                                  {appointment.studentNotes && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      <strong>Notas del estudiante:</strong> {appointment.studentNotes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={getStatusColor(appointment.status)}>
                                  {getStatusIcon(appointment.status)}
                                  <span className="ml-1 capitalize">{appointment.status}</span>
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleViewStudentProfile(appointment)}>
                                      <User className="h-4 w-4 mr-2" />
                                      Ver Perfil Estudiante
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddNotes(appointment)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Agregar Notas
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleContactStudent(appointment)}>
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Contactar Estudiante
                                    </DropdownMenuItem>
                                    {appointment.status === "pendiente" && (
                                      <DropdownMenuItem onClick={() => handleConfirmAppointment(appointment)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Confirmar Cita
                                      </DropdownMenuItem>
                                    )}
                                    {appointment.status === "confirmada" && (
                                      <DropdownMenuItem onClick={() => handleCompleteAppointment(appointment)}>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Marcar como Completada
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {completedAppointments.map((appointment) => (
                      <Card key={appointment.id} className="opacity-90">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <img
                                src={appointment.student.photo || "/placeholder.svg"}
                                alt={appointment.student.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900">{appointment.student.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.student.program}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {appointment.subject} ({appointment.subjectCode})
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(appointment.date).toLocaleDateString("es-ES")}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {appointment.time} - {appointment.endTime}
                                    </span>
                                  </div>
                                </div>
                                {appointment.monitorNotes && (
                                  <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded mt-2">
                                    <strong>Tus notas:</strong> {appointment.monitorNotes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="all" className="space-y-4">
                    {appointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <img
                                src={appointment.student.photo || "/placeholder.svg"}
                                alt={appointment.student.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900">{appointment.student.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.student.program}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {appointment.subject} ({appointment.subjectCode})
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(appointment.date).toLocaleDateString("es-ES")}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                      {appointment.time} - {appointment.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusColor(appointment.status)}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1 capitalize">{appointment.status}</span>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Availability Tab */}
            {activeTab === "availability" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Disponibilidad</h2>
                    <p className="text-gray-600">Configura tus horarios disponibles para monitorías</p>
                  </div>
                  <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowAvailabilityDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availabilitySlots.map((slot) => (
                    <Card key={slot.ids.join('-')}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{slot.day}</h3>
                            <p className="text-sm text-gray-600">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <Switch checked={slot.isActive} onCheckedChange={() => {}} />
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{slot.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {slot.subjects.map((subject, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleEditAvailability(slot)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 bg-transparent"
                            onClick={() => handleDeleteAvailability(slot)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
                    <p className="text-gray-600">Analiza tu desempeño como monitor</p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Reporte
                  </Button>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sesiones Completadas</p>
                          {/*<p className="text-2xl font-bold text-gray-900">{monitorData.totalSessions}</p>*/}
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Totales</p>
                          <p className="text-2xl font-bold text-gray-900">{completedAppointments.reduce((sum, apt) => sum + (parseInt(apt.endTime.split(':')[0]) - parseInt(apt.time.split(':')[0])), 0)}</p>
                          
                        </div>
                        <Clock className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estudiantes Únicos</p>
                          <p className="text-2xl font-bold text-gray-900">{new Set(appointments.map(apt => apt.student.name)).size}</p>
                          
                        </div>
                        <Users className="h-8 w-8 text-red-800" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rendimiento Mensual
                    </CardTitle>
                    <CardDescription>Evolución de tus métricas en los últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Gráfico de rendimiento mensual</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Subject Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Distribución por Materia</CardTitle>
                      <CardDescription>Sesiones por asignatura</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {monitorData.subjects.length > 0 ? monitorData.subjects.map((subject, index) => {
                          const count = completedAppointments.filter(apt => apt.subject === subject).length
                          const total = completedAppointments.length
                          const percentage = total > 0 ? (count / total) * 100 : 0
                          return (
                            <div key={subject} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{subject}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div className={index % 2 === 0 ? "bg-red-800" : "bg-amber-600"} style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          )
                        }) : (
                          <p className="text-sm text-gray-500">No hay datos disponibles</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
                  <p className="text-gray-600">Gestiona tu perfil y preferencias como monitor</p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Actualiza tu información de perfil</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input
                              id="firstName"
                              value={monitorData.firstName}
                              onChange={(e) => setMonitorData({ ...monitorData, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input
                              id="lastName"
                              value={monitorData.lastName}
                              onChange={(e) => setMonitorData({ ...monitorData, lastName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={monitorData.email} disabled />
                            <p className="text-xs text-gray-500">El correo institucional no se puede cambiar</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              value={monitorData.phone}
                              onChange={(e) => setMonitorData({ ...monitorData, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Professional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="employeeId">ID de Monitor</Label>
                            <Input id="employeeId" value={monitorData.employeeId} disabled />
                          </div>
                          
                        </div>

                        

                    

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Cambios
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Preferencias de Notificaciones</CardTitle>
                        <CardDescription>Configura cómo quieres recibir notificaciones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Nuevas Citas</Label>
                              <p className="text-sm text-gray-500">Notificaciones cuando se agende una nueva cita</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Recordatorios de Citas</Label>
                              <p className="text-sm text-gray-500">Recordatorios antes de cada monitoría</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Cancelaciones</Label>
                              <p className="text-sm text-gray-500">Cuando un estudiante cancele una cita</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Evaluaciones</Label>
                              <p className="text-sm text-gray-500">Cuando recibas una nueva calificación</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Preferencias
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Seguridad de la Cuenta</CardTitle>
                        <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Cambiar Contraseña
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Add/Edit Availability Dialog */}
      <Dialog open={showAvailabilityDialog} onOpenChange={(open) => {
        setShowAvailabilityDialog(open)
        if (!open) {
          setEditingSlot(null)
          setNewAvailability({
            day: "",
            startTime: "",
            endTime: "",
            location: "",
            subjects: [],
          })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Editar Horario Disponible" : "Agregar Horario Disponible"}</DialogTitle>
            <DialogDescription>
              {editingSlot ? "Modifica la configuración de este horario" : "Configura un nuevo horario para recibir estudiantes"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Día de la Semana</Label>
              <Select
                value={newAvailability.day}
                onValueChange={(value) => setNewAvailability({ ...newAvailability, day: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un día" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunes">Lunes</SelectItem>
                  <SelectItem value="Martes">Martes</SelectItem>
                  <SelectItem value="Miércoles">Miércoles</SelectItem>
                  <SelectItem value="Jueves">Jueves</SelectItem>
                  <SelectItem value="Viernes">Viernes</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hora Inicio</Label>
                <Select
                  value={newAvailability.startTime}
                  onValueChange={(value) => setNewAvailability({ ...newAvailability, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {hour.toString().padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hora Fin</Label>
                <Select
                  value={newAvailability.endTime}
                  onValueChange={(value) => setNewAvailability({ ...newAvailability, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fin" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {hour.toString().padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input
                placeholder="Ej: Aula 205"
                value={newAvailability.location}
                onChange={(e) => setNewAvailability({ ...newAvailability, location: e.target.value })}
              />
            </div>



            <div className="space-y-2">
              <Label>Materias</Label>
              <ScrollArea className="h-32 w-full border rounded-md p-2">
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant={newAvailability.subjects.includes(subject.name) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        newAvailability.subjects.includes(subject.name) ? "bg-red-800 hover:bg-red-900" : "hover:bg-red-50"
                      }`}
                      onClick={() => {
                        const newSubjects = newAvailability.subjects.includes(subject.name)
                          ? newAvailability.subjects.filter((s) => s !== subject.name)
                          : [...newAvailability.subjects, subject.name]
                        setNewAvailability({ ...newAvailability, subjects: newSubjects })
                      }}
                    >
                      {subject.name}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingSlot ? handleSaveEditAvailability : handleAddAvailability}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {editingSlot ? "Guardar Cambios" : "Agregar Horario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Notas de Monitoría</DialogTitle>
            <DialogDescription>
              Registra observaciones sobre la sesión con {selectedAppointment?.student.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas de la Sesión</Label>
              <Textarea
                id="notes"
                placeholder="Describe el progreso del estudiante, temas cubiertos, recomendaciones..."
                value={monitorNotes}
                onChange={(e) => setMonitorNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNotes} className="bg-red-800 hover:bg-red-900">
              Guardar Notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>Ingresa tu contraseña actual y la nueva contraseña</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} className="bg-red-800 hover:bg-red-900">
              Cambiar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
