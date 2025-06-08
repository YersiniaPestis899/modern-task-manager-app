'use client'

import { useState } from 'react'
import { Task, TaskStatus, TaskPriority } from '@/types'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { TaskForm } from './TaskForm'
import { 
  Check, 
  Play, 
  Pause, 
  X, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  Bell,
  MoreHorizontal
} from 'lucide-react'
import { formatDateTime, getPriorityColor, getStatusColor, isOverdue, getPriorityIcon } from '@/lib/utils'
import { toast } from 'sonner'

interface TaskItemProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => Promise<void>
  onDelete: () => Promise<void>
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (status: TaskStatus) => {
    setLoading(true)
    try {
      const updates: Partial<Task> = { 
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      }
      await onUpdate(updates)
    } catch (error) {
      toast.error('ステータスの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('このタスクを削除しますか？')) {
      try {
        await onDelete()
      } catch (error) {
        toast.error('タスクの削除に失敗しました')
      }
    }
  }

  const handleEdit = async (taskData: Partial<Task>) => {
    try {
      await onUpdate(taskData)
      setIsEditOpen(false)
    } catch (error) {
      toast.error('タスクの更新に失敗しました')
    }
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Play className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <Pause className="h-4 w-4 text-gray-600" />
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Pause className="h-4 w-4 text-gray-600" />
    }
  }

  const isTaskOverdue = task.due_date && isOverdue(task.due_date, task.due_time)

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      task.status === 'completed' ? 'opacity-60' : ''
    } ${isTaskOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* ステータスアイコン */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full mt-1"
            onClick={() => {
              const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
              handleStatusChange(nextStatus)
            }}
            disabled={loading}
          >
            {getStatusIcon(task.status)}
          </Button>

          {/* タスク内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className={`font-medium ${
                  task.status === 'completed' ? 'line-through text-gray-500' : ''
                }`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* メタ情報 */}
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                  {/* 優先度 */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                    <span>{getPriorityIcon(task.priority)}</span>
                    <span className="capitalize">{task.priority}</span>
                  </div>

                  {/* ステータス */}
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span>
                      {task.status === 'completed' ? '完了' :
                       task.status === 'in_progress' ? '進行中' :
                       task.status === 'pending' ? '未着手' : 'キャンセル'}
                    </span>
                  </div>

                  {/* 期限 */}
                  {task.due_date && (
                    <div className={`flex items-center gap-1 ${
                      isTaskOverdue ? 'text-red-600 font-medium' : ''
                    }`}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(task.due_date, task.due_time)}</span>
                      {isTaskOverdue && <span className="text-red-600">⚠️</span>}
                    </div>
                  )}

                  {/* カテゴリ */}
                  {task.category && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      <span>{task.category}</span>
                    </div>
                  )}

                  {/* リマインダー */}
                  {task.reminder_minutes && (
                    <div className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      <span>{task.reminder_minutes}分前</span>
                    </div>
                  )}
                </div>

                {/* タグ */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* アクションボタン */}
              <div className="flex items-center gap-1">
                {/* クイックアクション */}
                <div className="flex gap-1">
                  {task.status !== 'completed' && (
                    <>
                      {task.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStatusChange('in_progress')}
                          disabled={loading}
                          title="開始"
                        >
                          <Play className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleStatusChange('pending')}
                          disabled={loading}
                          title="一時停止"
                        >
                          <Pause className="h-4 w-4 text-gray-600" />
                        </Button>
                      )}
                    </>
                  )}
                </div>

                {/* 編集ダイアログ */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="編集"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>タスクを編集</DialogTitle>
                    </DialogHeader>
                    <TaskForm
                      task={task}
                      onSubmit={handleEdit}
                      onCancel={() => setIsEditOpen(false)}
                    />
                  </DialogContent>
                </Dialog>

                {/* 削除ボタン */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleDelete}
                  title="削除"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
