import { describe, expect, it } from 'vitest'
import { getRealName } from '../src/utils'
describe('esbuild', () => {
  it('should get real name', () => {
    const name = getRealName(`
      copyrelease
    * devel
      master
      release`)
    expect(name).toEqual('devel')
  })
})
