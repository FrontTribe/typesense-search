import type { Payload } from 'payload'

// Sample data for seeding collections
const samplePosts = [
  {
    title: 'Getting Started with Next.js 14',
    content: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Next.js 14 brings exciting new features including the App Router, Server Components, and improved performance. In this comprehensive guide, we'll explore how to leverage these features to build modern web applications.",
              },
            ],
          },
        ],
      },
    }),
    category: 'Technology',
    status: 'published',
  },
  {
    title: 'Building Scalable APIs with TypeScript',
    content: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'TypeScript provides excellent tooling and type safety for building robust APIs. Learn how to structure your API projects, implement proper error handling, and create maintainable code that scales with your team.',
              },
            ],
          },
        ],
      },
    }),
    category: 'Development',
    status: 'published',
  },
  {
    title: 'Modern CSS Techniques for 2024',
    content: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'CSS continues to evolve with new features like container queries, cascade layers, and improved grid layouts. This article explores the latest CSS techniques that can help you build more efficient and maintainable styles.',
              },
            ],
          },
        ],
      },
    }),
    category: 'Design',
    status: 'published',
  },
  {
    title: 'Database Optimization Strategies',
    content: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Database performance is crucial for application scalability. Learn essential optimization techniques including indexing strategies, query optimization, and database architecture patterns.',
              },
            ],
          },
        ],
      },
    }),
    category: 'Backend',
    status: 'published',
  },
  {
    title: 'React Server Components Deep Dive',
    content: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'React Server Components represent a paradigm shift in how we think about React applications. This deep dive explores the architecture, benefits, and practical implementation strategies.',
              },
            ],
          },
        ],
      },
    }),
    category: 'React',
    status: 'draft',
  },
]

const samplePortfolio = [
  {
    title: 'E-commerce Platform',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A full-stack e-commerce platform built with Next.js, TypeScript, and Stripe. Features include user authentication, product management, shopping cart, and payment processing.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Full-stack e-commerce platform with Next.js and Stripe integration',
    technologies: [
      { name: 'Next.js', category: 'frontend' },
      { name: 'TypeScript', category: 'frontend' },
      { name: 'Stripe', category: 'backend' },
      { name: 'MongoDB', category: 'database' },
      { name: 'Vercel', category: 'devops' },
    ],
    projectUrl: 'https://ecommerce-demo.vercel.app',
    githubUrl: 'https://github.com/username/ecommerce-platform',
    featured: true,
    status: 'published',
    tags: [{ tag: 'E-commerce' }, { tag: 'Next.js' }, { tag: 'TypeScript' }, { tag: 'Stripe' }],
  },
  {
    title: 'Task Management Dashboard',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A collaborative task management dashboard with real-time updates, drag-and-drop functionality, and team collaboration features.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Real-time collaborative task management dashboard',
    technologies: [
      { name: 'React', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'Socket.io', category: 'backend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Docker', category: 'devops' },
    ],
    projectUrl: 'https://taskboard-demo.netlify.app',
    githubUrl: 'https://github.com/username/task-dashboard',
    featured: false,
    status: 'published',
    tags: [{ tag: 'Dashboard' }, { tag: 'Real-time' }, { tag: 'Collaboration' }, { tag: 'React' }],
  },
  {
    title: 'Weather Analytics App',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A weather analytics application that provides detailed weather forecasts, historical data analysis, and climate trends visualization.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Interactive weather analytics with data visualization',
    technologies: [
      { name: 'Vue.js', category: 'frontend' },
      { name: 'D3.js', category: 'frontend' },
      { name: 'Express.js', category: 'backend' },
      { name: 'Redis', category: 'database' },
      { name: 'AWS', category: 'devops' },
    ],
    projectUrl: 'https://weather-analytics.herokuapp.com',
    githubUrl: 'https://github.com/username/weather-app',
    featured: true,
    status: 'published',
    tags: [
      { tag: 'Weather' },
      { tag: 'Analytics' },
      { tag: 'Vue.js' },
      { tag: 'Data Visualization' },
    ],
  },
  {
    title: 'Social Media Analytics Tool',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A comprehensive social media analytics tool that tracks engagement, reach, and performance metrics across multiple platforms.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Multi-platform social media analytics and reporting tool',
    technologies: [
      { name: 'Angular', category: 'frontend' },
      { name: 'Python', category: 'backend' },
      { name: 'FastAPI', category: 'backend' },
      { name: 'Elasticsearch', category: 'database' },
      { name: 'Kubernetes', category: 'devops' },
    ],
    projectUrl: 'https://social-analytics.io',
    githubUrl: 'https://github.com/username/social-analytics',
    featured: false,
    status: 'published',
    tags: [{ tag: 'Social Media' }, { tag: 'Analytics' }, { tag: 'Angular' }, { tag: 'Python' }],
  },
  {
    title: 'Mobile Banking App',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A secure mobile banking application with biometric authentication, real-time transactions, and comprehensive financial management features.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Secure mobile banking app with biometric authentication',
    technologies: [
      { name: 'React Native', category: 'frontend' },
      { name: 'Node.js', category: 'backend' },
      { name: 'PostgreSQL', category: 'database' },
      { name: 'Redis', category: 'database' },
      { name: 'AWS', category: 'devops' },
    ],
    projectUrl: null,
    githubUrl: 'https://github.com/username/banking-app',
    featured: true,
    status: 'archived',
    tags: [{ tag: 'Mobile' }, { tag: 'Banking' }, { tag: 'Security' }, { tag: 'React Native' }],
  },
]

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Premium wireless headphones with noise cancellation',
    price: 299.99,
    category: 'electronics',
    brand: 'AudioTech Pro',
    sku: 'ATH-BT-001',
    inStock: true,
    featured: true,
    status: 'published',
    tags: [
      { tag: 'Wireless' },
      { tag: 'Bluetooth' },
      { tag: 'Noise Cancellation' },
      { tag: 'Premium' },
    ],
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Soft, comfortable organic cotton t-shirt made from sustainably sourced materials. Available in multiple colors and sizes.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Sustainable organic cotton t-shirt in multiple colors',
    price: 24.99,
    category: 'clothing',
    brand: 'EcoWear',
    sku: 'EW-COT-001',
    inStock: true,
    featured: false,
    status: 'published',
    tags: [{ tag: 'Organic' }, { tag: 'Cotton' }, { tag: 'Sustainable' }, { tag: 'Comfortable' }],
  },
  {
    name: 'JavaScript: The Complete Guide',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Comprehensive guide to modern JavaScript development, covering ES6+, async programming, and advanced patterns. Perfect for developers of all levels.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Comprehensive JavaScript programming guide with examples',
    price: 49.99,
    category: 'books',
    brand: 'TechBooks Publishing',
    sku: 'TB-JS-001',
    inStock: true,
    featured: true,
    status: 'published',
    tags: [{ tag: 'JavaScript' }, { tag: 'Programming' }, { tag: 'Education' }, { tag: 'Guide' }],
  },
  {
    name: 'Smart Garden Irrigation System',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Automated garden irrigation system with soil moisture sensors and weather-based scheduling. Save water and keep your plants healthy.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Automated smart irrigation system with app control',
    price: 199.99,
    category: 'home-garden',
    brand: 'GardenTech',
    sku: 'GT-IRR-001',
    inStock: true,
    featured: false,
    status: 'published',
    tags: [{ tag: 'Smart Home' }, { tag: 'Irrigation' }, { tag: 'Garden' }, { tag: 'Automation' }],
  },
  {
    name: 'Professional Yoga Mat',
    description: JSON.stringify({
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'High-quality non-slip yoga mat made from eco-friendly materials. Provides excellent grip and cushioning for all types of yoga practice.',
              },
            ],
          },
        ],
      },
    }),
    shortDescription: 'Eco-friendly non-slip yoga mat with alignment guides',
    price: 79.99,
    category: 'sports',
    brand: 'ZenFit',
    sku: 'ZF-YOG-001',
    inStock: false,
    featured: false,
    status: 'discontinued',
    tags: [{ tag: 'Yoga' }, { tag: 'Eco-friendly' }, { tag: 'Non-slip' }, { tag: 'Professional' }],
  },
]

export const seed = async (payload: Payload) => {
  // Create admin user from environment variables or defaults
  const adminEmail = process.env.PAYLOAD_EMAIL || 'admin@example.com'
  const adminPassword = process.env.PAYLOAD_PASSWORD || 'admin123'

  const { totalDocs } = await payload.count({
    collection: 'users',
    where: {
      email: {
        equals: adminEmail,
      },
    },
  })

  if (!totalDocs) {
    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
      },
    })
    console.log(`✅ Created admin user: ${adminEmail}`)
  } else {
    console.log(`ℹ️  Admin user already exists: ${adminEmail}`)
  }

  // Seed sample data for collections
  await seedCollections(payload)
}

const seedCollections = async (payload: Payload) => {
  try {
    console.log('🌱 Starting collection seeding...')

    // Clear existing data first
    console.log('🧹 Clearing existing data...')

    // Clear Posts
    const existingPosts = await payload.find({
      collection: 'posts',
      limit: 0,
    })
    if (existingPosts.totalDocs > 0) {
      await payload.delete({
        collection: 'posts',
        where: {
          id: {
            in: existingPosts.docs.map((doc: any) => doc.id),
          },
        },
      })
      console.log(`  🗑️  Cleared ${existingPosts.totalDocs} existing posts`)
    }

    // Clear Portfolio
    const existingPortfolio = await payload.find({
      collection: 'portfolio',
      limit: 0,
    })
    if (existingPortfolio.totalDocs > 0) {
      await payload.delete({
        collection: 'portfolio',
        where: {
          id: {
            in: existingPortfolio.docs.map((doc: any) => doc.id),
          },
        },
      })
      console.log(`  🗑️  Cleared ${existingPortfolio.totalDocs} existing portfolio items`)
    }

    // Clear Products
    const existingProducts = await payload.find({
      collection: 'products',
      limit: 0,
    })
    if (existingProducts.totalDocs > 0) {
      await payload.delete({
        collection: 'products',
        where: {
          id: {
            in: existingProducts.docs.map((doc: any) => doc.id),
          },
        },
      })
      console.log(`  🗑️  Cleared ${existingProducts.totalDocs} existing products`)
    }

    // Seed Posts
    console.log('📝 Seeding posts...')
    for (const post of samplePosts) {
      try {
        await payload.create({
          collection: 'posts',
          data: post,
        })
        console.log(`  ✅ Created post: ${post.title}`)
      } catch (error) {
        console.error(`  ❌ Failed to create post "${post.title}":`, error.message)
      }
    }

    // Seed Portfolio
    console.log('💼 Seeding portfolio...')
    for (const item of samplePortfolio) {
      try {
        await payload.create({
          collection: 'portfolio',
          data: item,
        })
        console.log(`  ✅ Created portfolio item: ${item.title}`)
      } catch (error) {
        console.error(`  ❌ Failed to create portfolio item "${item.title}":`, error.message)
      }
    }

    // Seed Products
    console.log('🛍️ Seeding products...')
    for (const product of sampleProducts) {
      try {
        await payload.create({
          collection: 'products',
          data: product,
        })
        console.log(`  ✅ Created product: ${product.name}`)
      } catch (error) {
        console.error(`  ❌ Failed to create product "${product.name}":`, error.message)
      }
    }

    console.log('🎉 Collection seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Posts: ${samplePosts.length} items`)
    console.log(`   - Portfolio: ${samplePortfolio.length} items`)
    console.log(`   - Products: ${sampleProducts.length} items`)
    console.log(
      `   - Total: ${samplePosts.length + samplePortfolio.length + sampleProducts.length} items`,
    )
  } catch (error) {
    console.error('💥 Collection seeding failed:', error.message)
  }
}
