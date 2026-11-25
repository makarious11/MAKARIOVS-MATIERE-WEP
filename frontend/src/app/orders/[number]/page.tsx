// Re-export the canonical locale-aware page so /orders/[number] and /ar/orders/[number] share the same implementation
export { default } from '@/app/[locale]/orders/[number]/page';
