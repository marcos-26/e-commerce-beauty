<script setup lang="ts">
  import type {
    MarketplaceCategory,
    PaginatedResponse,
    MarketplaceProduct,
  } from '@/composables/marketplace-api'
  import bannerImage from '@/assets/images/banner.png'
  import bannerImage2 from '@/assets/images/banner2.png'
  import logoImage from '@/assets/images/logo.png'

  definePageMeta({
    layout: false,
    title: 'Inicio',
    description: 'Cilios Marketplace',
  })

  useHead({
    bodyAttrs: {
      class: 'bg-[#f6f8fd]',
    },
  })

  const fallbackCategories = [
    'Alongamento de Cilios',
    'Kits',
    'Pincas',
    'Colas',
    'Removedores',
    'Higiene',
    'Acessorios',
    'Outros',
  ]

  const { data: apiCategories } = await useAsyncData('marketplace-categories', () =>
    $fetch<MarketplaceCategory[]>(
      `${useRuntimeConfig().public.apiBase}/categories`,
    ).catch(() => []),
  )

  const { data: apiProductsResponse } = await useAsyncData('marketplace-products', () =>
    $fetch<MarketplaceProduct[] | PaginatedResponse<MarketplaceProduct>>(
      `${useRuntimeConfig().public.apiBase}/products`,
    ).catch(() => []),
  )

  const apiProducts = computed(() =>
    Array.isArray(apiProductsResponse.value)
      ? apiProductsResponse.value
      : apiProductsResponse.value?.data || [],
  )

  const {
    items: cartItems,
    drawerOpen,
    loading: cartLoading,
    error: cartError,
    count: cartCount,
    total: cartTotal,
    money,
    loadLocal,
    loadRemote,
    addItem,
    updateQuantity,
    clearCart,
    checkout,
  } = useAbandonedCart()

  const checkoutStatus = ref('')

  onMounted(async () => {
    loadLocal()
    await loadRemote()
  })

  const categories = computed(() =>
    apiCategories.value?.length
      ? apiCategories.value.map((category) => category.name)
      : fallbackCategories,
  )

  const categoryOptions: Record<string, string[]> = {
    'Alongamento de Cilios': [
      'Fio a fio',
      'Volume brasileiro',
      'Volume russo',
      'Mega volume',
      'Efeito molhado',
      'Anime / Manga lashes',
      'Curvaturas C, D, L e M',
      'Espessuras 0.03 a 0.20',
    ],
    Kits: [
      'Kit iniciante',
      'Kit profissional',
      'Kit retencao',
      'Kit lash lifting',
      'Kit brow lamination',
      'Combos promocionais',
    ],
    Pincas: [
      'Pinca reta',
      'Pinca curva',
      'Pinca isolamento',
      'Pinca volume russo',
      'Pinca boot',
      'Estojo para pincas',
    ],
    Colas: [
      'Secagem rapida',
      'Baixa ardencia',
      'Cola preta',
      'Cola transparente',
      'Cola sensivel',
      'Primer e acelerador',
      'Controle de umidade',
    ],
    Removedores: [
      'Removedor em gel',
      'Removedor em creme',
      'Removedor balm',
      'Removedor liquido',
      'Neutralizadores',
    ],
    Higiene: [
      'Shampoo foam',
      'Primer higienizador',
      'Escovinhas descartaveis',
      'Microbrush',
      'Lenco sem fiapos',
      'Biosseguranca',
    ],
    Acessorios: [
      'Pads e fitas',
      'Nano mister',
      'Higrometro',
      'Pedra jade',
      'Anel bate cola',
      'Espelho de precisao',
      'Mapeamento de cilios',
    ],
    Outros: [
      'Finalizadores e selantes',
      'Lash lifting',
      'Design de sobrancelhas',
      'Treinamentos',
      'Materiais descartaveis',
      'Lancamentos',
    ],
  }

  const expandedCategory = ref(fallbackCategories[0])

  const optionsForCategory = (category: string) =>
    categoryOptions[category] || categoryOptions.Outros

  const navItems = computed(() => [...categories.value.slice(0, 7), 'Ofertas'])

  const activeHeroSlide = ref(0)

  const heroSlides = [
    {
      image: bannerImage,
      alt: 'Tudo para realcar a beleza do olhar',
    },
    {
      image: bannerImage2,
      alt: 'Ofertas especiais para cilios',
    },
    {
      image: bannerImage,
      alt: 'Produtos para alongamento de cilios',
    },
    {
      image: bannerImage2,
      alt: 'Cilios Marketplace',
    },
  ]

  const benefits = [
    {
      title: 'Frete Gratis',
      text: 'acima de R$199',
      icon: 'i-lucide-truck',
    },
    {
      title: 'Parcele em ate',
      text: '6x sem juros',
      icon: 'i-lucide-credit-card',
    },
    {
      title: '5% de Desconto',
      text: 'no pix',
      icon: 'i-lucide-badge-percent',
    },
    {
      title: 'Entrega rapida',
      text: 'para todo o Brasil',
      icon: 'i-lucide-package-check',
    },
    {
      title: 'Compra Segura',
      text: 'seus dados protegidos',
      icon: 'i-lucide-lock-keyhole',
    },
  ]

  const fallbackProducts = [
    {
      id: 1,
      name: 'Cola Ultra Rapida Expert',
      price: 'R$ 49,90',
      installment: '6x de R$ 8,32 sem juros',
      position: '87% 53%',
      size: '540%',
      rating: 5,
    },
    {
      id: 2,
      name: 'Kit Alongamento Volume',
      price: 'R$ 159,90',
      installment: '6x de R$ 26,65 sem juros',
      position: '68% 47%',
      size: '360%',
      rating: 5,
    },
    {
      id: 3,
      name: 'Pinca Volume Russo',
      price: 'R$ 39,90',
      installment: '6x de R$ 6,65 sem juros',
      position: '82% 43%',
      size: '520%',
      rating: 4,
    },
    {
      id: 4,
      name: 'Cilios Volume 5D',
      price: 'R$ 29,90',
      installment: '6x de R$ 4,98 sem juros',
      position: '61% 45%',
      size: '500%',
      rating: 5,
    },
    {
      id: 5,
      name: 'Removedor em Gel',
      price: 'R$ 39,90',
      installment: '6x de R$ 6,68 sem juros',
      position: '96% 55%',
      size: '460%',
      rating: 4,
    },
  ]

  const products = computed(() => {
    if (!apiProducts.value.length) {
      return fallbackProducts
    }

    return apiProducts.value.map((product) => ({
      id: product.id,
      name: product.name,
      price: money(product.price),
      rawPrice: product.price,
      installment: `6x de ${money(Number(product.price) / 6)} sem juros`,
      image: product.image || '',
      position: 'center',
      size: 'contain',
      rating: 5,
      source: product,
    }))
  })

  const addProductToCart = async (product: any) => {
    if (!product.source) return
    checkoutStatus.value = ''
    await addItem(product.source)
  }

  const productPath = (product: any) => `/store/${product.id || product.source?.id}`

  const finishCheckout = async () => {
    checkoutStatus.value = ''
    const order = await checkout()
    if (order) checkoutStatus.value = 'Pedido criado com sucesso.'
  }
</script>

<template>
  <div class="min-h-screen bg-[#f6f8fd] text-slate-800">
    <header class="bg-white/90 shadow-sm shadow-slate-200/70">
      <div
        class="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:gap-10"
      >
        <NuxtLink to="/" class="flex shrink-0 justify-center lg:justify-start">
          <img
            :src="logoImage"
            alt="Cilios Marketplace"
            class="h-20 w-44 object-contain md:h-24 md:w-52"
          />
        </NuxtLink>

        <form class="flex min-w-0 flex-1 overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
          <input
            class="h-12 min-w-0 flex-1 border-0 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="O que voce procura?"
            type="search"
          />
          <button
            aria-label="Buscar"
            class="flex h-12 w-14 items-center justify-center bg-[#d72d91] text-white transition hover:bg-[#bf247e]"
            type="submit"
          >
            <span class="i-lucide-search h-6 w-6"></span>
          </button>
        </form>

        <div class="flex items-center justify-center gap-7 lg:justify-end">
          <NuxtLink to="/login" class="flex items-center gap-3 text-left">
            <span
              class="i-lucide-circle-user-round h-9 w-9 text-[#d72d91]"
            ></span>
            <span class="leading-tight">
              <span class="block text-xs font-medium text-[#c73891]">
                Entre ou cadastre-se
              </span>
              <span class="flex items-center gap-1 text-sm font-semibold">
                Minha conta
                <span class="i-lucide-chevron-down h-4 w-4"></span>
              </span>
            </span>
          </NuxtLink>

          <button
            class="relative text-slate-900"
            type="button"
            aria-label="Carrinho"
            @click="drawerOpen = true"
          >
            <span class="i-lucide-shopping-cart h-9 w-9"></span>
            <span
              class="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#d72d91] text-xs font-bold text-white"
            >
              {{ cartCount }}
            </span>
          </button>
        </div>
      </div>

      <nav class="bg-[#d72d91]">
        <div
          class="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 text-sm font-semibold text-white md:justify-between md:px-6"
        >
          <NuxtLink
            v-for="item in ['Inicio', ...navItems]"
            :key="item"
            to="/"
            class="shrink-0 px-4 py-3.5 transition hover:bg-white/15"
          >
            {{ item }}
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <section class="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside
          class="overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
        >
          <div class="flex items-center gap-3 bg-[#d72d91] px-5 py-4 text-white">
            <span class="i-lucide-menu h-6 w-6"></span>
            <span class="font-semibold">Categorias</span>
          </div>
          <div
            v-for="category in categories"
            :key="category"
            class="border-b border-slate-100 last:border-b-0"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between px-5 py-3 text-left text-sm text-slate-700 hover:bg-pink-50 hover:text-[#c72786]"
              :aria-expanded="expandedCategory === category"
              @click="expandedCategory = expandedCategory === category ? '' : category"
            >
              <span>{{ category }}</span>
              <span
                :class="[
                  expandedCategory === category
                    ? 'i-lucide-chevron-down'
                    : 'i-lucide-chevron-right',
                  'h-4 w-4 text-slate-400',
                ]"
              ></span>
            </button>
            <div
              v-if="expandedCategory === category"
              class="bg-slate-50 px-4 pb-3"
            >
              <NuxtLink
                v-for="option in optionsForCategory(category)"
                :key="option"
                to="/"
                class="block rounded px-3 py-2 text-xs font-medium text-slate-500 hover:bg-white hover:text-[#c72786]"
              >
                {{ option }}
              </NuxtLink>
            </div>
          </div>
        </aside>

        <div>
          <div
            class="relative overflow-hidden rounded border border-pink-100 bg-pink-100 shadow-sm"
          >
            <img
              :key="heroSlides[activeHeroSlide].image"
              :src="heroSlides[activeHeroSlide].image"
              :alt="heroSlides[activeHeroSlide].alt"
              class="h-full min-h-[250px] w-full object-cover transition-opacity duration-300"
            />
            <NuxtLink
              to="/"
              class="absolute bottom-[13%] left-[5%] rounded bg-[#d72d91] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#bf247e]"
            >
              COMPRE AGORA
            </NuxtLink>
            <div
              class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2"
              aria-label="Selecionar banner"
            >
              <button
                v-for="(_, index) in heroSlides"
                :key="index"
                type="button"
                :aria-label="`Mostrar banner ${index + 1}`"
                :aria-current="activeHeroSlide === index"
                class="h-3 w-3 rounded-full transition hover:scale-110"
                :class="
                  activeHeroSlide === index
                    ? 'bg-[#d72d91]'
                    : 'bg-white/80 hover:bg-[#d72d91]/60'
                "
                @click="activeHeroSlide = index"
              ></button>
            </div>
          </div>

          <div
            class="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-5"
            aria-label="Vantagens da loja"
          >
            <div
              v-for="benefit in benefits"
              :key="benefit.title"
              class="flex items-center gap-3"
            >
              <span :class="[benefit.icon, 'h-8 w-8 text-[#d72d91]']"></span>
              <span class="leading-tight">
                <span class="block text-sm font-semibold text-slate-800">
                  {{ benefit.title }}
                </span>
                <span class="text-xs text-slate-500">{{ benefit.text }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section class="pb-10 pt-2">
        <div class="mb-5 flex items-center justify-between">
          <h2 class="mb-0 text-xl font-bold text-slate-900 md:text-2xl">
            Mais Vendidos
          </h2>
          <NuxtLink to="/" class="text-sm font-medium text-[#d72d91]">
            Ver todos
          </NuxtLink>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <article
            v-for="product in products"
            :key="product.name"
            class="rounded border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <NuxtLink :to="productPath(product)" class="block">
              <div
                class="mb-4 h-40 rounded bg-white bg-no-repeat"
                :style="{
                  backgroundImage: `url(${product.image || bannerImage})`,
                  backgroundPosition: product.position,
                  backgroundSize: product.size,
                }"
                role="img"
                :aria-label="product.name"
              ></div>
              <h3 class="mb-1 text-sm font-medium leading-snug text-slate-700">
                {{ product.name }}
              </h3>
              <p class="text-lg font-bold text-slate-950">{{ product.price }}</p>
              <p class="text-xs text-slate-500">{{ product.installment }}</p>
              <div class="mt-2 flex text-[#f2a32b]" aria-label="Avaliacao">
                <span
                  v-for="star in 5"
                  :key="star"
                  :class="[
                    star <= product.rating
                      ? 'i-lucide-star fill-current'
                      : 'i-lucide-star',
                    'h-4 w-4',
                  ]"
                ></span>
              </div>
            </NuxtLink>
            <button
              v-if="product.source"
              class="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded bg-[#d72d91] px-3 text-sm font-semibold text-white transition hover:bg-[#bf247e]"
              type="button"
              @click.stop="addProductToCart(product)"
            >
              <span class="i-lucide-shopping-cart h-4 w-4"></span>
              Adicionar
            </button>
          </article>
        </div>
      </section>
    </main>

    <div
      v-if="drawerOpen"
      class="fixed inset-0 z-40 bg-slate-950/35"
      @click.self="drawerOpen = false"
    >
      <aside
        class="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        aria-label="Carrinho"
      >
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 class="text-lg font-bold text-slate-950">Carrinho</h2>
            <p class="text-sm text-slate-500">{{ cartCount }} item(ns)</p>
          </div>
          <button
            class="flex h-10 w-10 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
            type="button"
            aria-label="Fechar carrinho"
            @click="drawerOpen = false"
          >
            <span class="i-lucide-x h-5 w-5"></span>
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p
            v-if="checkoutStatus"
            class="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            {{ checkoutStatus }}
          </p>
          <p
            v-if="cartError"
            class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {{ cartError }}
          </p>

          <div v-if="!cartItems.length" class="py-12 text-center text-sm text-slate-500">
            Seu carrinho esta vazio.
          </div>

          <article
            v-for="item in cartItems"
            :key="item.product.id"
            class="flex gap-4 border-b border-slate-100 py-4 last:border-b-0"
          >
            <img
              :src="item.product.image || bannerImage"
              :alt="item.product.name"
              class="h-20 w-20 rounded border border-slate-100 object-contain"
            />
            <div class="min-w-0 flex-1">
              <h3 class="line-clamp-2 text-sm font-semibold text-slate-800">
                {{ item.product.name }}
              </h3>
              <p class="mt-1 text-sm font-bold text-slate-950">
                {{ money(item.product.price) }}
              </p>
              <div class="mt-3 flex items-center gap-2">
                <button
                  class="flex h-8 w-8 items-center justify-center rounded border border-slate-200 hover:bg-slate-50"
                  type="button"
                  aria-label="Diminuir quantidade"
                  @click="updateQuantity(item.product.id, item.quantity - 1)"
                >
                  <span class="i-lucide-minus h-4 w-4"></span>
                </button>
                <span class="w-8 text-center text-sm font-semibold">
                  {{ item.quantity }}
                </span>
                <button
                  class="flex h-8 w-8 items-center justify-center rounded border border-slate-200 hover:bg-slate-50"
                  type="button"
                  aria-label="Aumentar quantidade"
                  @click="updateQuantity(item.product.id, item.quantity + 1)"
                >
                  <span class="i-lucide-plus h-4 w-4"></span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <footer class="border-t border-slate-200 px-5 py-4">
          <div class="mb-4 flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span>{{ money(cartTotal) }}</span>
          </div>
          <div class="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <button
              class="flex h-11 w-11 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              aria-label="Limpar carrinho"
              :disabled="cartLoading || !cartItems.length"
              @click="clearCart"
            >
              <span class="i-lucide-trash-2 h-5 w-5"></span>
            </button>
            <button
              class="h-11 rounded bg-[#d72d91] px-4 text-sm font-semibold text-white transition hover:bg-[#bf247e] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="cartLoading || !cartItems.length"
              @click="finishCheckout"
            >
              {{ cartLoading ? 'Finalizando...' : 'Finalizar pedido' }}
            </button>
          </div>
        </footer>
      </aside>
    </div>

    <NuxtLink
      to="/contact-us"
      class="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#20b15a] text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#19984b]"
      aria-label="WhatsApp"
    >
      <span class="i-lucide-message-circle h-9 w-9"></span>
    </NuxtLink>
  </div>
</template>
