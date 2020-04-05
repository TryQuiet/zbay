import React, { useState } from 'react'
import * as R from 'ramda'
import classnames from 'classnames'
import { AutoSizer } from 'react-virtualized'
import { Scrollbars } from 'react-custom-scrollbars'
import { shell } from 'electron'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import { Typography } from '@material-ui/core'

import IconButton from '../../ui/IconButton'
import Icon from '../../ui/Icon'
import ExitIcon from '../../../static/images/logs/exit.svg'

const styles = theme => ({
  root: {
    width: '315px',
    height: '100vh',
    backgroundColor: theme.palette.colors.logsActiveDark
  },
  title: {
    lineHeight: '18px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: theme.palette.colors.logsTitleGray,
    marginTop: 20
  },
  topBar: {
    width: '100%',
    height: 58,
    paddingLeft: 20,
    paddingRight: 25,
    backgroundColor: theme.palette.colors.logsDark
  },
  iconButton: {
    marginTop: 20,
    padding: 0
  },
  tabBar: {
    color: theme.palette.colors.logsTitleGray,
    backgroundColor: theme.palette.colors.logsDark
  },
  tab: {
    marginRight: 1,
    cursor: 'pointer',
    padding: '4px 16px',
    backgroundColor: theme.palette.colors.logsInactiveDark
  },
  tabText: {
    lineHeight: '18px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: theme.palette.colors.logsTabWhite
  },
  activeTab: {
    backgroundColor: theme.palette.colors.logsActiveDark
  },
  mainLogsWindow: {
    margin: '8px 0px',
    width: '315px',
    height: '100vh',
    backgroundColor: theme.palette.colors.logsActiveDark
  },
  logsItem: {
    width: '100%',
    padding: '0px 8px',
    cursor: 'pointer'
  },
  logsLine: {
    fontFamily: 'Menlo Regular',
    lineHeight: '18px',
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: theme.palette.colors.logsTitleGray,
    wordWrap: 'break-word'
  }
})

const LogsTypes = {
  TRANSACTIONS: 'TRANSACTIONS',
  RPC_CALLS: 'RPC_CALLS',
  NODE_DEBUG: 'NODE_DEBUG'
}

export const LogsComponent = ({ classes, debugLogs, closeLogsWindow, rpcCallsLogs, transactionsLogs }) => {
  const logs = {
    [LogsTypes.TRANSACTIONS]: transactionsLogs,
    [LogsTypes.NODE_DEBUG]: debugLogs,
    [LogsTypes.RPC_CALLS]: rpcCallsLogs
  }
  const [currentActiveTab, setActiveTab] = useState(LogsTypes.NODE_DEBUG)
  return (
    <Grid container className={classes.root} alignContent={'flex-start'} item>
      <Grid container className={classes.topBar} justify={'space-between'} item>
        <Grid item>
          <Typography variant={'subtitle1'} className={classes.title}>Logs</Typography>
        </Grid>
        <Grid item>
          <IconButton className={classes.iconButton} onClick={closeLogsWindow}>
            <Icon src={ExitIcon} />
          </IconButton>
        </Grid>
      </Grid>
      <Grid container direction={'row'} className={classes.tabBar} justify={'flex-start'} wrap={'nowrap'} item>
        <Grid item onClick={() => setActiveTab(LogsTypes.TRANSACTIONS)} className={classnames(classes.tab, {
          [classes.activeTab]: currentActiveTab === LogsTypes.TRANSACTIONS
        })}>
          <Typography variant={'caption'} className={classes.tabText}>Transactions</Typography>
        </Grid>
        <Grid item onClick={() => setActiveTab(LogsTypes.NODE_DEBUG)} className={classnames(classes.tab, {
          [classes.activeTab]: currentActiveTab === LogsTypes.NODE_DEBUG
        })}>
          <Typography variant={'caption'} className={classes.tabText}>Logs</Typography>
        </Grid>
        <Grid item onClick={() => setActiveTab(LogsTypes.RPC_CALLS)} className={classnames(classes.tab, {
          [classes.activeTab]: currentActiveTab === LogsTypes.RPC_CALLS
        })}>
          <Typography variant={'caption'} className={classes.tabText}>RPC Requests</Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.mainLogsWindow} item>
        <AutoSizer>
          {({ width, height }) => (
            <Scrollbars
              autoHideTimeout={500}
              style={{ width: width, height: height }}
            >
              {logs[currentActiveTab].map((logLine, i) => <Grid item onClick={() => shell.openExternal(`https://explorer.zcha.in/transactions/${logLine}`)} className={classes.logsItem}><Typography className={classes.logsLine} variant={'caption'} key={i}>{logLine}</Typography></Grid>)}
            </Scrollbars>
          )}
        </AutoSizer>
      </Grid>
    </Grid>
  )
}

LogsComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  debugLogs: PropTypes.instanceOf(Immutable.List).isRequired,
  rpcCallsLogs: PropTypes.instanceOf(Immutable.List).isRequired,
  transactionsLogs: PropTypes.instanceOf(Immutable.List).isRequired,
  closeLogsWindow: PropTypes.func.isRequired
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(LogsComponent)
