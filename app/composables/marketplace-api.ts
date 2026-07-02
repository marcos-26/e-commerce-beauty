export type ApiUser = {
  id: number
  name: string
  email: string
}

type AuthResponse = {
  user: ApiUser
  token: string
}

export type MarketplaceCategory = {
  id: number
  name: string
  products_count?: number
}

export type MarketplaceProduct = {
  id: number
  name: string
  description?: string | null
  price: string | number
  original_price?: string | number | null
  image?: string | null
  category_id: number
  seller_store_id?: number | null
  stock?: number
  sold_count?: number
  rating_average?: string | number
  rating_count?: number
  is_featured?: boolean
  status?: string
  category?: MarketplaceCategory
  store?: {
    id: number
    name: string
    slug: string
    is_official?: boolean
  } | null
}

export type CmsBanner = {
  id: number
  title: string
  subtitle?: string | null
  image: string
  link_url?: string | null
  placement?: string
  sort_order?: number
  is_active?: boolean
}

export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type AbandonedCartItem = {
  id: number
  product_id: number
  quantity: number
  price: string | number
  product: MarketplaceProduct
}

export type AbandonedCart = {
  id: number
  total: string | number
  status: string
  last_activity_at?: string | null
  items: AbandonedCartItem[]
}

export type MarketplaceOrderItem = {
  id: number
  product_id: number
  quantity: number
  price: string | number
  product?: MarketplaceProduct | null
}

export type MarketplaceOrder = {
  id: number
  total: string | number
  subtotal?: string | number | null
  discount_total?: string | number | null
  shipping_total?: string | number | null
  status: string
  payment_method?: string | null
  payment_status?: string | null
  coupon_code?: string | null
  created_at?: string | null
  updated_at?: string | null
  items: MarketplaceOrderItem[]
  address?: {
    id: number
    recipient_name?: string | null
    street?: string | null
    number?: string | null
    city?: string | null
    state?: string | null
    zip_code?: string | null
  } | null
}

export type CouponApplyResponse = {
  coupon: {
    id: number
    code: string
    description?: string | null
    type: string
    value: string | number
  }
  discount: string | number
}

export const useMarketplaceApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('cilios_token', {
    default: () => null,
    sameSite: 'lax',
  })
  const user = useState<ApiUser | null>('cilios_user', () => null)

  const request = async <T>(path: string, options: any = {}) => {
    const headers = {
      Accept: 'application/json',
      ...(options.headers || {}),
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
    }

    return await $fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers,
    })
  }

  const login = async (email: string, password: string) => {
    const response = await request<AuthResponse>('/login', {
      method: 'POST',
      body: { email, password },
    })
    token.value = response.token
    user.value = response.user
    return response
  }

  const register = async (payload: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    const response = await request<AuthResponse>('/register', {
      method: 'POST',
      body: payload,
    })
    token.value = response.token
    user.value = response.user
    return response
  }

  const logout = async () => {
    if (token.value) {
      await request('/logout', { method: 'POST' }).catch(() => undefined)
    }
    token.value = null
    user.value = null
    await navigateTo('/login')
  }

  const loadUser = async () => {
    if (!token.value) {
      user.value = null
      return null
    }

    user.value = await request<ApiUser>('/me')
    return user.value
  }

  return {
    token,
    user,
    request,
    login,
    register,
    logout,
    loadUser,
  }
}
