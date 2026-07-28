import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'

import { describe, expect, it } from 'vitest'

const workflow = readFileSync(
  resolve(cwd(), '.github/workflows/pages-deployment.yml'),
  'utf8'
)

describe('GitHub Actions deployment contract', () => {
  it('supports main-branch pushes and manual evidence runs', () => {
    expect(workflow).toContain('push:')
    expect(workflow).toContain('- main')
    expect(workflow).toContain('workflow_dispatch:')
  })

  it('uses the pinned project Node version and locked dependencies', () => {
    expect(workflow).toContain('actions/checkout@v6')
    expect(workflow).toContain('actions/setup-node@v6')
    expect(workflow).toContain('node-version-file: .node-version')
    expect(workflow).toContain('run: npm ci')
  })

  it('gates deployment behind verification and a production audit', () => {
    expect(workflow).toContain('run: npm run verify')
    expect(workflow).toContain('npm audit --omit=dev --audit-level=high')
    expect(workflow.indexOf('run: npm run verify')).toBeLessThan(
      workflow.indexOf('cloudflare/wrangler-action@v3')
    )
  })

  it('deploys the verified dist directory to the Lab 12 Pages project', () => {
    expect(workflow).toContain('cloudflare/wrangler-action@v3')
    expect(workflow).toContain(
      'pages deploy dist --project-name=fit5032-lab12 --branch=main'
    )
    expect(workflow).toContain('gitHubToken: ${{ secrets.GITHUB_TOKEN }}')
  })

  it('smoke tests the exact deployment URL returned by Wrangler', () => {
    expect(workflow).toContain(
      'LAB12_PRODUCTION_URL: ${{ steps.deploy.outputs.deployment-url }}'
    )
    expect(workflow).toContain('run: npm run verify:production')
  })

  it('references GitHub Secrets without embedding credential values', () => {
    expect(workflow).toContain('${{ secrets.CLOUDFLARE_API_TOKEN }}')
    expect(workflow).toContain('${{ secrets.CLOUDFLARE_ACCOUNT_ID }}')
    expect(workflow).toContain('${{ secrets.VITE_OPENWEATHER_API_KEY }}')
    expect(workflow).not.toMatch(/cfut_[A-Za-z0-9_-]+/)
    expect(workflow).not.toMatch(/CLOUDFLARE_ACCOUNT_ID:\s*[0-9a-f]{32}/i)
  })
})
