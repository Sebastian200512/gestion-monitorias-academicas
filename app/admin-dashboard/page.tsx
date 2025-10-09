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
  PieChart, BarChart, LineChart, ArrowUpRight, ArrowDownRight,
} from "lucide-react"

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
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [editingItem, setEditingItem] = useState<any>(null)

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
        const [u, s, res] = await Promise.all([
          fetch('/api/usuarios?rol=ESTUDIANTE'),
          fetch('/api/materias'),
          fetch('/api/usuarios?rol=MONITOR'),
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
        //citas no implementados aún, dejar vacíos
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    })()
  }, [])

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
        case "users": setSelectedItems(users.map(u => u.id)); break
        case "monitors": setSelectedItems(monitors.map(m => m.id)); break
        case "subjects": setSelectedItems(subjects.map(s => s.id)); break
        case "appointments": setSelectedItems(appointments.map(a => a.id)); break
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
                {activeTab === "monitors" && (
                  <Button size="sm" className="bg-red-800 hover:bg-red-900" onClick={() => setShowMonitorDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Monitor
                  </Button>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-6 space-y-6">
            {/* ===== Dashboard Tab ===== */}
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

            {/* ===== Users Tab ===== */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Estudiantes</h2>
                    <p className="text-gray-600">Administra todos los Estudiantes del sistema</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItems.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Seleccionados ({selectedItems.length})
                      </Button>
                    )}
                    
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por nombre, email..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Usuarios */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox onCheckedChange={(c) => handleSelectAll(c === true)} checked={selectedItems.length === users.length && users.length > 0} />
                          </TableHead>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Programa</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Fecha Registro</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox checked={selectedItems.includes(user.id)} onChange={() => handleSelectItem(user.id)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                                  <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "Monitor" ? "default" : "secondary"}
                                className={user.role === "Monitor" ? "bg-amber-600 hover:bg-amber-700" : ""}>
                                {user.role}
                              </Badge>
                            </TableCell>
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
                                  <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Ver Perfil</DropdownMenuItem>
                                  <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600"><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{users.length ? `1-${users.length}` : "0"}</strong> de <strong>{users.length}</strong> usuarios
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Monitors Tab ===== */}
            {activeTab === "monitors" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Monitores</h2>
                    <p className="text-gray-600">Administra los monitores académicos</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItems.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />Eliminar Seleccionados ({selectedItems.length})
                      </Button>
                    )}
                    <Button size="sm" className="bg-red-800 hover:bg-red-900" onClick={() => setShowMonitorDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />Nuevo Monitor
                    </Button>
                  </div>
                </div>

                {/* Filtros */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="Buscar por nombre, email..." className="pl-10"
                          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                      </div>
                      
                      <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Grid monitores */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monitors.map((monitor) => (
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
                            <div className="mt-3">
                              <p className="text-xs text-gray-500 mb-1">Materias:</p>
                              <div className="flex flex-wrap gap-1">
                                {(monitor.subjects ?? []).map((s, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{monitor.totalSessions ?? 0}</span> sesiones
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm"><Eye className="h-3 w-3 mr-1" />Ver</Button>
                            <Button variant="outline" size="sm"><Edit className="h-3 w-3 mr-1" />Editar</Button>
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
                  {monitors.length === 0 && (
                    <div className="col-span-full text-center text-sm text-gray-500">Sin registros</div>
                  )}
                </div>

                {/* Paginación dummy */}
                <div className="flex items-center justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                      <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationEllipsis /></PaginationItem>
                      <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}

            {/* ===== Subjects Tab ===== */}
            {activeTab === "subjects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Materias</h2>
                    <p className="text-gray-600">Administra las materias disponibles para monitorías</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedItems.length > 0 && (
                      <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />Eliminar Seleccionados ({selectedItems.length})
                      </Button>
                    )}
                    
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
                      <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Materias */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox onCheckedChange={(c) => handleSelectAll(c === true)} checked={selectedItems.length === subjects.length && subjects.length > 0} />
                          </TableHead>
                          <TableHead>Materia</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Créditos</TableHead>
                          <TableHead>Facultad</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell>
                              <Checkbox checked={selectedItems.includes(subject.id)} onChange={() => handleSelectItem(subject.id)} />
                            </TableCell>
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
                        {subjects.length === 0 && (
                          <TableRow><TableCell colSpan={9} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{subjects.length ? `1-${subjects.length}` : "0"}</strong> de <strong>{subjects.length}</strong> materias
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Appointments Tab ===== */}
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
                      <Select value={filterFaculty} onValueChange={setFilterFaculty}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por materia" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las materias</SelectItem>
                          {/* TODO: Poblar dinámicamente desde tu API */}
                        </SelectContent>
                      </Select>
                      <Select value={filterDate} onValueChange={setFilterDate}>
                        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filtrar por fecha" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las fechas</SelectItem>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabla Citas */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox onCheckedChange={(c) => handleSelectAll(c === true)} checked={selectedItems.length === appointments.length && appointments.length > 0} />
                          </TableHead>
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
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <Checkbox checked={selectedItems.includes(appointment.id)} onChange={() => handleSelectItem(appointment.id)} />
                            </TableCell>
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
                                  <DropdownMenuItem><Eye className="h-4 w-4 mr-2" />Ver Detalles</DropdownMenuItem>
                                  <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                                  {appointment.status === "pendiente" && (<DropdownMenuItem><CheckCircle className="h-4 w-4 mr-2" />Confirmar</DropdownMenuItem>)}
                                  <DropdownMenuItem className="text-red-600"><XCircle className="h-4 w-4 mr-2" />Cancelar</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                        {appointments.length === 0 && (
                          <TableRow><TableCell colSpan={8} className="text-center text-sm text-gray-500">Sin registros</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t p-4">
                    <div className="text-sm text-gray-500">
                      Mostrando <strong>{appointments.length ? `1-${appointments.length}` : "0"}</strong> de <strong>{appointments.length}</strong> citas
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </CardFooter>
                </Card>
              </div>
            )}

            {/* ===== Reports Tab (plantilla, sin números ficticios) ===== */}
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

            {/* ===== Settings Tab (mantiene estructura; quité valores “institucionales” estrictos) ===== */}
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

      

      {/* Nuevo Monitor */}
      <Dialog open={showMonitorDialog} onOpenChange={setShowMonitorDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Monitor</DialogTitle>
            <DialogDescription>Agrega un nuevo monitor al sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="firstName">Nombres</Label><Input id="firstName" placeholder="Nombres" /></div>
              <div className="space-y-2"><Label htmlFor="lastName">Apellidos</Label><Input id="lastName" placeholder="Apellidos" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="email">Correo Electrónico</Label><Input id="email" type="email" placeholder="monitor@dominio.com" /></div>
            <div className="space-y-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" placeholder="+57 300 000 0000" /></div>
            <div className="space-y-2"><Label htmlFor="experience">Experiencia</Label><Input id="experience" placeholder="Ej: 2 años" /></div>
            <div className="space-y-2">
              <Label>Materias</Label>
              <div className="flex flex-wrap gap-2">
                {/* TODO: Lista de materias desde API */}
                {subjects.map((subject) => (<Badge key={subject.id} variant="outline" className="cursor-pointer hover:bg-red-50">{subject.name}</Badge>))}
                {subjects.length === 0 && <span className="text-xs text-gray-500">Sin materias aún</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Especialidades</Label>
              <Input placeholder="Ej: Límites, Derivadas, Integrales" />
              <p className="text-xs text-gray-500">Separa las especialidades con comas</p>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="sendCredentials" />
              <label htmlFor="sendCredentials" className="text-sm">Enviar credenciales por correo electrónico</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMonitorDialog(false)}>Cancelar</Button>
            <Button className="bg-red-800 hover:bg-red-900"><Plus className="h-4 w-4 mr-2" />Crear Monitor</Button>
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
