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
    { title: "Notificaciones", icon: Bell, value: "notifications" },
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
  endTime?: string
  available: boolean
  monitorId?: string
  slotId?: string
  monitorName?: string
  location?: string
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
  disponibilidad_id?: string
}

interface Notification {
  id: string
  type: "appointment_reminder" | "appointment_confirmed" | "appointment_cancelled" | "appointment_completed" | "system" | "monitor_message"
  title: string
  message: string
  date: string
  read: boolean
  appointmentId?: string
  actionUrl?: string
}

/** ========= Estado de datos (LIMPIO, SIN MOCKS) ========= */
const API_BASE = "/api"

export default function StudentDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")

  // User authentication
  const [userId, setUserId] = useState<number | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Booking states (single step)
  const [searchSubject, setSearchSubject] = useState("")
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [disponibilidadesMateria, setDisponibilidadesMateria] = useState<any[]>([])
  const [selectedDisp, setSelectedDisp] = useState<{
    id: string;
    dia: 'lunes'|'martes'|'miercoles'|'jueves'|'viernes'|'sabado'|'domingo';
    hora_inicio: string;
    hora_fin: string;
    ubicacion?: string | null;
    monitor: { id: string; nombre: string; email?: string };
    materia: { id: string; nombre: string; codigo: string };
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Appointments states
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [newDate, setNewDate] = useState<Date | null>(null)
  const [isLoadingModify, setIsLoadingModify] = useState(false)
  const [modifyDia, setModifyDia] = useState<string | null>(null)
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

  // estados
const [user, setUser] = useState<any | null>(null);
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
});

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setCurrentUser(parsedUser)
      setUserId(parsedUser.id)
    } else {
      router.push("/login-dashboard")
    }
  }, [router])

  // Cargar info del usuario al entrar a configuración
  useEffect(() => {
    if (activeTab === "settings" && userId) {
      fetch('/api/usuarios')
        .then(res => res.json())
        .then((users) => {
          const fullUser = users.find((u: any) => u.id === userId)
          if (fullUser) {
            const [firstName, ...lastNameParts] = fullUser.nombre.split(" ")
            setUserData({
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              email: fullUser.email || "",
              phone: "", // No está en el endpoint, se puede dejar vacío o agregar si se extiende el endpoint
              studentId: fullUser.codigo || "",
              program: fullUser.programa || "",
              semester: fullUser.semestre ? fullUser.semestre.toString() : "",
              bio: "", // No está en el endpoint, se puede dejar vacío o agregar si se extiende el endpoint
              avatar: "/placeholder.svg?height=100&width=100",
            })
          }
        })
        .catch((error) => {
          console.error("Error cargando info usuario:", error)
        })
    }
  }, [activeTab, userId])

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
  const [subjectMonitorMap, setSubjectMonitorMap] = useState(new Map<string, Set<string>>())

  const [monitors, setMonitors] = useState<Monitor[]>([])

  const [availableSlots, setAvailableSlots] = useState<any[]>([])

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])

  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([])

  const [userNotifications, setUserNotifications] = useState<Notification[]>([])

  // Debounced search for subjects
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchSubject.length >= 2) {
        // Try API search first
        try {
          const searchRes = await fetch(`${API_BASE}/materias?search=${encodeURIComponent(searchSubject)}`)
          if (searchRes.ok) {
            const searchData = await searchRes.json()
            const filtered = searchData.map((subject: any) => ({
              id: subject.id.toString(),
              name: subject.name,
              code: subject.code,
              credits: subject.credits
            }))
            setFilteredSubjects(filtered)
          } else {
            throw new Error('API search not available')
          }
        } catch (error) {
          // Fallback to local filtering
          const filtered = subjects.filter(subject =>
            subject.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchSubject.toLowerCase())
          )
          setFilteredSubjects(filtered)
        }
      } else {
        setFilteredSubjects([])
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchSubject, subjects, API_BASE])

  // Load availabilities when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      const loadDisponibilidades = async () => {
        const dispRes = await fetch(`${API_BASE}/disponibilidades?materia_id=${selectedSubject.id}&estado=Activa`)
        if (dispRes.ok) {
          const dispData = await dispRes.json()
          const mappedDisp = dispData.data.map((d: any) => ({
            id: String(d.id),
            dia: d.dia,
            hora_inicio: d.hora_inicio.substring(0,5),
            hora_fin: d.hora_fin.substring(0,5),
            ubicacion: d.ubicacion || null,
            monitor: { id: String(d.monitor.id), nombre: d.monitor.nombre_completo, email: d.monitor.correo },
            materia: { id: String(d.materia.id), nombre: d.materia.nombre, codigo: d.materia.codigo }
          }))
          setDisponibilidadesMateria(mappedDisp)
        }
      }
      loadDisponibilidades()
    } else {
      setDisponibilidadesMateria([])
    }
    // Clear selection when subject changes
    setSelectedDisp(null)
    setSelectedDate(null)
  }, [selectedSubject, API_BASE])

  // Cargar datos desde API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar subjects
        const subjectsRes = await fetch(`${API_BASE}/materias`)
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json()
          const allSubjects = subjectsData.map((subject: any) => ({
            id: subject.id.toString(),
            name: subject.name,
            code: subject.code,
            credits: subject.credits
          }))

          // Cargar todas las disponbilidades para saber qué materias tienen monitores
          const allDisponibilidadesRes = await fetch(`${API_BASE}/disponibilidades`)
          if (allDisponibilidadesRes.ok) {
            const dispData = await allDisponibilidadesRes.json()
            const subjectMonitorMap = new Map<string, Set<string>>()
            dispData.data.forEach((disp: any) => {
              const subjectId = disp.materia.id.toString()
              const monitorName = disp.monitor.nombre_completo
              if (!subjectMonitorMap.has(subjectId)) {
                subjectMonitorMap.set(subjectId, new Set())
              }
              subjectMonitorMap.get(subjectId)!.add(monitorName)
            })

            // Filtrar materias que tienen monitores disponibles
            const availableSubjects = allSubjects.filter((subject: Subject) => subjectMonitorMap.has(subject.id))
            setSubjects(availableSubjects)
            setSubjectMonitorMap(subjectMonitorMap)
          } else {
            setSubjects(allSubjects)
          }
        }

        // Cargar monitors
        const monitorsRes = await fetch(`${API_BASE}/monitors`)
        if (monitorsRes.ok) {
          const monitorsData = await monitorsRes.json()
          setMonitors(monitorsData)
        }

        // Cargar available slots (initially empty, will be loaded when subject is selected)
        setAvailableSlots([])

        // Cargar appointments
        if (userId) {
          const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`)
          if (appointmentsRes.ok) {
            const data = await appointmentsRes.json()
            const appointments = data.data.map((cita: any) => ({
              id: cita.id.toString(),
              subject: cita.materia.nombre,
              subjectCode: cita.materia.codigo,
              monitor: {
                name: cita.monitor.nombre_completo,
                email: cita.monitor.correo,
                phone: '',
                rating: 0,
                photo: '',
              },
              date: cita.fecha_cita,
              time: cita.hora_inicio,
              endTime: cita.hora_fin,
              location: cita.ubicacion || '',
              status: cita.estado,
              details: '',
              studentNotes: '',
              monitorNotes: '',
              createdAt: '',
              rating: 0,
              feedback: '',
              topics: [],
              duration: calculateDuration(cita.hora_inicio, cita.hora_fin),
              disponibilidad_id: cita.disponibilidad_id?.toString()
            }))
            // Filtrar por fecha: upcoming = futuras y no completadas, history = pasadas o completadas
            const upcoming = appointments.filter((a: any) => !isPastAppointment(a) && a.status !== 'completada')
            const history = appointments.filter((a: any) => isPastAppointment(a) || a.status === 'completada')

            setUpcomingAppointments(upcoming)
            setHistoryAppointments(history)
          }
        }

        // Cargar user data
        if (userId) {
          const userRes = await fetch(`${API_BASE}/usuarios`)
          if (userRes.ok) {
            const users = await userRes.json()
            const fullUser = users.find((u: any) => u.id === userId)
            if (fullUser) {
              setCurrentUser(fullUser) // Update user with full data
              // Update localStorage with full user data including roles
              localStorage.setItem("user", JSON.stringify(fullUser))
              const [firstName, ...lastNameParts] = fullUser.nombre.split(" ")
              setUserData({
                firstName: firstName || "",
                lastName: lastNameParts.join(" ") || "",
                email: fullUser.email || "",
                phone: "",
                studentId: fullUser.codigo || "",
                program: fullUser.programa || "",
                semester: fullUser.semestre ? fullUser.semestre.toString() : "",
                bio: "",
                avatar: "/placeholder.svg?height=100&width=100",
              })
            }
          }
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

        // Cargar notifications (mock data por ahora)
        const mockNotifications: Notification[] = [
          {
            id: "1",
            type: "appointment_reminder",
            title: "Recordatorio de cita",
            message: "Tienes una monitoría programada para mañana a las 10:00 AM",
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
            read: false,
            appointmentId: "1"
          },
          {
            id: "2",
            type: "appointment_confirmed",
            title: "Cita confirmada",
            message: "Tu cita de Cálculo Diferencial ha sido confirmada por el monitor",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
            read: true,
            appointmentId: "2"
          },
          {
            id: "3",
            type: "system",
            title: "Bienvenido al sistema",
            message: "¡Bienvenido a Monitorías UCP! Explora las funcionalidades disponibles.",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 semana atrás
            read: true
          }
        ]
        setUserNotifications(mockNotifications)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    if (API_BASE && userId) {
      loadData()
    }
  }, [userId])

  // Helper functions
  const getAvailableMonitors = () => {
    if (!selectedSubject) return []
    return monitors.filter((monitor) => monitor.subjects.includes(selectedSubject.id) && monitor.available)
  }

  const weekdayToIndex: Record<string, number> = {
    domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6
  }

  const getSingleTimeSlot = (): TimeSlot[] => {
    if (!selectedDate || !selectedDisp) return []

    return [{
      time: selectedDisp.hora_inicio,
      endTime: selectedDisp.hora_fin,
      available: true,
      monitorId: selectedDisp.monitor.id,
      slotId: selectedDisp.id,
      monitorName: selectedDisp.monitor.nombre
    }]
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

    // If selectedDisp exists, only mark days matching the dia as available
    const isAvailable = selectedDisp
      ? isCurrentMonth && !isPast && date.getDay() === (typeof selectedDisp.dia === 'string' ? weekdayToIndex[selectedDisp.dia.toLowerCase()] : selectedDisp.dia)
      : isCurrentMonth && !isPast

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isSelected,
        isAvailable,
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

  const canBookAppointment = () => {
    return selectedSubject !== null && selectedDisp !== null && selectedDate !== null
  }

  const handleBookAppointment = async () => {
    if (!selectedDisp || !userId || !selectedDate) return

    try {
      const requestData = {
        estudiante_id: userId,
        disponibilidad_id: selectedDisp.id,
        fecha_cita: selectedDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      }
      console.log("Sending booking request:", requestData)

      const res = await fetch(`${API_BASE}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      const responseData = await res.json()
      console.log("Booking response:", res.status, responseData)

      if (res.ok && responseData.ok) {
        resetBookingForm()
        setActiveTab("appointments")
        // Reload appointments
        const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`)
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json()
          const appointments = data.data.map((cita: any) => ({
            id: cita.id.toString(),
            subject: cita.materia.nombre,
            subjectCode: cita.materia.codigo,
            monitor: {
              name: cita.monitor.nombre_completo,
              email: cita.monitor.correo,
              phone: '',
              rating: 0,
              photo: '',
            },
            date: cita.fecha_cita,
            time: cita.hora_inicio,
            endTime: cita.hora_fin,
            location: cita.ubicacion || '',
            status: cita.estado,
            details: '',
            studentNotes: '',
            monitorNotes: '',
            createdAt: '',
            rating: 0,
            feedback: '',
            topics: [],
            duration: calculateDuration(cita.hora_inicio, cita.hora_fin)
          }))

          // Apply date-based filtering
          const upcoming = appointments.filter((a: any) => !isPastAppointment(a) && a.status !== 'completada')
          const history = appointments.filter((a: any) => isPastAppointment(a) || a.status === 'completada')

          setUpcomingAppointments(upcoming)
          setHistoryAppointments(history)
        }
      } else {
        console.error("Error booking appointment:", responseData)
        alert(`Error al agendar la cita: ${responseData.msg || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Error al agendar la cita")
    }
  }



  const resetBookingForm = () => {
    setSearchSubject("")
    setFilteredSubjects([])
    setSelectedSubject(null)
    setDisponibilidadesMateria([])
    setSelectedDisp(null)
    setSelectedDate(null)
  }

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailsDialog(true)
  }

  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      const res = await fetch(`${API_BASE}/citas/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelada' })
      })

      if (res.ok) {
        // Update local state
        setUpcomingAppointments(prev =>
          prev.map(apt =>
            apt.id === appointment.id
              ? { ...apt, status: 'cancelada' as const }
              : apt
          )
        )

        // Reload appointments from API
        const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`)
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json()
          const appointments = data.data.map((cita: any) => ({
            id: cita.id.toString(),
            subject: cita.materia.nombre,
            subjectCode: cita.materia.codigo,
            monitor: {
              name: cita.monitor.nombre_completo,
              email: cita.monitor.correo,
              phone: '',
              rating: 0,
              photo: '',
            },
            date: cita.fecha_cita,
            time: cita.hora_inicio,
            endTime: cita.hora_fin,
            location: cita.ubicacion || '',
            status: cita.estado,
            details: '',
            studentNotes: '',
            monitorNotes: '',
            createdAt: '',
            rating: 0,
            feedback: '',
            topics: [],
            duration: calculateDuration(cita.hora_inicio, cita.hora_fin)
          }))

          // Apply date-based filtering
          const upcoming = appointments.filter((a: any) => !isPastAppointment(a) && a.status !== 'completada')
          const history = appointments.filter((a: any) => isPastAppointment(a) || a.status === 'completada')

            setUpcomingAppointments(upcoming)
            setHistoryAppointments(history)
          }

          alert("Cita cancelada exitosamente")
        } else {
        console.error("Error canceling appointment:", res.status)
        alert("Error al cancelar la cita")
      }
    } catch (error) {
      console.error("Error canceling appointment:", error)
      alert("Error al cancelar la cita")
    }
  }

  const handleRateAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setRating(appointment.rating || 0)
    setFeedback(appointment.feedback || "")
    setShowRatingDialog(true)
  }

  const handleModifyAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewDate(new Date(appointment.date))
    setModifyDia(appointment.disponibilidad_id ? null : null) // We'll need to fetch the dia if needed
    setShowModifyDialog(true)

    // If we have disponibilidad_id, fetch the dia for validation
    if (appointment.disponibilidad_id) {
      try {
        const dispRes = await fetch(`${API_BASE}/disponibilidades/${appointment.disponibilidad_id}`)
        if (dispRes.ok) {
          const dispData = await dispRes.json()
          setModifyDia(dispData.dia)
        }
      } catch (error) {
        console.error("Error fetching disponibilidad:", error)
      }
    } else {
      // If no disponibilidad_id, we might need to infer from the appointment data
      // For now, allow all days
      setModifyDia(null)
    }
  }

  const handleSaveModifiedAppointment = async () => {
    if (!selectedAppointment || !newDate || !userId) return

    const originalDate = new Date(selectedAppointment.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Validations
    if (newDate < today) {
      alert("No se puede seleccionar una fecha anterior a hoy.")
      return
    }

    if (newDate.getTime() === originalDate.getTime()) {
      alert("La nueva fecha debe ser diferente a la fecha actual.")
      return
    }

    // Check for conflicts with other appointments
    const allAppointments = [...upcomingAppointments, ...historyAppointments]
    const hasConflict = allAppointments.some(apt =>
      apt.id !== selectedAppointment.id &&
      apt.date === newDate.toISOString().split('T')[0] &&
      apt.time === selectedAppointment.time &&
      apt.monitor.name === selectedAppointment.monitor.name
    )

    if (hasConflict) {
      alert("Ya tienes una cita programada para esa fecha y hora con el mismo monitor.")
      return
    }

    setIsLoadingModify(true)

    try {
      let payload: any = { fecha_cita: newDate.toISOString().split('T')[0] }

      // If we need to find a new disponibilidad_id (only if modifyDia is set)
      if (modifyDia) {
        // First, get monitor ID from email or name
        let monitorId = selectedAppointment.monitor.email // Assuming email is used as ID
        const monRes = await fetch(`${API_BASE}/monitors`)
        if (monRes.ok) {
          const monitors = await monRes.json()
          const monitor = monitors.find((m: any) => m.correo === selectedAppointment.monitor.email)
          if (monitor) monitorId = monitor.id
        }

        const dispRes = await fetch(`${API_BASE}/disponibilidades?monitor_id=${monitorId}&materia_id=${selectedAppointment.subjectCode}&dia=${modifyDia}&hora_inicio=${selectedAppointment.time}&hora_fin=${selectedAppointment.endTime}&estado=Activa`)
        if (dispRes.ok) {
          const dispData = await dispRes.json()
          const availableDisp = dispData.data.find((d: any) => {
            // Check if the date matches the selected day of week
            const selectedDayIndex = newDate.getDay()
            const weekdayMap: { [key: string]: number } = {
              'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6
            }
            return weekdayMap[d.dia.toLowerCase()] === selectedDayIndex
          })
          if (availableDisp) {
            payload.disponibilidad_id = availableDisp.id
          } else {
            alert("No hay disponibilidad para esa fecha.")
            setIsLoadingModify(false)
            return
          }
        }
      }

      const res = await fetch(`${API_BASE}/citas/${selectedAppointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const responseData = await res.json()

      if (res.ok) {
        // Update local state with the response data
        const updatedAppointment = {
          ...selectedAppointment,
          date: responseData.data.fecha_cita,
          status: responseData.data.estado || selectedAppointment.status,
          location: responseData.data.ubicacion || selectedAppointment.location
        }

        // Recalculate lists
        const allAppointmentsFiltered = [...upcomingAppointments, ...historyAppointments].filter(a => a.id !== selectedAppointment.id)
        allAppointmentsFiltered.push(updatedAppointment)

        const upcoming = allAppointmentsFiltered.filter((a: any) => !isPastAppointment(a) && a.status !== 'completada')
        const history = allAppointmentsFiltered.filter((a: any) => isPastAppointment(a) || a.status === 'completada')

        setUpcomingAppointments(upcoming)
        setHistoryAppointments(history)

        setShowModifyDialog(false)
        setSelectedAppointment(null)
        setNewDate(null)
        setModifyDia(null)
        alert(responseData.msg || "Fecha de la cita modificada exitosamente.")
      } else {
        alert(responseData.msg || 'Error al modificar la cita')
      }
    } catch (error) {
      console.error("Error modifying appointment:", error)
      alert("Error al modificar la cita.")
    } finally {
      setIsLoadingModify(false)
    }
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

  // Helper functions for appointment filtering
  const parseHHMM = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    const d = new Date()
    d.setHours(h ?? 0, m ?? 0, 0, 0)
    return d
  }

  const isPastAppointment = (apt: Appointment) => {
    const today = new Date()
    const todayYMD = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const aptDate = new Date(apt.date)
    const aptYMD = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate())

    if (aptYMD < todayYMD) return true
    if (aptYMD > todayYMD) return false

    // Es hoy: comparar hora fin
    const now = today
    const [eh, em] = (apt.endTime || apt.time).split(":").map(Number)
    const end = new Date()
    end.setHours(eh ?? 0, em ?? 0, 0, 0)
    return end < now
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    return endMinutes - startMinutes;
  }

  // Create derived arrays based on current date/time
  const allAppointments = [...upcomingAppointments, ...historyAppointments]

  // Filter functions for appointments tab
  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredPastAppointments = historyAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Helper function to normalize date to Date object in America/Bogota timezone
  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    // Assume dateStr is YYYY-MM-DD, adjust for timezone if needed
    // For simplicity, treat as local date
    return date
  }

  // Helper function to get date range for filterPeriod
  const getDateRange = (period: string) => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    switch (period) {
      case "this_month":
        const firstDayThisMonth = new Date(year, month, 1)
        const lastDayThisMonth = new Date(year, month + 1, 0)
        return { start: firstDayThisMonth, end: lastDayThisMonth }
      case "last_month":
        const firstDayLastMonth = new Date(year, month - 1, 1)
        const lastDayLastMonth = new Date(year, month, 0)
        return { start: firstDayLastMonth, end: lastDayLastMonth }
      case "this_semester":
        // Semester 1: Jan-Jun, Semester 2: Jul-Dec
        const isFirstSemester = month < 6 // 0-5 is Jan-Jun
        const start = isFirstSemester ? new Date(year, 0, 1) : new Date(year, 6, 1)
        const end = isFirstSemester ? new Date(year, 5, 30) : new Date(year, 11, 31)
        return { start, end }
      default:
        return null // "all" has no range
    }
  }

  // Filter functions for history tab
  const filteredHistoryAppointments = historyAppointments
    .filter((appointment) => {
      const matchesSearch =
        appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSubject = filterSubject === "all" || appointment.subjectCode === filterSubject

      // Period filtering
      let matchesPeriod = true
      if (filterPeriod !== "all") {
        const range = getDateRange(filterPeriod)
        if (range) {
          const aptDate = normalizeDate(appointment.date)
          if (!aptDate) {
            matchesPeriod = false
          } else {
            matchesPeriod = aptDate >= range.start && aptDate <= range.end
          }
        }
      }

      return matchesSearch && matchesSubject && matchesPeriod
    })
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      const dateA = normalizeDate(a.date)
      const dateB = normalizeDate(b.date)
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime()
      }
      // If same date, sort by time descending
      return b.time.localeCompare(a.time)
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
                    {activeTab === "home" && `Bienvenido${currentUser ? `, ${currentUser.nombre}` : ""}`}
                    {activeTab === "booking" && "Agendar Nueva Monitoría"}
                    {activeTab === "appointments" && "Mis Citas"}
                    {activeTab === "history" && "Historial de Monitorías"}
                    {activeTab === "notifications" && "Notificaciones"}
                    {activeTab === "settings" && "Configuración"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {activeTab === "home" && `${currentUser?.programa || "Programa no especificado"} - ${currentUser?.semestre ? `${currentUser.semestre}to Semestre` : "Semestre no especificado"}`}
                    {activeTab === "booking" && "Completa la información requerida"}
                    {activeTab === "appointments" && "Gestiona tus monitorías programadas"}
                    {activeTab === "history" && "Revisa tu progreso académico y califica tus sesiones"}
                    {activeTab === "notifications" && "Mantente al día con tus actividades y recordatorios"}
                    {activeTab === "settings" && "Gestiona tu perfil y preferencias"}
                  </p>
                </div>
              </div>
              {activeTab === "home" && (
                <div className="flex gap-2">
                  {currentUser?.roles && currentUser.roles.includes('MONITOR') && (
                    <Button size="sm" variant="outline" onClick={() => router.push('/monitor-dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Monitor
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-red-800 hover:bg-red-900 relative"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notificaciones
                    {userNotifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {userNotifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </Button>
                </div>
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
            </div>
          </header>



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
                  {new Date(appointment.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {appointment.time} – {appointment.endTime || (() => {
                    const [h, m] = appointment.time.split(':').map(Number);
                    const endH = h + 1;
                    return `${endH.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
                  })()}
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
                    {/* Subject and Availability Selection */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Selecciona la Materia y Disponibilidad
                        </CardTitle>
                        <CardDescription>Busca una materia y elige una disponibilidad activa</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar materia por nombre o código..."
                            className="pl-10"
                            value={searchSubject}
                            onChange={(e) => setSearchSubject(e.target.value)}
                          />
                        </div>

                        {/* Filtered Subjects */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                          {subjects.filter(subject =>
                            subject.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
                            subject.code.toLowerCase().includes(searchSubject.toLowerCase())
                          ).map((subject) => (
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
                              onClick={() => {
                                setSelectedSubject(subject)
                                setSelectedDisp(null)
                                setSelectedDate(null)
                              }}
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

                        {/* Disponibilidades for selected subject */}
                        {selectedSubject && (
                          <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Disponibilidades activas para {selectedSubject.name}</h4>
                            {disponibilidadesMateria.length === 0 ? (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  No hay disponibilidades para esta materia por el momento.
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <div className="space-y-2">
                                {disponibilidadesMateria.map((disp) => (
                                  <div
                                    key={disp.id}
                                    className={`
                                      p-4 border rounded-lg cursor-pointer transition-all duration-200
                                      ${
                                        selectedDisp?.id === disp.id
                                          ? "border-red-800 bg-red-50 ring-2 ring-red-800 ring-opacity-20"
                                          : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                                      }
                                    `}
                                    onClick={() => {
                                      setSelectedDisp(disp)
                                      setSelectedDate(null)
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <User className="h-4 w-4 text-gray-500" />
                                          <span className="font-medium">{disp.monitor.nombre}</span>
                                          <Badge variant="outline" className="text-xs">{disp.materia.codigo}</Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                          <span className="capitalize">{disp.dia}</span>
                                          <span>{disp.hora_inicio} - {disp.hora_fin}</span>
                                          <span>{disp.ubicacion || "Ubicación por asignar"}</span>
                                        </div>
                                      </div>
                                      {selectedDisp?.id === disp.id && (
                                        <CheckCircle className="h-5 w-5 text-red-800" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Date and Time Selection */}
                    {selectedDisp && (
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
                        {selectedDisp && (
                          <div className="flex items-center gap-3 text-sm">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{selectedDisp.materia.nombre}</p>
                              <p className="text-gray-500">{selectedDisp.materia.codigo}</p>
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

                        {selectedDisp && (
                          <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>
                              {selectedDisp.hora_inicio} - {selectedDisp.hora_fin}
                            </span>
                          </div>
                        )}

                        {selectedDisp && (
                          <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">{selectedDisp.monitor.nombre}</p>
                              <div className="flex items-center gap-1">
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{selectedDisp?.ubicacion || "Aula por asignar"}</span>
                        </div>

                        {canBookAppointment() && (
                          <div className="border-t pt-4">
                            <Button
                              className="w-full bg-red-800 hover:bg-red-900"
                              onClick={handleBookAppointment}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirmar Cita
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
                    <TabsTrigger value="past">Anteriores ({filteredPastAppointments.length})</TabsTrigger>
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
                                    {appointment.status !== "completada" && appointment.status !== "cancelada" && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleModifyAppointment(appointment)}>
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
                    {filteredPastAppointments.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes citas anteriores</h3>
                          <p className="text-gray-500">Tus monitorías completadas aparecerán aquí</p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredPastAppointments.map((appointment) => (
                        <Card key={appointment.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
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
                                {appointment.status === "completada" && (
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
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    filteredHistoryAppointments.map((appointment: Appointment) => (
                      <Card key={appointment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              
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
                                  {appointment.topics?.map((topic: string, index: number) => (
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

            {/* notificaciones */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Mark All as Read Button */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                    <p className="text-sm text-gray-500">
                      {userNotifications.filter(n => !n.read).length} notificaciones sin leer
                    </p>
                  </div>
                  {userNotifications.some(n => !n.read) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar todas como leídas
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                  {userNotifications.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes notificaciones</h3>
                        <p className="text-gray-500">Las notificaciones aparecerán aquí cuando tengas actividades pendientes</p>
                      </CardContent>
                    </Card>
                  ) : (
                    userNotifications.map((notification) => (
                      <Card key={notification.id} className={`transition-colors ${!notification.read ? 'border-l-4 border-l-red-800 bg-red-50' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${!notification.read ? 'bg-red-100' : 'bg-gray-100'}`}>
                              {notification.type === 'appointment_reminder' && <Clock className="h-5 w-5 text-amber-600" />}
                              {notification.type === 'appointment_confirmed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                              {notification.type === 'appointment_cancelled' && <XCircle className="h-5 w-5 text-red-600" />}
                              {notification.type === 'appointment_completed' && <Award className="h-5 w-5 text-blue-600" />}
                              {notification.type === 'system' && <Bell className="h-5 w-5 text-gray-600" />}
                              {notification.type === 'monitor_message' && <MessageCircle className="h-5 w-5 text-purple-600" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    {new Date(notification.date).toLocaleDateString("es-ES", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-red-800 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                              </div>
                              {notification.appointmentId && (
                                <div className="mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setActiveTab("appointments")
                                      // Aquí podrías hacer scroll a la cita específica
                                    }}
                                  >
                                    Ver cita
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Configuracion */}
            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
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
                             <Input id="firstName" type="firstName" value={userData.firstName} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" type="lastName" value={userData.lastName} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={userData.email} disabled />
                            <p className="text-xs text-gray-500">El correo institucional no se puede cambiar</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" type="phone" value={userData.phone} disabled />
                          </div>
                        </div>

                        {/* Academic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="studentId">Código Estudiantil</Label>
                            <Input id="studentId" value={userData.studentId} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="program">Programa Académico</Label>
                            <Input id="program" value={userData.program} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="semester">Semestre Actual</Label>
                            <Input id="semester" value={userData.semester} disabled />
                            
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
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>



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
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{selectedAppointment.monitor.name}</h3>

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

              </div>

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

      {/* Modify Appointment Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modificar fecha de la cita</DialogTitle>
            <DialogDescription>Cambia únicamente la fecha de tu cita. Los demás detalles permanecerán iguales.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Read-only Summary */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Materia:</span>
                    <p className="text-gray-900">{selectedAppointment.subject} ({selectedAppointment.subjectCode})</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Monitor:</span>
                    <p className="text-gray-900">{selectedAppointment.monitor.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Horario:</span>
                    <p className="text-gray-900">{selectedAppointment.time} - {selectedAppointment.endTime}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ubicación:</span>
                    <p className="text-gray-900">{selectedAppointment.location || 'Por asignar'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Estado:</span>
                    <Badge className={getStatusColor(selectedAppointment.status)}>
                      {getStatusIcon(selectedAppointment.status)}
                      <span className="ml-1 capitalize">{selectedAppointment.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fecha actual:</span>
                    <p className="text-gray-900">
                      {new Date(selectedAppointment.date).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-2">
                <Label htmlFor="newDate">Nueva fecha</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate ? newDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const selectedDate = e.target.value ? new Date(e.target.value) : null
                    if (selectedDate && modifyDia) {
                      const weekdayMap: { [key: string]: number } = {
                        'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6
                      }
                      const requiredDay = weekdayMap[modifyDia.toLowerCase()]
                      if (selectedDate.getDay() !== requiredDay) {
                        alert(`Esta cita solo puede programarse los ${modifyDia}s.`)
                        return
                      }
                    }
                    setNewDate(selectedDate)
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  Solo puedes seleccionar fechas futuras. Si la cita tiene un día fijo, solo estarán disponibles los días correspondientes.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-800 hover:bg-red-900"
              onClick={handleSaveModifiedAppointment}
              disabled={!newDate || newDate.getTime() === new Date(selectedAppointment?.date || '').getTime() || isLoadingModify}
            >
              {isLoadingModify ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      

      {/* Cambiar contraseña */}
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

