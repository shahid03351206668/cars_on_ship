const STORAGE_KEY = "cos_recently_viewed"

export interface RecentCar {
  name: string
  make: string
  model: string
  year: number
  price?: number
  images: string[]
}

export function addToRecentlyViewed(car: RecentCar) {
  try {
    const existing: RecentCar[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    const filtered = existing.filter((c) => c.name !== car.name)
    const updated = [car, ...filtered].slice(0, 6)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
  console.error("Failed to read recently viewed:", error)
  return []
}
}

export function getRecentlyViewed(): RecentCar[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
  } catch {
    return []
  }
}