'use client'

import { useState } from 'react'
import { Task, TaskPriority } from '@/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent } from './ui/card'
import { LoadingSpinner } from './LoadingSpinner'
import { Calendar, Clock, Flag, Tag, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface TaskFormProps {
  task?: Task
  onSubmit: (taskData: Partial<Task>) => Promise<void>
  onCancel?: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    due_date: task?.due_date || '',
    due_time: task?.due_time || '',
    priority: task?.priority || 'medium' as TaskPriority,
    category: task?.category || '',
    reminder_minutes: task?.reminder_minutes || 15,
    tags: task?.tags?.join(', ') || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('タスクタイトルを入力してください')
      return
    }

    setLoading(true)

    try {
      const taskData: Partial<Task> = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date || null,
        due_time: formData.due_time || null,
        priority: formData.priority,
        category: formData.category.trim() || null,
        reminder_minutes: formData.reminder_minutes > 0 ? formData.reminder_minutes : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        updated_at: new Date().toISOString(),
      }

      await onSubmit(taskData)
      
      // 新規作成の場合はフォームをリセット
      if (!task) {
        setFormData({
          title: '',
          description: '',
          due_date: '',
          due_time: '',
          priority: 'medium',
          category: '',
          reminder_minutes: 15,
          tags: '',
        })
      }
    } catch (error) {
      console.error('Task form error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* タイトル */}
      <div className="space-y-2">
        <Label htmlFor="title">タスクタイトル *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="何をしますか？"
          required
        />
      </div>

      {/* 説明 */}
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="詳細な説明（任意）"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
      </div>

      {/* 期限と時間 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">
            <Calendar className="w-4 h-4 inline mr-1" />
            期限日
          </Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="due_time">
            <Clock className="w-4 h-4 inline mr-1" />
            時間
          </Label>
          <Input
            id="due_time"
            type="time"
            value={formData.due_time}
            onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
          />
        </div>
      </div>

      {/* 優先度とカテゴリ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">
            <Flag className="w-4 h-4 inline mr-1" />
            優先度
          </Label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="urgent">緊急</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            <Tag className="w-4 h-4 inline mr-1" />
            カテゴリ
          </Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="例: 仕事, 個人"
          />
        </div>
      </div>

      {/* リマインダーとタグ */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reminder_minutes">
            <Bell className="w-4 h-4 inline mr-1" />
            リマインダー（分前）
          </Label>
          <select
            id="reminder_minutes"
            value={formData.reminder_minutes}
            onChange={(e) => setFormData(prev => ({ ...prev, reminder_minutes: Number(e.target.value) }))}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value={0}>なし</option>
            <option value={5}>5分前</option>
            <option value={15}>15分前</option>
            <option value={30}>30分前</option>
            <option value={60}>1時間前</option>
            <option value={1440}>1日前</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">
            <Tag className="w-4 h-4 inline mr-1" />
            タグ
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="例: 重要, 急ぎ"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            task ? '更新' : '作成'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  )
}
