import { createSelector } from 'reselect'

const store = s => s

export const logs = createSelector(store, state => state.get('logsData'))

const rpcCallsLogs = createSelector(logs, a => a.rpcCallsLogs)
const transactionsLogs = createSelector(logs, a => a.transactionLogs)
const nodeLogs = createSelector(logs, a => a.nodeLogs)
const islogsFileLoaded = createSelector(logs, a => a.islogsFileLoaded)
const isLogWindowOpened = createSelector(logs, a => a.isLogWindowOpened)

export default {
  rpcCallsLogs,
  transactionsLogs,
  nodeLogs,
  islogsFileLoaded,
  isLogWindowOpened
}
