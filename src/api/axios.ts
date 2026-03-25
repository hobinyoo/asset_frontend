import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

const AUTH_PAGES = ['/login', '/signup']

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

let isRefreshing = false
let refreshQueue: Array<() => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // refresh 엔드포인트이거나 이미 재시도한 요청이면 바로 리다이렉트
    if (originalRequest._retry || originalRequest.url === '/api/auth/refresh') {
      if (typeof window !== 'undefined' && !AUTH_PAGES.includes(window.location.pathname)) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise<void>((resolve) => {
          refreshQueue.push(resolve)
        }).then(() => api(originalRequest))
      }

      isRefreshing = true

      try {
        await api.post('/api/auth/refresh')
        refreshQueue.forEach((cb) => cb())
        refreshQueue = []
        return api(originalRequest)
      } catch {
        refreshQueue = []
        if (!AUTH_PAGES.includes(window.location.pathname)) {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
