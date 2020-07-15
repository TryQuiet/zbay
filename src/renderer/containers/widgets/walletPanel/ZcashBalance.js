import React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'

import ZcashBalance from '../../../components/widgets/walletPanel/ZcashBalance'
import identitySelectors from '../../../store/selectors/identity'
import contactsSelectors from '../../../store/selectors/contacts'

export const mapStateToProps = state => ({
  usdBalance: identitySelectors
    .balance('usd')(state)
    .plus(identitySelectors.lockedBalance('usd')(state)),
  zecBalance: identitySelectors
    .balance('zec')(state)
    .plus(identitySelectors.lockedBalance('zec')(state)),
  usdLocked: identitySelectors.lockedBalance('usd')(state),
  zecLocked: identitySelectors.lockedBalance('zec')(state),
  pendingBalance: contactsSelectors.pendingBalance(state)
})

export default R.compose(React.memo, connect(mapStateToProps))(ZcashBalance)
