<script setup lang="ts">
  import type { MarketplaceProduct } from '@/composables/marketplace-api'
  import bannerImage from '@/assets/images/banner.png'
  import logoImage from '@/assets/images/logo.png'

  definePageMeta({
    layout: false,
    name: 'store',
    title: 'Comprar',
    hidden: true,
  })

  const route = useRoute()
  const config = useRuntimeConfig()
  const productId = computed(() => {
    const param = route.params.id
    return Array.isArray(param) ? param[0] : param
  })

  const {
    drawerOpen,
    loading: cartLoading,
    error: cartError,
    count: cartCount,
    money,
    loadLocal,
    loadRemote,
    addItem,
  } = useAbandonedCart()

  onMounted(async () => {
    loadLocal()
    await loadRemote()
  })

  const { data: apiProduct } = await useAsyncData(
    () => `marketplace-product-${productId.value}`,
    () =>
      $fetch<MarketplaceProduct>(
        `${config.public.apiBase}/products/${productId.value}`,
      ).catch(() => null),
  )

  const product = computed<MarketplaceProduct>(() => {
    if (apiProduct.value) return apiProduct.value

    return {
      id: Number(productId.value || 1),
      name: 'Produto profissional para cilios',
      description:
        'Produto selecionado para lash designers, com qualidade profissional para atendimento em estudio.',
      price: 49.9,
      original_price: null,
      image: '',
      category_id: 0,
      stock: 99,
      sold_count: 0,
      rating_average: 4.8,
      rating_count: 0,
      is_featured: false,
      status: 'active',
      category: { id: 0, name: 'Cilios' },
      store: {
        id: 0,
        name: 'Cilios Oficial',
        slug: 'cilios-oficial',
        is_official: true,
      },
    }
  })

  const quantity = ref(1)
  const activeImage = ref(0)
  const status = ref('')

  const images = computed(() => [
    product.value.image || bannerImage,
    bannerImage,
    logoImage,
  ])

  const rating = computed(() =>
    Math.max(0, Math.min(5, Number(product.value.rating_average || 4.8))),
  )

  const ratingCount = computed(() => Number(product.value.rating_count || 0))
  const soldCount = computed(() => Number(product.value.sold_count || 0))
  const stock = computed(() => Number(product.value.stock ?? 0))
  const hasDiscount = computed(
    () =>
      product.value.original_price &&
      Number(product.value.original_price) > Number(product.value.price),
  )
  const discountPercent = computed(() => {
    if (!hasDiscount.value) return 0
    return Math.round(
      100 -
        (Number(product.value.price) / Number(product.value.original_price)) *
          100,
    )
  })

  const shippingDate = computed(() => {
    const date = new Date()
    date.setDate(date.getDate() + 5)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(date)
  })

  const canBuy = computed(() => stock.value > 0 && product.value.status === 'active')

  const changeQuantity = (amount: number) => {
    quantity.value = Math.min(
      Math.max(1, quantity.value + amount),
      Math.max(1, stock.value || 1),
    )
  }

  const addToCart = async () => {
    status.value = ''
    if (!canBuy.value) return
    await addItem(product.value, quantity.value)
    status.value = 'Produto adicionado ao carrinho.'
  }

  const buyNow = async () => {
    await addToCart()
    drawerOpen.value = true
  }

  useHead({
    title: () => product.value.name || 'Comprar',
  })

  useServerSeoMeta({
    description: () => product.value.description || 'Produto do marketplace',
  })
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f5] text-slate-900">
    <header class="border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        <NuxtLink to="/" class="flex items-center gap-3">
          <img :src="logoImage" alt="Cilios Marketplace" class="h-14 w-32 object-contain" />
          <span class="hidden text-lg font-bold text-[#d72d91] sm:inline">Comprar</span>
        </NuxtLink>
        <button
          class="relative flex h-11 w-11 items-center justify-center rounded border border-slate-200"
          type="button"
          aria-label="Carrinho"
          @click="drawerOpen = true"
        >
          <span class="i-lucide-shopping-cart h-6 w-6"></span>
          <span class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d72d91] px-1 text-xs font-bold text-white">
            {{ cartCount }}
          </span>
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <section class="grid gap-6 bg-white p-4 shadow-sm md:grid-cols-[480px_minmax(0,1fr)] md:p-6">
        <div>
          <div class="flex min-h-[360px] items-center justify-center bg-white">
            <img
              :src="images[activeImage]"
              :alt="product.name"
              class="max-h-[430px] w-full object-contain"
            />
          </div>
          <div class="mt-4 grid grid-cols-5 gap-2">
            <button
              v-for="(image, index) in images"
              :key="`${image}-${index}`"
              type="button"
              class="flex aspect-square items-center justify-center border bg-white p-1"
              :class="activeImage === index ? 'border-[#d72d91]' : 'border-slate-200'"
              @click="activeImage = index"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" class="h-full w-full object-contain" />
            </button>
          </div>
          <div class="mt-5 flex flex-wrap items-center gap-4 text-sm">
            <span class="text-slate-600">Compartilhar:</span>
            <button class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white" type="button" aria-label="Compartilhar">
              <span class="i-lucide-send h-4 w-4"></span>
            </button>
            <button class="flex h-8 w-8 items-center justify-center rounded-full bg-[#d72d91] text-white" type="button" aria-label="Favoritar">
              <span class="i-lucide-heart h-4 w-4"></span>
            </button>
            <span class="text-slate-600">Favoritar</span>
          </div>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-start gap-2">
            <span
              v-if="product.store?.is_official"
              class="rounded-sm bg-[#d72d91] px-1.5 py-0.5 text-xs font-bold text-white"
            >
              Oficial
            </span>
            <h1 class="min-w-0 flex-1 text-xl font-semibold leading-snug md:text-2xl">
              {{ product.name }}
            </h1>
          </div>

          <div class="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span class="font-semibold text-[#d72d91]">{{ rating.toFixed(1) }}</span>
            <span class="flex text-[#f2a32b]">
              <span
                v-for="star in 5"
                :key="star"
                :class="[star <= Math.round(rating) ? 'i-lucide-star fill-current' : 'i-lucide-star', 'h-4 w-4']"
              ></span>
            </span>
            <span class="h-4 w-px bg-slate-200"></span>
            <span class="underline">{{ ratingCount }}</span>
            <span class="text-slate-500">Avaliacoes</span>
            <span class="h-4 w-px bg-slate-200"></span>
            <span>{{ soldCount }} vendidos</span>
          </div>

          <div class="mt-5 overflow-hidden rounded-sm bg-[#fff0ec]">
            <div class="flex items-center justify-between bg-[#ff572f] px-4 py-2 text-sm font-bold text-white">
              <span>OFERTAS RELAMPAGO</span>
              <span class="flex items-center gap-1">
                <span class="i-lucide-clock h-4 w-4"></span>
                TERMINA EM
                <span class="bg-slate-950 px-1.5 py-0.5">01</span>
                <span class="bg-slate-950 px-1.5 py-0.5">13</span>
                <span class="bg-slate-950 px-1.5 py-0.5">55</span>
              </span>
            </div>
            <div class="flex flex-wrap items-end gap-3 px-5 py-5">
              <span class="text-3xl font-bold text-[#d72d91]">{{ money(product.price) }}</span>
              <span v-if="hasDiscount" class="text-sm text-slate-400 line-through">
                {{ money(product.original_price || 0) }}
              </span>
              <span v-if="hasDiscount" class="rounded-sm bg-white px-2 py-1 text-xs font-bold text-[#d72d91]">
                -{{ discountPercent }}%
              </span>
            </div>
          </div>

          <div class="mt-6 space-y-5 text-sm">
            <div class="grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)]">
              <span class="text-slate-500">Moedas</span>
              <span class="flex items-center gap-2">
                <span class="i-lucide-coins h-5 w-5 text-amber-500"></span>
                Compre e ganhe {{ Math.max(1, Math.floor(Number(product.price))) }} moeda(s)
              </span>
            </div>

            <div class="grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)]">
              <span class="text-slate-500">Frete</span>
              <div class="space-y-2">
                <p class="flex items-center gap-2 text-emerald-600">
                  <span class="i-lucide-truck h-5 w-5"></span>
                  Chega ate {{ shippingDate }}, Full
                </p>
                <p class="text-xs text-slate-500">Estocado e entregue pelo marketplace</p>
                <p><span class="font-semibold">Sao Paulo, Sao Paulo</span></p>
                <p>
                  <span class="mr-2 text-slate-400 line-through">R$8,39</span>
                  <span class="font-semibold">R$0,00</span>
                </p>
                <p><span class="font-semibold">Frete gratis</span> com cupom</p>
              </div>
            </div>

            <div class="grid items-center gap-2 sm:grid-cols-[92px_minmax(0,1fr)]">
              <span class="text-slate-500">Quantidade</span>
              <div class="flex flex-wrap items-center gap-3">
                <div class="grid h-10 grid-cols-3 border border-slate-200">
                  <button class="w-10 text-slate-500 hover:bg-slate-50" type="button" @click="changeQuantity(-1)">-</button>
                  <input
                    v-model.number="quantity"
                    class="w-12 border-x border-slate-200 text-center text-[#d72d91] outline-none"
                    type="number"
                    min="1"
                    :max="Math.max(1, stock)"
                  />
                  <button class="w-10 text-slate-500 hover:bg-slate-50" type="button" @click="changeQuantity(1)">+</button>
                </div>
                <span class="text-xs text-slate-500">{{ stock }} disponiveis</span>
              </div>
            </div>
          </div>

          <p v-if="status" class="mt-5 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {{ status }}
          </p>
          <p v-if="cartError" class="mt-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ cartError }}
          </p>

          <div class="mt-7 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <button
              class="flex h-12 items-center justify-center gap-2 border border-[#d72d91] bg-white px-4 font-semibold text-[#d72d91] transition hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="cartLoading || !canBuy"
              @click="addToCart"
            >
              <span class="i-lucide-shopping-cart h-5 w-5"></span>
              Adicionar Ao Carrinho
            </button>
            <button
              class="h-12 bg-[#d72d91] px-4 font-semibold text-white transition hover:bg-[#bf247e] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="cartLoading || !canBuy"
              @click="buyNow"
            >
              Comprar Agora
            </button>
          </div>

          <section class="mt-8 border-t border-slate-100 pt-5">
            <h2 class="text-base font-bold">Descricao do produto</h2>
            <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {{ product.description || 'Produto profissional para lash designers.' }}
            </p>
          </section>
        </div>
      </section>
    </main>
  </div>
</template>
