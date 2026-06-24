<script setup lang="ts">
  import type { MarketplaceOrder } from '@/composables/marketplace-api'

  definePageMeta({
    layout: false,
    title: 'Rastrear pedido',
  })

  const route = useRoute()
  const { token, request } = useMarketplaceApi()
  const orderId = ref(route.query.pedido?.toString() || '')
  const order = ref<MarketplaceOrder | null>(null)
  const loading = ref(false)
  const error = ref('')

  const steps = [
    { key: 'pending', label: 'Pedido recebido', icon: 'i-lucide-receipt-text' },
    {
      key: 'paid',
      label: 'Pagamento confirmado',
      icon: 'i-lucide-circle-dollar-sign',
    },
    { key: 'processing', label: 'Em preparo', icon: 'i-lucide-package-open' },
    { key: 'shipped', label: 'Em transporte', icon: 'i-lucide-truck' },
    { key: 'delivered', label: 'Entregue', icon: 'i-lucide-badge-check' },
  ]

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

  const statusLabel = (status?: string) =>
    ({
      pending: 'Pendente',
      paid: 'Pago',
      processing: 'Em preparo',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    })[status || ''] ||
    status ||
    'Pendente'

  const currentStepIndex = computed(() => {
    if (!order.value || order.value.status === 'cancelled') return -1
    return Math.max(
      0,
      steps.findIndex((step) => step.key === order.value?.status),
    )
  })

  const isStepDone = (index: number) => index <= currentStepIndex.value

  const loadOrder = async () => {
    const id = orderId.value.trim()
    if (!id) {
      error.value = 'Informe o numero do pedido.'
      return
    }

    if (!token.value) {
      await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
      return
    }

    loading.value = true
    error.value = ''
    order.value = null

    try {
      order.value = await request<MarketplaceOrder>(`/orders/${id}`)
    } catch (err: any) {
      error.value =
        err?.data?.message || 'Pedido nao encontrado para esta conta.'
      if (err?.status === 401 || err?.statusCode === 401) {
        token.value = null
        await navigateTo({
          path: '/login',
          query: { redirect: route.fullPath },
        })
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (orderId.value) loadOrder()
  })
</script>

<template>
  <main class="min-h-screen bg-[#f6f8fd] px-4 py-6 text-slate-900">
    <div class="mx-auto max-w-5xl">
      <header
        class="mb-6 rounded border border-slate-200 bg-white p-5 shadow-sm"
      >
        <NuxtLink
          to="/"
          class="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#d72d91]"
        >
          <span class="i-lucide-arrow-left h-4 w-4"></span>
          Voltar para loja
        </NuxtLink>
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 class="text-2xl font-bold">Rastrear pedido</h1>
            <p class="text-sm text-slate-500">
              Consulte o andamento usando o numero do pedido.
            </p>
          </div>
          <NuxtLink
            to="/order-history"
            class="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span class="i-lucide-list-ordered h-4 w-4"></span>
            Meus pedidos
          </NuxtLink>
        </div>
      </header>

      <form
        class="mb-5 grid gap-3 rounded border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
        @submit.prevent="loadOrder"
      >
        <label class="min-w-0">
          <span class="mb-1 block text-sm font-semibold">Numero do pedido</span>
          <input
            v-model="orderId"
            class="h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]"
            inputmode="numeric"
            placeholder="Ex: 15"
          />
        </label>
        <button
          class="mt-auto h-11 rounded bg-[#d72d91] px-5 text-sm font-semibold text-white hover:bg-[#bf247e] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
        >
          {{ loading ? 'Buscando...' : 'Rastrear' }}
        </button>
      </form>

      <p
        v-if="error"
        class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ error }}
      </p>

      <section
        v-if="order"
        class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div class="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <div
            class="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h2 class="text-xl font-bold">Pedido #{{ order.id }}</h2>
              <p class="mt-1 text-sm text-slate-500">
                Criado em {{ formatDate(order.created_at) }}
              </p>
            </div>
            <span
              class="inline-flex rounded border border-pink-200 bg-pink-50 px-3 py-1 text-sm font-bold text-[#d72d91]"
            >
              {{ statusLabel(order.status) }}
            </span>
          </div>

          <div
            v-if="order.status === 'cancelled'"
            class="mt-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Este pedido foi cancelado.
          </div>

          <ol v-else class="mt-6 space-y-5">
            <li
              v-for="(step, index) in steps"
              :key="step.key"
              class="flex gap-4"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                :class="
                  isStepDone(index)
                    ? 'border-[#d72d91] bg-[#d72d91] text-white'
                    : 'border-slate-200 bg-white text-slate-400'
                "
              >
                <span :class="[step.icon, 'h-5 w-5']"></span>
              </span>
              <div class="min-w-0 pb-5">
                <p
                  class="font-semibold"
                  :class="
                    isStepDone(index) ? 'text-slate-950' : 'text-slate-500'
                  "
                >
                  {{ step.label }}
                </p>
                <p class="mt-1 text-sm text-slate-500">
                  {{
                    isStepDone(index)
                      ? 'Etapa concluida ou em andamento.'
                      : 'Aguardando atualizacao.'
                  }}
                </p>
              </div>
            </li>
          </ol>
        </div>

        <aside class="rounded border border-slate-200 bg-white p-5 shadow-sm">
          <h2 class="text-lg font-bold">Resumo</h2>
          <div class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-semibold">{{ money(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-slate-500">Desconto</span>
              <span class="font-semibold">{{
                money(order.discount_total)
              }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-slate-500">Frete</span>
              <span class="font-semibold">{{
                money(order.shipping_total)
              }}</span>
            </div>
            <div
              class="flex justify-between gap-3 border-t border-slate-100 pt-3 text-base font-bold"
            >
              <span>Total</span>
              <span>{{ money(order.total) }}</span>
            </div>
          </div>

          <div class="mt-5 border-t border-slate-100 pt-5">
            <h3 class="font-semibold">Itens</h3>
            <div class="mt-3 space-y-3">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex gap-3"
              >
                <img
                  :src="item.product?.image || '/cover.png'"
                  :alt="item.product?.name || 'Produto'"
                  class="h-12 w-12 rounded border border-slate-100 object-contain"
                />
                <div class="min-w-0 flex-1">
                  <p class="line-clamp-2 text-sm font-semibold text-slate-800">
                    {{ item.product?.name || 'Produto removido' }}
                  </p>
                  <p class="text-xs text-slate-500">Qtd. {{ item.quantity }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>
