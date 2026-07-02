import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  if (!socketRef.current) {
    socketRef.current = io({ path: '/socket.io', autoConnect: true })
  }

  useEffect(() => () => socketRef.current?.disconnect(), [])

  return <SocketContext.Provider value={socketRef.current}>{children}</SocketContext.Provider>
}

export const useSocket = () => useContext(SocketContext)
