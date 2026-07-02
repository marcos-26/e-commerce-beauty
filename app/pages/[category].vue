<script setup lang="ts">
  const route = useRoute()

  const routeSlug = computed(() => String(route.params.category || ''))
  const pageTitle = computed(() =>
    routeSlug.value
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
  )

  definePageMeta({
    layout: false,
    title: 'Categoria',
    description: 'Produtos por categoria no Cilios Marketplace',
  })

  useHead({
    title: () =>
      pageTitle.value
        ? `${pageTitle.value} | Cilios Marketplace`
        : 'Categoria | Cilios Marketplace',
    bodyAttrs: {
      class: 'bg-[#f6f8fd]',
    },
  })
</script>

<template>
  <MarketplaceStorefront :initial-category-slug="routeSlug" />
</template>
