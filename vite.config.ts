import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import type { RenderedChunk } from 'rollup'
import { visualizer } from 'rollup-plugin-visualizer'
import type { SimpleGit, SimpleGitOptions } from 'simple-git'
import { simpleGit } from 'simple-git'
import fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import pkg from './package.json'

const bannerTemplate = [
  '/*!',
  '* Pokémon TCG Collector',
  '* @module {MODULE}', // will be replaced by chunk filename
  `* @version ${pkg.version}`,
  `* @license ${pkg.license}`,
  `* @see {@link ${pkg.repository.url}}`,
  '*/',
].join('\n ')

const getBanner = (chunk: RenderedChunk) => bannerTemplate.replace('{MODULE}', chunk.fileName)

interface GitInfo {
  sha: string | null
  branch: string | null
  date: string | null
}

async function gitInfo(): Promise<GitInfo | null> {
  const options: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
  }
  const git: SimpleGit = simpleGit(options)

  try {
    const branchSummary = await git.branch()
    const sha = await git.revparse(['--short', 'HEAD'])
    const commit = (await git.log(['-1'])).latest

    const info: GitInfo = {
      sha: sha,
      branch: branchSummary.current,
      date: commit!.date,
    }
    return info
  } catch (error) {
    console.warn(`Error trying to retrieve git info: ${error}`)
    return null
  }
}

// inject source code information (git stuff)
const gitinfo = await gitInfo()

const gitInfoDefines =
  gitinfo !== null
    ? {
        'import.meta.env.GIT_INFO_SHA': JSON.stringify(gitinfo.sha),
        'import.meta.env.GIT_INFO_REF': JSON.stringify(gitinfo.branch),
        'import.meta.env.GIT_INFO_DATE': JSON.stringify(gitinfo.date),
      }
    : {}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    vuetify({
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    fonts({
      fontsource: {
        families: [
          {
            name: 'Roboto',
            weights: [100, 300, 400, 500, 700, 900],
            styles: ['normal', 'italic'],
          },
          // support of japanese/chinese/korean
          // https://github.com/podlove/podlove-subscribe-button/issues/110#issuecomment-292117885
        ],
      },
    }),
    vueDevTools(),
    visualizer({
      open: false,
      filename: 'bundle-visualization.html',
      emitFile: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        banner: getBanner,
      },
    },
    sourcemap: 'hidden',
  },
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.GIT_INFO_REPOSITORY': JSON.stringify(pkg.repository.url),
    ...gitInfoDefines,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
})
