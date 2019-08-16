import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import channelsHandlers from '../../store/handlers/channel'
import ChannelComponent from '../../components/pages/Channel'

export const mapDispatchToProps = dispatch => bindActionCreators({
  loadRecipientAddress: channelsHandlers.actions.setDirectMessageRecipientAddress,
  loadRecipientUsername: channelsHandlers.actions.setDirectMessageRecipientUsername
}, dispatch)

const DirectMessages = ({ match, loadRecipientUsername, loadRecipientAddress }) => {
  loadRecipientAddress(match.params.id)
  loadRecipientUsername(match.params.username)
  return <ChannelComponent contactId={match.params.id} />
}

export default connect(null, mapDispatchToProps)(DirectMessages)
