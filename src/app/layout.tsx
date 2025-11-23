import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('http://152.67.2.20:3000'),
  title: {
    default: 'KAIRO STUDIO — Automations that move your business',
    template: '%s | KAIRO STUDIO',
  },
  description: 'We design marketing systems, AI products and automation stacks that scale revenue. Explore the Automation Universe with 3D interactive experiences.',
  keywords: ['automation', 'marketing', 'SaaS', 'AI', 'branding', 'strategy', 'workflow automation', 'marketing automation', 'business automation'],
  authors: [{ name: 'KAIRO STUDIO' }],
  creator: 'KAIRO STUDIO',
  publisher: 'KAIRO STUDIO',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://152.67.2.20:3000',
    siteName: 'KAIRO STUDIO',
    title: 'KAIRO STUDIO — Automations that move your business',
    description: 'We design marketing systems, AI products and automation stacks that scale revenue.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KAIRO STUDIO - Automation Universe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KAIRO STUDIO — Automations that move your business',
    description: 'We design marketing systems, AI products and automation stacks that scale revenue.',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    // Add your verification codes when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
