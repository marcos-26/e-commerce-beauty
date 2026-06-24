<script setup lang="ts">
  import type { MarketplaceOrder } from '@/composables/marketplace-api'

  definePageMeta({
    layout: false,
    title: 'Meus pedidos',
  })

  const { token, request, loadUser } = useMarketplaceApi()
  const orders = ref<MarketplaceOrder[]>([])
  const loading = ref(true)
  const error = ref('')

  const money = (value: string | number | null | undefined) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value || 0))

  const formatDate = (value?: string | null) => {
    if (!value) return 'Data indisponivel'

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value))
  }

  const statusLabel = (status: string) =>
    ({
      pending: 'Pendente',
      paid: 'Pago',
      processing: 'Em preparo',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    })[status] || status

  const paymentLabel = (method?: string | null) =>
    ({
      pix: 'Pix',
      credit_card: 'Cartao',
      boleto: 'Boleto',
      wallet: 'Carteira',
    })[method || ''] || 'Pagamento'

  const statusClass = (status: string) =>
    ({
      pending: 'border-amber-200 bg-amber-50 text-amber-700',
      paid: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      processing: 'border-blue-200 bg-blue-50 text-blue-700',
      shipped: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      delivered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      cancelled: 'border-red-200 bg-red-50 text-red-700',
    })[status] || 'border-slate-200 bg-slate-50 text-slate-600'

  const loadOrders = async () => {
    if (!token.value) {
      await navigateTo({
        path: '/login',
        query: { redirect: '/order-history' },
      })
      return
    }

    loading.value = true
    error.value = ''

    try {
      await loadUser()
      orders.value = await request<MarketplaceOrder[]>('/orders')
    } catch (err: any) {
      error.value =
        err?.data?.message || 'Nao foi possivel carregar seus pedidos.'
      if (err?.status === 401 || err?.statusCode === 401) {
        token.value = null
        await navigateTo({
          path: '/login',
          query: { redirect: '/order-history' },
        })
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(loadOrders)
</script>

<template>
  <main class="min-h-screen bg-[#f6f8fd] px-4 py-6 text-slate-900">
    <div class="mx-auto max-w-6xl">
      <header
        class="mb-6 flex flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <NuxtLink
            to="/"
            class="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#d72d91]"
          >
            <span class="i-lucide-arrow-left h-4 w-4"></span>
            Voltar para loja
          </NuxtLink>
          <h1 class="text-2xl font-bold">Meus pedidos</h1>
          <p class="text-sm text-slate-500">
            Acompanhe compras, pagamento e envio.
          </p>
        </div>
        <NuxtLink
          to="/track-order"
          class="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#d72d91] px-4 text-sm font-semibold text-white hover:bg-[#bf247e]"
        >
          <span class="i-lucide-map-pin h-4 w-4"></span>
          Rastrear pedido
        </NuxtLink>
      </header>

      <p
        v-if="error"
        class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </p>

      <div
        v-if="loading"
        class="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500"
      >
        Carregando pedidos...
      </div>

      <section v-else-if="orders.length" class="space-y-4">
        <article
          v-for="order in orders"
          :key="order.id"
          class="rounded border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div
            class="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-lg font-bold">Pedido #{{ order.id }}</h2>
                <span
                  :class="[
                    'rounded border px-2 py-1 text-xs font-bold',
                    statusClass(order.status),
                  ]"
                >
                  {{ statusLabel(order.status) }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-500">
                Criado em {{ formatDate(order.created_at) }}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {{ paymentLabel(order.payment_method) }} ?
                {{ order.payment_status || 'pendente' }}
              </p>
            </div>
            <div class="text-left sm:text-right">
              <p class="text-sm text-slate-500">Total</p>
              <p class="text-xl font-bold text-slate-950">
                {{ money(order.total) }}
              </p>
            </div>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="flex gap-4 py-4"
            >
              <img
                :src="item.product?.image || '/cover.png'"
                :alt="item.product?.name || 'Produto'"
                class="h-16 w-16 rounded border border-slate-100 object-contain"
              />
              <div class="min-w-0 flex-1">
                <NuxtLink
                  v-if="item.product"
                  :to="`/store/${item.product.id}`"
                  class="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-[#d72d91]"
                >
                  {{ item.product.name }}
                </NuxtLink>
                <p v-else class="text-sm font-semibold text-slate-800">
                  Produto removido
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  Quantidade: {{ item.quantity }}
                </p>
              </div>
              <p class="text-sm font-bold text-slate-950">
                {{ money(item.price) }}
              </p>
            </div>
          </div>

          <div
            class="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="text-sm text-slate-500">
              <span v-if="order.coupon_code"
                >Cupom {{ order.coupon_code }} ?
              </span>
              <span>Frete {{ money(order.shipping_total) }}</span>
            </div>
            <NuxtLink
              :to="{ path: '/track-order', query: { pedido: order.id } }"
              class="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span class="i-lucide-route h-4 w-4"></span>
              Ver rastreio
            </NuxtLink>
          </div>
        </article>
      </section>

      <section
        v-else
        class="rounded border border-dashed border-slate-300 bg-white px-5 py-12 text-center"
      >
        <p class="font-semibold text-slate-800">Voce ainda nao tem pedidos.</p>
        <p class="mt-1 text-sm text-slate-500">
          Quando finalizar uma compra, ela aparece aqui.
        </p>
        <NuxtLink
          to="/"
          class="mt-5 inline-flex h-10 items-center justify-center rounded bg-[#d72d91] px-4 text-sm font-semibold text-white hover:bg-[#bf247e]"
        >
          Comprar agora
        </NuxtLink>
      </section>
    </div>
  </main>
</template>
