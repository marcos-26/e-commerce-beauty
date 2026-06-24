<script setup lang="ts">
  import type {
    CouponApplyResponse,
    MarketplaceOrder,
  } from '@/composables/marketplace-api'
  import bannerImage from '@/assets/images/banner.png'

  const { request } = useMarketplaceApi()
  const {
    items: cartItems,
    drawerOpen,
    loading: cartLoading,
    error: cartError,
    count: cartCount,
    total: cartTotal,
    money,
    updateQuantity,
    clearCart,
    checkout,
  } = useAbandonedCart()

  const couponCode = ref('')
  const appliedCoupon = ref('')
  const couponDiscount = ref(0)
  const couponLoading = ref(false)
  const couponError = ref('')
  const paymentMethod = ref('pix')

  const paymentMethods = [
    { value: 'pix', label: 'Pix', icon: 'i-lucide-qr-code' },
    { value: 'credit_card', label: 'Cartao', icon: 'i-lucide-credit-card' },
    { value: 'boleto', label: 'Boleto', icon: 'i-lucide-barcode' },
  ]

  const shippingTotal = computed(() => {
    if (!cartTotal.value) return 0
    return cartTotal.value >= 199 ? 0 : 19.9
  })

  const estimatedTotal = computed(() =>
    Math.max(0, cartTotal.value - couponDiscount.value + shippingTotal.value),
  )

  const resetCoupon = () => {
    appliedCoupon.value = ''
    couponDiscount.value = 0
    couponError.value = ''
  }

  watch(cartTotal, (newTotal, oldTotal) => {
    if (newTotal === oldTotal) return
    if (!newTotal) {
      couponCode.value = ''
      resetCoupon()
      return
    }
    if (appliedCoupon.value) {
      resetCoupon()
      couponError.value = 'Aplique o cupom novamente apos alterar o carrinho.'
    }
  })

  const applyCoupon = async () => {
    const code = couponCode.value.trim().toUpperCase()
    if (!code) return

    couponLoading.value = true
    couponError.value = ''

    try {
      const response = await request<CouponApplyResponse>('/coupons/apply', {
        method: 'POST',
        body: {
          code,
          subtotal: cartTotal.value,
        },
      })
      appliedCoupon.value = response.coupon.code
      couponCode.value = response.coupon.code
      couponDiscount.value = Number(response.discount)
    } catch (err: any) {
      resetCoupon()
      couponError.value = err?.data?.message || 'Cupom indisponivel.'
    } finally {
      couponLoading.value = false
    }
  }

  const removeCoupon = () => {
    couponCode.value = ''
    resetCoupon()
  }

  const finishCheckout = async () => {
    const order = await checkout({
      coupon_code: appliedCoupon.value || undefined,
      payment_method: paymentMethod.value,
    })

    if (order) {
      const createdOrder = order as MarketplaceOrder
      removeCoupon()
      await navigateTo({
        path: '/track-order',
        query: { pedido: createdOrder.id.toString() },
      })
    }
  }
</script>

<template>
  <div
    v-if="drawerOpen"
    class="fixed inset-0 z-40 bg-slate-950/35"
    @click.self="drawerOpen = false"
  >
    <aside
      class="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl"
      aria-label="Carrinho"
    >
      <header
        class="flex items-center justify-between border-b border-slate-200 px-5 py-4"
      >
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
          v-if="cartError"
          class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ cartError }}
        </p>

        <div
          v-if="!cartItems.length"
          class="py-12 text-center text-sm text-slate-500"
        >
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
            <NuxtLink
              :to="`/store/${item.product.id}`"
              class="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-[#d72d91]"
            >
              {{ item.product.name }}
            </NuxtLink>
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

        <section
          v-if="cartItems.length"
          class="mt-5 space-y-4 border-t border-slate-100 pt-5"
        >
          <form
            class="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
            @submit.prevent="applyCoupon"
          >
            <label class="min-w-0">
              <span class="sr-only">Cupom</span>
              <input
                v-model="couponCode"
                class="h-10 w-full rounded border border-slate-300 px-3 text-sm uppercase outline-none focus:border-[#d72d91]"
                placeholder="Cupom"
              />
            </label>
            <button
              class="h-10 rounded bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              :disabled="couponLoading || !couponCode.trim()"
            >
              {{ couponLoading ? 'Aplicando...' : 'Aplicar' }}
            </button>
          </form>

          <div
            v-if="appliedCoupon"
            class="flex items-center justify-between rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          >
            <span>{{ appliedCoupon }} aplicado</span>
            <button type="button" class="font-semibold" @click="removeCoupon">
              Remover
            </button>
          </div>
          <p v-if="couponError" class="text-sm text-red-600">
            {{ couponError }}
          </p>

          <div>
            <p class="mb-2 text-sm font-semibold text-slate-700">Pagamento</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                type="button"
                class="flex h-10 items-center justify-center gap-1 rounded border text-xs font-semibold transition"
                :class="
                  paymentMethod === method.value
                    ? 'border-[#d72d91] bg-pink-50 text-[#d72d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                "
                @click="paymentMethod = method.value"
              >
                <span :class="[method.icon, 'h-4 w-4']"></span>
                {{ method.label }}
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer class="border-t border-slate-200 px-5 py-4">
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Subtotal</span>
            <span class="font-semibold">{{ money(cartTotal) }}</span>
          </div>
          <div
            v-if="couponDiscount"
            class="flex items-center justify-between text-emerald-700"
          >
            <span>Desconto</span>
            <span>-{{ money(couponDiscount) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-500">Frete estimado</span>
            <span class="font-semibold">{{
              shippingTotal ? money(shippingTotal) : 'Gratis'
            }}</span>
          </div>
          <div
            class="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold"
          >
            <span>Total</span>
            <span>{{ money(estimatedTotal) }}</span>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-3">
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
</template>
