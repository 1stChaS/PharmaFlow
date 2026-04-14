import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

export const metadata: Metadata = {
  title: 'MediCare Pharmacy | Hospital Pharmacy Management',
  description: 'A modern, friendly hospital pharmacy management system for tracking inventory, requests, and deliveries.',
}

export const viewport = {
  themeColor: '#89CFF0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${nunito.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
