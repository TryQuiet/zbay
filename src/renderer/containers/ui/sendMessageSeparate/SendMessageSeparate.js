import React from 'react'
import * as R from 'ramda'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { withModal, actionCreators } from '../../../store/handlers/modals'
import SendMessageModalComponent from '../../../components/ui/sendMessageSeparate/SendMessageSeparateMain'
import identitySelector from '../../../store/selectors/identity'
import directMessages from '../../../store/handlers/contacts'
import transfers from '../../../store/handlers/directMessagesQueue'
import userSelectors from '../../../store/selectors/users'

export const mapStateToProps = state => ({
  balanceZec: identitySelector.balance('zec')(state),
  userData: identitySelector.data(state),
  users: userSelectors.users(state),
  nickname: userSelectors.registeredUser(
    identitySelector.signerPubKey(state)
  )(state)
    ? userSelectors
      .registeredUser(identitySelector.signerPubKey(state))(state)
      .get('nickname')
    : ''
})

export const SendMessageSeparateModal = props => {
  return <SendMessageModalComponent {...props} />
}
export const mapDispatchToProps = dispatch => bindActionCreators({
  sendMessageHandler: directMessages.epics.sendDirectMessage,
  openSentFundsModal: (payload) => actionCreators.openModal('sentFunds', payload)(),
  sendPlainTransfer: (payload) => transfers.epics.sendPlainTransfer(payload)
}, dispatch)

export default R.compose(
  connect(mapStateToProps, mapDispatchToProps),
  withModal('newMessageSeparate'),
  React.memo
)(SendMessageSeparateModal)
