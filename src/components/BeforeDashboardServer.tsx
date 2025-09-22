import type { ServerComponentProps } from 'payload'

import styles from './BeforeDashboardServer.module.css'

export const BeforeDashboardServer = async (props: ServerComponentProps) => {
  const { payload } = props

  // Get collection stats
  const postsCount = await payload.count({ collection: 'posts' })
  const mediaCount = await payload.count({ collection: 'media' })

  return (
    <div className={styles.wrapper}>
      <h2>📊 Collection Statistics</h2>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Posts:</strong> {postsCount.totalDocs}
        </div>
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
          <strong>Media:</strong> {mediaCount.totalDocs}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#666' }}>
        <p>
          🔍 Typesense search is enabled for these collections. Use the search interface above to
          find content quickly.
        </p>
        <p>💡 Search features include typo tolerance, highlighting, and faceted search.</p>
      </div>
    </div>
  )
}
