// since `.js, .ts` files are not included by default,
// the following comment tells UnoCSS to force scan this file (to pick the logo icon).
// @unocss-include

export default {
  title: 'Cilios Marketplace',
  description:
    'Marketplace de produtos profissionais para extensao e cuidado dos cilios.',
  logo: 'i-fluent-emoji:shopping-bags',
  author: 'Cilios Marketplace',
  url: 'http://localhost:3000',
  github: '',
  ogImageUrl: 'og-image.jpg', // absolute url (or) from public folder
  generator: 'Cilios Marketplace',
  defaultLocale: 'pt-BR', // default
  identity: {
    type: 'Organization',
  } as any,
  twitter: '',
  trailingSlash: false, // default
  titleSeparator: '|', // default

  navs: {
    primary: [
      { title: 'Inicio', to: '/', icon: 'i-mdi-home' },
      { title: 'Produtos', to: '/', icon: 'i-mdi-home' },
      {
        title: 'Meus pedidos',
        to: '/order-history',
        icon: 'i-ic-baseline-history',
      },
      {
        title: 'Rastrear',
        to: '/track-order',
        icon: 'i-ic-outline-my-location',
      },
      {
        title: 'Atendimento',
        to: '/contact-us',
        icon: 'i-material-symbols-add-call',
      },
    ],
    secondary: [
      {
        title: 'Rastrear pedido',
        to: '/track-order',
        icon: 'i-ic-outline-my-location',
      },
      {
        title: 'Meus pedidos',
        to: '/order-history',
        icon: 'i-ic-baseline-history',
      },
      {
        title: 'Trocas e devolucoes',
        to: '/returns',
        icon: 'i-material-symbols-assignment-return-outline-rounded',
      },
      {
        title: 'Politica de entrega',
        to: '/delivery-policy',
        icon: 'i-tabler-truck-return',
      },
      {
        title: 'Contato',
        to: '/contact-us',
        icon: 'i-material-symbols-add-call',
      },
      {
        title: 'Ajuda e FAQs',
        to: '/help-faqs',
        icon: 'i-material-symbols-contact-support-outline',
      },
    ],
  },
}
