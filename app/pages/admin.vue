<script setup lang="ts">
  import type {
    MarketplaceCategory,
    MarketplaceProduct,
  } from '@/composables/marketplace-api'

  definePageMeta({
    layout: false,
    title: 'Admin',
  })

  const { token, user, request, loadUser, logout } = useMarketplaceApi()
  const categories = ref<MarketplaceCategory[]>([])
  const products = ref<MarketplaceProduct[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const error = ref('')
  const status = ref('')

  const categoryForm = reactive({
    id: null as number | null,
    name: '',
  })

  const productForm = reactive({
    id: null as number | null,
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
  })

  const emptyProduct = () => {
    productForm.id = null
    productForm.name = ''
    productForm.description = ''
    productForm.price = ''
    productForm.image = ''
    productForm.category_id = categories.value[0]?.id?.toString() || ''
  }

  const loadData = async () => {
    loading.value = true
    error.value = ''

    try {
      await loadUser()
      const [categoryData, productData] = await Promise.all([
        request<MarketplaceCategory[]>('/categories'),
        request<MarketplaceProduct[]>('/products'),
      ])
      categories.value = categoryData
      products.value = productData
      if (!productForm.category_id) {
        productForm.category_id = categories.value[0]?.id?.toString() || ''
      }
    } catch (err: any) {
      error.value = err?.data?.message || 'Nao foi possivel carregar os dados.'
      if (err?.status === 401 || err?.statusCode === 401) {
        token.value = null
        await navigateTo('/login')
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    if (!token.value) {
      await navigateTo('/login')
      return
    }

    await loadData()
  })

  const saveCategory = async () => {
    saving.value = true
    status.value = ''
    error.value = ''

    try {
      if (categoryForm.id) {
        await request(`/categories/${categoryForm.id}`, {
          method: 'PUT',
          body: { name: categoryForm.name },
        })
        status.value = 'Categoria atualizada.'
      } else {
        await request('/categories', {
          method: 'POST',
          body: { name: categoryForm.name },
        })
        status.value = 'Categoria criada.'
      }
      categoryForm.id = null
      categoryForm.name = ''
      await loadData()
    } catch (err: any) {
      error.value = err?.data?.message || 'Nao foi possivel salvar a categoria.'
    } finally {
      saving.value = false
    }
  }

  const editCategory = (category: MarketplaceCategory) => {
    categoryForm.id = category.id
    categoryForm.name = category.name
  }

  const deleteCategory = async (category: MarketplaceCategory) => {
    if (!confirm(`Excluir categoria "${category.name}"?`)) return

    await request(`/categories/${category.id}`, { method: 'DELETE' })
    status.value = 'Categoria removida.'
    await loadData()
  }

  const saveProduct = async () => {
    saving.value = true
    status.value = ''
    error.value = ''

    const body = {
      name: productForm.name,
      description: productForm.description || null,
      price: productForm.price,
      image: productForm.image || null,
      category_id: Number(productForm.category_id),
    }

    try {
      if (productForm.id) {
        await request(`/products/${productForm.id}`, {
          method: 'PUT',
          body,
        })
        status.value = 'Produto atualizado.'
      } else {
        await request('/products', {
          method: 'POST',
          body,
        })
        status.value = 'Produto criado.'
      }
      emptyProduct()
      await loadData()
    } catch (err: any) {
      error.value = err?.data?.message || 'Nao foi possivel salvar o produto.'
    } finally {
      saving.value = false
    }
  }

  const editProduct = (product: MarketplaceProduct) => {
    productForm.id = product.id
    productForm.name = product.name
    productForm.description = product.description || ''
    productForm.price = product.price?.toString() || ''
    productForm.image = product.image || ''
    productForm.category_id = product.category_id.toString()
  }

  const deleteProduct = async (product: MarketplaceProduct) => {
    if (!confirm(`Excluir produto "${product.name}"?`)) return

    await request(`/products/${product.id}`, { method: 'DELETE' })
    status.value = 'Produto removido.'
    await loadData()
  }

  const money = (value: string | number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value))
</script>

<template>
  <main class="min-h-screen bg-[#f6f8fd] px-4 py-6 text-slate-900">
    <div class="mx-auto max-w-7xl">
      <header class="mb-6 flex flex-col gap-4 rounded border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <NuxtLink to="/" class="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-[#d72d91]">
            <span class="i-lucide-arrow-left h-4 w-4"></span>
            Loja
          </NuxtLink>
          <h1 class="text-2xl font-bold">Painel do marketplace</h1>
          <p class="text-sm text-slate-500">
            {{ user?.name || 'Administrador' }}
          </p>
        </div>

        <button class="h-10 rounded border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50" @click="logout">
          Sair
        </button>
      </header>

      <p v-if="status" class="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ status }}
      </p>
      <p v-if="error" class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </p>

      <div v-if="loading" class="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Carregando dados...
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section class="space-y-6">
          <form class="rounded border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="saveCategory">
            <h2 class="text-lg font-bold">Categorias</h2>
            <label class="mt-4 block">
              <span class="text-sm font-semibold">Nome</span>
              <input v-model="categoryForm.name" required class="mt-1 h-10 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
            </label>
            <div class="mt-4 flex gap-2">
              <button class="h-10 rounded bg-[#d72d91] px-4 text-sm font-semibold text-white hover:bg-[#bf247e]" :disabled="saving">
                {{ categoryForm.id ? 'Atualizar' : 'Criar' }}
              </button>
              <button v-if="categoryForm.id" type="button" class="h-10 rounded border border-slate-300 px-4 text-sm font-semibold" @click="categoryForm.id = null; categoryForm.name = ''">
                Cancelar
              </button>
            </div>
          </form>

          <form class="rounded border border-slate-200 bg-white p-5 shadow-sm" @submit.prevent="saveProduct">
            <h2 class="text-lg font-bold">Produtos</h2>
            <div class="mt-4 space-y-3">
              <label class="block">
                <span class="text-sm font-semibold">Nome</span>
                <input v-model="productForm.name" required class="mt-1 h-10 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Preco</span>
                <input v-model="productForm.price" required type="number" step="0.01" min="0" class="mt-1 h-10 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Categoria</span>
                <select v-model="productForm.category_id" required class="mt-1 h-10 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]">
                  <option value="" disabled>Selecione</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Imagem URL</span>
                <input v-model="productForm.image" class="mt-1 h-10 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold">Descricao</span>
                <textarea v-model="productForm.description" rows="3" class="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-[#d72d91]"></textarea>
              </label>
            </div>
            <div class="mt-4 flex gap-2">
              <button class="h-10 rounded bg-[#d72d91] px-4 text-sm font-semibold text-white hover:bg-[#bf247e]" :disabled="saving || !categories.length">
                {{ productForm.id ? 'Atualizar' : 'Criar' }}
              </button>
              <button v-if="productForm.id" type="button" class="h-10 rounded border border-slate-300 px-4 text-sm font-semibold" @click="emptyProduct">
                Cancelar
              </button>
            </div>
          </form>
        </section>

        <section class="space-y-6">
          <div class="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-bold">Categorias cadastradas</h2>
            <div class="mt-4 divide-y divide-slate-100">
              <div v-for="category in categories" :key="category.id" class="flex items-center justify-between gap-3 py-3">
                <div>
                  <p class="font-semibold">{{ category.name }}</p>
                  <p class="text-xs text-slate-500">{{ category.products_count || 0 }} produtos</p>
                </div>
                <div class="flex gap-2">
                  <button class="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold" @click="editCategory(category)">Editar</button>
                  <button class="rounded border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600" @click="deleteCategory(category)">Excluir</button>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded border border-slate-200 bg-white p-5 shadow-sm">
            <h2 class="text-lg font-bold">Produtos cadastrados</h2>
            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <article v-for="product in products" :key="product.id" class="rounded border border-slate-200 p-4">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="mb-3 h-32 w-full rounded object-cover" />
                <h3 class="font-semibold">{{ product.name }}</h3>
                <p class="text-sm text-slate-500">{{ product.category?.name }}</p>
                <p class="mt-1 font-bold">{{ money(product.price) }}</p>
                <p class="mt-2 line-clamp-2 text-sm text-slate-600">{{ product.description }}</p>
                <div class="mt-4 flex gap-2">
                  <button class="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold" @click="editProduct(product)">Editar</button>
                  <button class="rounded border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600" @click="deleteProduct(product)">Excluir</button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
