<script setup lang="ts">
  const route = useRoute()

  const categoriesBySlug: Record<string, string> = {
    'alongamento-de-cilios': 'Alongamento de Cilios',
    kits: 'Kits',
    pincas: 'Pincas',
    colas: 'Colas',
    removedores: 'Removedores',
    higiene: 'Higiene',
    acessorios: 'Acessorios',
    ofertas: 'Ofertas',
  }

  const routeSlug = computed(() => String(route.params.category || ''))
  const currentCategory = computed(() => categoriesBySlug[routeSlug.value] || '')

  definePageMeta({
    layout: false,
    title: 'Categoria',
    description: 'Produtos por categoria no Cilios Marketplace',
  })

  useHead({
    title: () =>
      currentCategory.value
        ? `${currentCategory.value} | Cilios Marketplace`
        : 'Categoria | Cilios Marketplace',
    bodyAttrs: {
      class: 'bg-[#f6f8fd]',
    },
  })
</script>

<template>
  <MarketplaceStorefront :initial-category="currentCategory" />
</template>
