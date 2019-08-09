import React from 'react'
import { storiesOf } from '@storybook/react'
import { withKnobs, boolean } from '@storybook/addon-knobs'
import SendMoneyModal from './SendMoneyModal'

storiesOf('Components/Widgets/SendMoneyModal', module)
  .addDecorator(withKnobs)
  .add('playground', () => {
    return <SendMoneyModal open={boolean('Disabled', true)} handleClose={() => {}} />
  })
