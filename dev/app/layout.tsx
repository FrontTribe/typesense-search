import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Typesense Search Plugin Demo',
  description: 'A demonstration of the Typesense Search Plugin for Payload CMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav
          style={{
            backgroundColor: '#1f2937',
            padding: '1rem 2rem',
            borderBottom: '1px solid #374151',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
          >
            <Link
              href="/"
              style={{
                color: '#f9fafb',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: '600',
              }}
            >
              🏠 Home
            </Link>
            <Link
              href="/admin"
              style={{
                color: '#f9fafb',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              📝 Admin Panel
            </Link>
            <Link
              href="/search-test"
              style={{
                color: '#f9fafb',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              🔍 Search Test
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
