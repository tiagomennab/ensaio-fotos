import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/auth-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ensaio Fotos - AI Photo Generation SaaS',
  description: 'Create stunning AI-generated photos with custom trained models',
  keywords: ['AI', 'photo generation', 'machine learning', 'fine-tuning', 'SaaS'],
  authors: [{ name: 'Ensaio Fotos Team' }],
  openGraph: {
    title: 'Ensaio Fotos - AI Photo Generation',
    description: 'Create stunning AI-generated photos with custom trained models',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}