import { describe, expect, it } from 'vitest'
import { getRealName } from '../src/utils'
describe('esbuild', () => {
  it('should get real name', () => {
    const name = getRealName('* main ')
    expect(name).toEqual('main')
  })
})
