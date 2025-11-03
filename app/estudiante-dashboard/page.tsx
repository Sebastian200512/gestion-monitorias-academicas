"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/sidebar";
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
} from "lucide-react";

/* ===========================
   Sidebar 
   — Muestra navegación lateral y botón de cerrar sesión.
=========================== */
function AppSidebar({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const router = useRouter();
  // Cuando cierro sesión, regreso al login
  const handleLogout = () => {
    router.replace("/login-dashboard");
  };
  const menuItems = [
    { title: "Inicio", icon: Home, value: "home" },
    { title: "Agendar Cita", icon: Plus, value: "booking" },
    { title: "Mis Citas", icon: CalendarDays, value: "appointments" },
    { title: "Historial", icon: History, value: "history" },
    { title: "Notificaciones", icon: Bell, value: "notifications" },
    { title: "Configuración", icon: Settings, value: "settings" },
  ];

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
            <SidebarMenuItem key={item.value}>
              {/* Botón de cada sección, marcando la activa */}
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

        {/* Cerrar sesión al final */}
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
  );
}

/* ===========================
   Tipos (para darle forma a los datos)
   — Esto hace más claro qué espero de cada objeto.
=========================== */
interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}
interface Monitor {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  rating: number;
  experience: string;
  totalSessions: number;
  available: boolean;
  specialties: string[];
  schedule: { [key: string]: string[] };
}
interface TimeSlot {
  time: string;
  endTime?: string;
  available: boolean;
  monitorId?: string;
  slotId?: string;
  monitorName?: string;
  location?: string;
}
interface Appointment {
  id: string;
  subject: string;
  subjectCode: string;
  monitor: { name: string; email: string };
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  endTime: string;    // HH:mm
  location: string;
  status: "confirmada" | "pendiente" | "cancelada" | "completada";
  details: string;
  studentNotes?: string;
  monitorNotes?: string;
  createdAt: string;
  rating?: number;
  feedback?: string;
  topics?: string[];
  duration?: number;
  disponibilidad_id?: string;
}
type NotificationType =
  | "appointment_created"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "appointment_completed"
  | "appointment_reminder"
  | "system"
  | "monitor_message";
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string; // ISO
  timestamp: number; // para ordenar exacto
  read: boolean;
  appointmentId?: string;
  actionUrl?: string;
}

/* ===========================
   Helpers comunes
   — Utilidades pequeñas que uso en varios lados.
=========================== */
const formatTime12Hour = (time24: string) => {
  // Convierte "HH:mm" a formato 12 horas legible (es-CO)
  if (!time24) return "";
  const [h, m] = time24.split(":").map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
};
const toLocalDate = (fecha: string, hora: string) => new Date(`${fecha}T${hora}`);
// Fecha YYYY-MM-DD
const ymd = (date: Date) => date.toISOString().split("T")[0];
// Base de mi API
const API_BASE = "/api";

// Normalizo una cita que viene del API a mi tipo Appointment
function mapApiCitaToAppointment(cita: any): Appointment {
  const start = cita.hora_inicio?.slice(0,5) ?? "00:00";
  const end = cita.hora_fin?.slice(0,5) ?? start;
  return {
    id: String(cita.id),
    subject: cita.materia?.nombre ?? cita.materia_nombre ?? "Materia",
    subjectCode: cita.materia?.codigo ?? cita.materia_codigo ?? "",
    monitor: {
      name: cita.monitor?.nombre_completo ?? cita.monitor_nombre ?? "Monitor",
      email: cita.monitor?.correo ?? cita.monitor_email ?? ""
    },
    date: cita.fecha_cita,
    time: start,
    endTime: end,
    location: cita.ubicacion ?? "",
    status: cita.estado,
    details: cita.detalles ?? "",
    duration: (() => {
      // minutos entre inicio y fin
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      return (eh * 60 + em) - (sh * 60 + sm);
    })(),
    createdAt: cita.created_at ?? new Date().toISOString(),
    disponibilidad_id: cita.disponibilidad_id ? String(cita.disponibilidad_id) : undefined
  };
}

/* =========================================================
   NOTIFICACIONES (modo localStorage)
   — Guardo por usuario y no piso estados "leído".
========================================================= */
// Claves únicas por estudiante
const notifStorageKey = (uid: number) => `estudiante_notifications_${uid}`;
const notifiedKeysStorageKey = (uid: number) => `estudiante_notified_keys_${uid}`;
const notifVersionKey = (uid: number) => `estudiante_notifications_version_${uid}`; // por si cambio formato
const CURRENT_NOTIF_VERSION = 'v2';

// Carga lista de notificaciones desde localStorage
function loadNotificationsForUser(userId: number): Notification[] {
  try {
    let rawNotifs = localStorage.getItem(notifStorageKey(userId));
    let rawKeys = localStorage.getItem(notifiedKeysStorageKey(userId));
    let rawVer  = localStorage.getItem(notifVersionKey(userId));

    // Migración desde claves antiguas (si existen)
    if (!rawNotifs) {
      const oldKey = `student_notifications_${userId}`;
      rawNotifs = localStorage.getItem(oldKey);
      if (rawNotifs) {
        localStorage.setItem(notifStorageKey(userId), rawNotifs);
        localStorage.removeItem(oldKey);
        console.log("Migrated notifications from old key");
      }
    }
    if (!rawKeys) {
      const oldKeysKey = `student_notified_keys_${userId}`;
      rawKeys = localStorage.getItem(oldKeysKey);
      if (rawKeys) {
        localStorage.setItem(notifiedKeysStorageKey(userId), rawKeys);
        localStorage.removeItem(oldKeysKey);
        console.log("Migrated notified keys from old key");
      }
    }

    let loadedNotifs: Notification[] = [];
    let loadedKeys: string[] = [];

    if (rawNotifs) loadedNotifs = JSON.parse(rawNotifs);
    if (rawKeys) loadedKeys = JSON.parse(rawKeys);

    // Si cambia versión, normalizo fecha/timestamp
    if (rawVer !== CURRENT_NOTIF_VERSION) {
      loadedNotifs = loadedNotifs.map(n => ({
        ...n,
        date: new Date(n.date).toISOString(),
        timestamp: n.timestamp || new Date(n.date).getTime(),
      }));
      localStorage.setItem(notifVersionKey(userId), CURRENT_NOTIF_VERSION);
    }

    return loadedNotifs;
  } catch {
    return [];
  }
}
// Guarda lista de notificaciones
function saveNotificationsForUser(userId: number, items: Notification[]) {
  localStorage.setItem(notifStorageKey(userId), JSON.stringify(items));
  localStorage.setItem(notifVersionKey(userId), CURRENT_NOTIF_VERSION);
}
// Carga set de llaves ya notificadas (evita duplicar)
function loadNotifiedKeysForUser(userId: number): Set<string> {
  try {
    let raw = localStorage.getItem(notifiedKeysStorageKey(userId));
    if (!raw) {
      const oldKey = `student_notified_keys_${userId}`;
      raw = localStorage.getItem(oldKey);
      if (raw) {
        localStorage.setItem(notifiedKeysStorageKey(userId), raw);
        localStorage.removeItem(oldKey);
        console.log("Migrated notified keys from old key");
      }
    }

    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}
// Guarda set de llaves notificadas
function saveNotifiedKeysForUser(userId: number, keys: Set<string>) {
  localStorage.setItem(notifiedKeysStorageKey(userId), JSON.stringify(Array.from(keys)));
}

// Merge por id manteniendo "read:true" y orden por fecha
function mergeNotificationsById(existing: Notification[], incoming: Notification[]) {
  const map = new Map(existing.map(n => [n.id, n]));
  for (const n of incoming) {
    const prev = map.get(n.id);
    if (prev) {
      // Conservo "read", "date" y "timestamp" anteriores
      map.set(n.id, { ...n, read: prev.read, date: prev.date, timestamp: prev.timestamp });
    } else {
      map.set(n.id, n);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => (b.timestamp || new Date(b.date).getTime()) - (a.timestamp || new Date(a.date).getTime()));
}

/* ===========================
   Componente principal
=========================== */
export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home"); // pestaña actual

  // Estado de usuario autenticado
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Estados para agendar
  const [searchSubject, setSearchSubject] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [disponibilidadesMateria, setDisponibilidadesMateria] = useState<any[]>([]);
  const [selectedDisp, setSelectedDisp] = useState<{
    id: string;
    dia: "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado" | "domingo";
    hora_inicio: string;
    hora_fin: string;
    ubicacion?: string | null;
    monitor: { id: string; nombre: string; email?: string };
    materia: { id: string; nombre: string; codigo: string };
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Capacidad de cupos por disponibilidad/fecha (cache para no repetir fetch)
  const [capacityCache, setCapacityCache] = useState<Record<string, {ocupadas:number;limite:number;disponibles:number}>>({});
  const [isLoadingCapacity, setIsLoadingCapacity] = useState(false);

  // ymd local para este scope (evitar choques con la global)
  const ymd = (d: Date) => d.toISOString().slice(0,10);

  // Trae cupos de una disponibilidad en una fecha puntual
  async function loadCapacityFor(dispId: string | number, dateYMD: string) {
    const key = `${dispId}:${dateYMD}`;
    if (capacityCache[key]) return capacityCache[key];
    setIsLoadingCapacity(true);
    try {
      const res = await fetch(`/api/disponibilidades/${dispId}/capacidad?fecha=${dateYMD}`);
      if (!res.ok) throw new Error('Error al obtener capacidad');
      const data = await res.json();
      setCapacityCache(prev => ({ ...prev, [key]: data }));
      return data;
    } finally {
      setIsLoadingCapacity(false);
    }
  }

  // Estados para citas y modales
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showModifyDialog, setShowModifyDialog] = useState(false);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [isLoadingModify, setIsLoadingModify] = useState(false);
  const [modifyDia, setModifyDia] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filtros del historial
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all");

  // Estados de seguridad/cuenta
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =============== NOTIFICACIONES (control y refs) ===============
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [userNotifications, setUserNotifications] = useState<Notification[]>([]);
  const [notifiedKeys, setNotifiedKeys] = useState<Set<string>>(new Set());
  const [prevAppointments, setPrevAppointments] = useState<Appointment[]>([]);
  // Refs para ordenar la secuencia de carga (primero storage, luego citas, etc.)
  const storageReadyRef = useRef(false);
  const appointmentsLoadedRef = useRef(false);
  const currentAppointmentsRef = useRef<Appointment[]>([]);
  const loadedNotifsRef = useRef<Notification[]>([]);
  const loadedKeysRef = useRef<Set<string>>(new Set());

  // Perfil (tab settings, datos bloqueados para ediciones aquí)
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    studentId: "",
    program: "",
    semester: "",
  });

  // Listas generales
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectMonitorMap, setSubjectMonitorMap] = useState(new Map<string, Set<string>>());
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);

  /* ===========================
     Auth & usuario
     — Si no hay user, mando al login. Si hay, guardo id.
  =========================== */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);
      setUserId(parsedUser.id);
    } else {
      router.push("/login-dashboard");
    }
  }, [router]);

  // Cargo datos del usuario solo cuando estoy en "settings"
  useEffect(() => {
    if (activeTab === "settings" && userId) {
      fetch("/api/usuarios")
        .then((res) => res.json())
        .then((users) => {
          const fullUser = users.find((u: any) => u.id === userId);
          if (fullUser) {
            const [firstName, ...lastNameParts] = (fullUser.nombre || fullUser.nombre_completo || "").split(" ");
            setUserData({
              firstName: firstName || "",
              lastName: lastNameParts.join(" ") || "",
              email: fullUser.email || fullUser.correo || "",
              studentId: fullUser.codigo || "",
              program: fullUser.programa || "",
              semester: fullUser.semestre ? String(fullUser.semestre) : "",
            });
          }
        })
        .catch((e) => console.error("Error cargando info usuario:", e));
    }
  }, [activeTab, userId]);

  /* ===============================================
     NOTIFICACIONES — cargo cache del usuario una vez
     — Primero storage, luego, si ya hay citas, genero.
  =============================================== */
  useEffect(() => {
    if (!userId || storageReadyRef.current) return;
    const loadedNotifs = loadNotificationsForUser(userId);
    const loadedKeys = loadNotifiedKeysForUser(userId);

    setUserNotifications(loadedNotifs);
    setNotifiedKeys(loadedKeys);
    loadedNotifsRef.current = loadedNotifs;
    loadedKeysRef.current = loadedKeys;
    storageReadyRef.current = true; // ya puedo generar sin perder "read"
    console.log("Notificaciones cargadas desde localStorage:", loadedNotifs.length);

    if (appointmentsLoadedRef.current) {
      generateNotifications(currentAppointmentsRef.current);
    }
  }, [userId]);

  // Genero notificaciones a partir de las citas (nuevas, cambios y recordatorios)
  const generateNotifications = useCallback(
    (currentAppointments: Appointment[]) => {
      if (!userId) return;

      // Ordeno por fecha para que el flujo sea consistente
      const sortedAppointments = currentAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log("Generando notificaciones para citas:", sortedAppointments.length);
      let nextNotifications = [...userNotifications];
      const keys = new Set(notifiedKeys);
      const prevMap = new Map(prevAppointments.map(a => [a.id, a]));

      const now = Date.now();
      const THIRTY_SIX_HOURS = 36 * 60 * 60 * 1000;

      // Evito duplicados por llave
      const pushUnique = (n: Notification, key: string) => {
        if (keys.has(key)) return nextNotifications;
        if (!nextNotifications.some(x => x.id === n.id)) {
          nextNotifications = [n, ...nextNotifications].slice(0, 100);
          keys.add(key);
        }
        return nextNotifications;
      };

      // Limpio recordatorios viejos de una cita (si se cancela o sale del rango)
      const removeRemindersFor = (appointmentId: string) => {
        nextNotifications = nextNotifications.filter(n => !(n.type === "appointment_reminder" && n.appointmentId === appointmentId));
        const cleaned = new Set<string>();
        keys.forEach(k => {
          if (!k.startsWith(`reminder:${appointmentId}:`)) cleaned.add(k);
        });
        keys.clear();
        cleaned.forEach(k => keys.add(k));
      };

      for (const apt of sortedAppointments) {
        console.log("Procesando cita:", apt.id, apt.status, apt.date, apt.time);
        const prev = prevMap.get(apt.id);
        const startTime = new Date(`${apt.date}T${apt.time}`).getTime();

        // Nueva cita: notifico una sola vez
        if (!prev) {
          const now = Date.now();
          nextNotifications = pushUnique({
            id: `appointment_created-${apt.id}`,
            type: "appointment_created",
            title: "Cita agendada",
            message: `Agendaste ${apt.subject} con ${apt.monitor.name} el ${new Date(apt.date).toLocaleDateString("es-ES")} a las ${formatTime12Hour(apt.time)}`,
            date: new Date(now).toISOString(),
            timestamp: now,
            read: false,
            appointmentId: apt.id
          }, `created:${apt.id}`);
          console.log("Notificación creada para nueva cita");
        }

        // Estado actual (por si ya viene confirmada/cancelada/completada)
        if (apt.status === "confirmada") {
          const now = Date.now();
          nextNotifications = pushUnique({
            id: `appointment_confirmed-${apt.id}`,
            type: "appointment_confirmed",
            title: "Cita confirmada",
            message: `Tu cita de ${apt.subject} fue confirmada por el monitor.`,
            date: new Date(now).toISOString(),
            timestamp: now,
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:confirmada`);
        } else if (apt.status === "cancelada") {
          removeRemindersFor(apt.id);
          const now = Date.now();
          nextNotifications = pushUnique({
            id: `appointment_cancelled-${apt.id}`,
            type: "appointment_cancelled",
            title: "Cita cancelada",
            message: `Tu cita de ${apt.subject} fue cancelada.`,
            date: new Date(now).toISOString(),
            timestamp: now,
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:cancelada`);
        } else if (apt.status === "completada") {
          const now = Date.now();
          nextNotifications = pushUnique({
            id: `appointment_completed-${apt.id}`,
            type: "appointment_completed",
            title: "Cita completada",
            message: `Finalizaste la monitoría de ${apt.subject}.`,
            date: new Date(now).toISOString(),
            timestamp: now,
            read: false,
            appointmentId: apt.id
          }, `status:${apt.id}:completada`);
        }

        // Si cambió el estado, genero la notificación del cambio
        if (prev && prev.status !== apt.status) {
          if (apt.status === "cancelada") {
            removeRemindersFor(apt.id);
            const now = Date.now();
            nextNotifications = pushUnique({
              id: `appointment_cancelled-${apt.id}`,
              type: "appointment_cancelled",
              title: "Cita cancelada",
              message: `Tu cita de ${apt.subject} fue cancelada.`,
              date: new Date(now).toISOString(),
              timestamp: now,
              read: false,
              appointmentId: apt.id
            }, `status:${apt.id}:cancelada`);
          } else if (apt.status === "confirmada") {
            const now = Date.now();
            nextNotifications = pushUnique({
              id: `appointment_confirmed-${apt.id}`,
              type: "appointment_confirmed",
              title: "Cita confirmada",
              message: `Tu cita de ${apt.subject} fue confirmada por el monitor.`,
              date: new Date(now).toISOString(),
              timestamp: now,
              read: false,
              appointmentId: apt.id
            }, `status:${apt.id}:confirmada`);
          } else if (apt.status === "completada") {
            const now = Date.now();
            nextNotifications = pushUnique({
              id: `appointment_completed-${apt.id}`,
              type: "appointment_completed",
              title: "Cita completada",
              message: `Finalizaste la monitoría de ${apt.subject}.`,
              date: new Date(now).toISOString(),
              timestamp: now,
              read: false,
              appointmentId: apt.id
            }, `status:${apt.id}:completada`);
          }
        }

        // Recordatorios: solo para pendientes/confirmadas dentro de 36h
        if (apt.status !== "cancelada" && apt.status !== "completada") {
          const msUntilStart = startTime - now;
          if (msUntilStart > 0 && msUntilStart <= THIRTY_SIX_HOURS) {
            const now = Date.now();
            nextNotifications = pushUnique({
              id: `appointment_reminder-${apt.id}`,
              type: "appointment_reminder",
              title: "Recordatorio de cita",
              message: `Tienes ${apt.subject} con ${apt.monitor.name} el ${new Date(apt.date).toLocaleDateString("es-ES")} a las ${formatTime12Hour(apt.time)}`,
              date: new Date(now).toISOString(),
              timestamp: now,
              read: false,
              appointmentId: apt.id
            }, `reminder:${apt.id}:${new Date(apt.date).toDateString()}`);
          } else {
            // Si ya no aplica el recordatorio, lo limpio
            removeRemindersFor(apt.id);
          }
        }
      }

      // Guardo y actualizo estados/refs
      const merged = mergeNotificationsById(loadedNotifsRef.current, nextNotifications);
      setUserNotifications(merged);
      setNotifiedKeys(keys);
      localStorage.setItem(notifStorageKey(userId), JSON.stringify(merged));
      localStorage.setItem(notifiedKeysStorageKey(userId), JSON.stringify(Array.from(keys)));
      loadedNotifsRef.current = merged;
      loadedKeysRef.current = keys;
      setPrevAppointments(sortedAppointments);
    },
    [userId, userNotifications, notifiedKeys, prevAppointments]
  );

  /* ==============================================================
     Traer citas del estudiante y generar notificaciones
     — Hago polling cada minuto para reflejar cambios.
  ============================================================== */
  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(`/api/citas?estudiante_id=${userId}`, { cache: "no-store" });
        if (!res.ok) {
          // Si no responde, limpio para no mostrar basura
          setUpcomingAppointments([]);
          setHistoryAppointments([]);
          setPrevAppointments([]);
          return;
        }
        const json = await res.json();
        const list = Array.isArray(json?.data) ? json.data : [];

        const mapped: Appointment[] = list.map(mapApiCitaToAppointment);

        // Separo próximas y anteriores en base a fecha/hora fin
        const now = new Date();
        const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isPast = (a: Appointment) => {
          const ad = new Date(a.date);
          const aYMD = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate());
          if (aYMD < todayYMD) return true;
          if (aYMD > todayYMD) return false;
          const [eh, em] = (a.endTime || a.time).split(":").map(Number);
          const end = new Date();
          end.setHours(eh ?? 0, em ?? 0, 0, 0);
          return end < now;
        };
        const upcoming = mapped.filter((a) => !isPast(a) && a.status !== "completada");
        const history = mapped.filter((a) => isPast(a) || a.status === "completada");
        setUpcomingAppointments(upcoming);
        setHistoryAppointments(history);

        // Guardo prev en primera carga
        if (prevAppointments.length === 0) {
          setPrevAppointments(mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        // Referencia actual para el generador de notificaciones
        currentAppointmentsRef.current = mapped;
        appointmentsLoadedRef.current = true;

        // Genero notificaciones solo cuando storage ya está listo
        if (storageReadyRef.current) {
          generateNotifications(mapped);
        }
      } catch (e) {
        console.error("Error fetching student appointments:", e);
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 60000); // cada 60s

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  /* ===========================
     Búsqueda de materias (debounced)
     — Evito disparar fetch por cada tecla.
  =========================== */
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchSubject.length >= 2) {
        try {
          const searchRes = await fetch(`${API_BASE}/materias?search=${encodeURIComponent(searchSubject)}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const filtered = searchData.map((subject: any) => ({
              id: subject.id.toString(),
              name: subject.name,
              code: subject.code,
              credits: subject.credits,
            }));
            setFilteredSubjects(filtered);
          } else {
            // Si la API no está lista, intento filtrar sobre lo que ya tengo
            throw new Error("API search not available");
          }
        } catch {
          setFilteredSubjects((prev) =>
            prev.filter(
              (s) =>
                s.name.toLowerCase().includes(searchSubject.toLowerCase()) ||
                s.code.toLowerCase().includes(searchSubject.toLowerCase())
            )
          );
        }
      } else {
        setFilteredSubjects([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchSubject]);

  /* ===========================
     Disponibilidades por materia
     — Al elegir materia, traigo las disponibilidades activas.
  =========================== */
  useEffect(() => {
    if (selectedSubject) {
      const loadDisponibilidades = async () => {
        const res = await fetch(`${API_BASE}/disponibilidades?materia_id=${selectedSubject.id}&estado=Activa`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.data.map((d: any) => ({
            id: String(d.id),
            dia: d.dia,
            hora_inicio: d.hora_inicio.substring(0, 5),
            hora_fin: d.hora_fin.substring(0, 5),
            ubicacion: d.ubicacion || null,
            monitor: { id: String(d.monitor.id), nombre: d.monitor.nombre_completo, email: d.monitor.correo },
            materia: { id: String(d.materia.id), nombre: d.materia.nombre, codigo: d.materia.codigo },
          }));
          setDisponibilidadesMateria(mapped);
        }
      };
      loadDisponibilidades();
    } else {
      setDisponibilidadesMateria([]);
    }
    // Limpio selección cuando cambio de materia
    setSelectedDisp(null);
    setSelectedDate(null);
  }, [selectedSubject]);

  /* ===========================
     Cargar capacidad cuando ya elegí disp + fecha
  =========================== */
  useEffect(() => {
    if (!selectedDisp || !selectedDate) return;
    loadCapacityFor(selectedDisp.id, ymd(selectedDate)).catch(() => {});
  }, [selectedDisp, selectedDate]);

  /* ===========================
     Cargar catálogos (materias/monitores) y datos del usuario
     — Armo mapas útiles (materia -> monitores) y lleno tarjetas.
  =========================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Materias
        const subjectsRes = await fetch(`${API_BASE}/materias`);
        if (subjectsRes.ok) {
          const subjectsData = await subjectsRes.json();
          const allSubjects = subjectsData.map((subject: any) => ({
            id: subject.id.toString(),
            name: subject.name,
            code: subject.code,
            credits: subject.credits,
          }));

          // Disponibilidades para saber qué materias sí tienen monitor
          const allDispRes = await fetch(`${API_BASE}/disponibilidades`);
          if (allDispRes.ok) {
            const dispData = await allDispRes.json();
            const map = new Map<string, Set<string>>();
            dispData.data.forEach((disp: any) => {
              const subjectId = disp.materia.id.toString();
              const monitorName = disp.monitor.nombre_completo;
              if (!map.has(subjectId)) map.set(subjectId, new Set());
              map.get(subjectId)!.add(monitorName);
            });
            const availableSubjects = allSubjects.filter((s: Subject) => map.has(s.id));
            setSubjects(availableSubjects);
            setSubjectMonitorMap(map);
          } else {
            // Si falla, muestro todas las materias disponibles
            setSubjects(allSubjects);
          }
        }

        // Monitores (si tu API los tiene aparte)
        const monitorsRes = await fetch(`${API_BASE}/monitors`);
        if (monitorsRes.ok) setMonitors(await monitorsRes.json());

        // Limpio slots (se recalculan al elegir materia)
        setAvailableSlots([]);

        // Citas y usuario (para home y settings)
        if (userId) {
          const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`);
          if (appointmentsRes.ok) {
            const data = await appointmentsRes.json();
            const appointments: Appointment[] = data.data.map(mapApiCitaToAppointment);
            const now = new Date();
            const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const isPastAppointment = (apt: Appointment) => {
              const ad = new Date(apt.date);
              const aYMD = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate());
              if (aYMD < todayYMD) return true;
              if (aYMD > todayYMD) return false;
              const [eh, em] = (apt.endTime || apt.time).split(":").map(Number);
              const end = new Date();
              end.setHours(eh ?? 0, em ?? 0, 0, 0);
              return end < now;
            };
            const upcoming = appointments.filter((a) => !isPastAppointment(a) && a.status !== "completada");
            const history = appointments.filter((a) => isPastAppointment(a) || a.status === "completada");
            setUpcomingAppointments(upcoming);
            setHistoryAppointments(history);
          }

          const userRes = await fetch(`${API_BASE}/usuarios`);
          if (userRes.ok) {
            const users = await userRes.json();
            const fullUser = users.find((u: any) => u.id === userId);
            if (fullUser) {
              setCurrentUser(fullUser);
              localStorage.setItem("user", JSON.stringify(fullUser));
              const [firstName, ...lastNameParts] = (fullUser.nombre || fullUser.nombre_completo || "").split(" ");
              setUserData({
                firstName: firstName || "",
                lastName: lastNameParts.join(" ") || "",
                email: fullUser.email || fullUser.correo || "",
                studentId: fullUser.codigo || "",
                program: fullUser.programa || "",
                semester: fullUser.semestre ? String(fullUser.semestre) : "",
              });
            }
          }
        }

        // Notificaciones: purgo recordatorios viejos para no confundir
        if (userId) {
          const cached = loadNotificationsForUser(userId);
          const purged = cached.filter((n) => {
            if (n.type !== "appointment_reminder") return true;
            const reminderDate = new Date(n.date);
            const now = new Date();
            const futureLimit = new Date(now.getTime() + 36 * 60 * 60 * 1000);
            return reminderDate > now && reminderDate <= futureLimit;
          });
          setUserNotifications(purged);
          saveNotificationsForUser(userId, purged);

          const keys = loadNotifiedKeysForUser(userId);
          setNotifiedKeys(keys);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (API_BASE && userId) {
      loadData();
    }
  }, [userId]);

  /* ===========================
     Utilidades varias (fechas, colores, etc.)
  =========================== */
  const weekdayToIndex: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  // Slot único cuando la disponibilidad es una franja fija
  const getSingleTimeSlot = (): TimeSlot[] => {
    if (!selectedDate || !selectedDisp) return [];
    return [
      {
        time: selectedDisp.hora_inicio,
        endTime: selectedDisp.hora_fin,
        available: true,
        monitorId: selectedDisp.monitor.id,
        slotId: selectedDisp.id,
        monitorName: selectedDisp.monitor.nombre,
      },
    ];
  };

  // Dibujo calendario mensual con reglas básicas (pasado/deshabilitado, hoy, etc.)
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isPast = date < today;
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

      const isAvailable = selectedDisp
        ? isCurrentMonth &&
          !isPast &&
          date.getDay() ===
            (typeof selectedDisp.dia === "string" ? weekdayToIndex[selectedDisp.dia.toLowerCase()] : selectedDisp.dia)
        : isCurrentMonth && !isPast;

      days.push({ date, day: date.getDate(), isCurrentMonth, isToday, isPast, isSelected, isAvailable });
    }

    return days;
  };

  // Colores/íconos por estado de la cita
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-amber-600 hover:bg-amber-700";
      case "pendiente":
        return "bg-gray-500 hover:bg-gray-600";
      case "cancelada":
        return "bg-red-600 hover:bg-red-700";
      case "completada":
        return "bg-green-600 hover:bg-green-700";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="h-4 w-4" />;
      case "pendiente":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelada":
        return <XCircle className="h-4 w-4" />;
      case "completada":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Valido si ya se puede confirmar (materia + disp + fecha)
  const canBookAppointment = () => selectedSubject !== null && selectedDisp !== null && selectedDate !== null;

  // Crear cita (POST) con validaciones simples y refresco de listas
  const handleBookAppointment = async () => {
    if (!selectedDisp || !userId || !selectedDate) return;
    try {
      const requestData = {
        estudiante_id: userId,
        disponibilidad_id: selectedDisp.id,
        fecha_cita: selectedDate.toISOString().split("T")[0],
      };
      const res = await fetch(`${API_BASE}/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const responseData = await res.json();

      if (res.ok && responseData.ok) {
        alert("Cita agendada exitosamente");
        resetBookingForm();
        setActiveTab("appointments");
        const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`);
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          const appointments: Appointment[] = data.data.map((cita: any) => ({
            id: cita.id.toString(),
            subject: cita.materia.nombre,
            subjectCode: cita.materia.codigo,
            monitor: { name: cita.monitor.nombre_completo, email: cita.monitor.correo },
            date: cita.fecha_cita,
            time: cita.hora_inicio,
            endTime: cita.hora_fin,
            location: cita.ubicacion || "",
            status: cita.estado,
            duration: calculateDuration(cita.hora_inicio, cita.hora_fin),
          }));
          const now = new Date();
          const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPastAppointment = (apt: Appointment) => {
            const ad = new Date(apt.date);
            const aYMD = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate());
            if (aYMD < todayYMD) return true;
            if (aYMD > todayYMD) return false;
            const [eh, em] = (apt.endTime || apt.time).split(":").map(Number);
            const end = new Date();
            end.setHours(eh ?? 0, em ?? 0, 0, 0);
            return end < now;
          };
          const upcoming = appointments.filter((a) => !isPastAppointment(a) && a.status !== "completada");
          const history = appointments.filter((a) => isPastAppointment(a) || a.status === "completada");

          setUpcomingAppointments(upcoming);
          setHistoryAppointments(history);

          currentAppointmentsRef.current = appointments;
          generateNotifications(appointments);
        }
      } else {
        alert(`Error al agendar la cita: ${responseData.msg || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Error al agendar la cita");
    }
  };

  // Limpio el formulario de agendamiento
  const resetBookingForm = () => {
    setSearchSubject("");
    setFilteredSubjects([]);
    setSelectedSubject(null);
    setDisponibilidadesMateria([]);
    setSelectedDisp(null);
    setSelectedDate(null);
  };

  // Cancelar cita (PUT) y refrescar listas + notificaciones
  const handleCancelAppointment = async (appointment: Appointment) => {
    try {
      const res = await fetch(`${API_BASE}/citas/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cancelada" }),
      });

      if (res.ok) {
        setUpcomingAppointments((prev) =>
          prev.map((apt) => (apt.id === appointment.id ? { ...apt, status: "cancelada" as const } : apt))
        );

        const appointmentsRes = await fetch(`${API_BASE}/citas?estudiante_id=${userId}`);
        if (appointmentsRes.ok) {
          const data = await appointmentsRes.json();
          const appointments: Appointment[] = data.data.map((cita: any) => ({
            id: cita.id.toString(),
            subject: cita.materia.nombre,
            subjectCode: cita.materia.codigo,
            monitor: { name: cita.monitor.nombre_completo, email: cita.monitor.correo },
            date: cita.fecha_cita,
            time: cita.hora_inicio,
            endTime: cita.hora_fin,
            location: cita.ubicacion || "",
            status: cita.estado,
            duration: calculateDuration(cita.hora_inicio, cita.hora_fin),
          }));

          const now = new Date();
          const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const isPastAppointment = (apt: Appointment) => {
            const ad = new Date(apt.date);
            const aYMD = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate());
            if (aYMD < todayYMD) return true;
            if (aYMD > todayYMD) return false;
            const [eh, em] = (apt.endTime || apt.time).split(":").map(Number);
            const end = new Date();
            end.setHours(eh ?? 0, em ?? 0, 0, 0);
            return end < now;
          };
          const upcoming = appointments.filter((a) => !isPastAppointment(a) && a.status !== "completada");
          const history = appointments.filter((a) => isPastAppointment(a) || a.status === "completada");

          setUpcomingAppointments(upcoming);
          setHistoryAppointments(history);

          generateNotifications(appointments);
        }

        alert("Cita cancelada exitosamente");
      } else {
        alert("Error al cancelar la cita");
      }
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("Error al cancelar la cita");
    }
  };

  // Abro modal para modificar solo la fecha de una cita
  const handleModifyAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewDate(new Date(appointment.date));
    setModifyDia(appointment.disponibilidad_id ? null : null);
    setShowModifyDialog(true);

    // Si la cita está ligada a una disponibilidad con día específico, lo traigo
    if (appointment.disponibilidad_id) {
      try {
        const dispRes = await fetch(`${API_BASE}/disponibilidades/${appointment.disponibilidad_id}`);
        if (dispRes.ok) {
          const dispData = await dispRes.json();
          setModifyDia(dispData.dia);
        }
      } catch (error) {
        console.error("Error fetching disponibilidad:", error);
      }
    }
  };

  // Guardar cambios de fecha (PATCH)
  const handleSaveModifiedAppointment = async () => {
    if (!selectedAppointment || !newDate || !userId) return;

    // Validaciones simples para no dejar mover a la misma fecha o al pasado
    const originalDate = new Date(selectedAppointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate < today) {
      alert("No se puede seleccionar una fecha anterior a hoy.");
      return;
    }
    if (newDate.getTime() === originalDate.getTime()) {
      alert("La nueva fecha debe ser diferente a la fecha actual.");
      return;
    }

    // Evito conflicto con otra cita misma fecha/hora/monitor
    const allAppointments = [...upcomingAppointments, ...historyAppointments];
    const hasConflict = allAppointments.some(
      (apt) =>
        apt.id !== selectedAppointment.id &&
        apt.date === newDate.toISOString().split("T")[0] &&
        apt.time === selectedAppointment.time &&
        apt.monitor.name === selectedAppointment.monitor.name
    );
    if (hasConflict) {
      alert("Ya tienes una cita programada para esa fecha y hora con el mismo monitor.");
      return;
    }

    setIsLoadingModify(true);
    try {
      let payload: any = { fecha_cita: newDate.toISOString().split("T")[0] };

      // Si en tu API te exige cambiar disponibilidad, aquí iría la lógica extra
      const res = await fetch(`${API_BASE}/citas/${selectedAppointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseData = await res.json();

      if (res.ok) {
        const updatedAppointment = {
          ...selectedAppointment,
          date: responseData.data.fecha_cita,
          status: responseData.data.estado || selectedAppointment.status,
          location: responseData.data.ubicacion || selectedAppointment.location,
        };

        // Reconstruyo las listas y vuelvo a separar futuras/historial
        const pool = [...upcomingAppointments, ...historyAppointments].filter((a) => a.id !== selectedAppointment.id);
        pool.push(updatedAppointment);

        const now = new Date();
        const todayYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const isPastAppointment = (apt: Appointment) => {
          const ad = new Date(apt.date);
          const aYMD = new Date(ad.getFullYear(), ad.getMonth(), ad.getDate());
          if (aYMD < todayYMD) return true;
          if (aYMD > todayYMD) return false;
          const [eh, em] = (apt.endTime || apt.time).split(":").map(Number);
          const end = new Date();
          end.setHours(eh ?? 0, em ?? 0, 0, 0);
          return end < now;
        };
        const upcoming = pool.filter((a) => !isPastAppointment(a) && a.status !== "completada");
        const history = pool.filter((a) => isPastAppointment(a) || a.status === "completada");

        setUpcomingAppointments(upcoming);
        setHistoryAppointments(history);

        generateNotifications(pool);

        // Cierro modal y limpio estados
        setShowModifyDialog(false);
        setSelectedAppointment(null);
        setNewDate(null);
        setModifyDia(null);
        alert(responseData.msg || "Fecha de la cita modificada exitosamente.");
      } else {
        alert(responseData.msg || "Error al modificar la cita");
      }
    } catch (error) {
      console.error("Error modifying appointment:", error);
      alert("Error al modificar la cita.");
    } finally {
      setIsLoadingModify(false);
    }
  };

  // Cambio de contraseña (PATCH) validando confirmación
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const email = userData.email;
      const res = await fetch("/api/auth/login", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Contraseña cambiada correctamente");
        setShowPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      alert("Error al cambiar la contraseña");
      console.error(error);
    }
  };

  // Helpers de tiempo/duración
  const parseHHMM = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d;
  };
  const calculateDuration = (startTime: string, endTime: string): number => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };

  // Derivados para comparar contra hoy
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isPastAppointment = (apt: Appointment) => {
    const aptDate = new Date(apt.date);
    const aptYMD = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
    if (aptYMD < today) return true;
    if (aptYMD > today) return false;
    const [eh, em] = (apt.endTime || apt.time).split(":").map(Number);
    const end = new Date();
    end.setHours(eh ?? 0, em ?? 0, 0, 0);
    return end < now;
  };
  const allAppointments = [...upcomingAppointments, ...historyAppointments];

  // Búsqueda + filtro por estado para las listas de "Mis Citas"
  const filteredUpcomingAppointments = upcomingAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });
  const filteredPastAppointments = historyAppointments.filter((appointment) => {
    const matchesSearch =
      appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || appointment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Normalizo fecha segura y rango por período (mes actual, pasado, semestre)
  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  };
  const getDateRange = (period: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    switch (period) {
      case "this_month":
        return { start: new Date(year, month, 1), end: new Date(year, month + 1, 0) };
      case "last_month":
        return { start: new Date(year, month - 1, 1), end: new Date(year, month, 0) };
      case "this_semester":
        return { start: month < 6 ? new Date(year, 0, 1) : new Date(year, 6, 1), end: month < 6 ? new Date(year, 5, 30) : new Date(year, 11, 31) };
      default:
        return null;
    }
  };
  const filteredHistoryAppointments = historyAppointments
    .filter((appointment) => {
      const matchesSearch =
        appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.monitor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = filterSubject === "all" || appointment.subjectCode === filterSubject;
      let matchesPeriod = true;
      if (filterPeriod !== "all") {
        const range = getDateRange(filterPeriod);
        if (range) {
          const aptDate = normalizeDate(appointment.date);
          matchesPeriod = !!aptDate && aptDate >= range.start && aptDate <= range.end;
        }
      }
      return matchesSearch && matchesSubject && matchesPeriod;
    })
    .sort((a, b) => {
      const dateA = normalizeDate(a.date);
      const dateB = normalizeDate(b.date);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      if (dateA.getTime() !== dateB.getTime()) return dateB.getTime() - dateA.getTime();
      return b.time.localeCompare(a.time);
    });

  // Stats rápidos para tarjetas
  const stats = {
    totalSessions: historyAppointments.filter((apt) => apt.status === "completada").length,
    totalHours: historyAppointments.filter((apt) => apt.status === "completada").reduce((sum, apt) => sum + (apt.duration || 0), 0) / 60,
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
        ? Object.keys(subjectCounts).reduce((a, b) => (subjectCounts[a] > subjectCounts[b] ? a : b))
        : "Sin datos";
    })(),
  };

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen bg-gray-50 overflow-hidden">
        <AppSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <SidebarInset className="flex-1 w-full min-h-screen bg-gray-50">
          {/* Header superior con título contextual y accesos rápidos */}
          <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger/>
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
                    {activeTab === "history" && "Revisa tu progreso académico"}
                    {activeTab === "notifications" && "Mantente al día con tus actividades y recordatorios"}
                    {activeTab === "settings" && "Gestiona tu perfil"}
                  </p>
                </div>
              </div>
              {activeTab === "home" && (
                <div className="flex gap-2">
                  {/* Si el usuario también tiene rol de monitor, muestro acceso directo */}
                  {currentUser?.roles && currentUser.roles.includes('MONITOR') && (
                    <Button size="sm" variant="outline" onClick={() => router.push('/monitor-dashboard')}>
                      <User className="h-4 w-4 mr-2" />
                      Monitor
                    </Button>
                  )}
                  {/* Acceso a notificaciones con contador */}
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

          {/* Contenido principal por pestaña */}
          <main className="p-6">
            {/* HOME */}
            {activeTab === "home" && (
              <div className="space-y-6">
                {/* Tarjetas rápidas */}
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

                {/* Acceso rápido a agendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Agendar Nueva Monitoría
                    </CardTitle>
                    <CardDescription>Solicita apoyo académico</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="bg-red-800 hover:bg-red-900" onClick={() => setActiveTab("booking")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Cita
                    </Button>
                  </CardContent>
                </Card>

                {/* Próximas citas (hasta 4) */}
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
                      upcomingAppointments
                        .sort((a, b) => {
                          const dateA = normalizeDate(a.date);
                          const dateB = normalizeDate(b.date);
                          if (!dateA && !dateB) return 0;
                          if (!dateA) return 1;
                          if (!dateB) return -1;
                          if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
                          return a.time.localeCompare(b.time);
                        })
                        .slice(0, 4)
                        .map((appointment) => (
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

            {/* AGENDAR */}
            {activeTab === "booking" && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Formulario principal */}
                  <div className="lg:col-span-2">
                    {/* Selección de materia y disponibilidad */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Selecciona la Materia y Disponibilidad
                        </CardTitle>
                        <CardDescription>Busca una materia y elige una disponibilidad activa</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Búsqueda de materia */}
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar materia por nombre o código..."
                            className="pl-10"
                            value={searchSubject}
                            onChange={(e) => setSearchSubject(e.target.value)}
                          />
                        </div>

                        {/* Lista filtrada de materias con selección */}
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

                        {/* Disponibilidades activas de la materia seleccionada */}
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

                    {/* Selección de fecha/horario (calendario básico) */}
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
                          {/* Calendario mensual con navegación */}
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

                  {/* Resumen lateral y confirmación */}
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

                        {/* Cupos de la fecha seleccionada */}
                        {selectedDisp && selectedDate && (
                          <div className="flex items-center gap-2 text-sm">
                            {isLoadingCapacity ? (
                              <span className="text-gray-500">Cargando cupos...</span>
                            ) : (() => {
                              const key = `${selectedDisp.id}:${ymd(selectedDate)}`;
                              const cap = capacityCache[key];
                              if (!cap) return <span className="text-gray-500">Sin datos de cupos</span>;
                              return (
                                <>
                                  <span className="px-2 py-1 rounded border border-gray-200">
                                    Cupos: {cap.ocupadas}/{cap.limite}
                                  </span>
                                  <span className={cap.disponibles > 0 ? "text-gray-600" : "text-red-600 font-medium"}>
                                    Disponibles: {cap.disponibles}
                                  </span>
                                  {cap.disponibles <= 0 && (
                                    <div className="text-red-600 font-medium">
                                      No hay cupos disponibles para este horario.
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Botón Confirmar, deshabilitado si no hay cupos */}
                        {canBookAppointment() && (
                          <div className="border-t pt-4">
                            <Button
                              className="w-full bg-red-800 hover:bg-red-900"
                              onClick={handleBookAppointment}
                              disabled={
                                isLoadingCapacity ||
                                (() => {
                                  const key = `${selectedDisp?.id}:${selectedDate ? ymd(selectedDate) : ""}`;
                                  const cap = key && capacityCache[key];
                                  return !cap || cap.disponibles <= 0;
                                })()
                              }
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

            {/* MIS CITAS */}
            {activeTab === "appointments" && (
              <div className="space-y-6">
                {/* Buscador + filtros */}
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

                {/* Tabs Próximas / Anteriores */}
                <Tabs defaultValue="upcoming" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="upcoming">Próximas ({filteredUpcomingAppointments.length})</TabsTrigger>
                    <TabsTrigger value="past">Anteriores ({filteredPastAppointments.length})</TabsTrigger>
                  </TabsList>

                  {/* Próximas */}
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
                      filteredUpcomingAppointments
                        .sort((a, b) => {
                          const dateA = normalizeDate(a.date);
                          const dateB = normalizeDate(b.date);
                          if (!dateA && !dateB) return 0;
                          if (!dateA) return 1;
                          if (!dateB) return -1;
                          if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
                          return a.time.localeCompare(b.time);
                        })
                        .map((appointment) => (
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

                  {/* Anteriores */}
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

                              </div>
                            </div>

                            {/* Bloques opcionales si existen comentarios/notas */}
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

            {/* HISTORIAL */}
            {activeTab === "history" && (
              <div className="space-y-6">
                {/* Tarjetas de KPIs */}
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

                {/* Filtros de historial */}
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

                {/* Lista del historial con orden y chips de temas si existen */}
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
            
            {/* NOTIFICACIONES */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
                    <p className="text-sm text-gray-500">{userNotifications.filter((n) => !n.read).length} notificaciones sin leer</p>
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
                    {userNotifications.some((n) => !n.read) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!userId) return;
                          const updated = userNotifications.map((n) => ({ ...n, read: true }));
                          setUserNotifications(updated);
                          loadedNotifsRef.current = updated;
                          saveNotificationsForUser(userId, updated);
                          localStorage.setItem(notifStorageKey(userId), JSON.stringify(updated));
                          console.log("Marcando todas las notificaciones como leídas");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar todas como leídas
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // Orden: primero sin leer, luego leídas; dentro de cada grupo, más recientes primero
                    const filtered = userNotifications
                      .filter((n) => {
                        if (notificationFilter === "all") return true;
                        if (notificationFilter === "unread") return !n.read;
                        return n.type === (notificationFilter as NotificationType);
                      })
                      .sort((a, b) => {
                        if (a.read !== b.read) {
                          return a.read ? 1 : -1;
                        }
                        return (b.timestamp || new Date(b.date).getTime()) - (a.timestamp || new Date(a.date).getTime());
                      });

                    return filtered.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes notificaciones</h3>
                          <p className="text-gray-500">
                            {notificationFilter === "all"
                              ? "Las notificaciones aparecerán aquí cuando tengas actividades pendientes"
                              : `No hay notificaciones de tipo "${notificationFilter}"`}
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      filtered.map((notification) => (
                        <Card
                          key={notification.id}
                          className={`transition-colors group ${!notification.read ? "border-l-4 border-l-red-800 bg-red-50" : ""}`}
                        >
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
                                {!notification.read && <div className="absolute top-0 right-0 w-2 h-2 bg-red-800 rounded-full"></div>}
                              </div>
                              <div className="flex items-center gap-2 mt-4">
                                {notification.appointmentId && (
                                  <Button size="sm" variant="outline" onClick={() => setActiveTab("appointments")}>
                                    Ver cita
                                  </Button>
                                )}
                                {!notification.read && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      if (!userId) return;
                                      const updated = userNotifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n));
                                      setUserNotifications(updated);
                                      loadedNotifsRef.current = updated;
                                      saveNotificationsForUser(userId, updated);
                                      localStorage.setItem(notifStorageKey(userId), JSON.stringify(updated));
                                      console.log("Marcando notificación como leída:", notification.id);
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
                    );
                  })()}
                </div>
              </div>
            )}

            {/* CONFIGURACIÓN */}
            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                  </TabsList>

                  {/* Perfil (solo lectura aquí) */}
                  <TabsContent value="profile" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Actualiza tu información de perfil y datos académicos</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Datos del perfil: bloqueados para evitar cambios aquí */}
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

                        {/* Acciones de seguridad */}
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                            <Shield className="h-4 w-4 mr-2" />
                            Cambiar Contraseña
                          </Button>
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

      {/* MODAL: Modificar fecha de cita */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modificar fecha de la cita</DialogTitle>
            <DialogDescription>Cambia únicamente la fecha de tu cita. Los demás detalles permanecerán iguales.</DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              {/* Resumen sólo lectura para saber qué estoy modificando */}
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

              {/* Selector de fecha con validación simple */}
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

      {/* MODAL: Cambiar contraseña */}
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
