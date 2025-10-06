"use client"

import { useEffect, useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  BookOpen,
  Bell,
  Plus,
  GraduationCap,
  Home,
  CalendarDays,
  History,
  Settings,
  LogOut,
  User,
  MapPin,
  CheckCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Phone,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageCircle,
  Search,
  Filter,
  XCircle,
  Download,
  BarChart3,
  Award,
  Shield,
  Camera,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"

function AppSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
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
    { title: "Agendar Cita", icon: Plus, value: "booking" },
    { title: "Mis Citas", icon: CalendarDays, value: "appointments" },
    { title: "Historial", icon: History, value: "history" },
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
            <p className="text-xs text-red-100">Estudiante</p>
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

interface Subject {
  id: string
  name: string
  code: string
  credits: number
}

interface Monitor {
  id: string
  name: string
  email: string
  phone: string
  subjects: string[]
  rating: number
  experience: string
  totalSessions: number
  available: boolean
  photo: string
  specialties: string[]
  schedule: { [key: string]: string[] }
}

interface TimeSlot {
  time: string
  available: boolean
  monitorId?: string
}

interface Appointment {
  id: string
  subject: string
  subjectCode: string
  monitor: {
    name: string
    email: string
    phone: string
    rating: number
    photo: string
  }
  date: string
  time: string
  endTime: string
  location: string
  status: "confirmada" | "pendiente" | "cancelada" | "completada"
  details: string
  studentNotes?: string
  monitorNotes?: string
  createdAt: string
  rating?: number
  feedback?: string
  topics?: string[]
  duration?: number
}

/** ========= Estado de datos (LIMPIO, SIN MOCKS) ========= */
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? (window as any).__API_URL__ : "") // fallback opcional

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("home")

  // Booking states
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState("")
  const [studentNotes, setStudentNotes] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Appointments states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // History states
  const [filterSubject, setFilterSubject] = useState("all")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  // Settings states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // User data (estado vacío, se carga desde API)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    studentId: "",
    program: "",
    semester: "",
    bio: "",
    avatar: "/placeholder.svg?height=100&width=100",
  })

  // Cargar info del usuario al entrar a configuración
  useEffect(() => {
    const userId = 1 // Hardcodeado, reemplazar con autenticación real si está disponible
    if (activeTab === "settings" && userId) {
      fetch('/api/usuarios')
        .then(res => res.json())
        .then((users) => {
          const user = users.find((u: any) => u.id === userId)
          if (user) {
            const [firstName, ...lastNameParts] = user.nombre.split(" ")
            setUserData({
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              email: user.email || "",
              phone: "", // No está en el endpoint, se puede dejar vacío o agregar si se extiende el endpoint
              studentId: user.codigo || "",
              program: user.programa || "",
              semester: user.semestre ? user.semestre.toString() : "",
              bio: "", // No está en el endpoint, se puede dejar vacío o agregar si se extiende el endpoint
              avatar: "/placeholder.svg?height=100&width=100",
            })
          }
        })
        .catch((error) => {
          console.error("Error cargando info usuario:", error)
        })
    }
  }, [activeTab])

  const [notifications, setNotifications] = useState({
    emailReminders: false,
    smsReminders: false,
    appointmentConfirmations: false,
    weeklyDigest: false,
    promotions: false,
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    showEmail: false,
    showPhone: false,
    allowDirectMessages: false,
  })

  const [preferences, setPreferences] = useState({
    preferredLanguage: "es",
    timezone: "America/Bogota",
    defaultReminderTime: "30",
    favoriteSubjects: [] as string[],
  })

  // Data (estado vacío, se carga desde API)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [monitors, setMonitors] = useState<Monitor[]>([])

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])

  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([])

  // Cargar datos desde API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar subjects
        const subjectsRes = await fetch(`${API_BASE}/subjects`)
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json()
          setSubjects(subjectsData)
        }

        // Cargar monitors
        const monitorsRes = await fetch(`${API_BASE}/monitors`)
        if (monitorsRes.ok) {
          const monitorsData = await monitorsRes.json()
          setMonitors(monitorsData)
        }

        // Cargar upcoming appointments
        const upcomingRes = await fetch(`${API_BASE}/appointments/upcoming`)
        if (upcomingRes.ok) {
          const upcomingData = await upcomingRes.json()
          setUpcomingAppointments(upcomingData)
        }

        // Cargar history appointments
        const historyRes = await fetch(`${API_BASE}/appointments/history`)
        if (historyRes.ok) {
          const historyData = await historyRes.json()
          setHistoryAppointments(historyData)
        }

        // Cargar user data
        const userRes = await fetch(`${API_BASE}/user/profile`)
        if (userRes.ok) {
          const userData = await userRes.json()
          setUserData(userData)
        }

        // Cargar notifications settings
        const notificationsRes = await fetch(`${API_BASE}/user/notifications`)
        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData)
        }

        // Cargar privacy settings
        const privacyRes = await fetch(`${API_BASE}/user/privacy`)
        if (privacyRes.ok) {
          const privacyData = await privacyRes.json()
          setPrivacy(privacyData)
        }

        // Cargar preferences
        const preferencesRes = await fetch(`${API_BASE}/user/preferences`)
        if (preferencesRes.ok) {
          const preferencesData = await preferencesRes.json()
          setPreferences(preferencesData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    if (API_BASE) {
      loadData()
    }
  }, [])

  // Helper functions
  const getAvailableMonitors = () => {
    if (!selectedSubject) return []
    return monitors.filter((monitor) => monitor.subjects.includes(selectedSubject.id) && monitor.available)
  }

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDate || !selectedSubject) return []

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const dayName = dayNames[selectedDate.getDay()]
    const availableMonitors = getAvailableMonitors()
    const timeSlots: TimeSlot[] = []

    const allTimes = new Set<string>()
    availableMonitors.forEach((monitor) => {
      const schedule = monitor.schedule[dayName] || []
      schedule.forEach((time) => allTimes.add(time))
    })

    Array.from(allTimes)
      .sort()
      .forEach((time) => {
        const availableMonitorsForTime = availableMonitors.filter((monitor) => {
          const schedule = monitor.schedule[dayName] || []
          return schedule.includes(time)
        })

        timeSlots.push({
          time,
          available: availableMonitorsForTime.length > 0,
          monitorId: availableMonitorsForTime[0]?.id,
        })
      })

    return timeSlots
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const isCurrentMonth = date.getMonth() === month
      const isToday = date.getTime() === today.getTime()
      const isPast = date < today
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime()

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isAvailable: isCurrentMonth && !isPast,
      })
    }

    return days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-amber-600 hover:bg-amber-700"
      case "pendiente":
        return "bg-gray-500 hover:bg-gray-600"
      case "cancelada":
        return "bg-red-600 hover:bg-red-700"
      case "completada":
        return "bg-green-600 hover:bg-green-700"
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
      case "cancelada":
        return <XCircle className="h-4 w-4" />
      case "completada":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  // Event handlers
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedSubject !== null
      case 2:
        return selectedDate !== null && selectedTime !== null
      case 3:
        return selectedMonitor !== null
      case 4:
        return appointmentDetails.trim() !== ""
      default:
        return false
    }
  }

  const handleConfirmAppointment = () => {
    setShowConfirmDialog(true)
  }

  const handleFinalConfirmation = () => {
    console.log("Cita confirmada:", {
      subject: selectedSubject,
      date: selectedDate,
      time: selectedTime,
      monitor: selectedMonitor,
      details: appointmentDetails,
      notes: studentNotes,
    })
    setShowConfirmDialog(false)
    resetBookingForm()
    setActiveTab("appointments")
  }

  const resetBookingForm = () => {
    setCurrentStep(1)
    setSelectedSubject(null)
    setSelectedDate(null)
    setSelectedTime(null)
    setSelectedMonitor(null)
    setAppointmentDetails("")
    setStudentNotes("")
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsDialog(true)
  }

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelDialog(true)
  }

  const confirmCancelAppointment = () => {
    console.log("Cancelando cita:", selectedAppointment?.id)
    setShowCancelDialog(false)
    setSelectedAppointment(null)
  }

  const handleRateAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRating(appointment.rating || 0)
    setFeedback(appointment.feedback || "")
    setShowRatingDialog(true)
  }

  const submitRating = () => {
    console.log("Rating submitted:", { appointmentId: selectedAppointment?.id, rating, feedback })
    setShowRatingDialog(false)
    setSelectedAppointment(null)
    setRating(0)
    setFeedback("")
  }

  const handleSaveProfile = () => {
    console.log("Saving profile:", userData)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }
    try {
      const email = userData.email
      const res = await fetch('/api/auth/login', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          currentPassword,
          newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Contraseña cambiada correctamente")
        setShowPasswordDialog(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        alert(data.error || "Error al cambiar la contraseña")
      }
    } catch (error) {
      alert("Error al cambiar la contraseña")
      console.error(error)
    }
  }

  const handleDeleteAccount = () => {
    console.log("Deleting account")
    setShowDeleteDialog(false)
  }

  // Filter functions
  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredHistoryAppointments = historyAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = filterSubject === "all" || appointment.subjectCode === filterSubject
    const matchesPeriod = filterPeriod === "all"
    return matchesSearch && matchesSubject && matchesPeriod
  })

  const stats = {
    totalSessions: historyAppointments.filter((apt) => apt.status === "completada").length,
    totalHours:
      historyAppointments
        .filter((apt) => apt.status === "completada")
        .reduce((sum, apt) => sum + (apt.duration || 0), 0) / 60,
    averageRating:
      historyAppointments.filter((apt) => apt.rating).length > 0
        ? historyAppointments.filter((apt) => apt.rating).reduce((sum, apt) => sum + (apt.rating || 0), 0) /
          historyAppointments.filter((apt) => apt.rating).length
        : 0,
    favoriteSubject: (() => {
      const subjectCounts = historyAppointments.reduce((acc, apt) => {
        acc[apt.subject] = (acc[apt.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.keys(subjectCounts).length > 0
        ? Object.keys(subjectCounts).reduce((a, b) => subjectCounts[a] > subjectCounts[b] ? a : b)
        : "Sin datos";
    })(),
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1 w-full min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {activeTab === "home" && `Bienvenido${userData.firstName ? `, ${userData.firstName} ${userData.lastName}` : ""}`}
                    {activeTab === "booking" && "Agendar Nueva Monitoría"}
                    {activeTab === "appointments" && "Mis Citas"}
                    {activeTab === "history" && "Historial de Monitorías"}
                    {activeTab === "settings" && "Configuración"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {activeTab === "home" && `${userData.program || "Programa no especificado"} - ${userData.semester ? `${userData.semester}to Semestre` : "Semestre no especificado"}`}
                    {activeTab === "booking" && `Paso ${currentStep} de 4 - Completa la información requerida`}
                    {activeTab === "appointments" && "Gestiona tus monitorías programadas"}
                    {activeTab === "history" && "Revisa tu progreso académico y califica tus sesiones"}
                    {activeTab === "settings" && "Gestiona tu perfil y preferencias"}
                  </p>
                </div>
              </div>
              {activeTab === "home" && (
                <Button size="sm" className="bg-red-800 hover:bg-red-900">
                  <Bell className="h-4 w-4 mr-2" />
                  Notificaciones
                </Button>
              )}
              {activeTab === "booking" && (
                <Button variant="outline" size="sm" onClick={resetBookingForm}>
                  Reiniciar
                </Button>
              )}
              {activeTab === "appointments" && (
                <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("booking")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
              )}
              {activeTab === "history" && (
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Historial
                </Button>
              )}
            </div>
          </header>

          {/* Progress Bar for Booking */}
          {activeTab === "booking" && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso</span>
                <span className="text-sm text-gray-500">{currentStep}/4</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-800 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <main className="p-6">
            {/* Home Tab */}
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-l-4 border-l-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Próximas Citas</p>
                          <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-red-800" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Completadas</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Materias Activas</p>
                          <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agendar Nueva Monitoría */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Agendar Nueva Monitoría
                    </CardTitle>
                    <CardDescription>Solicita apoyo académico con nuestros monitores especializados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("booking")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Cita
                    </Button>
                  </CardContent>
                </Card>

                {/* Próximas Citas */}
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
                        <p className="text-gray-500 mb-4">Agenda una nueva monitoría para recibir apoyo académico</p>
                        <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("booking")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Agendar Cita
                        </Button>
                      </div>
                    ) : (
                      upcomingAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <BookOpen className="h-5 w-5 text-red-800" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{appointment.subject}</h4>
                              <p className="text-sm text-gray-600">Monitor: {appointment.monitor.name}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {appointment.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {appointment.time}
                                </span>
                                <span>{appointment.location}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Booking Tab */}
            {activeTab === "booking" && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Form */}
                  <div className="lg:col-span-2">
                    {/* Step 1: Subject Selection */}
                    {currentStep === 1 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Selecciona la Materia
                          </CardTitle>
                          <CardDescription>Elige la asignatura para la cual necesitas apoyo académico</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subjects.map((subject) => (
                              <div
                                key={subject.id}
                                className={`
                                  p-4 border rounded-lg cursor-pointer transition-all duration-200
                                  ${
                                    selectedSubject?.id === subject.id
                                      ? "border-red-800 bg-red-50 ring-2 ring-red-800 ring-opacity-20"
                                      : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                                  }
                                `}
                                onClick={() => setSelectedSubject(subject)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium text-gray-900">{subject.name}</h3>
                                    <p className="text-sm text-gray-600">{subject.code}</p>
                                    <p className="text-xs text-gray-500">{subject.credits} créditos</p>
                                  </div>
                                  {selectedSubject?.id === subject.id && (
                                    <CheckCircle className="h-5 w-5 text-red-800" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {selectedSubject && (
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                Has seleccionado <strong>{selectedSubject.name}</strong>. Hay{" "}
                                {getAvailableMonitors().length} monitores disponibles para esta materia.
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 2: Date and Time Selection */}
                    {currentStep === 2 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Selecciona Fecha y Hora
                          </CardTitle>
                          <CardDescription>Elige el día y horario que mejor se adapte a tu agenda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Calendar */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium text-gray-900">
                                {currentMonth.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                              </h3>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
                                  }
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
                                  }
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                                <div key={day} className="text-xs font-medium text-gray-500 p-2">
                                  {day}
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                              {generateCalendarDays().map((day, index) => (
                                <button
                                  key={index}
                                  className={`
                                    p-2 text-sm rounded-md transition-colors
                                    ${!day.isCurrentMonth ? "text-gray-300" : ""}
                                    ${day.isToday ? "bg-amber-100 text-amber-800 font-medium" : ""}
                                    ${day.isSelected ? "bg-red-800 text-white" : ""}
                                    ${day.isPast ? "text-gray-300 cursor-not-allowed" : ""}
                                    ${
                                      day.isAvailable && !day.isSelected && !day.isToday
                                        ? "hover:bg-red-50 hover:text-red-800"
                                        : ""
                                    }
                                  `}
                                  disabled={!day.isAvailable}
                                  onClick={() => day.isAvailable && setSelectedDate(day.date)}
                                >
                                  {day.day}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Time Slots */}
                          {selectedDate && (
                            <div>
                              <h3 className="font-medium text-gray-900 mb-3">
                                Horarios Disponibles - {selectedDate.toLocaleDateString("es-ES")}
                              </h3>
                              <div className="grid grid-cols-4 gap-2">
                                {getAvailableTimeSlots().map((slot) => (
                                  <button
                                    key={slot.time}
                                    className={`
                                      p-3 text-sm rounded-md border transition-colors
                                      ${
                                        selectedTime === slot.time
                                          ? "border-red-800 bg-red-800 text-white"
                                          : slot.available
                                            ? "border-gray-200 hover:border-red-800 hover:bg-red-50"
                                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                      }
                                    `}
                                    disabled={!slot.available}
                                    onClick={() => slot.available && setSelectedTime(slot.time)}
                                  >
                                    {slot.time}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 3: Monitor Selection */}
                    {currentStep === 3 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Selecciona un Monitor
                          </CardTitle>
                          <CardDescription>Elige el monitor que mejor se adapte a tus necesidades</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {getAvailableMonitors().map((monitor) => (
                            <div
                              key={monitor.id}
                              className={`
                                p-4 border rounded-lg cursor-pointer transition-all duration-200
                                ${
                                  selectedMonitor?.id === monitor.id
                                    ? "border-red-800 bg-red-50 ring-2 ring-red-800 ring-opacity-20"
                                    : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                                }
                              `}
                              onClick={() => setSelectedMonitor(monitor)}
                            >
                              <div className="flex items-start gap-4">
                                <img
                                  src={monitor.photo || "/placeholder.svg"}
                                  alt={monitor.name}
                                  className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h3 className="font-medium text-gray-900">{monitor.name}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex items-center gap-1">
                                          <Star className="h-4 w-4 text-amber-500 fill-current" />
                                          <span className="text-sm text-gray-600">{monitor.rating}</span>
                                        </div>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{monitor.experience}</span>
                                        <span className="text-sm text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{monitor.totalSessions} sesiones</span>
                                      </div>
                                    </div>
                                    {selectedMonitor?.id === monitor.id && (
                                      <CheckCircle className="h-5 w-5 text-red-800" />
                                    )}
                                  </div>

                                  <div className="mt-2">
                                    <p className="text-sm text-gray-600 mb-2">Especialidades:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {monitor.specialties.map((specialty) => (
                                        <Badge key={specialty} variant="secondary" className="text-xs">
                                          {specialty}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{monitor.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{monitor.phone}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Step 4: Additional Details */}
                    {currentStep === 4 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Detalles de la Monitoría
                          </CardTitle>
                          <CardDescription>
                            Proporciona información específica sobre los temas que necesitas repasar
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="details">Temas específicos a tratar *</Label>
                            <Textarea
                              id="details"
                              placeholder="Describe los temas específicos que necesitas repasar, las dificultades que tienes, o los ejercicios en los que necesitas ayuda..."
                              className="min-h-[120px]"
                              value={appointmentDetails}
                              onChange={(e) => setAppointmentDetails(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                            <Textarea
                              id="notes"
                              placeholder="Cualquier información adicional que consideres importante para el monitor..."
                              className="min-h-[80px]"
                              value={studentNotes}
                              onChange={(e) => setStudentNotes(e.target.value)}
                            />
                          </div>

                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Recuerda traer tus materiales de estudio, cuadernos y cualquier ejercicio específico que
                              quieras revisar durante la monitoría.
                            </AlertDescription>
                          </Alert>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Summary Sidebar */}
                  <div className="space-y-6">
                    <Card className="sticky top-6">
                      <CardHeader>
                        <CardTitle>Resumen de la Cita</CardTitle>
                        <CardDescription>Revisa los detalles antes de confirmar</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedSubject && (
                          <div className="flex items-center gap-3 text-sm">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{selectedSubject.name}</p>
                              <p className="text-gray-500">{selectedSubject.code}</p>
                            </div>
                          </div>
                        )}

                        {selectedDate && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>
                              {selectedDate.toLocaleDateString("es-ES", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {selectedTime && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              {selectedTime} -{" "}
                              {String(Number.parseInt(selectedTime.split(":")[0]) + 1).padStart(2, "0")}
                              :00
                            </span>
                          </div>
                        )}

                        {selectedMonitor && (
                          <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{selectedMonitor.name}</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-500 fill-current" />
                                <span className="text-gray-500">{selectedMonitor.rating}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>Aula por asignar</span>
                        </div>

                        {currentStep === 4 && (
                          <div className="border-t pt-4">
                            <Button
                              className="w-full bg-red-800 hover:bg-red-900"
                              onClick={handleConfirmAppointment}
                              disabled={!canProceedToNextStep()}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Cita
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    {currentStep < 4 && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={prevStep}
                              disabled={currentStep === 1}
                              className="flex-1 bg-transparent"
                            >
                              Anterior
                            </Button>
                            <Button
                              onClick={nextStep}
                              disabled={!canProceedToNextStep()}
                              className="flex-1 bg-red-800 hover:bg-red-900"
                            >
                              Siguiente
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por materia o monitor..."
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

                {/* Tabs */}
                <Tabs defaultValue="upcoming" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="upcoming">Próximas ({filteredUpcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Anteriores (0)</TabsTrigger>
                  </TabsList>

                  {/* Upcoming Appointments */}
                  <TabsContent value="upcoming" className="space-y-4">
                    {filteredUpcomingAppointments.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas próximas</h3>
                          <p className="text-gray-500 mb-4">Agenda una nueva monitoría para recibir apoyo académico</p>
                          <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("booking")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agendar Cita
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredUpcomingAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <img
                                  src={appointment.monitor.photo || "/placeholder.svg"}
                                  alt={appointment.monitor.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-medium text-gray-900">{appointment.subject}</h3>
                                    <Badge variant="outline" className="text-xs">
                                      {appointment.subjectCode}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">Monitor: {appointment.monitor.name}</p>
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
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      <span>{appointment.location}</span>
                                    </div>
                                  </div>
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
                                    <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                                      <BookOpen className="h-4 w-4 mr-2" />
                                      Ver Detalles
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <MessageCircle className="h-4 w-4 mr-2" />
                                      Contactar Monitor
                                    </DropdownMenuItem>
                                    {appointment.status !== "completada" && (
                                      <>
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Modificar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-red-600"
                                          onClick={() => handleCancelAppointment(appointment)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Cancelar
                                        </DropdownMenuItem>
                                      </>
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

                  {/* Past Appointments */}
                  <TabsContent value="past" className="space-y-4">
                    <Card>
                      <CardContent className="p-8 text-center">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas anteriores</h3>
                        <p className="text-gray-500">Tus monitorías completadas aparecerán aquí</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sesiones Completadas</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Totales</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Calificación Promedio</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                        </div>
                        <Star className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Materia Favorita</p>
                          <p className="text-lg font-bold text-gray-900">{stats.favoriteSubject}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-red-800" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar por materia o monitor..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={filterSubject} onValueChange={setFilterSubject}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por materia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las materias</SelectItem>
                          <SelectItem value="MAT101">Cálculo Diferencial</SelectItem>
                          <SelectItem value="FIS101">Física I</SelectItem>
                          <SelectItem value="SIS101">Programación I</SelectItem>
                          <SelectItem value="MAT201">Álgebra Lineal</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Filtrar por período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todo el tiempo</SelectItem>
                          <SelectItem value="this_month">Este mes</SelectItem>
                          <SelectItem value="last_month">Mes pasado</SelectItem>
                          <SelectItem value="this_semester">Este semestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* History List */}
                <div className="space-y-4">
                  {filteredHistoryAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                        <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredHistoryAppointments.map((appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <img
                                src={appointment.monitor.photo || "/placeholder.svg"}
                                alt={appointment.monitor.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-gray-900">{appointment.subject}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {appointment.subjectCode}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">Monitor: {appointment.monitor.name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(appointment.date).toLocaleDateString("es-ES")}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{appointment.time}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>{appointment.duration} min</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {appointment.topics?.map((topic, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(appointment.status)}>
                                {appointment.status === "completada" ? "Completada" : appointment.status}
                              </Badge>
                              {appointment.status === "completada" && (
                                <div className="flex items-center gap-1">
                                  {appointment.rating ? (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                                      <span className="text-sm text-gray-600">{appointment.rating}</span>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRateAppointment(appointment)}
                                    >
                                      <Star className="h-4 w-4 mr-1" />
                                      Calificar
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {appointment.feedback && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Tu comentario:</strong> {appointment.feedback}
                              </p>
                            </div>
                          )}

                          {appointment.monitorNotes && (
                            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Notas del monitor:</strong> {appointment.monitorNotes}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="privacy">Privacidad</TabsTrigger>
                    <TabsTrigger value="preferences">Preferencias</TabsTrigger>
                  </TabsList>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Actualiza tu información de perfil y datos académicos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        

                        {/* Personal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input
                              id="firstName"
                              value={userData.firstName}
                              onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input
                              id="lastName"
                              value={userData.lastName}
                              onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={userData.email} disabled />
                            <p className="text-xs text-gray-500">El correo institucional no se puede cambiar</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                              id="phone"
                              value={userData.phone}
                              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Academic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Código Estudiantil</Label>
                            <Input id="studentId" value={userData.studentId} readOnly />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="program">Programa Académico</Label>
                            <Input id="program" value={userData.program} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="semester">Semestre Actual</Label>
                            <Select
                              value={userData.semester}
                              onValueChange={(value) => setUserData({ ...userData, semester: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sem) => (
                                  <SelectItem key={sem} value={sem.toString()}>
                                    {sem}° Semestre
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        

                        

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Cambiar Contraseña
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Preferencias de Notificaciones</CardTitle>
                        <CardDescription>Configura cómo y cuándo quieres recibir notificaciones</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Recordatorios por Email</Label>
                              <p className="text-sm text-gray-500">
                                Recibe recordatorios de citas por correo electrónico
                              </p>
                            </div>
                            <Switch
                              checked={notifications.emailReminders}
                              onCheckedChange={(checked) =>
                                setNotifications({ ...notifications, emailReminders: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Recordatorios por SMS</Label>
                              <p className="text-sm text-gray-500">
                                Recibe recordatorios de citas por mensaje de texto
                              </p>
                            </div>
                            <Switch
                              checked={notifications.smsReminders}
                              onCheckedChange={(checked) =>
                                setNotifications({ ...notifications, smsReminders: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Confirmaciones de Citas</Label>
                              <p className="text-sm text-gray-500">
                                Notificaciones cuando se confirme o cancele una cita
                              </p>
                            </div>
                            <Switch
                              checked={notifications.appointmentConfirmations}
                              onCheckedChange={(checked) =>
                                setNotifications({ ...notifications, appointmentConfirmations: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Resumen Semanal</Label>
                              <p className="text-sm text-gray-500">Recibe un resumen de tus actividades cada semana</p>
                            </div>
                            <Switch
                              checked={notifications.weeklyDigest}
                              onCheckedChange={(checked) =>
                                setNotifications({ ...notifications, weeklyDigest: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Promociones y Eventos</Label>
                              <p className="text-sm text-gray-500">
                                Información sobre eventos académicos y promociones
                              </p>
                            </div>
                            <Switch
                              checked={notifications.promotions}
                              onCheckedChange={(checked) => setNotifications({ ...notifications, promotions: checked })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Tiempo de Recordatorio</Label>
                          <Select
                            value={preferences.defaultReminderTime}
                            onValueChange={(value) => setPreferences({ ...preferences, defaultReminderTime: value })}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutos antes</SelectItem>
                              <SelectItem value="30">30 minutos antes</SelectItem>
                              <SelectItem value="60">1 hora antes</SelectItem>
                              <SelectItem value="120">2 horas antes</SelectItem>
                              <SelectItem value="1440">1 día antes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Preferencias
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Privacy Tab */}
                  <TabsContent value="privacy" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configuración de Privacidad</CardTitle>
                        <CardDescription>Controla quién puede ver tu información y contactarte</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Visibilidad del Perfil</Label>
                            <Select
                              value={privacy.profileVisibility}
                              onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="public">Público - Visible para todos</SelectItem>
                                <SelectItem value="students">
                                  Solo Estudiantes - Visible para otros estudiantes
                                </SelectItem>
                                <SelectItem value="private">Privado - Solo visible para monitores asignados</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Mostrar Email en Perfil</Label>
                              <p className="text-sm text-gray-500">Permite que otros vean tu correo electrónico</p>
                            </div>
                            <Switch
                              checked={privacy.showEmail}
                              onCheckedChange={(checked) => setPrivacy({ ...privacy, showEmail: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Mostrar Teléfono en Perfil</Label>
                              <p className="text-sm text-gray-500">Permite que otros vean tu número de teléfono</p>
                            </div>
                            <Switch
                              checked={privacy.showPhone}
                              onCheckedChange={(checked) => setPrivacy({ ...privacy, showPhone: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Permitir Mensajes Directos</Label>
                              <p className="text-sm text-gray-500">Permite que monitores te envíen mensajes directos</p>
                            </div>
                            <Switch
                              checked={privacy.allowDirectMessages}
                              onCheckedChange={(checked) => setPrivacy({ ...privacy, allowDirectMessages: checked })}
                            />
                          </div>
                        </div>

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Configuración
                        </Button>
                      </CardContent>
                    </Card>

                    
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Preferencias Generales</CardTitle>
                        <CardDescription>Personaliza tu experiencia en la plataforma</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Idioma</Label>
                            <Select
                              value={preferences.preferredLanguage}
                              onValueChange={(value) => setPreferences({ ...preferences, preferredLanguage: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Zona Horaria</Label>
                            <Select
                              value={preferences.timezone}
                              onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                                <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                                <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Preferencias
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Estadísticas de Uso</CardTitle>
                        <CardDescription>Tu actividad en la plataforma</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <CalendarDays className="h-8 w-8 text-red-800 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                            <p className="text-sm text-gray-600">Citas Completadas</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
                            <p className="text-sm text-gray-600">Horas de Monitoría</p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <BookOpen className="h-8 w-8 text-red-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-gray-900">{new Set(historyAppointments.map(apt => apt.subject)).size}</p>
                            <p className="text-sm text-gray-600">Materias Diferentes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Cita de Monitoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas agendar esta cita? Se enviará una confirmación por correo electrónico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="text-sm">
              <strong>Materia:</strong> {selectedSubject?.name}
            </div>
            <div className="text-sm">
              <strong>Fecha:</strong> {selectedDate?.toLocaleDateString("es-ES")}
            </div>
            <div className="text-sm">
              <strong>Hora:</strong> {selectedTime}
            </div>
            <div className="text-sm">
              <strong>Monitor:</strong> {selectedMonitor?.name}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFinalConfirmation} className="bg-red-800 hover:bg-red-900">
              Confirmar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Cita</DialogTitle>
            <DialogDescription>Información completa de tu monitoría</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Monitor Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={selectedAppointment.monitor.photo || "/placeholder.svg"}
                  alt={selectedAppointment.monitor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedAppointment.monitor.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="text-sm text-gray-600">{selectedAppointment.monitor.rating}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{selectedAppointment.monitor.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{selectedAppointment.monitor.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Materia</label>
                  <p className="text-sm text-gray-900">
                    {selectedAppointment.subject} ({selectedAppointment.subjectCode})
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fecha</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedAppointment.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Horario</label>
                  <p className="text-sm text-gray-900">
                    {selectedAppointment.time} - {selectedAppointment.endTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ubicación</label>
                  <p className="text-sm text-gray-900">{selectedAppointment.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Creada</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedAppointment.createdAt).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              {/* Topics */}
              <div>
                <label className="text-sm font-medium text-gray-700">Temas a tratar</label>
                <p className="text-sm text-gray-900 mt-1">{selectedAppointment.details}</p>
              </div>

              {/* Student Notes */}
              {selectedAppointment.studentNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Tus notas</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAppointment.studentNotes}</p>
                </div>
              )}

              {/* Monitor Notes */}
              {selectedAppointment.monitorNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notas del monitor</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedAppointment.monitorNotes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cerrar
            </Button>
            {selectedAppointment?.status !== "completada" && (
              <Button className="bg-red-800 hover:bg-red-900">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Monitor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="py-4">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Materia:</strong> {selectedAppointment.subject}
                </p>
                <p>
                  <strong>Monitor:</strong> {selectedAppointment.monitor.name}
                </p>
                <p>
                  <strong>Fecha:</strong> {new Date(selectedAppointment.date).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Hora:</strong> {selectedAppointment.time}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Mantener Cita
            </Button>
            <Button variant="destructive" onClick={confirmCancelAppointment}>
              Cancelar Cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Calificar Monitoría</DialogTitle>
            <DialogDescription>Comparte tu experiencia para ayudar a otros estudiantes</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-gray-900">{selectedAppointment.subject}</h3>
                <p className="text-sm text-gray-600">con {selectedAppointment.monitor.name}</p>
              </div>

              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? "text-amber-500" : "text-gray-300"}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Comentarios (opcional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="Comparte tu experiencia con esta monitoría..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={submitRating} disabled={rating === 0} className="bg-red-800 hover:bg-red-900">
              Enviar Calificación
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

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Eliminar Cuenta</DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. Se eliminarán todos tus datos, historial de citas y configuraciones.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Para confirmar la eliminación de tu cuenta, escribe <strong>"ELIMINAR"</strong> en el campo de abajo:
            </p>
            <Input placeholder="Escribe ELIMINAR para confirmar" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Eliminar Cuenta Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

