import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { cn } from '@/lib/utils'
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Modern Task Manager - 効率的なタスク管理アプリ',
    template: '%s | Modern Task Manager'
  },
  description: '効率的なタスク管理を実現するモダンなWebアプリケーション。カレンダー機能、リマインダー、プロジェクト管理など、生産性向上に必要な機能を統合しました。',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: 'タスク管理, TODO, 生産性, カレンダー, リマインダー, プロジェクト管理, 効率化, task management, todo, productivity, calendar, reminders',
  authors: [{ name: 'Task Manager Team' }],
  creator: 'Task Manager Team',
  publisher: 'Task Manager Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://modern-task-manager-app.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Modern Task Manager - 効率的なタスク管理アプリ',
    description: '効率的なタスク管理を実現するモダンなWebアプリケーション。カレンダー機能、リマインダー、プロジェクト管理など、生産性向上に必要な機能を統合しました。',
    url: 'https://modern-task-manager-app.vercel.app',
    siteName: 'Modern Task Manager',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Modern Task Manager - 効率的なタスク管理アプリ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modern Task Manager - 効率的なタスク管理アプリ',
    description: '効率的なタスク管理を実現するモダンなWebアプリケーション。カレンダー機能、リマインダー、プロジェクト管理など、生産性向上に必要な機能を統合しました。',
    images: ['/og-image.png'],
    creator: '@taskmanager',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google117ef46d812d4fd0',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Task Manager" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1270353215114134"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  )
}
