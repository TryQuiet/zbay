/* eslint import/first: 0 */

import { mapDispatchToProps } from './RegistrationGuide'

jest.mock('../../../shared/electronStore', () => ({
  set: () => {},
  get: () => {}
}))

describe('SyncLoader', () => {
  it('will receive right actions', async () => {
    const actions = mapDispatchToProps(x => x)
    expect(actions).toMatchSnapshot()
  })
})
