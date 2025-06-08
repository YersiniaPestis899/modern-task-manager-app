'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { toast } from 'sonner'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [debugInfo, setDebugInfo] = useState<{url: string, hash: string} | null>(null)

  // 🔧 Hydration Error対策: クライアントサイドでのみデバッグ情報を設定
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo({
        url: window.location.href,
        hash: window.location.hash
      })
    }
  }, [])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Auth callback処理開始')
        console.log('Current URL:', window.location.href)
        
        // URLハッシュから認証情報を取得
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        // URLクエリパラメータからもエラー情報を取得
        const urlParams = new URLSearchParams(window.location.search)
        const urlError = urlParams.get('error')
        const urlErrorDescription = urlParams.get('error_description')

        const finalError = error || urlError
        const finalErrorDescription = errorDescription || urlErrorDescription

        console.log('Auth params:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          error: finalError,
          errorDescription: finalErrorDescription 
        })

        if (finalError) {
          console.error('OAuth error:', finalError, finalErrorDescription)
          setStatus('error')
          
          // 具体的なエラーメッセージを表示
          let userFriendlyMessage = '認証エラーが発生しました'
          
          if (finalError === 'server_error' && finalErrorDescription?.includes('Database error saving new user')) {
            userFriendlyMessage = 'データベースエラー: ユーザー情報の保存に失敗しました。データベースの設定を確認してください。'
          } else if (finalError === 'access_denied') {
            userFriendlyMessage = 'Google認証がキャンセルされました'
          } else {
            userFriendlyMessage = `認証エラー: ${finalErrorDescription || finalError}`
          }
          
          toast.error(userFriendlyMessage)
          setTimeout(() => router.push('/'), 5000)
          return
        }

        if (!accessToken) {
          console.error('No access token found')
          setStatus('error')
          toast.error('認証情報を取得できませんでした')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        // Supabaseセッションを確立
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          toast.error('セッションの確立に失敗しました')
          setTimeout(() => router.push('/'), 3000)
          return
        }

        if (session) {
          console.log('✅ Auth callback成功:', session.user.email)
          setStatus('success')
          toast.success(`ログインしました！ (${session.user.email})`)
          
          // 少し待ってからメインページにリダイレクト
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else {
          console.error('No session established')
          setStatus('error')
          toast.error('ログインに失敗しました')
          setTimeout(() => router.push('/'), 3000)
        }

      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        toast.error('認証処理中にエラーが発生しました')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          {status === 'processing' && (
            <>
              <LoadingSpinner size="lg" />
              <h2 className="text-2xl font-bold text-gray-900">
                Google認証を処理中...
              </h2>
              <p className="text-gray-600">
                認証が完了するまでお待ちください
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-900">
                ログイン成功！
              </h2>
              <p className="text-gray-600">
                タスク管理画面に移動します...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-900">
                認証エラー
              </h2>
              <p className="text-gray-600">
                ログイン画面に戻ります...
              </p>
            </>
          )}
        </div>

        {/* 🔧 Hydration Error対策: クライアントサイドでのみ表示 */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="text-left p-4 bg-gray-100 rounded-lg text-xs font-mono max-w-md">
            <div className="font-semibold mb-2">デバッグ情報:</div>
            <div>Status: {status}</div>
            <div>URL: {debugInfo.url}</div>
            <div>Hash: {debugInfo.hash}</div>
          </div>
        )}
      </div>
    </div>
  )
}
