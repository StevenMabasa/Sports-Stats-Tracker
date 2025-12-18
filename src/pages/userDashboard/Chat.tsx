// pages/userDashboard/Chat.tsx
import React, { useRef, useEffect, useState } from "react";
import { fetchChatForMatch, sendChatMessage, deleteChatMessage } from "../../services/chatService";
import supabase from "../../../supabaseClient";

interface Props { matchId: string; username: string; }
const Chat: React.FC<Props> = ({ matchId, username }) => {
  const [messages, setMessages] = useState<{ id: string; author: string; text: string; timestamp: number; user_id: string | null }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await fetchChatForMatch(matchId);
      if (!mounted) return;
      setMessages(rows.map(r => ({ 
        id: r.id, 
        author: r.author || "Fan", 
        text: r.message, 
        timestamp: new Date(r.inserted_at).getTime(),
        user_id: r.user_id 
      })));
    })();
    return () => { mounted = false; };
  }, [matchId]);

  // realtime subscription so chats appear on other users' screens
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:chats:${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `match_id=eq.${matchId}` }, (payload: any) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new;
          setMessages(prev => [...prev, { 
            id: r.id, 
            author: r.author || 'Fan', 
            text: r.message, 
            timestamp: new Date(r.inserted_at).getTime(),
            user_id: r.user_id 
          }]);
        } else if (payload.eventType === 'DELETE') {
          const r = payload.old;
          setMessages(prev => prev.filter(m => m.id !== r.id));
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new;
          setMessages(prev => prev.map(m => m.id === r.id ? { 
            id: r.id, 
            author: r.author || 'Fan', 
            text: r.message, 
            timestamp: new Date(r.inserted_at).getTime(),
            user_id: r.user_id 
          } : m));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [matchId]);
  const ref = useRef<HTMLDivElement|null>(null);
  const inputRef = useRef<HTMLInputElement|null>(null);

  useEffect(()=>{ if(ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [messages.length]);

  return (
    <aside className="rs-chat rs-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontWeight:900,color:"var(--primary)"}}>Match Chat</div>

      </div>

      <div ref={ref} className="rs-messages">
        {messages.length === 0 ? <div style={{color:"var(--muted)"}}>No messages yet — share your thoughts!</div>
        : messages.map(c=>(
          <div key={c.id} className="rs-message">
            <div className="rs-meta"><div style={{fontWeight:800}}>{c.author}</div><div>{new Date(c.timestamp).toLocaleString()}</div></div>
            <div style={{marginTop:6}}>{c.text}</div>
            {currentUserId && c.user_id === currentUserId && (
              <div style={{marginTop:8,textAlign:"right"}}>
                <button className="rs-btn ghost" onClick={async ()=>{ await deleteChatMessage(c.id); setMessages(prev=>prev.filter(m=>m.id!==c.id)); }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rs-chat-input">
        <input ref={inputRef} placeholder="Write a message..." onKeyDown={async e=>{ if(e.key==="Enter"){ const text=inputRef.current?.value||""; if(text.trim()){ await sendChatMessage(matchId, username || "Fan", text, currentUserId); if(inputRef.current) inputRef.current.value=""; const rows = await fetchChatForMatch(matchId); setMessages(rows.map(r=>({ id:r.id, author:r.author||"Fan", text:r.message, timestamp:new Date(r.inserted_at).getTime(), user_id: r.user_id }))); } } }} />
        <button className="rs-btn" onClick={async () => { const text=inputRef.current?.value||""; if(text.trim()){ await sendChatMessage(matchId, username || "Fan", text, currentUserId); if(inputRef.current) inputRef.current.value=""; const rows = await fetchChatForMatch(matchId); setMessages(rows.map(r=>({ id:r.id, author:r.author||"Fan", text:r.message, timestamp:new Date(r.inserted_at).getTime(), user_id: r.user_id }))); } }}>Send</button>
      </div>
    </aside>
  );
};

export default Chat;
