export const groceryKeys = {
  all: ['groceries'] as const,
  categories: () => [...groceryKeys.all, 'categories'] as const,
  products: (categoryId?: string) =>
    [...groceryKeys.all, 'products', categoryId ?? 'all'] as const,
  product: (id: string) => [...groceryKeys.all, 'product', id] as const,
}
