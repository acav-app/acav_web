import { listBannerSlidesActivos } from '@/lib/admin/repository'
import type { BannerSlide } from '@/lib/admin/types'
import HomeClient from './home-client'

export const revalidate = 60

export default async function Home() {
  let slides: BannerSlide[] = []

  try {
    slides = await listBannerSlidesActivos()
  } catch (error) {
    console.error('[banner]', error)
  }

  return <HomeClient slides={slides} />
}
