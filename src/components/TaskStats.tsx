'use client'

import { useMemo } from 'react'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Target,
  Award
} from 'lucide-react'
import { isOverdue } from '@/lib/utils'

interface TaskStatsProps {
  tasks: Task[]
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const cancelled = tasks.filter(t => t.status === 'cancelled').length
    
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && t.due_date && isOverdue(t.due_date, t.due_time)
    ).length
    
    const dueToday = tasks.filter(t => {
      if (t.status === 'completed' || !t.due_date) return false
      const today = new Date().toISOString().split('T')[0]
      return t.due_date === today
    }).length
    
    const dueThisWeek = tasks.filter(t => {
      if (t.status === 'completed' || !t.due_date) return false
      const today = new Date()
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const taskDate = new Date(t.due_date)
      return taskDate >= today && taskDate <= weekFromNow
    }).length

    // 優先度別統計
    const byPriority = {
      urgent: tasks.filter(t => t.priority === 'urgent').length,
      high: tasks.filter(t => t.priority === 'high').length,
      medium: tasks.filter(t => t.priority === 'medium').length,
      low: tasks.filter(t => t.priority === 'low').length,
    }

    // カテゴリ別統計
    const categories = Array.from(new Set(tasks.filter(t => t.category).map(t => t.category!)))
    const byCategory = categories.reduce((acc, category) => {
      acc[category] = tasks.filter(t => t.category === category).length
      return acc
    }, {} as Record<string, number>)

    // 完了率
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // 今月の統計
    const thisMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const thisMonthTasks = tasks.filter(t => 
      (t.created_at ?? '').startsWith(thisMonth)
    ).length
    const thisMonthCompleted = tasks.filter(t => 
      t.completed_at && t.completed_at.startsWith(thisMonth)
    ).length

    // 週次パフォーマンス（過去4週間）
    const weeklyStats = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weekTasks = tasks.filter(t => {
        const taskDate = new Date(t.created_at ?? 0)
        return taskDate >= weekStart && taskDate <= weekEnd
      })
      
      const weekCompleted = tasks.filter(t => {
        if (!t.completed_at) return false
        const completedDate = new Date(t.completed_at ?? 0)
        return completedDate >= weekStart && completedDate <= weekEnd
      })
      
      weeklyStats.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        created: weekTasks.length,
        completed: weekCompleted.length
      })
    }

    return {
      total,
      completed,
      pending,
      inProgress,
      cancelled,
      overdue,
      dueToday,
      dueThisWeek,
      byPriority,
      byCategory,
      completionRate,
      thisMonthTasks,
      thisMonthCompleted,
      weeklyStats
    }
  }, [tasks])

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    subtitle 
  }: {
    title: string
    value: number | string
    icon: any
    color: string
    subtitle?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* メイン統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="総タスク数"
          value={stats.total}
          icon={BarChart3}
          color="text-blue-600"
        />
        <StatCard
          title="完了率"
          value={`${stats.completionRate}%`}
          icon={CheckCircle2}
          color="text-green-600"
          subtitle={`${stats.completed}/${stats.total} 完了`}
        />
        <StatCard
          title="期限切れ"
          value={stats.overdue}
          icon={AlertTriangle}
          color="text-red-600"
          subtitle="要注意"
        />
        <StatCard
          title="今日の期限"
          value={stats.dueToday}
          icon={Clock}
          color="text-orange-600"
          subtitle="本日中"
        />
      </div>

      {/* ステータス別詳細 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ステータス別内訳
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">完了済み</span>
                <span className="text-sm font-medium">{stats.completed}</span>
              </div>
              <ProgressBar value={stats.completed} max={stats.total} color="bg-green-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">進行中</span>
                <span className="text-sm font-medium">{stats.inProgress}</span>
              </div>
              <ProgressBar value={stats.inProgress} max={stats.total} color="bg-blue-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">未着手</span>
                <span className="text-sm font-medium">{stats.pending}</span>
              </div>
              <ProgressBar value={stats.pending} max={stats.total} color="bg-gray-500" />
            </div>
            
            {stats.cancelled > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">キャンセル</span>
                  <span className="text-sm font-medium">{stats.cancelled}</span>
                </div>
                <ProgressBar value={stats.cancelled} max={stats.total} color="bg-red-500" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              優先度別内訳
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  🔥 緊急
                </span>
                <span className="text-sm font-medium">{stats.byPriority.urgent}</span>
              </div>
              <ProgressBar value={stats.byPriority.urgent} max={stats.total} color="bg-red-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  ⚡ 高
                </span>
                <span className="text-sm font-medium">{stats.byPriority.high}</span>
              </div>
              <ProgressBar value={stats.byPriority.high} max={stats.total} color="bg-orange-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  ⭐ 中
                </span>
                <span className="text-sm font-medium">{stats.byPriority.medium}</span>
              </div>
              <ProgressBar value={stats.byPriority.medium} max={stats.total} color="bg-yellow-500" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  🌿 低
                </span>
                <span className="text-sm font-medium">{stats.byPriority.low}</span>
              </div>
              <ProgressBar value={stats.byPriority.low} max={stats.total} color="bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 週次パフォーマンス */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            週次パフォーマンス（過去4週間）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.weeklyStats.map((week, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{week.week}週</span>
                  <span>作成: {week.created}, 完了: {week.completed}</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-blue-500 rounded"
                    style={{ 
                      width: `${week.created > 0 ? Math.max((week.created / Math.max(...stats.weeklyStats.map(w => w.created))) * 100, 10) : 0}%` 
                    }}
                    title={`作成: ${week.created}`}
                  />
                  <div 
                    className="bg-green-500 rounded"
                    style={{ 
                      width: `${week.completed > 0 ? Math.max((week.completed / Math.max(...stats.weeklyStats.map(w => w.completed))) * 100, 10) : 0}%` 
                    }}
                    title={`完了: ${week.completed}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>作成</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>完了</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* カテゴリ別統計 */}
      {Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              カテゴリ別内訳
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-600">{String(count)}</span>
                  </div>
                  <ProgressBar value={Number(count)} max={stats.total} color="bg-purple-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 今月の概要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            今月の概要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.thisMonthTasks}</div>
              <div className="text-sm text-gray-600">新規作成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.thisMonthCompleted}</div>
              <div className="text-sm text-gray-600">今月完了</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.dueThisWeek}</div>
              <div className="text-sm text-gray-600">今週期限</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">期限切れ</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生産性のヒント */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            生産性のヒント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {stats.completionRate >= 80 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>素晴らしい！完了率が80%を超えています。</span>
              </div>
            )}
            {stats.overdue > 0 && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>期限切れのタスクがあります。優先的に取り組みましょう。</span>
              </div>
            )}
            {stats.byPriority.urgent > stats.byPriority.high + stats.byPriority.medium && (
              <div className="flex items-center gap-2 text-orange-600">
                <Clock className="h-4 w-4" />
                <span>緊急タスクが多めです。タスクの計画を見直してみましょう。</span>
              </div>
            )}
            {stats.dueToday > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <Target className="h-4 w-4" />
                <span>今日期限のタスクがあります。集中して取り組みましょう。</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
