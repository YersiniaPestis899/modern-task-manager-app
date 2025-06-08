'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Task, TaskFilter, TaskStatus, TaskPriority } from '@/types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  Flag,
  User as UserIcon,
  Settings,
  Bell,
  X,
  CheckCircle,
  Clock,
  Play,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  filter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
  user: User
}

export function Sidebar({ isOpen, onClose, tasks, filter, onFilterChange, user }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState(filter.search || '')
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>(filter.status || [])
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>(filter.priority || [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(filter.category || [])

  // カテゴリとタグを抽出
  const categories = [...new Set(tasks.filter(t => t.category).map(t => t.category!))]
  const allTags = [...new Set(tasks.flatMap(t => t.tags || []))]

  // フィルターの統計
  const getFilterStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const overdue = tasks.filter(t => {
      if (t.status === 'completed' || !t.due_date) return false
      const now = new Date()
      const dueDate = new Date(t.due_date)
      if (t.due_time) {
        const [hours, minutes] = t.due_time.split(':')
        dueDate.setHours(parseInt(hours), parseInt(minutes))
      }
      return dueDate < now
    }).length

    return { total, completed, pending, inProgress, overdue }
  }

  const stats = getFilterStats()

  // フィルター適用
  useEffect(() => {
    const newFilter: TaskFilter = {
      search: searchTerm || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
      category: selectedCategories.length > 0 ? selectedCategories : undefined,
    }
    onFilterChange(newFilter)
  }, [searchTerm, selectedStatuses, selectedPriorities, selectedCategories, onFilterChange])

  // ステータス切り替え
  const toggleStatus = (status: TaskStatus) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  // 優先度切り替え
  const togglePriority = (priority: TaskPriority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  // カテゴリ切り替え
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // フィルターリセット
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedStatuses([])
    setSelectedPriorities([])
    setSelectedCategories([])
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )

  const FilterButton = ({ 
    active, 
    onClick, 
    children, 
    count,
    icon: Icon 
  }: { 
    active: boolean
    onClick: () => void
    children: React.ReactNode
    count?: number
    icon?: any
  }) => (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "w-full justify-between h-auto p-2",
        active && "bg-blue-600 text-white hover:bg-blue-700"
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span className="text-sm">{children}</span>
      </div>
      {count !== undefined && (
        <span className={cn(
          "text-xs px-2 py-1 rounded-full",
          active ? "bg-blue-500" : "bg-gray-200 text-gray-600"
        )}>
          {count}
        </span>
      )}
    </Button>
  )

  return (
    <>
      {/* オーバーレイ（モバイル用） */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* サイドバー */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r z-50 transform transition-transform duration-200 ease-in-out overflow-y-auto custom-scrollbar",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0 lg:static lg:z-auto"
      )}>
        <div className="p-4 space-y-4">
          {/* ユーザー情報 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-600">
                    {user.user_metadata?.full_name || 'ユーザー'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 検索 */}
          <FilterSection title="検索">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="タスクを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </FilterSection>

          {/* クイック統計 */}
          <FilterSection title="概要">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>総タスク</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">完了</span>
                <span className="font-medium text-green-600">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600">進行中</span>
                <span className="font-medium text-blue-600">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">未着手</span>
                <span className="font-medium text-gray-600">{stats.pending}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">期限切れ</span>
                  <span className="font-medium text-red-600">{stats.overdue}</span>
                </div>
              )}
            </div>
          </FilterSection>

          {/* ステータスフィルター */}
          <FilterSection title="ステータス">
            <div className="space-y-1">
              <FilterButton
                active={selectedStatuses.includes('pending')}
                onClick={() => toggleStatus('pending')}
                count={stats.pending}
                icon={Clock}
              >
                未着手
              </FilterButton>
              <FilterButton
                active={selectedStatuses.includes('in_progress')}
                onClick={() => toggleStatus('in_progress')}
                count={stats.inProgress}
                icon={Play}
              >
                進行中
              </FilterButton>
              <FilterButton
                active={selectedStatuses.includes('completed')}
                onClick={() => toggleStatus('completed')}
                count={stats.completed}
                icon={CheckCircle}
              >
                完了
              </FilterButton>
            </div>
          </FilterSection>

          {/* 優先度フィルター */}
          <FilterSection title="優先度">
            <div className="space-y-1">
              <FilterButton
                active={selectedPriorities.includes('urgent')}
                onClick={() => togglePriority('urgent')}
                count={tasks.filter(t => t.priority === 'urgent').length}
              >
                🔥 緊急
              </FilterButton>
              <FilterButton
                active={selectedPriorities.includes('high')}
                onClick={() => togglePriority('high')}
                count={tasks.filter(t => t.priority === 'high').length}
              >
                ⚡ 高
              </FilterButton>
              <FilterButton
                active={selectedPriorities.includes('medium')}
                onClick={() => togglePriority('medium')}
                count={tasks.filter(t => t.priority === 'medium').length}
              >
                ⭐ 中
              </FilterButton>
              <FilterButton
                active={selectedPriorities.includes('low')}
                onClick={() => togglePriority('low')}
                count={tasks.filter(t => t.priority === 'low').length}
              >
                🌿 低
              </FilterButton>
            </div>
          </FilterSection>

          {/* カテゴリフィルター */}
          {categories.length > 0 && (
            <FilterSection title="カテゴリ">
              <div className="space-y-1">
                {categories.map(category => (
                  <FilterButton
                    key={category}
                    active={selectedCategories.includes(category)}
                    onClick={() => toggleCategory(category)}
                    count={tasks.filter(t => t.category === category).length}
                    icon={Tag}
                  >
                    {category}
                  </FilterButton>
                ))}
              </div>
            </FilterSection>
          )}

          {/* 人気のタグ */}
          {allTags.length > 0 && (
            <FilterSection title="人気のタグ">
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 10).map(tag => {
                  const count = tasks.filter(t => t.tags?.includes(tag)).length
                  return (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setSearchTerm(tag)}
                    >
                      {tag} ({count})
                    </Button>
                  )
                })}
              </div>
            </FilterSection>
          )}

          {/* フィルターアクション */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              フィルターをリセット
            </Button>
            
            <div className="text-xs text-center text-gray-500">
              {searchTerm || selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedCategories.length > 0
                ? 'フィルター適用中'
                : '全てのタスクを表示中'
              }
            </div>
          </div>

          {/* クイックアクション */}
          <FilterSection title="クイックアクション">
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  setSearchTerm('')
                  setSelectedStatuses(['pending', 'in_progress'])
                  // 今日期限のタスクをフィルタリングするロジックを追加できます
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                今日のタスク
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedStatuses([])
                  setSelectedPriorities(['urgent', 'high'])
                  setSelectedCategories([])
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                重要なタスク
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setSelectedStatuses(['completed'])
                  setSelectedPriorities([])
                  setSelectedCategories([])
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                完了済み
              </Button>
            </div>
          </FilterSection>
        </div>
      </aside>
    </>
  )
}
