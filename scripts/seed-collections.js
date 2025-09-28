#!/usr/bin/env node

/**
 * Collection Seeder Script
 *
 * This script generates sample data for all collections except media.
 * It creates 5 items for each collection: posts, portfolio, and products.
 *
 * Usage:
 *   node scripts/seed-collections.js
 *
 * Or with environment variables:
 *   PAYLOAD_SECRET=your-secret TYPESENSE_API_KEY=your-key node scripts/seed-collections.js
 */

import { getPayload } from 'payload'
import config from '../dev/payload.config.js'

const generateSamplePosts = () => [
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'The new App Router provides a more intuitive file-based routing system that makes it easier to organize your application structure. Server Components allow you to render components on the server, reducing client-side JavaScript and improving performance.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "We'll cover advanced patterns like dependency injection, middleware composition, and database abstraction layers. These techniques will help you build APIs that are both performant and maintainable.",
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Container queries allow you to style elements based on the size of their container rather than the viewport, providing more flexible and component-based styling approaches.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "We'll dive into advanced topics like connection pooling, read replicas, and caching strategies that can dramatically improve your application's database performance.",
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Learn how Server Components can reduce bundle size, improve performance, and enable new patterns for data fetching and component composition.',
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

const generateSamplePortfolio = () => [
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'The platform supports multiple payment methods, inventory management, and real-time order tracking. Built with performance and scalability in mind.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Built with React, Socket.io, and PostgreSQL. Features include project boards, time tracking, and detailed analytics.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Features interactive charts, location-based forecasts, and data export capabilities. Built with Vue.js and D3.js for data visualization.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Integrates with Twitter, Instagram, and LinkedIn APIs to provide unified analytics dashboard with customizable reports and automated insights.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Built with React Native and integrated with banking APIs. Features include account management, bill payments, investment tracking, and fraud detection.',
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

const generateSampleProducts = () => [
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Features include quick charge capability, comfortable over-ear design, and seamless device switching. Compatible with all major devices and platforms.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Ethically manufactured with eco-friendly dyes and minimal environmental impact. Perfect for everyday wear or casual occasions.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Includes practical examples, exercises, and real-world projects. Covers topics from basic syntax to advanced concepts like closures and prototypes.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Features mobile app control, multiple zone support, and integration with weather services for optimal watering schedules.',
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
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Durable construction with antimicrobial properties and easy cleaning. Includes carrying strap and alignment lines for proper positioning.',
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

const seedCollections = async () => {
  try {
    console.log('🌱 Starting collection seeding...')

    const payload = await getPayload({ config })

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
            in: existingPosts.docs.map((doc) => doc.id),
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
            in: existingPortfolio.docs.map((doc) => doc.id),
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
            in: existingProducts.docs.map((doc) => doc.id),
          },
        },
      })
      console.log(`  🗑️  Cleared ${existingProducts.totalDocs} existing products`)
    }

    // Seed Posts
    console.log('📝 Seeding posts...')
    const posts = generateSamplePosts()
    for (const post of posts) {
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
    const portfolio = generateSamplePortfolio()
    for (const item of portfolio) {
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
    const products = generateSampleProducts()
    for (const product of products) {
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
    console.log(`   - Posts: ${posts.length} items`)
    console.log(`   - Portfolio: ${portfolio.length} items`)
    console.log(`   - Products: ${products.length} items`)
    console.log(`   - Total: ${posts.length + portfolio.length + products.length} items`)
  } catch (error) {
    console.error('💥 Seeding failed:', error.message)
    process.exit(1)
  }
}

// Run the seeder
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCollections()
}

export { seedCollections }
