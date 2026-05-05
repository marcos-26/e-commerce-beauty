type ApiUser = {
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
  image?: string | null
  category_id: number
  category?: MarketplaceCategory
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
