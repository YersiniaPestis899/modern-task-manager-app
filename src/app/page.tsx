'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { TaskDashboard } from '@/components/TaskDashboard'
import { AuthComponent } from '@/components/AuthComponent'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { getNotificationManager } from '@/lib/notifications'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期認証状態をチェック
    const checkAuth = async () => {
      try {
        // セッション復元を試行
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('セッション取得エラー:', error)
          // セッション取得エラーの場合、現在のユーザーをチェック
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          setUser(currentUser)
        } else {
          setUser(session?.user ?? null)
        }

        // URL fragment からハッシュパラメータをチェック（OAuth コールバック処理）
        if (window.location.hash) {
          console.log('🔍 OAuth callback detected:', window.location.hash)
          // ハッシュをクリアしてページを再読み込みしないように
          window.history.replaceState(null, '', window.location.pathname)
        }
        
        console.log('🔍 認証チェック完了:', session?.user ? 'ログイン済み' : 'ログインなし')
      } catch (error) {
        console.error('認証チェックエラー:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 認証状態変更:', event, session?.user ? 'ユーザーあり' : 'ユーザーなし')
        
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN') {
          console.log('✅ ログイン成功')
          // ログイン時に通知許可をリクエスト
          const notificationManager = getNotificationManager()
          if (notificationManager) {
            await notificationManager.requestPermission()
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 ログアウト')
          // ログアウト時にスケジュールされた通知をクリア
          const notificationManager = getNotificationManager()
          if (notificationManager) {
            notificationManager.cancelAllReminders()
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 トークン更新')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // サービスワーカーの登録（PWA対応）
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  // 詳細なローディング状態とデバッグ情報
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">認証状態を確認中...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-gray-400">
              URL: {typeof window !== 'undefined' ? window.location.href : 'loading...'}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {user ? (
        <TaskDashboard user={user} />
      ) : (
        <AuthComponent />
      )}
    </div>
  )
}
