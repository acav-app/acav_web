import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID

const FIELDS = 'id,media_url,permalink,caption,timestamp,media_type,thumbnail_url'

async function tryBasicDisplayAPI() {
  const url = `https://graph.instagram.com/me/media?fields=${FIELDS}&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=12`
  
  const response = await fetch(url, {
    next: { revalidate: 3600 }
  } as RequestInit & { next?: { revalidate: number } })

  if (!response.ok) return null
  
  const data = await response.json()
  return data.data || []
}

async function tryGraphAPI() {
  if (!INSTAGRAM_BUSINESS_ID) return null
  
  const url = `https://graph.instagram.com/${INSTAGRAM_BUSINESS_ID}/media?fields=${FIELDS}&access_token=${INSTAGRAM_ACCESS_TOKEN}&limit=12`
  
  const response = await fetch(url, {
    next: { revalidate: 3600 }
  } as RequestInit & { next?: { revalidate: number } })

  if (!response.ok) return null
  
  const data = await response.json()
  return data.data || []
}

async function fetchInstagramPosts() {
  if (!INSTAGRAM_ACCESS_TOKEN) return []
  // Try Basic Display API first (no Business ID needed)
  let posts = await tryBasicDisplayAPI()
  
  // Fallback to Graph API if Basic Display fails
  if (!posts || posts.length === 0) {
    posts = await tryGraphAPI()
  }
  
  return posts || []
}

export async function GET() {
  try {
    const posts = await fetchInstagramPosts()
    
    const formattedPosts = posts.map((post: any) => ({
      id: post.id,
      type: post.media_type === 'VIDEO' ? 'video' : 'image',
      src: post.media_url,
      thumbnail: post.thumbnail_url || post.media_url,
      permalink: post.permalink,
      caption: post.caption || '',
      timestamp: post.timestamp,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error('Instagram fetch error:', error)
    return NextResponse.json({ posts: [], error: 'Failed to fetch Instagram posts' }, { status: 500 })
  }
}
