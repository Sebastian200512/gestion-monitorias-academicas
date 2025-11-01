"use client"

import { useState, useEffect, useCallback } from "react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
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
  Bell,
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
  const handleLogout = () => {
    router.replace("/login-dashboard")
  }
  const menuItems = [
    { title: "Inicio", icon: Home, value: "home" },
    { title: "Mis Citas", icon: CalendarDays, value: "appointments" },
    { title: "Disponibilidad", icon: Clock, value: "availability" },
    { title: "Reportes", icon: BarChart3, value: "reports" },
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

interface Notification {
  id: string
  type: "appointment_created" | "appointment_confirmed" | "appointment_cancelled" | "appointment_completed" | "appointment_reminder" | "system" | "monitor_message"
  title: string
  message: string
  date: string
  read: boolean
  appointmentId?: string
  actionUrl?: string
}

const API_BASE = "/api"

// ---- Helpers de Storage por usuario (NOTIFICACIONES) ----
const notifStorageKey = (userId: number) => `monitor_notifications_${userId}`
const notifiedKeysStorageKey = (userId: number) => `monitor_notified_keys_${userId}`

function loadNotificationsForUser(userId: number): Notification[] {
  try {
    const raw = localStorage.getItem(notifStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveNotificationsForUser(userId: number, items: Notification[]) {
  localStorage.setItem(notifStorageKey(userId), JSON.stringify(items))
}

function loadNotifiedKeysForUser(userId: number): Set<string> {
  try {
    const raw = localStorage.getItem(notifiedKeysStorageKey(userId))
    const arr = raw ? JSON.parse(raw) : []
    return new Set(arr)
  } catch {
    return new Set()
  }
}

function saveNotifiedKeysForUser(userId: number, keys: Set<string>) {
  localStorage.setItem(notifiedKeysStorageKey(userId), JSON.stringify(Array.from(keys)))
}

export default function MonitorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("home")
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<MonitorAppointment | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showStudentProfileDialog, setShowStudentProfileDialog] = useState(false)
  const [selectedStudentProfile, setSelectedStudentProfile] = useState<any>(null)
  const [showAppointmentDetailsDialog, setShowAppointmentDetailsDialog] = useState(false)
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<MonitorAppointment | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userId, setUserId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [inFlight, setInFlight] = useState<Record<string, boolean>>({})
  const [notificationFilter, setNotificationFilter] = useState("all")

  // Notifications states
  const [userNotifications, setUserNotifications] = useState<Notification[]>([])
  const [prevAppointments, setPrevAppointments] = useState<MonitorAppointment[]>([])
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(new Set())
  const [loadedNotifState, setLoadedNotifState] = useState(false)
  const [loadedAppointments, setLoadedAppointments] = useState(false)

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

  // Monitor profile data
  const [monitorData, setMonitorData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    program: "",
    semester: "",
    code: "",
  })

  // Assigned subject
  const [assignedSubject, setAssignedSubject] = useState<any>(null)

  // Availability
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])

  // New availability
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

  // Helpers de tiempo
  const formatTime12Hour = (time24: string) => {
    if (!time24) return ""
    const [hours, minutes] = time24.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase()
  }

  const addTwoHours = (time24: string) => {
    if (!time24) return ""
    const [h, m] = time24.split(':').map(Number)
    const newHours = h + 2
    return `${newHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const handleStartTimeChange = (startTime: string) => {
    const endTime = addTwoHours(startTime)
    setNewAvailability(prev => ({
      ...prev,
      startTime,
      endTime
    }))
  }

  // Load user + materias
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserId(parsedUser.id)
      const fullName = parsedUser.nombre_completo || parsedUser.nombre || ""
      const [firstName, ...lastNameParts] = fullName.split(" ")
      setMonitorData({
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        email: parsedUser.correo || parsedUser.email || "",
        program: parsedUser.programa || "",
        semester: (parsedUser.semestre ?? "")?.toString() || "",
        code: parsedUser.codigo || "",
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

  // Cargar notificaciones y notifiedKeys cuando ya hay userId
  useEffect(() => {
    if (!userId) return
    setUserNotifications(loadNotificationsForUser(userId))
    setNotifiedKeys(loadNotifiedKeysForUser(userId))
    setLoadedNotifState(true)
  }, [userId])

  // Fetch data del monitor
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return
      try {
        // Perfil (no bloquea si 404)
        try {
          const profileResponse = await fetch(`${API_BASE}/usuarios/${userId}`)
          if (profileResponse.ok) {
            const userData = await profileResponse.json()
            const fullName = userData.nombre_completo || userData.nombre || ""
            const [firstName, ...lastNameParts] = fullName.split(" ")
            setMonitorData({
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              email: userData.correo || userData.email || "",
              program: userData.programa || "",
              semester: (userData.semestre ?? "")?.toString() || "",
              code: userData.codigo || "",
            })
          }
        } catch (e) {
          console.error("Error fetching profile:", e)
        }

        // Materia asignada
        try {
          const assignedSubjectResponse = await fetch(`${API_BASE}/usuarios/${userId}/materia-asignada`)
          if (assignedSubjectResponse.ok) {
            const assignedSubjectData = await fetch(`${API_BASE}/usuarios/${userId}/materia-asignada`).then(r => r.json())
            setAssignedSubject(assignedSubjectData)
          } else {
            setAssignedSubject(null)
          }
        } catch (e) {
          setAssignedSubject(null)
        }

        // Citas
        try {
          const appointmentsResponse = await fetch(`${API_BASE}/citas?monitor_id=${userId}`)
          if (appointmentsResponse.ok) {
            const appointmentsJson = await appointmentsResponse.json()
            if (appointmentsJson.ok && appointmentsJson.data) {
              const mapped: MonitorAppointment[] = appointmentsJson.data.map((apt: any) => ({
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
                createdAt: apt.created_at,
              }))
              setAppointments(mapped)
            } else {
              setAppointments([])
            }
          } else {
            setAppointments([])
          }
        } catch (e) {
          setAppointments([])
        } finally {
          setLoadedAppointments(true)
        }

        // Disponibilidades
        try {
          const availabilityResponse = await fetch(`${API_BASE}/monitor/availability?userId=${userId}`)
          if (availabilityResponse.ok) {
            const availabilityData = await availabilityResponse.json()
            setAvailabilitySlots(availabilityData)
          }
        } catch {}

        // Preferences (si aplica)
        try {
          const preferencesRes = await fetch(`${API_BASE}/user/preferences`)
          if (preferencesRes.ok) {
            const preferencesData = await preferencesRes.json()
            setPreferences(preferencesData)
          }
        } catch {}
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
    fetchData()
  }, [userId])

  // Disparar generación de notificaciones cuando:
  // - Ya se cargaron desde storage (loadedNotifState)
  // - Ya se cargaron citas (loadedAppointments)
  // - Hay citas
  useEffect(() => {
    if (!userId) return
    if (!loadedNotifState || !loadedAppointments) return
    if (appointments.length === 0) return
    generateNotifications(appointments)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loadedNotifState, loadedAppointments, appointments])

  const addTwoHoursMemo = addTwoHours // (para evitar recreación innecesaria)

  // Availability handlers
  const handleAddAvailability = async () => {
    if (!newAvailability.day || !newAvailability.startTime || !newAvailability.endTime || !newAvailability.location || !assignedSubject) {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" })
      return
    }

    try {
      const response = await fetch(`${API_BASE}/disponibilidades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monitor_id: userId,
          materia_id: assignedSubject.id,
          dia: newAvailability.day,
          hora_inicio: newAvailability.startTime,
          hora_fin: newAvailability.endTime,
          ubicacion: newAvailability.location,
          estado: 'Activa'
        })
      })

      if (response.ok) {
        const availabilityResponse = await fetch(`${API_BASE}/monitor/availability?userId=${userId}`)
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json()
          setAvailabilitySlots(availabilityData)
        }
        setShowAvailabilityDialog(false)
        setNewAvailability({
          day: "",
          startTime: "",
          endTime: "",
          location: "",
          subjects: [],
        })
        toast({ title: "Éxito", description: "Disponibilidad agregada correctamente" })
      } else {
        toast({ title: "Error", description: "Error al agregar disponibilidad", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error adding availability:", error)
      toast({ title: "Error", description: "Error interno del servidor", variant: "destructive" })
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

  const handleSaveEditAvailability = async () => {
    if (!editingSlot || !newAvailability.day || !newAvailability.startTime || !newAvailability.endTime || !newAvailability.location) {
      toast({ title: "Error", description: "Todos los campos son requeridos", variant: "destructive" })
      return
    }

    try {
      for (const id of editingSlot.ids) {
        const response = await fetch(`${API_BASE}/disponibilidades/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dia: newAvailability.day,
            hora_inicio: newAvailability.startTime,
            hora_fin: newAvailability.endTime,
            ubicacion: newAvailability.location,
          })
        })
        if (!response.ok) {
          throw new Error("Error updating")
        }
      }

      const availabilityResponse = await fetch(`${API_BASE}/monitor/availability?userId=${userId}`)
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json()
        setAvailabilitySlots(availabilityData)
      }
      setShowAvailabilityDialog(false)
      setEditingSlot(null)
      setNewAvailability({
        day: "",
        startTime: "",
        endTime: "",
        location: "",
        subjects: [],
      })
      toast({ title: "Éxito", description: "Disponibilidad actualizada correctamente" })
    } catch (error) {
      console.error("Error updating availability:", error)
      toast({ title: "Error", description: "Error al actualizar disponibilidad", variant: "destructive" })
    }
  }

  const handleDeleteAvailability = async (slot: AvailabilitySlot) => {
    if (!confirm("¿Eliminar definitivamente este horario? Esta acción no se puede deshacer.")) return;

    try {
      for (const id of slot.ids) {
        const res = await fetch(`/api/disponibilidades/${id}`, { method: "DELETE" });

        if (res.status === 409) {
          let payload: any = null;
          try {
            payload = await res.json();
          } catch {
            payload = null;
          }

          console.warn("⚠️ Conflicto detectado al eliminar disponibilidad:", payload);

          // Solo aviso, NO desactivar automáticamente
          toast({
            title: "No se puede eliminar",
            description:
              payload?.message || payload?.msg ||
              "Esta disponibilidad tiene citas registradas. Desactívala si no quieres más reservas y conserva el histórico.",
            variant: "destructive",
          });
          return;
        }

        if (!res.ok) {
          let payload: any = null;
          try { payload = await res.json(); } catch {}
          toast({
            title: "Error",
            description: payload?.message || payload?.msg || "No se pudo eliminar la disponibilidad.",
            variant: "destructive",
          });
          return;
        }
      }

      // Todos OK → quita del estado
      setAvailabilitySlots(prev =>
        prev.filter(s =>
          s.day !== slot.day ||
          s.startTime !== slot.startTime ||
          s.endTime !== slot.endTime ||
          s.location !== slot.location
        )
      );

      toast({ title: "Eliminada", description: "La disponibilidad fue eliminada." });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Error interno al eliminar.",
        variant: "destructive",
      });
    }
  };

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

  // ---- CRUD Citas ----
  const handleViewAppointmentDetails = (appointment: MonitorAppointment) => {
    setSelectedAppointmentDetails(appointment)
    setShowAppointmentDetailsDialog(true)
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

  const handleCancelAppointment = async (appointment: MonitorAppointment) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta cita?")) return
    try {
      const response = await fetch(`${API_BASE}/citas/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelada' })
      })
      if (response.ok) {
        setAppointments(appointments.map(apt =>
          apt.id === appointment.id ? { ...apt, status: 'cancelada' } : apt
        ))
      } else {
        console.error("Error canceling appointment")
      }
    } catch (error) {
      console.error("Error canceling appointment:", error)
    }
  }

  // Toggle disponibilidad
  const handleToggleAvailability = useCallback(async (slot: AvailabilitySlot, checked: boolean) => {
    const slotKey = slot.ids.join('.')
    if (inFlight[slotKey]) return
    setInFlight(prev => ({ ...prev, [slotKey]: true }))

    const newEstado = checked ? "Activa" : "Inactiva"
    const previousSlots = [...availabilitySlots]
    setAvailabilitySlots(prev => prev.map(s =>
      s.ids.some(id => slot.ids.includes(id)) ? { ...s, isActive: checked } : s
    ))

    try {
      const response = await fetch(`${API_BASE}/disponibilidades/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: slot.ids, estado: newEstado })
      })
      const result = await response.json()

      if (response.ok) {
        if (userId) {
          const availabilityResponse = await fetch(`${API_BASE}/monitor/availability?userId=${userId}`, { cache: 'no-store' })
          if (availabilityResponse.ok) {
            const availabilityData = await availabilityResponse.json()
            setAvailabilitySlots(availabilityData)
          }
        }
        toast({ title: "Disponibilidad actualizada", description: `La disponibilidad ha sido ${checked ? 'activada' : 'desactivada'} exitosamente.` })
      } else {
        setAvailabilitySlots(previousSlots)
        toast({ title: "Error", description: result.msg || "No se pudo actualizar la disponibilidad", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error toggling availability:", error)
      setAvailabilitySlots(previousSlots)
      toast({ title: "Error", description: "Error interno del servidor", variant: "destructive" })
    } finally {
      setInFlight(prev => ({ ...prev, [slotKey]: false }))
    }
  }, [availabilitySlots, userId, inFlight, toast])

  // Próximas y completadas
  const upcomingAppointments = appointments.filter((apt) => {
    const now = new Date()
    const appointmentDate = new Date(apt.date)
    const appointmentEndTime = new Date(`${apt.date}T${apt.endTime}`)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate())
    return apt.status !== "completada" &&
           (appointmentDay > today || (appointmentDay.getTime() === today.getTime() && appointmentEndTime >= now))
  })
  const completedAppointments = appointments.filter((apt) => apt.status === "completada")

  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // FIX: Merge estable de notificaciones para conservar estado "read"
  function mergeNotificationsById(existing: Notification[], incoming: Notification[]) {
    const map = new Map(existing.map(n => [n.id, n]))
    for (const n of incoming) {
      const prev = map.get(n.id)
      if (prev) {
        map.set(n.id, { ...prev, ...n, read: prev.read || n.read })
      } else {
        map.set(n.id, n)
      }
    }
    return Array.from(map.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // ---- Generación de notificaciones ----
  const syncNotifications = (uid: number, items: Notification[]) => {
    saveNotificationsForUser(uid, items)
  }

  const generateNotifications = useCallback((currentAppointments: MonitorAppointment[]) => {
    if (!userId) return

    const now = new Date()
    const THIRTY_SIX_HOURS = 36 * 60 * 60 * 1000

    let newNotifications: Notification[] = []
    const keys = new Set(notifiedKeys)

    const prevMap = new Map(prevAppointments.map(apt => [apt.id, apt]))

    const pushUnique = (n: Notification, key: string) => {
      if (keys.has(key)) return
      newNotifications.push(n)
      keys.add(key)
    }

    const removeRemindersFor = (appointmentId: string) => {
      // FIX: No eliminar otras notificaciones al limpiar recordatorios
      newNotifications = newNotifications.filter(n => !(n.type === "appointment_reminder" && n.appointmentId === appointmentId))
      const cleaned = new Set<string>()
      keys.forEach(k => {
        if (!k.startsWith(`reminder:${appointmentId}:`)) cleaned.add(k)
      })
      keys.clear()
      cleaned.forEach(k => keys.add(k))
    }

    for (const apt of currentAppointments) {
      const prev = prevMap.get(apt.id)
      const startDT = new Date(`${apt.date}T${apt.time}`)

      // FIX: Detectar "citas nuevas" aunque no exista estado previo
      if (!prev) {
        const startDT = new Date(`${apt.date}T${apt.time}`)
        const now = new Date()
        const hoursAgo = (now.getTime() - startDT.getTime()) / (1000 * 60 * 60)
        if (hoursAgo <= 24) {
          pushUnique({
            id: `appointment_created-${apt.id}`,
            type: "appointment_created",
            title: "Nueva cita agendada",
            message: `${apt.subject} con ${apt.student.name} el ${new Date(apt.date).toLocaleDateString("es-ES")} a las ${formatTime12Hour(apt.time)}`,
            date: new Date().toISOString(),
            read: false,
            appointmentId: apt.id
          }, `created:${apt.id}`)
        }
      }

      // FIX: Manejo completo de cambios de estado
      if (prev && prev.status !== apt.status) {
        if (apt.status === "cancelada") {
          // FIX: limpiar solo recordatorios de esa cita
          removeRemindersFor(apt.id)

          pushUnique({
            id: `appointment_cancelled-${apt.id}`,
            type: "appointment_cancelled",
            title: "Cita cancelada",
            message: `El estudiante canceló la cita de ${apt.subject}.`,
            date: new Date().toISOString(),
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:cancelada`)
        } else if (apt.status === "confirmada") {
          pushUnique({
            id: `appointment_confirmed-${apt.id}`,
            type: "appointment_confirmed",
            title: "Cita confirmada",
            message: `Confirmaste la cita de ${apt.subject} con ${apt.student.name}.`,
            date: new Date().toISOString(),
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:confirmada`)
        } else if (apt.status === "completada") {
          pushUnique({
            id: `appointment_completed-${apt.id}`,
            type: "appointment_completed",
            title: "Cita completada",
            message: `Finalizaste la monitoría de ${apt.subject} con ${apt.student.name}.`,
            date: new Date().toISOString(),
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:completada`)
        }
      }

      // FIX: Recordatorios solo para futuras ≤36h y limpieza segura
      const msUntilStart = new Date(`${apt.date}T${apt.time}`).getTime() - Date.now()
      if (apt.status !== "cancelada" && apt.status !== "completada") {
        if (msUntilStart > 0 && msUntilStart <= THIRTY_SIX_HOURS) {
          pushUnique({
            id: `appointment_reminder-${apt.id}`,
            type: "appointment_reminder",
            title: "Recordatorio de cita",
            message: `Tienes ${apt.subject} con ${apt.student.name} el ${new Date(apt.date).toLocaleDateString("es-ES")} a las ${formatTime12Hour(apt.time)}`,
            date: new Date().toISOString(),
            read: false,
            appointmentId: apt.id
          }, `reminder:${apt.id}:${new Date(apt.date).toDateString()}`)
        } else {
          // FIX: salir de ventana → eliminar recordatorios de esa cita
          removeRemindersFor(apt.id)
        }
      }
    }

    if (userId) {
      // FIX: Persistencia en localStorage (scope por monitor)
      const merged = mergeNotificationsById(userNotifications, newNotifications)
      setUserNotifications(merged)
      saveNotificationsForUser(userId, merged)
      setNotifiedKeys(keys)
      saveNotifiedKeysForUser(userId, keys)
      setPrevAppointments(currentAppointments)
    }
  }, [userId, userNotifications, notifiedKeys, prevAppointments])

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
                  <Button size="sm" className="bg-red-800 hover:bg-red-900 relative" onClick={() => setActiveTab("notifications")}>
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
                          <p className="text-2xl font-bold text-gray-900">
                            {completedAppointments.reduce((sum, apt) => {
                              const start = parseInt(apt.time.split(':')[0])
                              const end = parseInt(apt.endTime.split(':')[0])
                              return sum + (end - start)
                            }, 0)}
                          </p>
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
                          <p className="text-2xl font-bold text-gray-900">
                            {new Set(appointments.map(apt => apt.student.name)).size}
                          </p>
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
                          disabled={!assignedSubject}
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
                      <CardDescription>Métricas de esta semana</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex justify-between text-sm">
                          <span>Sesiones completadas:</span>
                          <span className="font-medium">
                            {(() => {
                              const now = new Date()
                              const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                              const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                              return completedAppointments.filter(apt => {
                                const aptDate = new Date(apt.date)
                                return aptDate >= startOfWeek && aptDate <= endOfWeek
                              }).length
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Horas trabajadas:</span>
                          <span className="font-medium">
                            {(() => {
                              const now = new Date()
                              const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                              const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                              return completedAppointments.filter(apt => {
                                const aptDate = new Date(apt.date)
                                return aptDate >= startOfWeek && aptDate <= endOfWeek
                              }).reduce((sum, apt) => {
                                const start = parseInt(apt.time.split(':')[0])
                                const end = parseInt(apt.endTime.split(':')[0])
                                return sum + (end - start)
                              }, 0)
                            })()}h
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Estudiantes atendidos:</span>
                          <span className="font-medium">
                            {(() => {
                              const now = new Date()
                              const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                              const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                              const weeklyAppointments = completedAppointments.filter(apt => {
                                const aptDate = new Date(apt.date)
                                return aptDate >= startOfWeek && aptDate <= endOfWeek
                              })
                              return new Set(weeklyAppointments.map(apt => apt.student.name)).size
                            })()}
                          </span>
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

            {/* mis citas */}
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
                    {(() => {
                      if (filteredUpcomingAppointments.length === 0) {
                        return (
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
                        )
                      }
                      return filteredUpcomingAppointments.map((appointment) => (
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
                                    <DropdownMenuItem onClick={() => handleViewAppointmentDetails(appointment)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Detalles
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
                                    {(appointment.status === "pendiente" || appointment.status === "confirmada") && (
                                      <DropdownMenuItem onClick={() => handleCancelAppointment(appointment)}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancelar Cita
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    })()}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-4">
                    {completedAppointments.map((appointment) => (
                      <Card key={appointment.id} className="opacity-90">
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

                  <TabsContent value="all" className="space-y-4">
                    {appointments.map((appointment) => (
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

            {/* disponibilidades */}
            {activeTab === "availability" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Disponibilidad</h2>
                    <p className="text-gray-600">Configura tus horarios disponibles para monitorías</p>
                  </div>
                  <Button
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={() => setShowAvailabilityDialog(true)}
                    disabled={!assignedSubject}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Horario
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availabilitySlots.map((slot) => {
                    const slotKey = slot.ids.join('.')
                    return (
                      <Card key={slotKey}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-medium text-gray-900">{slot.day}</h3>
                              <p className="text-sm text-gray-600">
                                {formatTime12Hour(slot.startTime)} - {formatTime12Hour(slot.endTime)}
                              </p>
                            </div>
                            <div className="relative z-10">
                              <Switch
                                checked={Boolean(slot.isActive)}
                                disabled={inFlight[slotKey]}
                                onCheckedChange={(checked) => {
                                  handleToggleAvailability(slot, checked)
                                }}
                              />
                            </div>
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
                    )})}
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
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-green-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sesiones Completadas</p>
                          <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
                        </div>
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Este Mes</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {completedAppointments.reduce((sum, apt) => {
                              const start = parseInt(apt.time.split(':')[0])
                              const end = parseInt(apt.endTime.split(':')[0])
                              return sum + (end - start)
                            }, 0)}
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Estudiantes Únicos</p>
                          <p className="text-2xl font-bold text-gray-900">{new Set(appointments.map(apt => apt.student.name)).size}</p>
                        </div>
                        <Users className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Rendimiento Semanal
                    </CardTitle>
                    <CardDescription>Métricas de esta semana</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Sesiones Esta Semana</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const now = new Date()
                            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                            const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                            return completedAppointments.filter(apt => {
                              const aptDate = new Date(apt.date)
                              return aptDate >= startOfWeek && aptDate <= endOfWeek
                            }).length
                          })()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Horas Esta Semana</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const now = new Date()
                            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                            const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                            return completedAppointments.filter(apt => {
                              const aptDate = new Date(apt.date)
                              return aptDate >= startOfWeek && aptDate <= endOfWeek
                            }).reduce((sum, apt) => {
                              const start = parseInt(apt.time.split(':')[0])
                              const end = parseInt(apt.endTime.split(':')[0])
                              return sum + (end - start)
                            }, 0)
                          })()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Estudiantes Esta Semana</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {(() => {
                            const now = new Date()
                            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                            const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)

                            const weeklyAppointments = completedAppointments.filter(apt => {
                              const aptDate = new Date(apt.date)
                              return aptDate >= startOfWeek && aptDate <= endOfWeek
                            })
                            return new Set(weeklyAppointments.map(apt => apt.student.name)).size
                          })()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* notificaciones */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                {/* Header con filtros */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                    <p className="text-sm text-gray-500">
                      {userNotifications.filter(n => !n.read).length} notificaciones sin leer
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={notificationFilter} onValueChange={setNotificationFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="unread">Sin leer</SelectItem>
                        <SelectItem value="appointment_created">Citas creadas</SelectItem>
                        <SelectItem value="appointment_reminder">Recordatorios</SelectItem>
                        <SelectItem value="appointment_confirmed">Confirmadas</SelectItem>
                        <SelectItem value="appointment_cancelled">Canceladas</SelectItem>
                        <SelectItem value="appointment_completed">Completadas</SelectItem>
                      </SelectContent>
                    </Select>
                    {userNotifications.some(n => !n.read) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!userId) return
                          setUserNotifications(prev => {
                            const updated = prev.map(n => ({ ...n, read: true }))
                            saveNotificationsForUser(userId, updated)
                            return updated
                          })
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                </div>

                {/* Lista */}
                <div className="space-y-4">
                  {(() => {
                    const filteredNotifications = userNotifications
                      .filter(notification => {
                        if (notificationFilter === "all") return true
                        if (notificationFilter === "unread") return !notification.read
                        return notification.type === notificationFilter
                      })
                      // Orden: más reciente primero
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    return filteredNotifications.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes notificaciones</h3>
                          <p className="text-gray-500">
                            {notificationFilter === "all"
                              ? "Las notificaciones aparecerán aquí cuando tengas actividades pendientes"
                              : `No hay notificaciones de tipo "${notificationFilter}"`
                            }
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <Card key={notification.id} className={`transition-colors group ${!notification.read ? 'border-l-4 border-l-red-800 bg-red-50' : ''}`}>
                          <CardContent className="p-6">
                            <div className="relative">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg">{notification.title}</h3>
                                <p className="text-sm text-gray-700 mt-2">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.date).toLocaleString("es-CO", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                    timeZone: "America/Bogota",
                                  })}
                                </p>
                                {!notification.read && (
                                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-800 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                {notification.appointmentId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setActiveTab("appointments")
                                    }}
                                  >
                                    Ver cita
                                  </Button>
                                )}
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (!userId) return
                                      setUserNotifications(prev => {
                                        const updated = prev.map(n =>
                                          n.id === notification.id ? { ...n, read: true } : n
                                        )
                                        saveNotificationsForUser(userId, updated)
                                        return updated
                                      })
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Marcar como leída
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Configuración */}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input id="firstName" type="text" value={monitorData.firstName || ""} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" type="text" value={monitorData.lastName || ""} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={monitorData.email || ""} disabled />
                            <p className="text-xs text-gray-500">El correo institucional no se puede cambiar</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="code">Código</Label>
                            <Input id="code" type="text" value={monitorData.code || ""} disabled />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md-grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="program">Programa Académico</Label>
                            <Input id="program" type="text" value={monitorData.program || ""} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="semester">Semestre Actual</Label>
                            <Input id="semester" type="text" value={monitorData.semester || ""} disabled />
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

      {/* agregar/editar horarios */}
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
              <br />
              <span className="text-sm text-amber-600 font-medium">
                Nota: Las disponibilidades tienen una duración fija de 2 horas
              </span>
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
                  onValueChange={handleStartTimeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
                        {formatTime12Hour(`${hour.toString().padStart(2, "0")}:00`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hora Fin</Label>
                <Input
                  value={newAvailability.endTime ? formatTime12Hour(newAvailability.endTime) : ""}
                  disabled
                  placeholder="Se calcula automáticamente"
                />
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
              <Label>Materia</Label>
              {assignedSubject ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Materia asignada: <span className="font-medium text-red-800">{assignedSubject.nombre}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Esta materia se seleccionará automáticamente para tus horarios de disponibilidad.
                  </p>
                </div>
              ) : (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <p className="text-sm text-red-700">
                    No tienes una materia asignada por el administrador. Contacta al administrador para asignarte una materia antes de crear horarios de disponibilidad.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingSlot ? handleSaveEditAvailability : handleAddAvailability}
              className="bg-amber-600 hover:bg-amber-700"
              disabled={!assignedSubject}
            >
              {editingSlot ? "Guardar Cambios" : "Agregar Horario"}
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
                  <EyeOff className="h-4 w-4" />
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
            <Button onClick={() => {
              if (newPassword !== confirmPassword) {
                alert("Las contraseñas no coinciden")
                return
              }
              setShowPasswordDialog(false)
              setCurrentPassword("")
              setNewPassword("")
              setConfirmPassword("")
            }} className="bg-red-800 hover:bg-red-900">
              Cambiar Contraseña
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
