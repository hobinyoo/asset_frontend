import { AxiosError } from 'axios'

interface ApiErrorBody {
  message?: string
  error?: { code?: string; details?: string }
}

/** 백엔드 공통 에러 응답(`{ message, error: { code, details } }`)에서 사용자 노출용 메시지를 추출한다. */
export const getApiErrorMessage = (error: unknown, fallback = '요청을 처리하지 못했습니다.'): string => {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    return body?.message || body?.error?.details || fallback
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

/** 백엔드 에러 코드(`INSUFFICIENT_CASH` 등)를 반환한다. 없으면 undefined. */
export const getApiErrorCode = (error: unknown): string | undefined => {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    return body?.error?.code
  }
  return undefined
}
