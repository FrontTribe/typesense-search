import Link from 'next/link'

export default function HomePage() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        backgroundColor: '#ffffff',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Typesense Search Plugin
        </h1>
        <p
          style={{
            fontSize: '1.25rem',
            color: '#6b7280',
            marginBottom: '32px',
            maxWidth: '800px',
            margin: '0 auto 32px auto',
            lineHeight: '1.6',
          }}
        >
          A powerful search plugin for Payload CMS powered by Typesense. Experience lightning-fast,
          typo-tolerant search with real-time results.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            padding: '24px',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            backgroundColor: '#fafbfc',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px 0',
              color: '#374151',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📝 Admin Panel
          </h2>
          <p
            style={{
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5',
            }}
          >
            Access the Payload CMS admin panel to manage your content and see the integrated search
            interface.
          </p>
          <Link
            href="/admin"
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
          >
            Open Admin Panel
          </Link>
        </div>

        <div
          style={{
            padding: '24px',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            backgroundColor: '#fafbfc',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease',
          }}
        >
          <h2
            style={{
              margin: '0 0 16px 0',
              color: '#374151',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔍 Search Test
          </h2>
          <p
            style={{
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5',
            }}
          >
            Test the headless search component with real data. Search through posts and media with
            live results.
          </p>
          <Link
            href="/search-test"
            style={{
              display: 'inline-block',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background-color 0.2s ease',
            }}
          >
            Test Search
          </Link>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '40px',
        }}
      >
        <h2
          style={{
            margin: '0 0 20px 0',
            color: '#374151',
            fontSize: '24px',
          }}
        >
          Features
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>⚡ Lightning Fast</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Sub-millisecond search response times powered by Typesense
            </p>
          </div>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>🔍 Typo Tolerant</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Find results even with spelling mistakes and typos
            </p>
          </div>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>🎯 Faceted Search</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Filter results by categories, status, and custom fields
            </p>
          </div>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>📱 Headless Ready</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Reusable components for any frontend framework
            </p>
          </div>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>🔄 Auto Sync</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Automatic synchronization with Payload CMS changes
            </p>
          </div>
          <div>
            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>🎨 Customizable</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Fully customizable UI and search behavior
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#1f2937',
          padding: '32px',
          borderRadius: '12px',
          color: '#f9fafb',
        }}
      >
        <h2
          style={{
            margin: '0 0 20px 0',
            color: '#f9fafb',
            fontSize: '24px',
          }}
        >
          Quick Start
        </h2>
        <div
          style={{
            backgroundColor: '#111827',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #374151',
            marginBottom: '20px',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: '1.5',
              overflow: 'auto',
              color: '#f9fafb',
            }}
          >
            {`// Install the plugin
npm install typesense-search

// Add to your Payload config
import { typesenseSearch } from 'typesense-search'

export default buildConfig({
  plugins: [
    typesenseSearch({
      collections: {
        posts: {
          enabled: true,
          searchFields: ['title', 'content'],
          facetFields: ['category', 'status']
        }
      },
      typesense: {
        apiKey: 'your-api-key',
        nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }]
      }
    })
  ]
})`}
          </pre>
        </div>
        <p
          style={{
            color: '#d1d5db',
            margin: 0,
            fontSize: '14px',
          }}
        >
          Ready to get started? Check out the{' '}
          <Link href="/search-test" style={{ color: '#60a5fa' }}>
            Search Test page
          </Link>{' '}
          to see it in action!
        </p>
      </div>
    </div>
  )
}
