// import { createSelector } from 'reselect'
// import Immutable from 'immutable'
// import identitySelectors from './identity'
// import directMssagesQueueSelectors from './messagesQueue'
// import zbayMessages from '../../zbay/messages'
// import operationsSelectors from './operations'

// export const Contact = Immutable.Record({
//   lastSeen: null,
//   username: '',
//   address: '',
//   messages: Immutable.List(),
//   newMessages: Immutable.List(),
//   vaultMessages: Immutable.List()
// })

// const store = s => s

// const contacts = createSelector(store, state => state.get('contacts'))
// const contact = address => createSelector(contacts, c => c.get(address, Contact()))
// const messages = address => createSelector(contact(address), c => c.messages)
// const lastSeen = address => createSelector(contact(address), c => c.lastSeen)
// const username = address => createSelector(contact(address), c => c.username)
// const vaultMessages = address => createSelector(contact(address), c => c.vaultMessages)

// export const queuedMessages = address => createSelector(
//   directMssagesQueueSelectors.queue,
//   address,
//   (queue, recipientAddress) => queue.filter(m => m.recipientAddress === recipientAddress)
// )

// export const pendingMessages = address => createSelector(
//   operationsSelectors.operations,
//   address,
//   (operations, recipientAddress) => operations.filter(
//     o => o.type === operationTypes.pendingDirectMessage && o.meta.recipientAddress === channel.recipientAddress
//   )
// )

// export const messages = createSelector(
//   identitySelectors.data,
//   messages,
//   vaultMessages,
//   pendingMessages,
//   queuedMessages,
//   (identity, messages, vaultMessages, pendingMessages, queuedMessages) => {
//     const identityAddress = identity.address

//     const displayablePending = pendingMessages.map(
//       operation => zbayMessages.operationToDisplayableMessage({ operation, identityAddress })
//     )

//     const displayableQueued = queuedMessages.map(
//       (queuedMessage, messageKey) => zbayMessages.queuedToDisplayableMessage({
//         queuedMessage, messageKey, identityAddress
//       })
//     )
//     return messages.concat(
//       vaultMessages.values(),
//       displayableQueued.values(),
//       displayablePending.values()
//     ).sortBy(m => m.get('createdAt'))
//   }
// )

// export default {
//   contacts,
//   contact,
//   messages,
//   lastSeen,
//   vaultMessages,
//   username
// }
