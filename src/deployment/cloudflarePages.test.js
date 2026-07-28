import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

import { describe, expect, it } from 'vitest'

const projectFile = (relativePath) => resolve(cwd(), relativePath)

const readProjectFile = (relativePath) => readFileSync(projectFile(relativePath), 'utf8')

describe('Cloudflare Pages deployment contract', () => {
  it('pins the Node version supported by Vite 8', () => {
    expect(readProjectFile('.node-version').trim()).toBe('22.16.0')
  })

  it('preserves Vue Router history routes on direct requests', () => {
    expect(readProjectFile('public/_redirects').trim()).toBe('/* /index.html 200')
  })

  it('allows geolocation for the deployed application origin', () => {
    expect(readProjectFile('public/_headers')).toContain(
      'Permissions-Policy: geolocation=(self)'
    )
  })

  it('remains a single static Vue project', () => {
    const packageJson = JSON.parse(readProjectFile('package.json'))

    expect(packageJson.name).toBe('fit5032-lab11')
    expect(packageJson.scripts.start).toBeUndefined()
    expect(packageJson.dependencies.express).toBeUndefined()
  })
})
