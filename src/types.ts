export type Product = {
  id: string
  name: string
  image: string
  categoryId: string
  price: number
}

export type Category = {
  id: string
  name: string
  sortOrder: number
}
