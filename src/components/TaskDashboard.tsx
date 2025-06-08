'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Task, TaskFilter, TaskFormData } from '@/types'
import { supabase } from '@/lib/supabase'
import { TaskList } from './TaskList'
import { TaskForm } from './TaskForm'
import { TaskCalendar } from './TaskCalendar'
import { TaskStats } from './TaskStats'
import { Sidebar } from './Sidebar'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { LoadingSpinner } from './LoadingSpinner'
import { Plus, Menu, X, Calendar, List, BarChart3, Settings, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { getNotificationManager, TaskNotificationManager } from '@/lib/notifications'

interface TaskDashboardProps {
  user: User
}

export function TaskDashboard({ user }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'list' | 'calendar' | 'stats'>('list')
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [filter, setFilter] = useState<TaskFilter>({})
  const [notificationManager, setNotificationManager] = useState<TaskNotificationManager | null>(null)

  // 通知マネージャーの初期化（クライアントサイドのみ）
  useEffect(() => {
    const manager = getNotificationManager()
    setNotificationManager(manager)
    
    // 通知許可を要求
    if (manager) {
      manager.requestPermission()
    }
  }, [])

  // タスクの読み込み
  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTasks(data || [])
      
      // リマインダーをスケジュール（クライアントサイドのみ）
      if (notificationManager && data) {
        data.forEach(task => {
          if (task.reminder_minutes && task.due_date && task.status !== 'completed') {
            notificationManager.scheduleTaskReminder(task)
          }
        })
      }
    } catch (error: any) {
      toast.error('タスクの読み込みに失敗しました')
      console.error('Load tasks error:', error)
    } finally {
      setLoading(false)
    }
  }

  // タスクの作成
  const createTask = async (taskData: TaskFormData | Partial<Task>) => {
    try {
      // 必須フィールドの確認とデフォルト値の設定
      const taskToInsert = {
        title: taskData.title || 'Untitled Task',
        description: taskData.description || null,
        due_date: taskData.due_date
          ? typeof taskData.due_date === 'string'
            ? taskData.due_date
            : taskData.due_date.toISOString()
          : null,
        due_time: taskData.due_time || null,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        category: taskData.category || null,
        reminder_minutes: taskData.reminder_minutes || null,
        is_recurring: taskData.is_recurring || false,
        recurring_pattern: taskData.recurring_pattern || null,
        tags: taskData.tags || [],
        user_id: user.id,
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskToInsert])
        .select()
        .single()

      if (error) throw error

      setTasks(prev => [data, ...prev])
      setIsCreateTaskOpen(false)
      toast.success('タスクを作成しました')

      // リマインダーをスケジュール（クライアントサイドのみ）
      if (notificationManager && data.reminder_minutes && data.due_date) {
        notificationManager.scheduleTaskReminder(data)
      }
    } catch (error: any) {
      toast.error('タスクの作成に失敗しました')
      console.error('Create task error:', error)
    }
  }

  // タスクの更新
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === taskId ? data : task
      ))
      
      toast.success('タスクを更新しました')

      // 通知マネージャーが利用可能な場合のみ処理
      if (notificationManager) {
        // リマインダーを再スケジュール
        notificationManager.cancelTaskReminder(taskId)
        if (data.reminder_minutes && data.due_date && data.status !== 'completed') {
          notificationManager.scheduleTaskReminder(data)
        }

        // 完了通知
        if (updates.status === 'completed' && data.status === 'completed') {
          notificationManager.showTaskCompletedNotification(data)
        }
      }
    } catch (error: any) {
      toast.error('タスクの更新に失敗しました')
      console.error('Update task error:', error)
    }
  }

  // タスクの削除
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      // 通知マネージャーが利用可能な場合のみ処理
      if (notificationManager) {
        notificationManager.cancelTaskReminder(taskId)
      }
      
      toast.success('タスクを削除しました')
    } catch (error: any) {
      toast.error('タスクの削除に失敗しました')
      console.error('Delete task error:', error)
    }
  }

  // ログアウト
  const handleLogout = async () => {
    try {
      // すべてのリマインダーをキャンセル
      if (notificationManager) {
        notificationManager.cancelAllReminders()
      }
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('ログアウトしました')
    } catch (error: any) {
      toast.error('ログアウトに失敗しました')
    }
  }

  // リアルタイム購読
  useEffect(() => {
    loadTasks()

    const channel = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [payload.new as Task, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(task => 
              task.id === payload.new.id ? payload.new as Task : task
            ))
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user.id, notificationManager]) // notificationManagerの依存関係を追加

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  Task Manager
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* ビュー切り替え */}
              <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">リスト</span>
                </Button>
                <Button
                  variant={currentView === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('calendar')}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">カレンダー</span>
                </Button>
                <Button
                  variant={currentView === 'stats' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('stats')}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">統計</span>
                </Button>
              </div>

              {/* タスク作成ボタン */}
              <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">新規タスク</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>新しいタスクを作成</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSubmit={createTask} />
                </DialogContent>
              </Dialog>

              {/* ユーザーメニュー */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 🔔 通知機能の状態表示（開発時のみ） */}
        {process.env.NODE_ENV === 'development' && notificationManager && (
          <div className="px-4 py-1 bg-green-50 border-b border-green-200">
            <p className="text-xs text-green-600">
              🔔 通知機能が有効です (許可状況: {notificationManager.getNotificationCapabilities().permission})
            </p>
          </div>
        )}
      </header>

      <div className="flex">
        {/* サイドバー */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          tasks={tasks}
          filter={filter}
          onFilterChange={setFilter}
          user={user}
        />

        {/* メインコンテンツ */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {currentView === 'list' && (
              <TaskList
                tasks={tasks}
                filter={filter}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {currentView === 'calendar' && (
              <TaskCalendar
                tasks={tasks}
                onUpdateTask={updateTask}
                onCreateTask={createTask}
              />
            )}
            {currentView === 'stats' && (
              <TaskStats tasks={tasks} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
