import { io, Socket } from "socket.io-client"
import { getStoredSid } from "../api/auth"

const FRAPPE_URL = import.meta.env.VITE_API_BASE_URL

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const sid = getStoredSid()

    socket = io(FRAPPE_URL, {
      withCredentials: true,
      path: "/socket.io",
      transports: ["polling", "websocket"],
      query: {
        sid: sid,          
      },
    })

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    socket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message)
    })
  }

  return socket
}