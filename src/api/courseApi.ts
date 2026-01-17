import axiosClient from './axiosClient'
import axios from 'axios'
import type { User } from './userApi'

export type StudentSessionsFilters = {
  search?: string
  courseName?: string
  courseGroupName?: string
  locationName?: string
  dateStart?: string
  dateEnd?: string
}

export type StudentSessionsRequest = {
  pageNumber?: number
  pageSize?: number
  filters?: StudentSessionsFilters
  sortBy?: string
}

export type StudentSessionItem = {
  courseId: number
  courseName: string
  courseGroupId: number
  courseGroupName: string
  courseSessionId: number
  locationName: string
  dateStart: string
  dateEnd: string
}

export type PagedResponse<T> = {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export async function getStudentSessions(
  request: StudentSessionsRequest,
): Promise<PagedResponse<StudentSessionItem>> {
  const res = await axiosClient.post<string | PagedResponse<StudentSessionItem>>(
    '/course/student/sessions/get',
    request,
    {
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  const data: PagedResponse<StudentSessionItem> | string =
    typeof payload === 'string' ? payload : (payload as PagedResponse<StudentSessionItem>)
  return typeof data === 'string' ? (JSON.parse(data) as PagedResponse<StudentSessionItem>) : data
}

export type TeacherSessionItem = {
  courseId: number
  courseName: string
  courseGroupId: number
  courseGroupName: string
  courseSessionId: number
  locationName: string
  dateStart: string
  dateEnd: string
}
export type TeacherSessionsFilters = {
  search?: string
  courseName?: string
  courseGroupName?: string
  locationName?: string
  dateStart?: string
  dateEnd?: string
}

export type TeacherSessionsRequest = {
  pageNumber?: number
  pageSize?: number
  filters?: TeacherSessionsFilters
  sortBy?: string
}

export async function getTeacherSessions(
  request: TeacherSessionsRequest,
): Promise<PagedResponse<TeacherSessionItem>> {
  const res = await axiosClient.post<string | PagedResponse<TeacherSessionItem>>(
    '/course/teacher/sessions/get',
    request,
    {
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as PagedResponse<TeacherSessionItem>)
    : (payload as PagedResponse<TeacherSessionItem>)
}

export type TeacherSessionDetail = {
  courseId: number
  courseName: string
  courseGroupId: number
  courseGroupName: string
  courseSessionId: number
  locationName: string
  dateStart: string
  dateEnd: string
}

export async function getTeacherSessionById(sessionId: number): Promise<TeacherSessionDetail> {
  const res = await axiosClient.get<string | TeacherSessionDetail>('/course/teacher/session/get', {
    params: { sessionId },
    headers: { Accept: 'text/plain, application/json' },
  })

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as TeacherSessionDetail)
    : (payload as TeacherSessionDetail)
}

export async function getStudentGroupSessions(
  courseGroupId: number,
): Promise<StudentSessionItem[]> {
  const res = await axiosClient.get<string | StudentSessionItem[]>(
    '/course/student/group/sessions/get',
    {
      params: { courseGroupId },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as StudentSessionItem[])
    : (payload as StudentSessionItem[])
}

export type AttendanceLogItem = {
  attendanceLogId: number
  courseSessionId: number
  attenderUserId: number
  userName: string
  userSurname: string
  studentAlbumIdNumber: number
  attendanceLoginDateCreated: string
  wasUserPresent: boolean
}

export async function getSessionAttendanceList(sessionId: number): Promise<AttendanceLogItem[]> {
  const res = await axiosClient.get<string | AttendanceLogItem[]>(
    '/course/session/attendance-list/get',
    {
      params: { sessionId },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as AttendanceLogItem[])
    : (payload as AttendanceLogItem[])
}

export type AttendanceToggleResult = {
  attendanceLogId: number
  attenderUserId: number
  courseSessionId: number
  dateCreated: string
}

export async function toggleSessionAttendance(
  attendingUserId: number,
  courseSessionId: number,
  addOrRemove: boolean,
): Promise<AttendanceToggleResult> {
  const res = await axiosClient.get<string | AttendanceToggleResult>(
    '/course/session/attendance/toggle',
    {
      params: { attendingUserId, courseSessionId, addOrRemove },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as AttendanceToggleResult)
    : (payload as AttendanceToggleResult)
}

export type StudentAttendanceItem = {
  attendanceLogId: number
  attenderUserId: number
  courseSessionId: number
  dateCreated: string
}

export async function getStudentAttendance(
  courseGroupId: number,
): Promise<StudentAttendanceItem[]> {
  const res = await axiosClient.get<string | StudentAttendanceItem[]>(
    '/course/student/attendance/get',
    {
      params: { courseGroupId },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as StudentAttendanceItem[])
    : (payload as StudentAttendanceItem[])
}

export type AttendanceScannerToken = {
  token: string
  expires: string
}

export async function getAttendanceScannerToken(
  courseSessionId: number,
): Promise<AttendanceScannerToken> {
  const res = await axiosClient.get<string | AttendanceScannerToken>(
    '/course/session/attendance/scanner/token/get',
    {
      params: { courseSessionId },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as AttendanceScannerToken)
    : (payload as AttendanceScannerToken)
}

// Register attendance using attenderToken (decoded from student's QR) with scanner bearer token
export async function registerAttendanceWithBearer(
  attenderToken: string,
  scannerBearer: string,
): Promise<User> {
  const baseURL = import.meta.env.VITE_API_URL
  const bare = axios.create({ baseURL, timeout: 15000, withCredentials: false })
  const res = await bare.get<string | User>('/course/session/attendance/register', {
    params: { attenderToken },
    headers: { Accept: 'text/plain, application/json', Authorization: `Bearer ${scannerBearer}` },
  })

  const payload = res.data
  return typeof payload === 'string' ? (JSON.parse(payload) as User) : (payload as User)
}
