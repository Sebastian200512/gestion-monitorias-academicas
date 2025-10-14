"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, SidebarInset,
} from "@/components/ui/sidebar"
import {
  Users, Calendar, BarChart3, Settings, Shield, UserCheck, Clock, BookOpen, TrendingUp,
  AlertTriangle, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Download, LogOut,
  Home, FileSpreadsheet, FilePen as FilePdf, FileJson, CheckCircle, XCircle, AlertCircle,
  Save, Mail, Phone, CalendarDays, Star, Bell, Globe, Database, HardDrive, RefreshCw, Loader2,
  PieChart, BarChart, LineChart, ArrowUpRight, ArrowDownRight, UserX, Check, ChevronsUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/** ========= Sidebar (sin cambios de estructura) ========= */
function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const router = useRouter()
  const handleLogout = () => {
    router.replace("/login-dashboard")
  }
  const menuItems = [
    { title: "Dashboard", icon: Home, value: "dashboard" },
    { title: "Usuarios", icon: Users, value: "users" },
    { title: "Monitores", icon: UserCheck, value: "monitors" },
    { title: "Materias", icon: BookOpen, value: "subjects" },
    { title: "Citas", icon: Calendar, value: "appointments" },
    { title: "Reportes", icon: BarChart3, value: "reports" },
    { title: "Configuración", icon: Settings, value: "settings" },
  ]
  return (
    <Sidebar className="border-r border-gray-200 h-screen">
      <SidebarHeader className="border-b border-gray-200 p-4 bg-red-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 p-2 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Admin Panel</h2>
            <p className="text-xs text-red-100">Monitorías UCP</p>
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
                <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 hover:text-red-700">
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

/** ========= Tipos ========= */
interface UserType {
  id: string
  name: string
  email: string
  role: "Estudiante" | "Monitor" | "Administrador"
  status: "Activo" | "Pendiente" | "Inactivo"
  program?: string
  semester?: string
  joinDate: string
  photo?: string
}
interface Monitor {
  id: string
  name: string
  email: string
  phone?: string
  status: "Activo" | "Pendiente" | "Inactivo"
  subjects: string[]
  rating?: number
  experience?: string
  totalSessions?: number
  photo?: string
  specialties?: string[]
}
interface Subject {
  id: string
  name: string
  code: string
  credits: number
  faculty?: string
  monitors?: number
  students?: number
  sessions?: number
  status: "Activo" | "Inactivo"
}
interface Appointment {
  id: string
  student: { id: string; name: string; program?: string }
  monitor: { id: string; name: string }
  subject: string
  subjectCode?: string
  date: string
  time?: string
  endTime?: string
  location?: string
  status: "confirmada" | "pendiente" | "completada" | "cancelada"
  createdAt?: string
}

/** ========= Helper UI ========= */
const getStatusColor = (status: string) => {
  switch (status) {
    case "Activo":
    case "confirmada":
    case "completada":
      return "bg-green-600 hover:bg-green-700"
    case "Pendiente":
    case "pendiente":
      return "bg-amber-600 hover:bg-amber-700"
    case "Inactivo":
    case "cancelada":
      return "bg-red-600 hover:bg-red-700"
    default:
      return "bg-gray-500 hover:bg-gray-600"
  }
}
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Activo":
    case "confirmada":
    case "completada":
      return <CheckCircle className="h-4 w-4" />
    case "Pendiente":
    case "pendiente":
      return <AlertCircle className="h-4 w-4" />
    case "Inactivo":
    case "cancelada":
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

/** ========= Componente principal ========= */
export default function AdminDashboardComplete() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showMonitorDialog, setShowMonitorDialog] = useState(false)
  const [showSubjectDialog, setShowSubjectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "json">("excel")
  const [exportSection, setExportSection] = useState<"all" | "users" | "monitors" | "subjects" | "appointments" | "reports">("all")
  const [isExporting, setIsExporting] = useState(false)

  // filtros/selección
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterRole, setFilterRole] = useState("all")
  const [filterFaculty, setFilterFaculty] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [filterSubjectStatus, setFilterSubjectStatus] = useState("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentPageSubjects, setCurrentPageSubjects] = useState(1)
  const pageSizeSubjects = 10
  const [currentPageUsers, setCurrentPageUsers] = useState(1)
  const pageSizeUsers = 10
  const [currentPageMonitors, setCurrentPageMonitors] = useState(1)
  const pageSizeMonitors = 10
  const [currentPageAppointments, setCurrentPageAppointments] = useState(1)
  const pageSizeAppointments = 10
  const [openSubjectFilter, setOpenSubjectFilter] = useState(false)

  /** ======== ESTADO DE DATOS (LIMPIO, SIN MOCKS) ======== */
  const [users, setUsers] = useState<UserType[]>([])
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  /** ======== CARGA DESDE API (reemplaza endpoints por los tuyos) ======== */
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? (window as any).__API_URL__ : "") // fallback opcional

  useEffect(() => {
    ;(async () => {
      try {
        const [u, s, res, appointmentsRes] = await Promise.all([
          fetch('/api/usuarios?rol=ESTUDIANTE'),
          fetch('/api/materias'),
          fetch('/api/usuarios?rol=MONITOR'),
          fetch('/api/citas'),
        ])
        if (u.ok) {
        const data = await u.json();
        setUsers(data.map((user: any) => ({
          id: String(user.id),
          name: user.nombre,
          email: user.email,
          role: user.rol,            // ya viene como 'Estudiante'
          status: 'Activo',
          program: user.programa || '',
          semester: user.semestre || '',
          joinDate: new Date().toISOString().split('T')[0]
        })));
      }
        if (s.ok) {
          const data = await s.json()
          setSubjects(data.map((subject: any) => ({
            id: subject.id.toString(),
            name: subject.name,
            code: subject.code,
            credits: subject.credits || 3,
            faculty: '',
            monitors: 0,
            students: 0,
            sessions: 0,
            status: subject.estado || 'Activo'
          })));
        }
        if (res.ok) {
        const data = await res.json();
        setMonitors(data.map((user: any) => ({
          id: String(user.id),
          name: user.nombre,
          email: user.email,
          role: user.rol,            // 'Monitor'
          status: 'Activo',
          program: user.programa || '',
          semester: user.semestre || '',
          joinDate: new Date().toISOString().split('T')[0]
        })));
      }
        if (appointmentsRes.ok) {
          const appointmentsJson = await appointmentsRes.json();
          if (appointmentsJson.ok && appointmentsJson.data) {
            const appointmentsData = appointmentsJson.data.map((apt: any) => ({
              id: apt.id.toString(),
              student: {
                id: apt.estudiante.id.toString(),
                name: apt.estudiante.nombre_completo,
                program: apt.estudiante.programa || '',
              },
              monitor: {
                id: apt.monitor.id.toString(),
                name: apt.monitor.nombre_completo,
              },
              subject: apt.materia.nombre,
              subjectCode: apt.materia.codigo,
              date: apt.fecha_cita,
              time: apt.hora_inicio,
              endTime: apt.hora_fin,
              location: apt.ubicacion,
              status: apt.estado,
              createdAt: apt.created_at,
            }));
            setAppointments(appointmentsData);
          } else {
            setAppointments([]);
          }
        } else {
          setAppointments([]);
        }
        //citas no implementados aún, dejar vacíos
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })()
  }, [])

  /** ======== FILTRADO DE CITAS ======== */
  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(apt =>
        apt.student.name.toLowerCase().includes(term) ||
        apt.monitor.name.toLowerCase().includes(term) ||
        apt.subject.toLowerCase().includes(term)
      )
    }

    // Filtro por estado
    if (filterStatus !== "all") {
      const statusMap: { [key: string]: string } = {
        confirmed: "confirmada",
        pending: "pendiente",
        completed: "completada",
        cancelled: "cancelada",
      }
      const mappedStatus = statusMap[filterStatus] || filterStatus
      filtered = filtered.filter(apt => apt.status === mappedStatus)
    }

    // Filtro por materia
    if (filterFaculty !== "all") {
      filtered = filtered.filter(apt => apt.subject === filterFaculty)
    }

    // Filtro por fecha
    if (filterDate !== "all") {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      if (filterDate === "today") {
        filtered = filtered.filter(apt => apt.date === today)
      } else if (filterDate === "week") {
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Monday
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate >= startOfWeek && aptDate <= endOfWeek
        })
      } else if (filterDate === "month") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate >= startOfMonth && aptDate <= endOfMonth
        })
      }
    }

    return filtered
  }, [appointments, searchTerm, filterStatus, filterFaculty, filterDate])

  /** ======== PAGINACIÓN DE CITAS ======== */
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPageAppointments - 1) * pageSizeAppointments
    return filteredAppointments.slice(startIndex, startIndex + pageSizeAppointments)
  }, [filteredAppointments, currentPageAppointments, pageSizeAppointments])

  const totalPagesAppointments = Math.ceil(filteredAppointments.length / pageSizeAppointments)

  /** ======== FILTRADO DE USUARIOS ======== */
  const filteredUsers = useMemo(() => {
    let filtered = users
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [users, searchTerm])

  /** ======== PAGINACIÓN DE USUARIOS ======== */
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPageUsers - 1) * pageSizeUsers
    return filteredUsers.slice(startIndex, startIndex + pageSizeUsers)
  }, [filteredUsers, currentPageUsers, pageSizeUsers])

  const totalPagesUsers = Math.ceil(filteredUsers.length / pageSizeUsers)

  /** ======== FILTRADO DE MONITORES ======== */
  const filteredMonitors = useMemo(() => {
    let filtered = monitors
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term)
      )
    }
    return filtered
  }, [monitors, searchTerm])

  /** ======== PAGINACIÓN DE MONITORES ======== */
  const paginatedMonitors = useMemo(() => {
    const startIndex = (currentPageMonitors - 1) * pageSizeMonitors
    return filteredMonitors.slice(startIndex, startIndex + pageSizeMonitors)
  }, [filteredMonitors, currentPageMonitors, pageSizeMonitors])

  const totalPagesMonitors = Math.ceil(filteredMonitors.length / pageSizeMonitors)

  /** ======== FILTRADO DE MATERIAS ======== */
  const filteredSubjects = useMemo(() => {
    let filtered = subjects
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term)
      )
    }
    if (filterSubjectStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterSubjectStatus)
    }
    if (filterFaculty !== "all") {
      filtered = filtered.filter(s => s.faculty === filterFaculty)
    }
    return filtered
  }, [subjects, searchTerm, filterSubjectStatus, filterFaculty])

  /** ======== PAGINACIÓN DE MATERIAS ======== */
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPageSubjects - 1) * pageSizeSubjects
    return filteredSubjects.slice(startIndex, startIndex + pageSizeSubjects)
  }, [filteredSubjects, currentPageSubjects, pageSizeSubjects])

  const totalPagesSubjects = Math.ceil(filteredSubjects.length / pageSizeSubjects)

  /** ======== MÉTRICAS (derivadas de los arrays, sin números ficticios) ======== */
  const systemStats = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.status === "Activo").length
    const totalMonitors = monitors.length
    const activeMonitors = monitors.filter(m => m.status === "Activo").length
    const totalSubjects = subjects.length
    const activeSubjects = subjects.filter(s => s.status === "Activo").length
    const totalAppointments = appointments.length
    const completedAppointments = appointments.filter(a => a.status === "completada").length
    const pendingAppointments = appointments.filter(a => a.status === "pendiente").length
    const cancelledAppointments = appointments.filter(a => a.status === "cancelada").length
    const averageRating = monitors.length
      ? Math.round(
          (monitors.reduce((acc, m) => acc + (m.rating ?? 0), 0) / monitors.length) * 10
        ) / 10
      : 0
    // Si tu API devuelve horas totales/crecimiento, cámbialo aquí:
    return {
      totalUsers,
      activeUsers,
      totalMonitors,
      activeMonitors,
      totalSubjects,
      activeSubjects,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalHours: 0,
      averageRating,
      growthRate: 0,
      userGrowth: 0,
    }
  }, [users, monitors, subjects, appointments])

  /** ======== UTILIDADES ========= */
  const handleExport = async () => {
    setIsExporting(true)
    try {
      // NOTE: conecta aquí tu export real según exportSection/exportFormat
      // await fetch(`${API_BASE}/export?format=${exportFormat}&section=${exportSection}`)
    } finally {
      setIsExporting(false)
      setShowExportDialog(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      switch (activeTab) {
        case "users": setSelectedItems(filteredUsers.map(u => u.id)); break
        case "monitors": setSelectedItems(filteredMonitors.map(m => m.id)); break
        case "subjects": setSelectedItems(filteredSubjects.map(s => s.id)); break
        case "appointments": setSelectedItems(filteredAppointments.map(a => a.id)); break
        default: setSelectedItems([])
      }
    } else {
      setSelectedItems([])
    }
  }
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const handleDeleteSelected = () => {
    // NOTE: conecta a tu backend (DELETE/BULK)
    setShowDeleteDialog(false)
    setSelectedItems([])
  }

  /** ========= VISTA ========= */
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1 w-full min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
                  <p className="text-sm text-gray-500">Sistema de Monitorías - Universidad Católica de Pereira</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>
            </div>
          </header>

          {/* Pagina principal */}
          <main className="p-6 space-y-6">
            {/* ===== Principal ===== */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Usuarios</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                          <p className="text-xs text-green-600 font-medium">+{systemStats.userGrowth}% vs mes anterior</p>
                        </div>
                        <Users className="h-8 w-8 text-red-800" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Monitores Activos</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats.activeMonitors}</p>
                          <p className="text-xs text-amber-600 font-medium">+{systemStats.growthRate}% vs mes anterior</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Citas</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats.totalAppointments}</p>
                          <p className="text-xs text-red-600 font-medium">+0% vs mes anterior</p>
                        </div>
                        <Calendar className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Horas Totales</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats.totalHours}</p>
                          <p className="text-xs text-amber-700 font-medium">+0% vs mes anterior</p>
                        </div>
                        <Clock className="h-8 w-8 text-amber-700" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Alertas */}
                <Card className="border-l-4 border-l-amber-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">Alertas del Sistema</h4>
                        <p className="text-sm text-gray-600">
                          {monitors.filter(m => m.status === "Pendiente").length} monitores requieren aprobación •{" "}
                          {appointments.filter(a => a.status === "pendiente").length} citas pendientes de confirmación
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actividad Reciente (sin nombres ficticios) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Actividad Reciente
                    </CardTitle>
                    <CardDescription>Conecta tu API para ver eventos recientes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-500">No hay actividades para mostrar.</div>
                  </CardContent>
                </Card>

                {/* Snapshot de Usuarios (muestra primeros registros si existen) */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Gestión de Usuarios</CardTitle>
                        <CardDescription>Administra estudiantes y monitores del sistema</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input placeholder="Buscar usuarios..." className="pl-10 w-64" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filtros
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(users.slice(0, 4)).map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={user.role === "Monitor" ? "default" : "secondary"}
                                className={user.role === "Monitor" ? "bg-amber-600 hover:bg-amber-700" : ""}
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>
                                {getStatusIcon(user.status)}
                                <span className="ml-1">{user.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>{user.joinDate}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Ver Perfil</DropdownMenuItem>
                                  <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow><TableCell colSpan={6} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-center">
                      <Button variant="outline" onClick={() => setActiveTab("users")}>
                        Ver Todos los Usuarios
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== Gestión de estudiantes ===== */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h2>
                    <p className="text-gray-600">Administra todos los Estudiantes del sistema</p>
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por nombre, email, código..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Usuarios */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Programa</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.program || "-"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(user.status)}>
                                {getStatusIcon(user.status)} <span className="ml-1">{user.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>{user.joinDate}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/usuarios/${user.id}/assign-role`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ role: 'MONITOR' }),
                                        });
                                        if (res.ok) {
                                          alert('Rol de Monitor asignado exitosamente');
                                          // Refrescar la lista de usuarios
                                          window.location.reload();
                                        } else {
                                          const error = await res.json();
                                          alert(`Error: ${error.error}`);
                                        }
                                      } catch (err) {
                                        console.error('Error asignando rol:', err);
                                        alert('Error al asignar rol');
                                      }
                                    }}
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />Asignar Monitor
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {paginatedUsers.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{paginatedUsers.length ? `${(currentPageUsers - 1) * pageSizeUsers + 1}-${Math.min(currentPageUsers * pageSizeUsers, filteredUsers.length)}` : "0"}</strong> de <strong>{filteredUsers.length}</strong> usuarios
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageUsers(prev => Math.max(1, prev - 1))}
                            disabled={currentPageUsers === 1}
                          >
                            Anterior
                          </Button>
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPagesUsers) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPagesUsers - 4, currentPageUsers - 2)) + i
                          if (page > totalPagesUsers) return null
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPageUsers(page)}
                                isActive={page === currentPageUsers}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                        {totalPagesUsers > 5 && currentPageUsers < totalPagesUsers - 2 && (
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                        )}
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageUsers(prev => Math.min(totalPagesUsers, prev + 1))}
                            disabled={currentPageUsers === totalPagesUsers}
                          >
                            Siguiente
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Gestión de monitores ===== */}
            {activeTab === "monitors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Monitores</h2>
                    <p className="text-gray-600">Administra los monitores académicos</p>
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por nombre, email, código..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>

                      <Button variant="outline" size="icon" onClick={() => setSearchTerm('')}><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Grid monitores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedMonitors.map((monitor) => (
                    <Card key={monitor.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback>{monitor.name?.charAt(0) ?? "M"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{monitor.name}</h3>

                              </div>
                              <Badge className={getStatusColor(monitor.status)}>
                                {getStatusIcon(monitor.status)} <span className="ml-1">{monitor.status}</span>
                              </Badge>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><span>{monitor.email}</span></div>
                              {monitor.phone && <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><span>{monitor.phone}</span></div>}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{monitor.totalSessions ?? 0}</span> sesiones
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/usuarios/${monitor.id}/remove-role`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ role: 'MONITOR' }),
                                  });
                                  if (res.ok) {
                                    alert('Rol de Monitor removido exitosamente');
                                    // Refrescar la lista de monitores
                                    window.location.reload();
                                  } else {
                                    const error = await res.json();
                                    alert(`Error: ${error.error}`);
                                  }
                                } catch (err) {
                                  console.error('Error removiendo rol:', err);
                                  alert('Error al remover rol');
                                }
                              }}
                            >
                              <UserX className="h-3 w-3 mr-1" />Quitar Monitor
                            </Button>
                            {monitor.status === "Pendiente" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />Aprobar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredMonitors.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500">Sin registros</div>
                  )}
                </div>

                {/* Count */}
                <div className="text-sm text-gray-500 text-center">
                  Mostrando <strong>{paginatedMonitors.length ? `${(currentPageMonitors - 1) * pageSizeMonitors + 1}-${Math.min(currentPageMonitors * pageSizeMonitors, filteredMonitors.length)}` : "0"}</strong> de <strong>{filteredMonitors.length}</strong> monitores
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageMonitors(prev => Math.max(1, prev - 1))}
                          disabled={currentPageMonitors === 1}
                        >
                          Anterior
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPagesMonitors) }, (_, i) => {
                        const page = Math.max(1, Math.min(totalPagesMonitors - 4, currentPageMonitors - 2)) + i
                        if (page > totalPagesMonitors) return null
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPageMonitors(page)}
                              isActive={page === currentPageMonitors}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      })}
                      {totalPagesMonitors > 5 && currentPageMonitors < totalPagesMonitors - 2 && (
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                      )}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageMonitors(prev => Math.min(totalPagesMonitors, prev + 1))}
                          disabled={currentPageMonitors === totalPagesMonitors}
                        >
                          Siguiente
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}

            {/* ===== Gestión materias ===== */}
            {activeTab === "subjects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Materias</h2>
                    <p className="text-gray-600">Administra las materias disponibles para monitorías</p>
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por nombre, código..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Select value={filterSubjectStatus} onValueChange={setFilterSubjectStatus}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="Activo">Activas</SelectItem>
                          <SelectItem value="Inactivo">Desactivas</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setFilterSubjectStatus('all'); }}><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Materias */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Materia</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Créditos</TableHead>
                          <TableHead>Facultad</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSubjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell>{subject.code}</TableCell>
                            <TableCell>{subject.credits}</TableCell>
                            <TableCell>{subject.faculty ?? "—"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(subject.status)}>
                                {getStatusIcon(subject.status)} <span className="ml-1">{subject.status}</span>
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {paginatedSubjects.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{paginatedSubjects.length ? `${(currentPageSubjects - 1) * pageSizeSubjects + 1}-${Math.min(currentPageSubjects * pageSizeSubjects, filteredSubjects.length)}` : "0"}</strong> de <strong>{filteredSubjects.length}</strong> materias
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageSubjects(prev => Math.max(1, prev - 1))}
                            disabled={currentPageSubjects === 1}
                          >
                            Anterior
                          </Button>
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPagesSubjects) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPagesSubjects - 4, currentPageSubjects - 2)) + i
                          if (page > totalPagesSubjects) return null
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPageSubjects(page)}
                                isActive={page === currentPageSubjects}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                        {totalPagesSubjects > 5 && currentPageSubjects < totalPagesSubjects - 2 && (
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                        )}
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageSubjects(prev => Math.min(totalPagesSubjects, prev + 1))}
                            disabled={currentPageSubjects === totalPagesSubjects}
                          >
                            Siguiente
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Gestión de citas ===== */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Citas</h2>
                    <p className="text-gray-600">Administra todas las monitorías del sistema</p>
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por estudiante, monitor..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="confirmed">Confirmadas</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="completed">Completadas</SelectItem>
                          <SelectItem value="cancelled">Canceladas</SelectItem>
                        </SelectContent>
                      </Select>
                      <Popover open={openSubjectFilter} onOpenChange={setOpenSubjectFilter}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openSubjectFilter}
                            className="w-[250px] justify-between"
                          >
                            {filterFaculty === "all" ? "Todas las materias" : filterFaculty}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar materia..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron materias.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setFilterFaculty("all")
                                    setOpenSubjectFilter(false)
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", filterFaculty === "all" ? "opacity-100" : "opacity-0")} />
                                  Todas las materias
                                </CommandItem>
                                {subjects.map((subject) => (
                                  <CommandItem
                                    key={subject.id}
                                    onSelect={() => {
                                      setFilterFaculty(subject.name)
                                      setOpenSubjectFilter(false)
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", filterFaculty === subject.name ? "opacity-100" : "opacity-0")} />
                                    {subject.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por fecha" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las fechas</SelectItem>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterFaculty('all'); setFilterDate('all'); }}><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Citas */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Estudiante</TableHead>
                          <TableHead>Monitor</TableHead>
                          <TableHead>Materia</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Ubicación</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="font-medium">{appointment.student.name}</div>
                              <div className="text-xs text-gray-500">{appointment.student.program ?? "—"}</div>
                            </TableCell>
                            <TableCell>{appointment.monitor.name}</TableCell>
                            <TableCell>
                              <div className="font-medium">{appointment.subject}</div>
                              <div className="text-xs text-gray-500">{appointment.subjectCode ?? ""}</div>
                            </TableCell>
                            <TableCell>{new Date(appointment.date).toLocaleDateString("es-ES")}</TableCell>
                            <TableCell>{[appointment.time, appointment.endTime].filter(Boolean).join(" - ") || "—"}</TableCell>
                            <TableCell>{appointment.location ?? "—"}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(appointment.status)}>
                                {getStatusIcon(appointment.status)} <span className="ml-1 capitalize">{appointment.status}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {appointment.status === "pendiente" && (<DropdownMenuItem><CheckCircle className="h-4 w-4 mr-2" />Confirmar</DropdownMenuItem>)}
                                  <DropdownMenuItem className="text-red-600"><XCircle className="h-4 w-4 mr-2" />Cancelar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {paginatedAppointments.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{paginatedAppointments.length ? `${(currentPageAppointments - 1) * pageSizeAppointments + 1}-${Math.min(currentPageAppointments * pageSizeAppointments, filteredAppointments.length)}` : "0"}</strong> de <strong>{filteredAppointments.length}</strong> citas
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageAppointments(prev => Math.max(1, prev - 1))}
                            disabled={currentPageAppointments === 1}
                          >
                            Anterior
                          </Button>
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, totalPagesAppointments) }, (_, i) => {
                          const page = Math.max(1, Math.min(totalPagesAppointments - 4, currentPageAppointments - 2)) + i
                          if (page > totalPagesAppointments) return null
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPageAppointments(page)}
                                isActive={page === currentPageAppointments}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                        {totalPagesAppointments > 5 && currentPageAppointments < totalPagesAppointments - 2 && (
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                        )}
                        <PaginationItem>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPageAppointments(prev => Math.min(totalPagesAppointments, prev + 1))}
                            disabled={currentPageAppointments === totalPagesAppointments}
                          >
                            Siguiente
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Reportes (plantilla, sin números ficticios) ===== */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
                    <p className="text-gray-600">Analiza el rendimiento del sistema de monitorías</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowExportDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />Exportar Reportes
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Período" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                          <SelectItem value="quarter">Este trimestre</SelectItem>
                          <SelectItem value="year">Este año</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterFaculty} onValueChange={setFilterFaculty}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Facultad" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las facultades</SelectItem>
                          {/* TODO: Poblar dinámicamente */}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Citas</p>
                        <p className="text-3xl font-bold text-gray-900">{systemStats.totalAppointments}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-green-600">+0% vs período anterior</p>
                        </div>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full"><Calendar className="h-6 w-6 text-red-800" /></div>
                    </div>
                  </CardContent></Card>

                  <Card><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Completitud</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {systemStats.totalAppointments ? Math.round((systemStats.completedAppointments / systemStats.totalAppointments) * 100) : 0}%
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                          <p className="text-xs text-green-600">+0% vs período anterior</p>
                        </div>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div>
                    </div>
                  </CardContent></Card>

                  <Card><CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tasa de Cancelación</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {systemStats.totalAppointments ? Math.round((systemStats.cancelledAppointments / systemStats.totalAppointments) * 100) : 0}%
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                          <p className="text-xs text-red-600">0% vs período anterior</p>
                        </div>
                      </div>
                      <div className="p-3 bg-red-100 rounded-full"><XCircle className="h-6 w-6 text-red-600" /></div>
                    </div>
                  </CardContent></Card>

                  
                </div>

                {/* Espacios para charts (sin datos ficticios) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" />Citas por Materia</CardTitle><CardDescription>Conecta tu API para renderizar el gráfico</CardDescription></CardHeader><CardContent><div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><p className="text-gray-500">Gráfico pendiente de datos</p></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />Tendencia de Citas</CardTitle><CardDescription>Conecta tu API para renderizar el gráfico</CardDescription></CardHeader><CardContent><div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><p className="text-gray-500">Gráfico pendiente de datos</p></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Distribución por Estado</CardTitle><CardDescription>Conecta tu API para renderizar el gráfico</CardDescription></CardHeader><CardContent><div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><p className="text-gray-500">Gráfico pendiente de datos</p></div></CardContent></Card>
                  <Card><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Rendimiento de Monitores</CardTitle><CardDescription>Conecta tu API para renderizar el gráfico</CardDescription></CardHeader><CardContent><div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg"><p className="text-gray-500">Gráfico pendiente de datos</p></div></CardContent></Card>
                </div>

                {/* Top performers: se muestra solo si hay datos */}
                <Card>
                  <CardHeader><CardTitle>Monitores Destacados</CardTitle><CardDescription>Los monitores con mejor desempeño</CardDescription></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Monitor</TableHead>
                          <TableHead>Materia Principal</TableHead>
                          <TableHead>Sesiones</TableHead>
                          <TableHead>Calificación</TableHead>
                          <TableHead>Tasa de Completitud</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monitors.slice(0, 3).map((monitor) => (
                          <TableRow key={monitor.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={monitor.photo || "/placeholder.svg"} alt={monitor.name} />
                                  <AvatarFallback>{monitor.name?.charAt(0) ?? "M"}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{monitor.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{monitor.subjects?.[0] ?? "—"}</TableCell>
                            <TableCell>{monitor.totalSessions ?? 0}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-500 fill-current" />
                                <span>{monitor.rating ?? "—"}</span>
                              </div>
                            </TableCell>
                            <TableCell>—</TableCell>
                          </TableRow>
                        ))}
                        {monitors.length === 0 && (
                          <TableRow><TableCell colSpan={5} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ===== Configuración (mantiene estructura; quité valores “institucionales” estrictos) ===== */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h2>
                  <p className="text-gray-600">Administra la configuración global del sistema</p>
                </div>

                <Tabs defaultValue="general" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5 max-w-4xl">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
                    <TabsTrigger value="security">Seguridad</TabsTrigger>
                    <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                    <TabsTrigger value="backup">Respaldo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configuración General</CardTitle>
                        <CardDescription>Ajustes básicos del sistema</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="siteName">Nombre del Sistema</Label>
                            <Input id="siteName" defaultValue="" placeholder="Nombre del sistema" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="siteUrl">URL del Sistema</Label>
                            <Input id="siteUrl" defaultValue="" placeholder="https://tu-dominio.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="adminEmail">Email de Administración</Label>
                            <Input id="adminEmail" defaultValue="" type="email" placeholder="admin@tu-dominio.com" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="timezone">Zona Horaria</Label>
                            <Select defaultValue="america_bogota">
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="america_bogota">América/Bogotá (GMT-5)</SelectItem>
                                <SelectItem value="america_new_york">América/New York (GMT-5)</SelectItem>
                                <SelectItem value="europe_madrid">Europa/Madrid (GMT+1)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        

                        <Button className="bg-red-800 hover:bg-red-900">
                          <Save className="h-4 w-4 mr-2" />Guardar Cambios
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Notificaciones, Seguridad, Integraciones, Backup: estructura igual; sin valores rígidos */}
                    {/* ... (puedes conservar tu contenido original; solo evita textos fijos tipo fechas o claves) */}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>

      {/* ====== Diálogos (sin datos ficticios) ====== */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogDescription>Selecciona el formato y los datos que deseas exportar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Formato de Exportación</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant={exportFormat === "excel" ? "default" : "outline"}
                  className={exportFormat === "excel" ? "bg-red-800 hover:bg-red-900" : ""} onClick={() => setExportFormat("excel")}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />Excel
                </Button>
                <Button variant={exportFormat === "pdf" ? "default" : "outline"}
                  className={exportFormat === "pdf" ? "bg-red-800 hover:bg-red-900" : ""} onClick={() => setExportFormat("pdf")}>
                  <FilePdf className="h-4 w-4 mr-2" />PDF
                </Button>
                <Button variant={exportFormat === "json" ? "default" : "outline"}
                  className={exportFormat === "json" ? "bg-red-800 hover:bg-red-900" : ""} onClick={() => setExportFormat("json")}>
                  <FileJson className="h-4 w-4 mr-2" />JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Datos a Exportar</Label>
              <Select value={exportSection} onValueChange={(v: any) => setExportSection(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los datos</SelectItem>
                  <SelectItem value="users">Usuarios</SelectItem>
                  <SelectItem value="monitors">Monitores</SelectItem>
                  <SelectItem value="subjects">Materias</SelectItem>
                  <SelectItem value="appointments">Citas</SelectItem>
                  <SelectItem value="reports">Reportes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select defaultValue="all_time">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_time">Todo el tiempo</SelectItem>
                  <SelectItem value="this_month">Este mes</SelectItem>
                  <SelectItem value="last_month">Mes pasado</SelectItem>
                  <SelectItem value="this_year">Este año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>Cancelar</Button>
            <Button onClick={handleExport} disabled={isExporting} className="bg-red-800 hover:bg-red-900">
              {isExporting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exportando...</>) : (<><Download className="h-4 w-4 mr-2" />Exportar</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      

      

      

     {/*Finaliza con el diálogo de confirmación de eliminación:*/}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar los {selectedItems.length} elementos seleccionados? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
