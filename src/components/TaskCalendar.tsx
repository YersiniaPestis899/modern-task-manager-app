'use client'

import { useState, useMemo } from 'react'
import { Task, CalendarEvent } from '@/types'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { TaskForm } from './TaskForm'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatTime, getPriorityColor, isOverdue } from '@/lib/utils'

interface TaskCalendarProps {
  tasks: Task[]
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  onCreateTask: (taskData: Partial<Task>) => Promise<void>
}

export function TaskCalendar({ tasks, onUpdateTask, onCreateTask }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const startOfCalendar = new Date(startOfMonth)
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay())
    
    const days = []
    const currentDay = new Date(startOfCalendar)
    
    for (let i = 0; i < 42; i++) { // 6週間分
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }

  // 指定日のタスクを取得
  const getTasksForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return tasks.filter(task => task.due_date === dateString)
  }

  // カレンダーイベントの生成
  const calendarEvents = useMemo(() => {
    return tasks
      .filter(task => task.due_date)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.due_date + (task.due_time ? `T${task.due_time}` : 'T09:00')),
        end: new Date(task.due_date + (task.due_time ? `T${task.due_time}` : 'T10:00')),
        color: getPriorityColor(task.priority),
        task,
      }))
  }, [tasks])

  const calendarDays = generateCalendarDays()
  const today = new Date().toISOString().split('T')[0]
  const currentMonthYear = currentDate.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long'
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsCreateTaskOpen(true)
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    const taskWithDate = {
      ...taskData,
      due_date: selectedDate?.toISOString().split('T')[0] || null,
    }
    
    try {
      await onCreateTask(taskWithDate)
      setIsCreateTaskOpen(false)
      setSelectedDate(null)
    } catch (error) {
      console.error('Task creation error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* カレンダーヘッダー */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {currentMonthYear}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                今日
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* カレンダーグリッド */}
      <Card>
        <CardContent className="p-4">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`p-2 text-center text-sm font-medium ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダー日付 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const dateString = date.toISOString().split('T')[0]
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isToday = dateString === today
              const dayTasks = getTasksForDate(date)
              const isWeekend = index % 7 === 0 || index % 7 === 6

              return (
                <div
                  key={dateString}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  onClick={() => handleDateClick(date)}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-gray-400' :
                    isToday ? 'text-blue-600' :
                    isWeekend ? (index % 7 === 0 ? 'text-red-600' : 'text-blue-600') :
                    'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* タスク表示 */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const taskIsOverdue = isOverdue(task.due_date!, task.due_time)
                      return (
                        <div
                          key={task.id}
                          className={`text-xs p-1 rounded truncate cursor-pointer hover:scale-105 transition-transform ${
                            task.status === 'completed' 
                              ? 'bg-green-100 text-green-800 line-through'
                              : taskIsOverdue
                              ? 'bg-red-100 text-red-800'
                              : getPriorityColor(task.priority).includes('red')
                              ? 'bg-red-100 text-red-800'
                              : getPriorityColor(task.priority).includes('orange')
                              ? 'bg-orange-100 text-orange-800'
                              : getPriorityColor(task.priority).includes('yellow')
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTask(task)
                          }}
                          title={`${task.title} ${task.due_time ? `(${formatTime(task.due_time)})` : ''}`}
                        >
                          <div className="flex items-center gap-1">
                            {task.due_time && (
                              <Clock className="h-3 w-3 flex-shrink-0" />
                            )}
                            {taskIsOverdue && (
                              <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 選択された日のタスク詳細 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {formatDate(selectedDate)} のタスク ({getTasksForDate(selectedDate).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  className={`p-3 border rounded-lg ${task.status === 'completed' ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                        {task.title}
                      </h4>
                      {task.due_time && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(task.due_time)}
                        </div>
                      )}
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))}
              
              {getTasksForDate(selectedDate).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  この日にはタスクがありません
                </div>
              )}
              
              <Button
                onClick={() => handleDateClick(selectedDate)}
                className="w-full mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                この日にタスクを追加
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* タスク作成ダイアログ */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate && `${formatDate(selectedDate)} に`}新しいタスクを作成
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => {
              setIsCreateTaskOpen(false)
              setSelectedDate(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* タスク詳細ダイアログ */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>タスク詳細</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">{selectedTask.title}</h3>
                {selectedTask.description && (
                  <p className="text-gray-600 mt-2">{selectedTask.description}</p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(selectedTask.due_date)}</span>
                  {selectedTask.due_time && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(selectedTask.due_time)}</span>
                    </>
                  )}
                </div>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getPriorityColor(selectedTask.priority)}`}>
                  優先度: {selectedTask.priority}
                </div>
                
                <div className="flex items-center gap-2">
                  ステータス: 
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    selectedTask.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedTask.status === 'completed' ? '完了' :
                     selectedTask.status === 'in_progress' ? '進行中' : '未着手'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    const newStatus = selectedTask.status === 'completed' ? 'pending' : 'completed'
                    onUpdateTask(selectedTask.id, {
                      status: newStatus,
                      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
                    })
                    setSelectedTask(null)
                  }}
                  className="flex-1"
                >
                  {selectedTask.status === 'completed' ? '未完了にする' : '完了にする'}
                </Button>
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  閉じる
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
