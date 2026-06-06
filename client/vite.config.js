import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

// 判断是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [
    react(),
    // PWA 支持
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '匠芯简历',
        short_name: '匠芯简历',
        description: 'AI智能简历制作平台',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
    // Gzip 压缩
    isProduction && compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
    }),
    // Brotli 压缩
    isProduction && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
    // 打包分析 (可选，通过 BUILD_ANALYZE=true 启用)
    process.env.BUILD_ANALYZE === 'true' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),

  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
    // 热更新优化
    hmr: {
      overlay: false,
    },
  },

  build: {
    // 代码分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          // 编辑器相关
          'editor-vendor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-link',
            '@tiptap/extension-underline',
          ],
          // PDF 导出相关 (较大，单独拆分)
          'pdf-vendor': ['html2canvas', 'jspdf'],
        },
        // 静态资源分类
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 源码映射 (生产环境关闭)
    sourcemap: !isProduction,
    // 图片资源内联阈值 (10KB以下内联)
    assetsInlineLimit: 10240,
    // 构建目标
    target: 'esnext',
    // CSS 优化
    cssMinify: true,
    // 报告压缩后大小
    reportCompressedSize: false,
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'axios',
    ],
    exclude: ['@tiptap/extension-link', '@tiptap/extension-underline'],
  },

  // 路径解析
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@services': '/src/services',
    },
  },

  // CSS 配置
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
})
