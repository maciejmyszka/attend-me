import axiosClient from './axiosClient'
import axios from 'axios'

export type LoginResponse = {
  token: string
  expires: string
}

export async function loginUser(loginName: string, password: string): Promise<LoginResponse> {
  const res = await axiosClient.post<string | LoginResponse>('/user/login', undefined, {
    params: { loginName, password },
    headers: { Accept: 'text/plain, application/json' },
  })

  const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data

  if (data?.token) {
    try {
      localStorage.setItem('access_token', data.token)
    } catch {}
  }

  return data
}

export function logoutUser(): void {
  try {
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
  } catch {}
}

export type StudentInfo = {
  studentId: number
  albumNumber: number
  currentYearOfStudy: number
  dateCreated: string
}

export type TeacherInfo = {
  teacherId: number
  academicTitle: string
  dateCreated: string
}

export type User = {
  userId: number
  loginName: string
  name: string
  surname: string
  studentId: number
  teacherId: number
  isStudent: boolean
  student?: StudentInfo
  isTeacher: boolean
  teacher?: TeacherInfo
  dateCreated: string
  deviceName: string
  isAdmin: boolean
}

export type AttendanceTicket = {
  token: string
  expires: string
}

export async function userGet(userId?: number): Promise<User> {
  const res = await axiosClient.get<string | User>('/user/get', {
    params: userId !== undefined ? { userId } : undefined,
    headers: { Accept: 'text/plain, application/json' },
  })

  const payload = res.data
  const data: User = typeof payload === 'string' ? (JSON.parse(payload) as User) : payload
  return data
}

export async function getAttendanceTicketWithBearer(token: string): Promise<AttendanceTicket> {
  const baseURL = import.meta.env.VITE_API_URL
  const bare = axios.create({ baseURL, timeout: 15000, withCredentials: false })

  const res = await bare.get<string | AttendanceTicket>('/user/attendance/ticket/get', {
    headers: {
      Accept: 'text/plain, application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = res.data
  const data: AttendanceTicket =
    typeof payload === 'string' ? (JSON.parse(payload) as AttendanceTicket) : payload
  return data
}

export function hasStudentRole(user: User): boolean {
  return !!user.isStudent || !!user.student
}

export function hasTeacherRole(user: User): boolean {
  return !!user.isTeacher || !!user.teacher
}

export function hasAdminRole(user: User): boolean {
  return !!user.isAdmin
}
