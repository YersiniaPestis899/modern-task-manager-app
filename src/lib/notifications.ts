import { Task } from '@/types'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  data?: any
}

export class TaskNotificationManager {
  private static instance: TaskNotificationManager
  private permission: NotificationPermission = 'default'
  private scheduledNotifications: Map<string, number> = new Map()
  private isClient: boolean

  private constructor() {
    this.isClient = typeof window !== 'undefined'
    if (this.isClient) {
      this.checkPermission()
    }
  }

  static getInstance(): TaskNotificationManager {
    if (!TaskNotificationManager.instance) {
      TaskNotificationManager.instance = new TaskNotificationManager()
    }
    return TaskNotificationManager.instance
  }

  private async checkPermission(): Promise<void> {
    if (!this.isClient || !('Notification' in window)) {
      return
    }
    this.permission = Notification.permission
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isClient || !('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    return permission === 'granted'
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isClient) {
      console.warn('サーバーサイドでは通知を表示できません')
      return
    }

    if (this.permission !== 'granted') {
      const granted = await this.requestPermission()
      if (!granted) return
    }

    try {
      // サービスワーカーが利用可能な場合はそれを使用
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.svg',
          badge: options.badge || '/favicon.svg',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          data: options.data
        })
      } else {
        // フォールバック: 通常の通知
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.svg',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          data: options.data
        })

        // 自動で閉じる（オプション）
        if (!options.requireInteraction) {
          setTimeout(() => notification.close(), 5000)
        }
      }
    } catch (error) {
      console.error('通知の表示に失敗しました:', error)
    }
  }

  scheduleTaskReminder(task: Task): void {
    if (!this.isClient || !task.due_date || !task.reminder_minutes) return

    const dueDateTime = new Date(task.due_date)
    if (task.due_time) {
      const [hours, minutes] = task.due_time.split(':')
      dueDateTime.setHours(parseInt(hours), parseInt(minutes))
    }

    const reminderTime = new Date(dueDateTime.getTime() - (task.reminder_minutes * 60 * 1000))
    const now = new Date()

    if (reminderTime <= now) return // 過去の時間の場合はスケジュールしない

    const timeoutId = window.setTimeout(() => {
      this.showTaskReminder(task)
      this.scheduledNotifications.delete(task.id)
    }, reminderTime.getTime() - now.getTime())

    // 既存のリマインダーがある場合はキャンセル
    this.cancelTaskReminder(task.id)
    this.scheduledNotifications.set(task.id, timeoutId)
  }

  cancelTaskReminder(taskId: string): void {
    if (!this.isClient) return
    
    const timeoutId = this.scheduledNotifications.get(taskId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduledNotifications.delete(taskId)
    }
  }

  private async showTaskReminder(task: Task): Promise<void> {
    const dueTime = task.due_time ? ` (${task.due_time})` : ''
    const dueDateText = task.due_date ? new Date(task.due_date).toLocaleDateString('ja-JP') : '今日'
    
    await this.showNotification({
      title: `📅 リマインダー: ${task.title}`,
      body: `期限: ${dueDateText}${dueTime}`,
      tag: `task-reminder-${task.id}`,
      requireInteraction: true,
      data: {
        taskId: task.id,
        type: 'reminder'
      }
    })
  }

  async showTaskDueNotification(task: Task): Promise<void> {
    await this.showNotification({
      title: `⏰ 期限到来: ${task.title}`,
      body: `タスクの期限が来ました`,
      tag: `task-due-${task.id}`,
      requireInteraction: true,
      data: {
        taskId: task.id,
        type: 'due'
      }
    })
  }

  async showTaskCompletedNotification(task: Task): Promise<void> {
    await this.showNotification({
      title: `✅ タスク完了`,
      body: `「${task.title}」が完了しました！`,
      tag: `task-completed-${task.id}`,
      requireInteraction: false,
      data: {
        taskId: task.id,
        type: 'completed'
      }
    })
  }

  // すべてのスケジュールされた通知をキャンセル
  cancelAllReminders(): void {
    if (!this.isClient) return
    
    Array.from(this.scheduledNotifications.entries()).forEach(([taskId, timeoutId]) => {
      clearTimeout(timeoutId)
    })
    this.scheduledNotifications.clear()
  }

  // ブラウザがサポートする通知機能をチェック
  getNotificationCapabilities() {
    if (!this.isClient) {
      return {
        supported: false,
        permission: 'default' as NotificationPermission,
        serviceWorkerSupported: false,
        actions: false,
        badge: false,
        persistent: false
      }
    }

    return {
      supported: 'Notification' in window,
      permission: this.permission,
      serviceWorkerSupported: 'serviceWorker' in navigator,
      actions: 'actions' in Notification.prototype,
      badge: 'badge' in Notification.prototype,
      persistent: 'serviceWorker' in navigator && 'showNotification' in ServiceWorkerRegistration.prototype
    }
  }
}

// クライアントサイド用のファクトリー関数
export const getNotificationManager = (): TaskNotificationManager | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return TaskNotificationManager.getInstance()
}

// タイプ定義
interface NotificationAction {
  action: string
  title: string
  icon?: string
}