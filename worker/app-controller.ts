import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
/**
 * worker/app-controller.ts
 * -----------------------
 * ✅ Durable Object extension point for SESSION MANAGEMENT (control plane).
 *
 * Add/extend session lifecycle features here (list/add/remove/update/analytics).
 * Do NOT move this logic into `worker/config.ts` or duplicate this Durable Object elsewhere.
 */
// 🤖 AI Extension Point: Add session management features
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    console.log('[AppController] Constructed');
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      console.log('[AppController] ensureLoaded: loading sessions from storage...');
      const stored = (await this.ctx.storage.get<Record<string, SessionInfo>>('sessions')) || {};
      this.sessions = new Map(Object.entries(stored));
      this.loaded = true;
      console.log('[AppController] ensureLoaded: loaded', { count: this.sessions.size });
    }
  }
  private async persist(): Promise<void> {
    console.log('[AppController] persist: saving sessions...', { count: this.sessions.size });
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    console.log('[AppController] persist: saved', { count: this.sessions.size });
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    console.log('[AppController] addSession: start', { sessionId, hasTitle: !!title });
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
    console.log('[AppController] addSession: complete', { sessionId, count: this.sessions.size });
  }
  async removeSession(sessionId: string): Promise<boolean> {
    console.log('[AppController] removeSession: start', { sessionId });
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      await this.persist();
      console.log('[AppController] removeSession: deleted', { sessionId, count: this.sessions.size });
    } else {
      console.log('[AppController] removeSession: not_found', { sessionId, count: this.sessions.size });
    }
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    console.log('[AppController] updateSessionActivity: start', { sessionId });
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
      console.log('[AppController] updateSessionActivity: updated', { sessionId });
      return;
    }
    console.log('[AppController] updateSessionActivity: not_found', { sessionId });
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    console.log('[AppController] updateSessionTitle: start', { sessionId, titleLength: title?.length ?? 0 });
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      console.log('[AppController] updateSessionTitle: updated', { sessionId });
      return true;
    }
    console.log('[AppController] updateSessionTitle: not_found', { sessionId });
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    console.log('[AppController] listSessions: start');
    await this.ensureLoaded();
    const list = Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
    console.log('[AppController] listSessions: complete', { count: list.length });
    return list;
  }
  async getSessionCount(): Promise<number> {
    console.log('[AppController] getSessionCount: start');
    await this.ensureLoaded();
    const count = this.sessions.size;
    console.log('[AppController] getSessionCount: complete', { count });
    return count;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    console.log('[AppController] getSession: start', { sessionId });
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId) || null;
    console.log('[AppController] getSession: complete', { sessionId, found: !!session });
    return session;
  }
  async clearAllSessions(): Promise<number> {
    console.log('[AppController] clearAllSessions: start');
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    console.log('[AppController] clearAllSessions: complete', { deletedCount: count });
    return count;
  }
}