import type { ChatMessage } from "./types";

export interface Conversation {
  id: string;
  title: string;
  ts: string;
  messages: ChatMessage[];
}

/** Group messages by conversationId. Messages without conversationId use time-gap fallback. */
export function groupConversations(
  messages: ChatMessage[],
  customTitles: Record<string, string>
): Conversation[] {
  const map = new Map<string, ChatMessage[]>();

  let fallbackId = "__fallback__";
  for (const m of messages) {
    const cid = m.conversationId || fallbackId;
    if (!m.conversationId) {
      const group = map.get(fallbackId);
      if (group && group.length > 0) {
        const last = group[group.length - 1];
        if (new Date(m.timestamp).getTime() - new Date(last.timestamp).getTime() > 30 * 60 * 1000) {
          fallbackId = `__fallback_${m.id}__`;
        }
      }
      const key = m.conversationId || fallbackId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    } else {
      if (!map.has(cid)) map.set(cid, []);
      map.get(cid)!.push(m);
    }
  }

  const convos: Conversation[] = [];
  for (const [id, msgs] of map) {
    if (msgs.length === 0) continue;
    const firstUser = msgs.find((m) => m.role === "user");
    const defaultTitle = firstUser
      ? firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? "..." : "")
      : "New conversation";
    convos.push({
      id,
      title: customTitles[id] || defaultTitle,
      ts: msgs[0].timestamp,
      messages: msgs,
    });
  }

  return convos.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

export function formatRelativeTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (diff < 7 * 86400000) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
