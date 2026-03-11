export type DataResponse<T> = {
  data: T
  status: number
  success: boolean
  message: string
  error_code?: string | null
  details?: string | null
}

export type Paging<T> = {
  totalElements: number
  totalPages: number
  size: number
  pageNumber: number
  last: boolean
  content: T
}

export type ErrorResponse = {
  data: null
  status: number
  success: boolean
  message: string
  error_code?: string | null
  details?: string | null
}
