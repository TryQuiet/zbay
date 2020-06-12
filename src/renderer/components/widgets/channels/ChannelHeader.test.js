import React from 'react'
import Immutable from 'immutable'
import { shallow } from 'enzyme'

import { ChannelHeader } from './ChannelHeader'
import { mockClasses } from '../../../../shared/testing/mocks'
import { createChannel } from '../../../testUtils'

describe('ChannelHeader', () => {
  it('renders component', () => {
    const channel = Immutable.fromJS(createChannel(1))
    const result = shallow(
      <ChannelHeader
        tab={0}
        setTab={() => {}}
        unmute={() => {}}
        mutedFlag
        classes={mockClasses}
        channel={channel}
        members={null}
        isRegisteredUsername
      />
    )
    expect(result).toMatchSnapshot()
  })

  it('renders without members count', () => {
    const channel = Immutable.fromJS(createChannel(1))
    const result = shallow(
      <ChannelHeader
        classes={mockClasses}
        tab={0}
        setTab={() => {}}
        channel={channel}
        members={new Set([1, 2, 3, 4])}
        unmute={() => {}}
        mutedFlag
        isRegisteredUsername
      />
    )
    expect(result).toMatchSnapshot()
  })

  it('renders members when 0', () => {
    const channel = Immutable.fromJS(createChannel(1))
    const result = shallow(
      <ChannelHeader
        classes={mockClasses}
        tab={0}
        setTab={() => {}}
        channel={channel}
        members={new Set()}
        unmute={() => {}}
        mutedFlag
        isRegisteredUsername
      />
    )
    expect(result).toMatchSnapshot()
  })
})
