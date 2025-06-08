'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from './LoadingSpinner'
import { CheckCircle, Mail, Lock, User, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export function AuthComponent() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  // ✅ Google認証を有効化（設定完了後）
  const GOOGLE_AUTH_ENABLED = true

  // 🔍 デバッグ情報の表示（開発時のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
      setDebugInfo(`Supabase URL: ${supabaseUrl}\nApp URL: ${currentOrigin}\nCallback URL: ${currentOrigin}/auth/callback`)
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('ログインしました！')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        toast.success('アカウントを作成しました！確認メールをご確認ください。')
      }
    } catch (error: any) {
      console.error('認証エラー:', error)
      toast.error(error.message || '認証エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      console.log('🚀 Google認証開始')
      
      // 専用コールバックページにリダイレクト
      const redirectTo = `${window.location.origin}/auth/callback`
      console.log('📍 リダイレクト先:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      console.log('📋 Supabase Response:', data)
      
      if (error) {
        console.error('❌ Supabase認証エラー:', error)
        throw error
      }
      
      console.log('✅ Google認証リクエスト成功 - リダイレクト中...')
      // 成功した場合、Googleのリダイレクトが自動的に処理される
      // loadingはページ遷移で自動的に解除される
      
    } catch (error: any) {
      console.error('❌ Google認証エラー:', error)
      setLoading(false)
      
      // エラーの詳細をユーザーに表示
      let errorMessage = 'Google認証エラーが発生しました'
      
      if (error.message?.includes('validation_failed')) {
        errorMessage = 'Google認証プロバイダーが有効化されていません。Supabaseの設定を確認してください。'
      } else if (error.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'リダイレクトURIが正しく設定されていません。Google Cloud Consoleの設定を確認してください。'
      } else if (error.message?.includes('invalid_client')) {
        errorMessage = 'Google Client IDまたはClient Secretが正しくありません。'
      }
      
      toast.error(errorMessage)
      
      // デバッグ情報をコンソールに出力
      console.log('🔍 デバッグ情報:')
      console.log('- Current URL:', window.location.href)
      console.log('- Redirect URL:', `${window.location.origin}/auth/callback`)
      console.log('- Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* 左側：アプリの紹介 */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Modern Task Manager
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0">
              生産性を向上させる最新のタスク管理アプリケーション
            </p>
          </div>

          <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">スマートリマインダー</h3>
                <p className="text-sm text-gray-600">デスクトップ通知で期限を逃しません</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">カレンダー統合</h3>
                <p className="text-sm text-gray-600">スケジュールを一目で確認</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">リアルタイム同期</h3>
                <p className="text-sm text-gray-600">どのデバイスからでもアクセス</p>
              </div>
            </div>
          </div>

          {/* 🔍 デバッグ情報（開発時のみ） */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="text-left p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs font-mono">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800 font-semibold">デバッグ情報</span>
              </div>
              <pre className="text-blue-700 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
        </div>

        {/* 右側：認証フォーム */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'ログイン' : 'アカウント作成'}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? 'アカウントにログインしてタスク管理を始めましょう'
                  : '新しいアカウントを作成してタスク管理を始めましょう'
                }
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 🎯 Google認証セクション - 最初に表示 */}
              {GOOGLE_AUTH_ENABLED && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Googleでログイン
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">または</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    isLogin ? 'ログイン' : 'アカウント作成'
                  )}
                </Button>
              </form>

              {/* 🚨 Google認証無効化時の説明メッセージ */}
              {!GOOGLE_AUTH_ENABLED && (
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    📝 現在、メール/パスワード認証のみ利用可能です
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Google認証は設定完了後に有効化されます
                  </p>
                </div>
              )}

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin
                    ? 'アカウントをお持ちでない場合は作成'
                    : '既にアカウントをお持ちの場合はログイン'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
