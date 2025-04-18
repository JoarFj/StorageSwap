import { useState, useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Message, User } from "@shared/schema";
import { Helmet } from "react-helmet";
import { formatDistanceToNow } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SendHorizontal, User as UserIcon } from "lucide-react";

// Group messages by other user (conversation partner)
interface ConversationGroup {
  otherUserId: number;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage: Message;
  unreadCount: number;
}

export default function Messages() {
  const [, params] = useRoute("/messages/:userId");
  const selectedUserId = params?.userId ? parseInt(params.userId) : null;
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUserId = 1; // In a real app, this would come from authentication

  // Fetch all user's messages
  const { data: allMessages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentUserId}`],
  });

  // Fetch conversation with selected user if any
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentUserId}/${selectedUserId}`],
    enabled: !!selectedUserId,
  });

  // Fetch user info for each unique user in the conversations
  const uniqueUserIds = allMessages 
    ? [...new Set(allMessages.map(msg => 
        msg.senderId === currentUserId ? msg.receiverId : msg.senderId
      ))]
    : [];

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users/multiple', uniqueUserIds],
    enabled: uniqueUserIds.length > 0,
    // This would typically be a batch API call, but we'll simulate fetching each user
    queryFn: async () => {
      const userPromises = uniqueUserIds.map(id => 
        fetch(`/api/users/${id}`).then(res => res.json())
      );
      return Promise.all(userPromises);
    },
  });

  // Fetch selected user data
  const { data: selectedUser, isLoading: isLoadingSelectedUser } = useQuery<User>({
    queryKey: [`/api/users/${selectedUserId}`],
    enabled: !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { senderId: number, receiverId: number, message: string }) => {
      return apiRequest('POST', '/api/messages', message);
    },
    onSuccess: () => {
      // Invalidate queries to refresh the messages
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}`] });
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}/${selectedUserId}`] });
      }
      setNewMessage("");
    },
  });

  // Group messages by conversation partner
  const conversations: ConversationGroup[] = [];
  
  if (allMessages && allMessages.length > 0) {
    const conversationMap: Map<number, { messages: Message[], unreadCount: number }> = new Map();
    
    // Group messages by the other user in the conversation
    allMessages.forEach(message => {
      const otherUserId = message.senderId === currentUserId 
        ? message.receiverId 
        : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, { messages: [], unreadCount: 0 });
      }
      
      conversationMap.get(otherUserId)!.messages.push(message);
      
      // Count unread messages
      if (message.senderId !== currentUserId && !message.isRead) {
        conversationMap.get(otherUserId)!.unreadCount += 1;
      }
    });
    
    // Create conversation groups with the last message and unread count
    conversationMap.forEach((value, otherUserId) => {
      // Sort messages by date (newest first)
      const sortedMessages = value.messages.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Find user info for this conversation
      const otherUser = users?.find(user => user.id === otherUserId);
      
      conversations.push({
        otherUserId,
        otherUserName: otherUser?.fullName || `User ${otherUserId}`,
        otherUserAvatar: otherUser?.avatar,
        lastMessage: sortedMessages[0],
        unreadCount: value.unreadCount,
      });
    });
    
    // Sort conversations by last message date (newest first)
    conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );
  }

  // Send a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId) return;
    
    sendMessageMutation.mutate({
      senderId: currentUserId,
      receiverId: selectedUserId,
      message: newMessage.trim(),
    });
  };

  // Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      if (conversation && selectedUserId) {
        const unreadMessages = conversation.filter(
          msg => msg.senderId === selectedUserId && !msg.isRead
        );
        
        if (unreadMessages.length > 0) {
          // In a real app, this would be a batch operation
          for (const msg of unreadMessages) {
            await apiRequest('PATCH', `/api/messages/${msg.id}/read`, {});
          }
          
          // Invalidate queries to refresh the messages
          queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}`] });
          queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentUserId}/${selectedUserId}`] });
        }
      }
    };
    
    markMessagesAsRead();
  }, [conversation, selectedUserId, currentUserId, queryClient]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  return (
    <>
      <Helmet>
        <title>Messages - StoreShare</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Conversations sidebar */}
          <div className="md:col-span-1 border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            
            <div className="overflow-y-auto h-[calc(70vh-3.5rem)]">
              {isLoadingMessages ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <div>
                  {conversations.map(convo => (
                    <Link key={convo.otherUserId} href={`/messages/${convo.otherUserId}`}>
                      <a className={`block px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                        selectedUserId === convo.otherUserId ? 'bg-primary-50' : ''
                      }`}>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={convo.otherUserAvatar} />
                            <AvatarFallback>{convo.otherUserName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h3 className="font-medium truncate">{convo.otherUserName}</h3>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(convo.lastMessage.createdAt))}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {convo.lastMessage.senderId === currentUserId ? 'You: ' : ''}
                              {convo.lastMessage.message}
                            </p>
                          </div>
                          {convo.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                  <p className="text-gray-600">
                    Your conversations will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Conversation */}
          <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
            {selectedUserId ? (
              <>
                {/* Conversation header */}
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center">
                  {isLoadingSelectedUser ? (
                    <div className="flex items-center animate-pulse">
                      <div className="rounded-full bg-gray-200 h-8 w-8 mr-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                  ) : selectedUser ? (
                    <>
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback>{selectedUser.fullName.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold">{selectedUser.fullName}</h2>
                      </div>
                    </>
                  ) : (
                    <h2 className="font-semibold">User #{selectedUserId}</h2>
                  )}
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {isLoadingConversation ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className={`animate-pulse max-w-[70%] rounded-lg p-3 ${
                            i % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'
                          }`}>
                            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : conversation && conversation.length > 0 ? (
                    <div className="space-y-3">
                      {conversation
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message) => {
                          const isCurrentUser = message.senderId === currentUserId;
                          return (
                            <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-primary-500 text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <p>{message.message}</p>
                                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                      <p className="text-gray-600 max-w-md">
                        Send a message to start a conversation with this user
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t">
                  <div className="flex">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      className="ml-2" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      <SendHorizontal className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <MessageIcon className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Messages</h2>
                <p className="text-gray-600 max-w-md mb-6">
                  Select a conversation from the sidebar or start a new one by contacting a host
                </p>
                <Link href="/search">
                  <Button>
                    Find Storage Spaces
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// MessageIcon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
