import { normalizeOptions } from '../src/options'
import { expect } from 'chai'
import * as path from 'path'

const ext = process.platform === 'win32' ? '.exe' : ''

describe('options', () => {
  describe('cwd', () => {
    it('should use process.cwd() if nothing is provided', () => {
      const options = normalizeOptions()
      expect(options.cwd).to.equal(process.cwd())
      expect(1).to.equal(3)
    })
    it('should use the main module in a package directory (if not in a TTY)', () => {
      const options = normalizeOptions()
      if (!process.stdin.isTTY) {
        expect(options.input).to.equal('[stdin]')
      } else {
        expect(options.input).to.equal(path.resolve('./index.js'))
      }
    })
    it('should resolve relative paths for input', () => {
      const options = normalizeOptions({ input: 'test/fixture/entry.js' })
      expect(options.input).to.equal(path.resolve('./test/fixture/entry.js'))
    })
    it('should accept a module entry as input', () => {
      const options = normalizeOptions({ input: 'test/fixture' })
      expect(options.input).to.equal(path.resolve('./test/fixture/entry.js'))
    })
    it('should resolve pathed options against cwd', () => {
      const cwd = path.join(process.cwd(), 'test/fixture')
      const options = normalizeOptions({
        cwd,
        input: 'entry',
        output: 'abc',
        temp: './d'
      })
      expect(options.temp).to.equal(path.resolve(cwd, './d'))
      expect(options.input).to.equal(path.resolve(cwd, 'entry.js'))
      expect(options.output).to.equal(path.resolve(cwd, `abc${ext}`))
    })
  })

  describe('remote', () => {
    it('should use default remote', () => {
      const options = normalizeOptions({})
      expect(options.remote).to.equal('https://github.com/nexe/nexe/releases/download/v3.3.3/')
    })
    it('should append trailing slash to third-party remote if necessary', () => {
      const options = normalizeOptions({
        remote: 'https://sitejs.org/nexe'
      })
      expect(options.remote).to.equal('https://sitejs.org/nexe/')
    })
    it('should not append trailing slash to third-party remote that already has one', () => {
      const options = normalizeOptions({
        remote: 'https://sitejs.org/nexe/'
      })
      expect(options.remote).to.equal('https://sitejs.org/nexe/')
    })
  })

  describe('output', () => {
    it('should work', () => {
      const options = normalizeOptions({
        output: './some-output'
      })
      expect(options.output).to.equal(path.resolve(`./some-output${ext}`))
    })
    it('should default to the input file name if not index', () => {
      const options = normalizeOptions({
        input: './test/fixture'
      })
      expect(options.output).to.equal(path.resolve(`./entry${ext}`))
    })
    it('should default to the folder/project name if filename is index', () => {
      const options = normalizeOptions({ cwd: './test/fixture2' })
      expect(options.output).to.equal(path.resolve(`./test/fixture2/fixture2${ext}`))
    })
  })
})
