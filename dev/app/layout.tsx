import type { Metadata } from 'next'

import Link from 'next/link'
import './demo.css'

export const metadata: Metadata = {
  description: 'A demonstration of the Typesense Search Plugin for Payload CMS',
  title: 'Typesense Search Plugin Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-gray-800 border-b border-gray-700 px-8 py-4">
          <div className="flex items-center gap-8 max-w-7xl mx-auto">
            <Link
              href="/admin"
              className="text-gray-100 text-base no-underline hover:text-white transition-colors"
            >
              📝 Admin Panel
            </Link>
            <Link
              href="/"
              className="text-gray-100 text-base no-underline hover:text-white transition-colors"
            >
              🔍 Search Demo
            </Link>
            <div className="ml-auto">
              <span className="text-gray-400 text-sm">
                Typesense Search Plugin Demo
              </span>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
