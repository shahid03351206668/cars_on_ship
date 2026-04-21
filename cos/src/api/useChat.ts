import { fetchAPIAuthPost } from "./vehicles" // adjust to your actual import path

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatRoom {
  room_id: string
  ad: string
  seller: string
  buyer: string
  status: "Open" | "Closed" | "Archived"
  last_message_at: string | null
}

export interface ChatMessage {
  name: string
  room: string
  sender: string
  sender_role: "Buyer" | "Seller"
  message: string
  message_type: "Text" | "File" | "System"
  is_read: 0 | 1
  sent_at: string
}

export interface InboxRoom {
  room_id: string
  other_user: string          // seller (for buyer inbox) or buyer (for seller inbox)
  other_user_full_name: string
  other_user_avatar: string | null
  ad: string
  make: string
  model: string
  year: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Get or create a Chat Room for a given Ad + current buyer.
 * Returns the room_id (deterministic hash).
 */
export async function getOrCreateChatRoom(
  adId: string,
  sellerUser: string
): Promise<string> {
  const response = await fetchAPIAuthPost(
    "cars_on_ship.chat.get_or_create_room",
    { ad_id: adId, seller: sellerUser }
  )
  return (response as { room_id: string }).room_id
}

/**
 * Fetch paginated messages for a room.
 * Pass `before` (ISO timestamp) for infinite-scroll upward pagination.
 */
export async function getMessages(
  roomId: string,
  limit = 30,
  before?: string
): Promise<ChatMessage[]> {
  const payload: Record<string, string> = {
    room_id: roomId,
    limit: String(limit),
  }
  if (before) payload.before = before
  const response = await fetchAPIAuthPost(
    "cars_on_ship.chat.get_messages",
    payload
  )
  return response as ChatMessage[]
}

/**
 * Send a message to a room.
 */
export async function sendMessage(
  roomId: string,
  message: string
): Promise<{ message_id: string }> {
  const response = await fetchAPIAuthPost(
    "cars_on_ship.chat.send_message",
    { room_id: roomId, message }
  )
  return response as { message_id: string }
}

/**
 * Fetch buyer's inbox — all rooms sorted by last_message_at.
 */
export async function getBuyerInbox(): Promise<InboxRoom[]> {
  const response = await fetchAPIAuthPost(
    "cars_on_ship.chat.get_buyer_inbox",
    {}
  )
  return response as InboxRoom[]
}

/**
 * Mark all messages in a room as read.
 */
export async function markRoomRead(roomId: string): Promise<void> {
  await fetchAPIAuthPost("cars_on_ship.chat.mark_room_read", {
    room_id: roomId,
  })
}