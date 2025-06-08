'use client'

import { useState } from 'react'
import { Task, TaskFilter } from '@/types'
import { TaskItem } from './TaskItem'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Search, Filter, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react'
import { formatDate, isOverdue } from '@/lib/utils'

interface TaskListProps {
  tasks: Task[]
  filter: TaskFilter
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  onDeleteTask: (taskId: string) => Promise<void>
}

export function TaskList({ tasks, filter, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  // タスクをフィルタリング
  const filteredTasks = tasks.filter(task => {
    // 検索フィルター
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // ステータスフィルター
    if (filter.status && !filter.status.includes(task.status)) {
      return false
    }

    // 優先度フィルター
    if (filter.priority && !filter.priority.includes(task.priority)) {
      return false
    }

    // カテゴリフィルター
    if (filter.category && filter.category.length > 0 && 
        (!task.category || !filter.category.includes(task.category))) {
      return false
    }

    // 完了済みタスクの表示設定
    if (!showCompleted && task.status === 'completed') {
      return false
    }

    return true
  })

  // タスクをグループ化
  const groupedTasks = {
    overdue: filteredTasks.filter(task => 
      task.status !== 'completed' && task.due_date && isOverdue(task.due_date, task.due_time)
    ),
    today: filteredTasks.filter(task => {
      if (task.status === 'completed' || !task.due_date) return false
      const today = new Date().toISOString().split('T')[0]
      return task.due_date === today && !isOverdue(task.due_date, task.due_time)
    }),
    upcoming: filteredTasks.filter(task => {
      if (task.status === 'completed' || !task.due_date) return false
      const today = new Date().toISOString().split('T')[0]
      return task.due_date > today
    }),
    noDate: filteredTasks.filter(task => 
      task.status !== 'completed' && !task.due_date
    ),
    completed: filteredTasks.filter(task => task.status === 'completed'),
  }

  const getStatusStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && t.due_date && isOverdue(t.due_date, t.due_time)
    ).length

    return { total, completed, pending, inProgress, overdue }
  }

  const stats = getStatusStats()

  const TaskGroup = ({ title, tasks, icon: Icon, color }: {
    title: string
    tasks: Task[]
    icon: any
    color: string
  }) => (
    tasks.length > 0 && (
      <Card className={`mb-6 border-l-4 ${color}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
            <span className="text-sm font-normal text-muted-foreground">
              ({tasks.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={(updates) => onUpdateTask(task.id, updates)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  )

  return (
    <div className="space-y-6">
      {/* 統計 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">総タスク</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">完了</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">進行中</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">未着手</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-muted-foreground">期限切れ</div>
          </CardContent>
        </Card>
      </div>

      {/* 検索とフィルター */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="タスクを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={showCompleted ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                完了済みを表示
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* タスクリスト */}
      <div>
        <TaskGroup
          title="期限切れ"
          tasks={groupedTasks.overdue}
          icon={AlertCircle}
          color="border-l-red-500"
        />
        
        <TaskGroup
          title="今日"
          tasks={groupedTasks.today}
          icon={Clock}
          color="border-l-blue-500"
        />
        
        <TaskGroup
          title="今後"
          tasks={groupedTasks.upcoming}
          icon={Clock}
          color="border-l-green-500"
        />
        
        <TaskGroup
          title="期限なし"
          tasks={groupedTasks.noDate}
          icon={Clock}
          color="border-l-gray-500"
        />

        {showCompleted && (
          <TaskGroup
            title="完了済み"
            tasks={groupedTasks.completed}
            icon={CheckCircle2}
            color="border-l-green-500"
          />
        )}

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {searchTerm ? '検索条件に一致するタスクがありません' : 'タスクがありません'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
