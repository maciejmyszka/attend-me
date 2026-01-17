import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import router from '../router'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const axiosClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token') || undefined
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token')
      } catch {}
      if (router.currentRoute.value.name !== 'login') {
        await router.push({ name: 'login' })
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient

export async function get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res: AxiosResponse<T> = await axiosClient.get<T>(url, config)
  return res.data
}

export async function post<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await axiosClient.post<T>(url, body, config)
  return res.data
}

export async function put<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await axiosClient.put<T>(url, body, config)
  return res.data
}

export async function patch<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res: AxiosResponse<T> = await axiosClient.patch<T>(url, body, config)
  return res.data
}

export async function del<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res: AxiosResponse<T> = await axiosClient.delete<T>(url, config)
  return res.data
}

type ApiErrorDetail = {
  status?: number
  message?: string
  url?: string
}

function getErrorMessage(err: AxiosError): string {
  const data = err.response?.data as unknown
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>
    const m = record.message
    if (typeof m === 'string') return m
  }
  return err.message
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const message = getErrorMessage(error)
    const url = error.config?.url

    try {
      const detail: ApiErrorDetail = { status, message, url }
      window.dispatchEvent(new CustomEvent('api-error', { detail }))
    } catch {}

    if (status === 401) {
      try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('token')
      } catch {}
      if (router.currentRoute.value.name !== 'login') {
        await router.push({ name: 'login' })
      }
    }
    if (status === 403) {
      if (router.currentRoute.value.name !== 'no-access') {
        await router.push({ name: 'no-access' })
      }
    }
    return Promise.reject(error)
  },
)
