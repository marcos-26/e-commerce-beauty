import type {
  AbandonedCart,
  MarketplaceProduct,
} from '@/composables/marketplace-api'

type CartItem = {
  product: MarketplaceProduct
  quantity: number
}

const storageKey = 'cilios_abandoned_cart'

export const useAbandonedCart = () => {
  const { token, request } = useMarketplaceApi()
  const items = useState<CartItem[]>('cilios_cart_items', () => [])
  const drawerOpen = useState('cilios_cart_drawer_open', () => false)
  const loading = useState('cilios_cart_loading', () => false)
  const error = useState('cilios_cart_error', () => '')

  const count = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  )

  const total = computed(() =>
    items.value.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0,
    ),
  )

  const money = (value: string | number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value))

  const payload = () => ({
    items: items.value.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    })),
  })

  const persistLocal = () => {
    if (!import.meta.client) return
    localStorage.setItem(storageKey, JSON.stringify(items.value))
  }

  const syncRemote = async () => {
    if (!token.value) {
      persistLocal()
      return null
    }

    return await request<AbandonedCart>('/abandoned-cart', {
      method: 'PUT',
      body: payload(),
    })
  }

  const loadLocal = () => {
    if (!import.meta.client) return

    try {
      const stored = localStorage.getItem(storageKey)
      items.value = stored ? JSON.parse(stored) : []
    } catch {
      items.value = []
    }
  }

  const loadRemote = async () => {
    if (!token.value) return

    loading.value = true
    error.value = ''

    try {
      const cart = await request<AbandonedCart>('/abandoned-cart')
      if (cart.items.length) {
        items.value = cart.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        }))
        persistLocal()
      } else if (items.value.length) {
        await syncRemote()
      }
    } catch (err: any) {
      error.value = err?.data?.message || 'Nao foi possivel carregar o carrinho.'
    } finally {
      loading.value = false
    }
  }

  const addItem = async (product: MarketplaceProduct, quantity = 1) => {
    const existing = items.value.find((item) => item.product.id === product.id)

    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }

    persistLocal()
    await syncRemote().catch(() => undefined)
    drawerOpen.value = true
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      items.value = items.value.filter((item) => item.product.id !== productId)
    } else {
      const item = items.value.find((cartItem) => cartItem.product.id === productId)
      if (item) item.quantity = quantity
    }

    persistLocal()
    await syncRemote().catch(() => undefined)
  }

  const clearCart = async () => {
    items.value = []
    persistLocal()

    if (token.value) {
      await request('/abandoned-cart', { method: 'DELETE' }).catch(
        () => undefined,
      )
    }
  }

  const checkout = async () => {
    if (!items.value.length) return null

    if (!token.value) {
      await navigateTo({ path: '/login', query: { redirect: '/' } })
      return null
    }

    loading.value = true
    error.value = ''

    try {
      const order = await request('/orders', {
        method: 'POST',
        body: payload(),
      })
      items.value = []
      persistLocal()
      drawerOpen.value = false
      return order
    } catch (err: any) {
      error.value = err?.data?.message || 'Nao foi possivel finalizar o pedido.'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    items,
    drawerOpen,
    loading,
    error,
    count,
    total,
    money,
    loadLocal,
    loadRemote,
    addItem,
    updateQuantity,
    clearCart,
    checkout,
  }
}
