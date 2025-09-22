'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Smile, Paperclip } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  communityId: string
  channelId: string
  replyToId?: string
  attachments: string[]
  reactions: Array<{
    emoji: string
    userIds: string[]
  }>
  createdAt: number
  editedAt?: number
}

interface TypingUser {
  userId: string
  username: string
  displayName: string
}

interface RealtimeChatProps {
  communityId: string
  channelId: string
  channelName: string
}

export function RealtimeChat({ communityId, channelId, channelName }: RealtimeChatProps) {
  const { socket, isConnected } = useSocket()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket || !isConnected) return

    // Join the community
    socket.emit('join_community', communityId)

    // Listen for new messages
    const handleNewMessage = (message: Message) => {
      if (message.channelId === channelId) {
        setMessages(prev => [...prev, message])
      }
    }

    // Listen for message edits
    const handleMessageEdited = (data: { messageId: string; content: string; editedAt: number }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, content: data.content, editedAt: data.editedAt }
            : msg
        )
      )
    }

    // Listen for message deletions
    const handleMessageDeleted = (data: { messageId: string; deletedAt: number }) => {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
    }

    // Listen for typing indicators
    const handleTypingStart = (data: { userId: string; username: string; displayName: string; channelId: string }) => {
      if (data.channelId === channelId && data.userId !== user?.id) {
        setTypingUsers(prev => {
          const exists = prev.find(u => u.userId === data.userId)
          if (!exists) {
            return [...prev, { userId: data.userId, username: data.username, displayName: data.displayName }]
          }
          return prev
        })
      }
    }

    const handleTypingStop = (data: { userId: string; channelId: string }) => {
      if (data.channelId === channelId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
      }
    }

    // Listen for reactions
    const handleReactionAdded = (data: { 
      messageId: string; 
      emoji: string; 
      userId: string; 
      username: string; 
      displayName: string 
    }) => {
      setMessages(prev =>
        prev.map(msg => {
          if (msg.id === data.messageId) {
            const reactions = [...msg.reactions]
            const existingReaction = reactions.find(r => r.emoji === data.emoji)
            
            if (existingReaction) {
              if (!existingReaction.userIds.includes(data.userId)) {
                existingReaction.userIds.push(data.userId)
              }
            } else {
              reactions.push({
                emoji: data.emoji,
                userIds: [data.userId]
              })
            }
            
            return { ...msg, reactions }
          }
          return msg
        })
      )
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message_edited', handleMessageEdited)
    socket.on('message_deleted', handleMessageDeleted)
    socket.on('user_typing_start', handleTypingStart)
    socket.on('user_typing_stop', handleTypingStop)
    socket.on('reaction_added', handleReactionAdded)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message_edited', handleMessageEdited)
      socket.off('message_deleted', handleMessageDeleted)
      socket.off('user_typing_start', handleTypingStart)
      socket.off('user_typing_stop', handleTypingStop)
      socket.off('reaction_added', handleReactionAdded)
      socket.emit('leave_community', communityId)
    }
  }, [socket, isConnected, communityId, channelId, user?.id])

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return

    socket.emit('send_message', {
      communityId,
      channelId,
      content: newMessage.trim()
    })

    setNewMessage('')
    
    // Stop typing
    if (isTyping) {
      socket.emit('typing_stop', { communityId, channelId })
      setIsTyping(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!socket) return

    // Handle typing indicators
    if (!isTyping) {
      setIsTyping(true)
      socket.emit('typing_start', { communityId, channelId })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socket.emit('typing_stop', { communityId, channelId })
    }, 1000)
  }

  const addReaction = (messageId: string, emoji: string) => {
    if (!socket) return
    socket.emit('add_reaction', { messageId, communityId, emoji })
  }

  const formatTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Unknown time'
    }
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Connecting to chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-semibold text-foreground"># {channelName}</h3>
        <p className="text-sm text-muted-foreground">
          {isConnected ? 'Connected' : 'Disconnected'}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.avatar} />
                <AvatarFallback>
                  {message.sender.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {message.sender.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(message.createdAt)}
                  </span>
                  {message.editedAt && (
                    <Badge variant="secondary" className="text-xs">
                      edited
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-foreground">{message.content}</p>
                
                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction) => (
                      <Button
                        key={`${message.id}-${reaction.emoji}`}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => addReaction(message.id, reaction.emoji)}
                      >
                        {reaction.emoji} {reaction.userIds.length}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span>
                {typingUsers.map(u => u.displayName).join(', ')} 
                {typingUsers.length === 1 ? ' is' : ' are'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder={`Message #${channelName}`}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            className="flex-1"
          />
          
          <Button variant="outline" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}