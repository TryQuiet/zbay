// import { createSelector } from 'reselect'
// import identitySelectors from './identity'
// import directMessagesQueueSelectors from './directMessagesQueue'
// import operationsSelectors from './operations'
// import messagesSelectors from './messages'
// import zbayMessages from '../../zbay/messages'
// import { operationTypes } from '../handlers/operations'

// const store = s => s

// const channel = createSelector(store, state => state.get('channel'))

// export const messages = createSelector(
//   identitySelectors.data,
//   currentChannelMessages,
//   pendingMessages,
//   queuedMessages,
//   (identity, receivedMessages, pendingMessages, queuedMessages) => {
//     const identityAddress = identity.address
//     const displayableBroadcasted = receivedMessages.map(
//       message => zbayMessages.receivedToDisplayableMessage({ message, identityAddress })
//     )

//     const displayablePending = pendingMessages.map(
//       operation => zbayMessages.operationToDisplayableMessage({ operation, identityAddress })
//     )

//     const displayableQueued = queuedMessages.map(
//       (queuedMessage, messageKey) => zbayMessages.queuedToDisplayableMessage({
//         queuedMessage, messageKey, identityAddress
//       })
//     )
//     return displayableBroadcasted.concat(
//       displayablePending.values(),
//       displayableQueued.values()
//     ).sortBy(m => m.get('createdAt'))
//   }
// )
