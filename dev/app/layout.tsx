import type { Metadata } from 'next'

import Link from 'next/link'

export const metadata: Metadata = {
  description: 'A demonstration of the Typesense Search Plugin for Payload CMS',
  title: 'Typesense Search Plugin Demo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav
          style={{
            backgroundColor: '#1f2937',
            borderBottom: '1px solid #374151',
            padding: '1rem 2rem',
          }}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '2rem',
              margin: '0 auto',
              maxWidth: '1200px',
            }}
          >
            <Link
              href="/admin"
              style={{
                color: '#f9fafb',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              📝 Admin Panel
            </Link>
            <Link
              href="/search-demo"
              style={{
                color: '#f9fafb',
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              🔍 Search Demo
            </Link>
            <div style={{ marginLeft: 'auto' }}>
              <span
                style={{
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                }}
              >
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
