<script setup lang="ts">
  import type {
    CmsBanner,
    MarketplaceCategory,
    PaginatedResponse,
    MarketplaceProduct,
  } from '@/composables/marketplace-api'
  import bannerImage from '@/assets/images/banner.png'
  import bannerImage2 from '@/assets/images/banner2.png'
  import logoImage from '@/assets/images/logo.png'

  const props = withDefaults(defineProps<{
    initialCategory?: string
    initialCategorySlug?: string
  }>(), {
    initialCategory: '',
    initialCategorySlug: '',
  })

  const fallbackCategories = [
    'Alongamento de Cilios',
    'Kits',
    'Pincas',
    'Colas',
    'Removedores',
    'Higiene',
    'Acessorios',
    'Ofertas',
  ]

  const apiBase = useRuntimeConfig().public.apiBase

  const { data: apiCategories } = useAsyncData(
    'marketplace-categories',
    () =>
      $fetch<MarketplaceCategory[]>(`${apiBase}/categories`, {
        timeout: 3000,
      }).catch(() => []),
    {
      default: () => [],
      lazy: true,
      server: false,
    },
  )

  const { data: apiProductsResponse } = useAsyncData(
    'marketplace-products',
    () =>
      $fetch<MarketplaceProduct[] | PaginatedResponse<MarketplaceProduct>>(
        `${apiBase}/products`,
        {
          timeout: 3000,
        },
      ).catch(() => []),
    {
      default: () => [],
      lazy: true,
      server: false,
    },
  )

  const { data: apiBanners } = useAsyncData(
    'marketplace-home-banners',
    () =>
      $fetch<CmsBanner[]>(`${apiBase}/banners?placement=home`, {
        timeout: 3000,
      }).catch(() => []),
    {
      default: () => [],
      lazy: true,
      server: false,
    },
  )

  const apiProducts = computed(() =>
    Array.isArray(apiProductsResponse.value)
      ? apiProductsResponse.value
      : apiProductsResponse.value?.data || [],
  )

  const {
    drawerOpen,
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

  const searchTerm = ref('')
  const selectedCategory = ref('')

  const normalizeText = (value: string | number | null | undefined) =>
    String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const slugifyCategory = (category: string) =>
    normalizeText(category)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const categories = computed(() =>
    apiCategories.value?.length
      ? apiCategories.value.map((category) => category.name)
      : fallbackCategories,
  )

  const routeCategory = computed(() => {
    if (props.initialCategory) return props.initialCategory
    if (!props.initialCategorySlug) return ''

    return (
      categories.value.find(
        (category) => slugifyCategory(category) === props.initialCategorySlug,
      ) || ''
    )
  })

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
    dynamicOptionsByCategory.value[category]?.length
      ? dynamicOptionsByCategory.value[category].slice(0, 8)
      : categoryOptions[category] || categoryOptions.Outros

  const categorySlugOverrides: Record<string, string> = {
    'Alongamento de Cilios': 'alongamento-de-cilios',
    Ofertas: 'ofertas',
  }

  const categoryPath = (category: string) =>
    category === 'Inicio'
      ? '/'
      : `/${categorySlugOverrides[category] || slugifyCategory(category)}`

  const navItems = computed(() => [
    ...categories.value
      .filter((category) => normalizeText(category) !== 'ofertas')
      .slice(0, 7),
    'Ofertas',
  ])

  const activeHeroSlide = ref(0)

  const fallbackHeroSlides = [
    {
      image: bannerImage,
      alt: 'Tudo para realcar a beleza do olhar',
      linkUrl: categoryPath('Ofertas'),
    },
    {
      image: bannerImage2,
      alt: 'Ofertas especiais para cilios',
      linkUrl: categoryPath('Ofertas'),
    },
    {
      image: bannerImage,
      alt: 'Produtos para alongamento de cilios',
      linkUrl: categoryPath('Alongamento de Cilios'),
    },
    {
      image: bannerImage2,
      alt: 'Cilios Marketplace',
      linkUrl: categoryPath('Ofertas'),
    },
  ]

  const heroSlides = computed(() => {
    if (!apiBanners.value?.length) return fallbackHeroSlides

    return apiBanners.value.map((banner) => ({
      image: banner.image,
      alt: banner.subtitle || banner.title,
      linkUrl: banner.link_url || categoryPath('Ofertas'),
    }))
  })

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
      category: 'Colas',
      price: 'R$ 49,90',
      installment: '6x de R$ 8,32 sem juros',
      position: '87% 53%',
      size: '540%',
      rating: 5,
    },
    {
      id: 2,
      name: 'Kit Alongamento Volume',
      category: 'Kits',
      price: 'R$ 159,90',
      installment: '6x de R$ 26,65 sem juros',
      position: '68% 47%',
      size: '360%',
      rating: 5,
    },
    {
      id: 3,
      name: 'Pinca Volume Russo',
      category: 'Pincas',
      price: 'R$ 39,90',
      installment: '6x de R$ 6,65 sem juros',
      position: '82% 43%',
      size: '520%',
      rating: 4,
    },
    {
      id: 4,
      name: 'Cilios Volume 5D',
      category: 'Alongamento de Cilios',
      price: 'R$ 29,90',
      installment: '6x de R$ 4,98 sem juros',
      position: '61% 45%',
      size: '500%',
      rating: 5,
    },
    {
      id: 5,
      name: 'Removedor em Gel',
      category: 'Removedores',
      price: 'R$ 39,90',
      installment: '6x de R$ 6,68 sem juros',
      position: '96% 55%',
      size: '460%',
      rating: 4,
    },
  ]

  const products = computed(() => {
    if (!apiProducts.value.length) {
      return fallbackProducts.map((product) => ({
        ...product,
        image: '',
        rawPrice: 0,
        source: null,
        hasDiscount: false,
      }))
    }

    return apiProducts.value.map((product) => {
      const price = Number(product.price)
      const originalPrice = Number(product.original_price || 0)

      return {
        id: product.id,
        name: product.name,
        category: product.category?.name || '',
        price: money(product.price),
        rawPrice: product.price,
        installment: `6x de ${money(price / 6)} sem juros`,
        image: product.image || '',
        position: 'center',
        size: 'contain',
        rating: Math.max(1, Math.round(Number(product.rating_average || 5))),
        source: product,
        hasDiscount: originalPrice > price,
      }
    })
  })

  const dynamicOptionsByCategory = computed(() =>
    products.value.reduce<Record<string, string[]>>((options, product) => {
      if (!product.category || !product.name) return options

      options[product.category] ||= []

      if (!options[product.category].includes(product.name)) {
        options[product.category].push(product.name)
      }

      return options
    }, {}),
  )

  const matchesCategory = (product: any, category: string) => {
    if (!category) return true

    const normalizedCategory = normalizeText(category)
    const productCategory = normalizeText(
      product.category || product.source?.category?.name,
    )

    if (normalizedCategory === 'ofertas') {
      return Boolean(product.hasDiscount || product.source?.is_featured)
    }

    return productCategory === normalizedCategory
  }

  const filteredProducts = computed(() => {
    const search = normalizeText(searchTerm.value)

    return products.value.filter((product) => {
      const text = normalizeText(
        [
          product.name,
          product.category,
          product.source?.description,
          product.source?.store?.name,
        ].join(' '),
      )

      return (
        (!search || text.includes(search)) &&
        matchesCategory(product, selectedCategory.value)
      )
    })
  })

  const sectionTitle = computed(() => {
    if (selectedCategory.value) return selectedCategory.value
    if (searchTerm.value.trim()) return 'Resultados da busca'
    return 'Mais Vendidos'
  })

  const addProductToCart = async (product: any) => {
    if (!product.source) return
    await addItem(product.source)
  }

  const productPath = (product: any) =>
    `/store/${product.id || product.source?.id}`

  const openHeroLink = () => {
    const linkUrl = heroSlides.value[activeHeroSlide.value]?.linkUrl

    if (!linkUrl) {
      navigateTo(categoryPath('Ofertas'))
      return
    }

    navigateTo(linkUrl, {
      external: /^https?:\/\//.test(linkUrl),
    })
  }

  const selectCategory = (category: string) => {
    selectedCategory.value = category
    searchTerm.value = ''
    navigateTo(categoryPath(category))
  }

  const toggleCategory = (category: string) => {
    expandedCategory.value = expandedCategory.value === category ? '' : category
    selectCategory(category)
  }

  const selectSuggestion = (category: string, option: string) => {
    selectedCategory.value = category
    searchTerm.value = option
  }

  const clearFilters = () => {
    selectedCategory.value = ''
    searchTerm.value = ''
  }

  const isNavActive = (item: string) =>
    item === 'Inicio'
      ? !selectedCategory.value && !searchTerm.value.trim()
      : selectedCategory.value === item

  watch(
    routeCategory,
    (category) => {
      selectedCategory.value = category
      expandedCategory.value = category || fallbackCategories[0]
      searchTerm.value = ''
    },
    { immediate: true },
  )
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

        <form
          class="flex min-w-0 flex-1 overflow-hidden rounded border border-slate-200 bg-white shadow-sm"
          @submit.prevent
        >
          <input
            v-model="searchTerm"
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
          <NuxtLink
            to="/order-history"
            class="flex items-center gap-3 text-left"
          >
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
            :to="categoryPath(item)"
            class="shrink-0 px-4 py-3.5 transition hover:bg-white/15"
            :class="isNavActive(item) ? 'bg-white/20' : ''"
            @click="item === 'Inicio' ? clearFilters() : undefined"
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
          <div
            class="flex items-center gap-3 bg-[#d72d91] px-5 py-4 text-white"
          >
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
              :class="
                selectedCategory === category ? 'bg-pink-50 text-[#c72786]' : ''
              "
              :aria-expanded="expandedCategory === category"
              @click="toggleCategory(category)"
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
              <button
                v-for="option in optionsForCategory(category)"
                :key="option"
                type="button"
                class="block w-full rounded px-3 py-2 text-left text-xs font-medium text-slate-500 hover:bg-white hover:text-[#c72786]"
                @click="selectSuggestion(category, option)"
              >
                {{ option }}
              </button>
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
            <button
              type="button"
              class="absolute bottom-[13%] left-[5%] rounded bg-[#d72d91] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#bf247e]"
              @click="openHeroLink"
            >
              COMPRE AGORA
            </button>
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
        <div
          class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="mb-0 text-xl font-bold text-slate-900 md:text-2xl">
              {{ sectionTitle }}
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ filteredProducts.length }} produto(s) encontrado(s)
            </p>
          </div>
          <button
            v-if="selectedCategory || searchTerm"
            type="button"
            class="inline-flex h-9 items-center gap-2 rounded border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-white"
            @click="clearFilters"
          >
            <span class="i-lucide-x h-4 w-4"></span>
            Limpar filtros
          </button>
        </div>

        <div
          v-if="filteredProducts.length"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <article
            v-for="product in filteredProducts"
            :key="product.id"
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
              <p class="mb-1 text-xs font-semibold text-[#d72d91]">
                {{ product.category || 'Cilios' }}
              </p>
              <h3 class="mb-1 text-sm font-medium leading-snug text-slate-700">
                {{ product.name }}
              </h3>
              <p class="text-lg font-bold text-slate-950">
                {{ product.price }}
              </p>
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

        <div
          v-else
          class="rounded border border-dashed border-slate-300 bg-white px-5 py-12 text-center"
        >
          <p class="font-semibold text-slate-800">Nenhum produto encontrado.</p>
          <p class="mt-1 text-sm text-slate-500">
            Tente outra busca ou limpe os filtros.
          </p>
        </div>
      </section>
    </main>

    <CartDrawer />

    <NuxtLink
      to="/contact-us"
      class="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#20b15a] text-white shadow-lg shadow-emerald-900/20 transition hover:bg-[#19984b]"
      aria-label="WhatsApp"
    >
      <span class="i-lucide-message-circle h-9 w-9"></span>
    </NuxtLink>
  </div>
</template>
