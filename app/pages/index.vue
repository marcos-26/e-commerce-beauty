<script setup lang="ts">
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
</script>

<template>
  <MarketplaceStorefront />
</template>
