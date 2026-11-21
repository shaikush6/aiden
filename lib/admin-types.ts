// What the admin panel gets back from /api/admin (shared by the server and the browser).
import type { AppConfig } from './app-config.ts'

export interface AdminAccount {
  username: string
  displayName: string
  admin: boolean
  createdAt: number
  /** When this account's progress was last saved (0 if never). */
  lastSaved: number
  quest: { done: number; of: number }
  land: { done: number; of: number }
  spent: number
  quota: number
}

export interface AdminData { accounts: AdminAccount[]; config: AppConfig; me: string }
