import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import directMessageChannel from '../../store/handlers/directMessageChannel'
import ChannelComponent from '../../components/pages/Channel'

export const mapDispatchToProps = dispatch => bindActionCreators({
  loadRecipientAddress: directMessageChannel.actions.setDirectMessageRecipientAddress,
  loadRecipientUsername: directMessageChannel.actions.setDirectMessageRecipientUsername
}, dispatch)

const DirectMessages = ({ match, loadRecipientUsername, loadRecipientAddress }) => {
  loadRecipientAddress(match.params.id)
  loadRecipientUsername(match.params.username)
  return <ChannelComponent contactId={match.params.id} />
}

export default connect(null, mapDispatchToProps)(DirectMessages)
