/* eslint import/first: 0 */
import React from 'react'
import { shallow } from 'enzyme'
import Immutable from 'immutable'

import { LogsComponent } from './Logs'
import { mockClasses } from '../../../../shared/testing/mocks'

describe('LogsComponent', () => {
  it('renders component', () => {
    const result = shallow(
      <LogsComponent
        open
        classes={mockClasses}
        debugLogs={Immutable.fromJS([])}
        closeLogsWindow={jest.fn()}
        rpcCallsLogs={Immutable.fromJS([])}
        transactionsLogs={Immutable.fromJS([])}
      />
    )
    expect(result).toMatchSnapshot()
  })
})
