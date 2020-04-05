import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as R from 'ramda'

import logsHandlers from '../../../store/handlers/logs'
import logsSelectors from '../../../store/selectors/logs'

import Logs from '../../../components/widgets/logs/Logs'

export const mapStateToProps = state => ({
  debugLogs: logsSelectors.nodeLogs(state),
  rpcCallsLogs: logsSelectors.rpcCallsLogs(state),
  transactionsLogs: logsSelectors.transactionsLogs(state)
})

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      closeLogsWindow: logsHandlers.epics.closeLogsWindow
    },
    dispatch
  )

export const LogsContainer = ({ debugLogs, closeLogsWindow, rpcCallsLogs, transactionsLogs }) => <Logs debugLogs={debugLogs} closeLogsWindow={closeLogsWindow} rpcCallsLogs={rpcCallsLogs} transactionsLogs={transactionsLogs} />

export default R.compose(
  connect(mapStateToProps, mapDispatchToProps)
)(LogsContainer)
