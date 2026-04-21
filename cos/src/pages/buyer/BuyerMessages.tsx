import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Send, Plus, Smile, ChevronLeft } from "lucide-react"
import {
  getMessages,
  sendMessage,
  getBuyerInbox,
  markRoomRead,
  getOrCreateChatRoom,
  type ChatMessage,
  type InboxRoom,
} from "../../api/useChat"
import toast from "react-hot-toast"
import { getSocket } from "../../lib/socket"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatInboxTime(iso: string | null) {
  if (!iso) return ""
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay)
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function avatarFallback(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Group messages by date for date separators
function groupByDate(messages: ChatMessage[]) {
  const groups: { date: string; messages: ChatMessage[] }[] = []
  for (const msg of messages) {
    const date = new Date(msg.sent_at).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const last = groups[groups.length - 1]
    if (last && last.date === date) {
      last.messages.push(msg)
    } else {
      groups.push({ date, messages: [msg] })
    }
  }
  return groups
}

// ─── Avatar component ─────────────────────────────────────────────────────────

function Avatar({
  src,
  name,
  size = 40,
}: {
  src?: string | null
  name: string
  size?: number
}) {
  const [imgError, setImgError] = useState(false)
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
        onError={() => setImgError(true)}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
    >
      {avatarFallback(name || "?")}
    </div>
  )
}

// ─── Ad context banner ────────────────────────────────────────────────────────

function AdBanner({
  make,
  model,
  year,
  price,
  image,
  adId,
}: {
  make: string
  model: string
  year: string
  price?: number
  image?: string | null
  adId: string
}) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-2 border-[#FC7844] rounded-xl mx-4 mt-4 bg-white">
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                "https://placehold.co/64x48?text=Car"
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
            🚗
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-gray-900 uppercase tracking-wide truncate">
          {make} {model}
        </p>
        <p className="text-xs text-gray-500">
          {year}
          {price ? ` • ${year}` : ""}
        </p>
        {price ? (
          <p className="text-[#FC7844] font-bold text-sm">
            £{price.toLocaleString()}
          </p>
        ) : null}
      </div>
      <button
        onClick={() => navigate(`/buyer/car/${adId}`)}
        className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        View Ad
      </button>
    </div>
  )
}

// ─── Inbox sidebar item ───────────────────────────────────────────────────────

function InboxItem({
  room,
  isActive,
  onClick,
}: {
  room: InboxRoom
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive ? "bg-gray-100" : "hover:bg-gray-50"
      }`}
    >
      <Avatar
        src={room.other_user_avatar}
        name={room.other_user_full_name || room.other_user}
        size={44}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {room.other_user_full_name || room.other_user}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0">
            {formatInboxTime(room.last_message_at)}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {room.last_message || "No messages yet"}
        </p>
      </div>
      {room.unread_count > 0 && (
        <span className="w-5 h-5 rounded-full bg-[#FC7844] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
          {room.unread_count > 9 ? "9+" : room.unread_count}
        </span>
      )}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BuyerMessages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // URL params passed from MyOffers
  const roomIdFromUrl = searchParams.get("room")
  const adIdFromUrl = searchParams.get("ad")
  const sellerFromUrl = searchParams.get("seller")

  // Active room state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(roomIdFromUrl)
  const [activeAdId, setActiveAdId] = useState<string | null>(adIdFromUrl)

  // Inbox
  const [inbox, setInbox] = useState<InboxRoom[]>([])
  const [inboxLoading, setInboxLoading] = useState(true)

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [hasOlder, setHasOlder] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)

  // Input
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)

  // Tab (My Chat / My Deals / Recently View)
  const [sidebarTab, setSidebarTab] = useState<"chat" | "deals" | "recent">(
    "chat"
  )

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Current room's inbox entry (for header info)
  const activeRoom = inbox.find((r) => r.room_id === activeRoomId) ?? null

  // ── Load inbox ──────────────────────────────────────────────────────────────
  const loadInbox = useCallback(async () => {
    try {
      setInboxLoading(true)
      const data = await getBuyerInbox()
      setInbox(data)
    } catch {
      // silently fail — inbox may be empty on first load
    } finally {
      setInboxLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  // ── Load messages when active room changes ──────────────────────────────────
  const loadMessages = useCallback(async (roomId: string) => {
    setMessagesLoading(true)
    setHasOlder(true)
    try {
      const data = await getMessages(roomId, 30)
      setMessages(data.reverse()) // oldest first for display
      await markRoomRead(roomId)
    } catch (err: any) {
      toast.error(err?.message || "Failed to load messages")
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeRoomId) {
      loadMessages(activeRoomId)
    }
  }, [activeRoomId, loadMessages])

  // ── Scroll to bottom on new messages ───────────────────────────────────────
  useEffect(() => {
    if (!loadingOlder) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, loadingOlder])

  // ── Socket.io real-time subscription ───────────────────────────────────────
useEffect(() => {
  if (!activeRoomId) return

  const interval = setInterval(async () => {
    try {
      const latest = await getMessages(activeRoomId, 30)
      setMessages(latest.reverse())
      loadInbox()
    } catch {
      // silently fail
    }
  }, 3000)

  return () => clearInterval(interval)
}, [activeRoomId, loadInbox])


  // ── Load older messages (scroll up) ────────────────────────────────────────
  const handleLoadOlder = async () => {
    if (!activeRoomId || !hasOlder || loadingOlder || messages.length === 0)
      return
    const oldest = messages[0].sent_at
    setLoadingOlder(true)
    try {
      const older = await getMessages(activeRoomId, 30, oldest)
      if (older.length === 0) {
        setHasOlder(false)
      } else {
        setMessages((prev) => [...older.reverse(), ...prev])
      }
    } finally {
      setLoadingOlder(false)
    }
  }

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !activeRoomId || sending) return
    setInputText("")
    setSending(true)
    try {
      await sendMessage(activeRoomId, text)
      // Socket event will append the message — no need to push manually
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message")
      setInputText(text) // restore on failure
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Select a room from inbox ────────────────────────────────────────────────
  const handleSelectRoom = (room: InboxRoom) => {
    setActiveRoomId(room.room_id)
    setActiveAdId(room.ad)
    setSearchParams({
      room: room.room_id,
      ad: room.ad,
      seller: room.other_user,
    })
  }

  // ── Current session user (from Frappe boot) ─────────────────────────────────
  const currentUser: string =
    (window as any).frappe?.session?.user ?? ""

  const grouped = groupByDate(messages)

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gray-900">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-base">Message</span>
        </div>

        {/* Sidebar tabs */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          {[
            { label: "My Chat", value: "chat" as const },
            { label: "My Deals", value: "deals" as const },
            { label: "Recently View", value: "recent" as const },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSidebarTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sidebarTab === tab.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Inbox list */}
        <div className="flex-1 overflow-y-auto">
          {inboxLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : inbox.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 px-6 text-center">
              <span className="text-2xl">💬</span>
              <p className="text-xs text-gray-400">
                No conversations yet. Message a seller from My Offers.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {inbox.map((room) => (
                <InboxItem
                  key={room.room_id}
                  room={room}
                  isActive={room.room_id === activeRoomId}
                  onClick={() => handleSelectRoom(room)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      {activeRoomId ? (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-900 border-b border-gray-800">
            <Avatar
              src={activeRoom?.other_user_avatar}
              name={
                activeRoom?.other_user_full_name ||
                activeRoom?.other_user ||
                sellerFromUrl ||
                "Seller"
              }
              size={38}
            />
            <div>
              <p className="text-white font-semibold text-sm">
                {activeRoom?.other_user_full_name ||
                  activeRoom?.other_user ||
                  sellerFromUrl ||
                  "Seller"}
              </p>
              {activeRoom && (
                <p className="text-gray-400 text-xs">
                  {activeRoom.make} {activeRoom.model}
                </p>
              )}
            </div>
          </div>

          {/* Ad context banner */}
          {activeRoom && (
            <AdBanner
              make={activeRoom.make}
              model={activeRoom.model}
              year={activeRoom.year}
              image={null}
              adId={activeRoom.ad}
            />
          )}

          {/* Messages area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-gray-50"
          >
            {/* Load older button */}
            {hasOlder && messages.length >= 30 && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={handleLoadOlder}
                  disabled={loadingOlder}
                  className="text-xs text-gray-400 hover:text-gray-600 px-4 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                >
                  {loadingOlder ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}

            {messagesLoading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-7 h-7 border-3 border-[#FC7844] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-400">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <span className="text-3xl">👋</span>
                <p className="text-sm text-gray-400">
                  Start the conversation!
                </p>
              </div>
            ) : (
              grouped.map((group) => (
                <div key={group.date}>
                  {/* Date separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[11px] text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                      {group.date}
                    </span>
                  </div>

                  {group.messages.map((msg) => {
                    const isMine = msg.sender === currentUser
                    return (
                      <div
                        key={msg.name}
                        className={`flex items-end gap-2 mb-2 ${
                          isMine ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        {!isMine ? (
                          <Avatar
                            src={activeRoom?.other_user_avatar}
                            name={
                              activeRoom?.other_user_full_name ||
                              activeRoom?.other_user ||
                              "Seller"
                            }
                            size={32}
                          />
                        ) : (
                          <div className="w-8 h-8 flex-shrink-0" />
                        )}

                        {/* Bubble */}
                        <div
                          className={`max-w-[65%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? "bg-gray-900 text-white rounded-br-sm"
                              : "bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    )
                  })}

                  {/* Time under the last message of each group */}
                  <p className="text-center text-[11px] text-gray-400 mt-1 mb-3">
                    {group.messages.length > 0
                      ? formatTime(
                          group.messages[group.messages.length - 1].sent_at
                        )
                      : ""}
                  </p>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-gray-200">
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Send message"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            />
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              className="text-gray-400 hover:text-[#FC7844] transition-colors disabled:opacity-30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Empty state — no room selected
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
          <span className="text-5xl">💬</span>
          <p className="text-gray-500 font-medium">Select a conversation</p>
          <p className="text-sm text-gray-400">
            Or message a seller from{" "}
            <button
              className="text-[#FC7844] underline"
              onClick={() => navigate("/buyer/my-offers")}
            >
              My Offers
            </button>
          </p>
        </div>
      )}
    </div>
  )
}