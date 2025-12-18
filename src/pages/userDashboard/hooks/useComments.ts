// pages/userDashboard/hooks/useComments.ts
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Comment {
  id: string;
  matchId: string;
  author: string;
  text: string;
  timestamp: number;
}

const COMMENTS_KEY = "rs_dashboard_comments_v2";

export function useComments() {
  const [commentsMap, setCommentsMap] = useLocalStorage<Record<string, Comment[]>>(COMMENTS_KEY, {});

  const getCommentsForMatch = useCallback((matchId: string) => commentsMap[matchId] || [], [commentsMap]);

  const sendComment = useCallback((matchId: string, author: string, text: string) => {
    const t = text.trim();
    if (!t) return;
    const newComment: Comment = { id: `${Date.now()}_${Math.random().toString(36).slice(2,8)}`, matchId, author, text: t, timestamp: Date.now() };
    setCommentsMap(prev => ({ ...prev, [matchId]: [...(prev[matchId] || []), newComment] }));
  }, [setCommentsMap]);

  const deleteComment = useCallback((matchId: string, id: string) => {
    setCommentsMap(prev => ({ ...prev, [matchId]: (prev[matchId] || []).filter(c => c.id !== id) }));
  }, [setCommentsMap]);

  return { commentsMap, getCommentsForMatch, sendComment, deleteComment };
}
