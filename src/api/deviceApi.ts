import axiosClient from './axiosClient'
import axios from 'axios'

export type DeviceRegisterToken = {
  token: string
  expires: string
}

export type DeviceRegisterRequest = {
  deviceName: string
  studentName: string
  studentSurname: string
  albumIdNumber: number
}

export async function getDeviceRegisterToken(deviceUserId: number): Promise<DeviceRegisterToken> {
  const res = await axiosClient.get<string | DeviceRegisterToken>(
    '/user/device/register/token/get',
    {
      params: { deviceUserId },
      headers: { Accept: 'text/plain, application/json' },
    },
  )

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as DeviceRegisterToken)
    : (payload as DeviceRegisterToken)
}

export async function registerDevice(body: DeviceRegisterRequest): Promise<DeviceRegisterToken> {
  const res = await axiosClient.post<string | DeviceRegisterToken>('/user/device/register', body, {
    headers: { Accept: 'text/plain, application/json' },
  })

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as DeviceRegisterToken)
    : (payload as DeviceRegisterToken)
}

export async function registerDeviceWithToken(
  token: string,
  body: DeviceRegisterRequest,
): Promise<DeviceRegisterToken> {
  const baseURL = import.meta.env.VITE_API_URL
  const bare = axios.create({ baseURL, timeout: 15000, withCredentials: false })
  const res = await bare.post<string | DeviceRegisterToken>('/user/device/register', body, {
    headers: { Accept: 'text/plain, application/json', Authorization: `Bearer ${token}` },
  })

  const payload = res.data
  return typeof payload === 'string'
    ? (JSON.parse(payload) as DeviceRegisterToken)
    : (payload as DeviceRegisterToken)
}

export async function resetDevice(deviceUserId: number): Promise<void> {
  await axiosClient.post<unknown>('/user/device/reset', undefined, {
    params: { deviceUserId },
    headers: { Accept: 'text/plain, application/json' },
  })
}

export async function resetDeviceWithBearer(token: string, deviceUserId: number): Promise<void> {
  const baseURL = import.meta.env.VITE_API_URL
  const bare = axios.create({ baseURL, timeout: 15000, withCredentials: false })
  await bare.post<unknown>('/user/device/reset', undefined, {
    params: { deviceUserId },
    headers: { Accept: 'text/plain, application/json', Authorization: `Bearer ${token}` },
  })
}
