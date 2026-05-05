<script setup lang="ts">
  definePageMeta({
    layout: false,
    title: 'Entrar',
  })

  const { login, token } = useMarketplaceApi()
  const form = reactive({
    email: '',
    password: '',
  })
  const loading = ref(false)
  const error = ref('')

  onMounted(() => {
    if (token.value) {
      navigateTo('/admin')
    }
  })

  const submit = async () => {
    loading.value = true
    error.value = ''

    try {
      await login(form.email, form.password)
      await navigateTo('/admin')
    } catch (err: any) {
      error.value =
        err?.data?.message || err?.data?.errors?.email?.[0] || 'Nao foi possivel entrar.'
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <main class="min-h-screen bg-[#f6f8fd] px-4 py-10 text-slate-900">
    <section class="mx-auto max-w-md rounded border border-slate-200 bg-white p-6 shadow-sm">
      <NuxtLink to="/" class="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d72d91]">
        <span class="i-lucide-arrow-left h-4 w-4"></span>
        Voltar para loja
      </NuxtLink>

      <h1 class="text-3xl font-bold">Entre</h1>
      <p class="mt-2 text-sm text-slate-500">Acesse sua conta para gerenciar o marketplace.</p>

      <p v-if="error" class="mt-5 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {{ error }}
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <label class="block">
          <span class="text-sm font-semibold">E-mail</span>
          <input v-model="form.email" type="email" required class="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
        </label>

        <label class="block">
          <span class="text-sm font-semibold">Senha</span>
          <input v-model="form.password" type="password" required class="mt-1 h-11 w-full rounded border border-slate-300 px-3 outline-none focus:border-[#d72d91]" />
        </label>

        <button class="h-11 w-full rounded bg-[#d72d91] font-semibold text-white hover:bg-[#bf247e]" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-600">
        Ainda nao tem conta?
        <NuxtLink to="/cadastro" class="font-semibold text-[#d72d91] underline">Cadastre-se</NuxtLink>
      </p>
    </section>
  </main>
</template>
