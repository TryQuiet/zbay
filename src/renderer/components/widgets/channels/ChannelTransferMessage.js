import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { DateTime } from 'luxon'
import classNames from 'classnames'
import * as R from 'ramda'

import Grid from '@material-ui/core/Grid'
import Link from '@material-ui/core/Link'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import ListItem from '@material-ui/core/ListItem'
import Collapse from '@material-ui/core/Collapse'
import ListItemText from '@material-ui/core/ListItemText'
import CircularProgress from '@material-ui/core/CircularProgress'
import { withStyles } from '@material-ui/core/styles'

import red from '@material-ui/core/colors/red'
import lightGreen from '@material-ui/core/colors/lightGreen'

import DoneIcon from '@material-ui/icons/Done'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import BlockIcon from '@material-ui/icons/Block'

import { getZbayAddress } from '../../../zbay/channels'
import { _DisplayableMessage } from '../../../zbay/messages'
import Elipsis from '../../ui/Elipsis'
import ChannelMessageActions from './ChannelMessageActions'

import ZecBalance from '../walletPanel/ZecBalance'
import SpinnerLoaderComponent from '../../ui/SpinnerLoader'
import BigNumber from 'bignumber.js'

const styles = theme => ({
  messageCard: {
    padding: 0
  },
  transactionCard: {
    paddingTop: theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  wrapper: {
    background: '#fff',
    marginBottom: theme.spacing.unit
  },
  clickable: {
    cursor: 'pointer'
  },
  wrapperPending: {
    background: '#eeeeee'
  },
  username: {
    fontSize: '0.855rem'
  },
  message: {
    fontSize: '0.855rem',
    marginTop: theme.spacing.unit,
    whiteSpace: 'pre-line'
  },
  statusIcon: {
    color: theme.typography.caption.color,
    fontSize: '0.95rem',
    marginLeft: theme.spacing.unit
  },
  broadcasted: {
    color: lightGreen[600]
  },
  failed: {
    color: red[500]
  },
  divider: {
    minWidth: `calc(100% + ${4 * theme.spacing.unit}px)`,
    marginLeft: -2 * theme.spacing.unit,
    color: theme.palette.primary.main,
    height: 2
  },
  link: {
    color: theme.palette.colors.blue
  },
  info: {
    paddingTop: theme.spacing.unit
  }
})

const statusComponent = {
  broadcasted: DoneAllIcon,
  pending: props => <CircularProgress size={12} {...props} />,
  success: DoneIcon,
  failed: ErrorIcon,
  cancelled: BlockIcon
}

const getTimeFormat = time => {
  const today = DateTime.utc()
  if (time.hasSame(today, 'day')) {
    return 'T'
  } else if (time.hasSame(today, 'week')) {
    return 'ccc, HH:mm'
  } else if (time.hasSame(today, 'year')) {
    return 'LLL dd, HH:mm'
  }
  return 'LLL dd, y, HH:mm'
}

export const ChannelTransferMessage = ({
  classes,
  message,
  rateUsd,
  onResend,
  onReply,
  onCancel
}) => {
  const tnx = message.get('id')
  const fromYou = message.get('fromYou', false)
  const [actionsOpen, setActionsOpen] = useState(null)
  const sender = message.get('sender')
  const username = sender.get('username', 'Unnamed')
  const address = getZbayAddress(sender.get('replyTo'))
  const spentZec = message.get('spent')
  const spentUsd = rateUsd.times(new BigNumber(message.get('spent') || 0)).toFormat(2)
  const info = message.get('message')

  const time = DateTime.fromSeconds(message.get('createdAt'))
  const timeFormat = getTimeFormat(time)
  const timeString = time.toFormat(timeFormat)

  const status = message.get('status', 'broadcasted')
  const StatusIcon = statusComponent[status]
  const error = message.get('error')

  return (
    <ListItem
      className={classNames({
        [classes.wrapper]: true,
        [classes.clickable]: ['failed', 'cancelled'].includes(status),
        [classes.wrapperPending]: status !== 'broadcasted'
      })}
      alignItems='flex-start'
      onClick={() => setActionsOpen(!actionsOpen)}
    >
      <ListItemText
        disableTypography
        className={classes.messageCard}
        primary={
          <Grid container direction='row' justify='space-between' alignItems='flex-start'>
            <Grid item>
              <Typography color='textPrimary' className={classes.username}>
                {username}
                {fromYou ? ' (You)' : null}
              </Typography>
              <Typography variant='caption'>{address.substring(0, 32)}...</Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' alignItems='center' justify='flex-end'>
                <Typography variant='caption'>{timeString}</Typography>
                <StatusIcon
                  className={classNames({
                    [classes.statusIcon]: true,
                    [classes.failed]: status === 'failed',
                    [classes.broadcasted]: status === 'broadcasted'
                  })}
                />
              </Grid>
              {status === 'failed' ? (
                <Elipsis
                  interactive
                  content={`Error ${error.code}: ${error.message}`}
                  tooltipPlacement='bottom'
                  length={60}
                  classes={{ content: classes.failed }}
                />
              ) : null}
            </Grid>
          </Grid>
        }
        secondary={
          <React.Fragment>
            <Divider className={classes.divider} />
            <Grid container direction='column' justify='space-evenly' alignItems='center'>
              <Grid
                container
                direction='column'
                justify='space-evenly'
                alignItems='center'
                className={classes.transactionCard}
              >
                <Grid item xs={12}>
                  <Typography variant='display2'>${spentUsd}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <ZecBalance value={spentZec} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='title'>Send to :</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='title'>{fromYou ? 'You' : username}</Typography>
                </Grid>
                <Grid item xs={12}>
                  {showStatusInfo({ status, classes, tnx, error })}
                </Grid>
              </Grid>
              <Divider className={classes.divider} />
              <Grid
                container
                direction='row'
                alignItems='center'
                justify='flex-start'
                className={classes.info}
              >
                <Grid item xs={12}>
                  <Typography variant='Body 2'>{info}</Typography>{' '}
                </Grid>
              </Grid>
              <Collapse in timeout='auto'>
                <ChannelMessageActions
                  onReply={() => onReply(message)}
                  onResend={() => onResend(message)}
                  onCancel={onCancel}
                  fromYou={fromYou}
                  status={status}
                />
              </Collapse>
            </Grid>
          </React.Fragment>
        }
      />
    </ListItem>
  )
}

const showStatusInfo = ({ status, classes, tnx, error }) => {
  switch (status) {
    case 'broadcasted':
      return (
        <Link
          onClick={
            () => {} // send to address
          }
          variant='body1'
          className={classes.link}
        >
          {tnx}
        </Link>
      )
    case 'failed':
      return (
        <Elipsis
          interactive
          content={`Error ${error.code}: ${error.message}`}
          tooltipPlacement='bottom'
          length={60}
          classes={{ content: classes.failed }}
        />
      )
    case 'cancelled':
      return (
        <Elipsis
          interactive
          content={`Cancelled`}
          tooltipPlacement='bottom'
          length={60}
          classes={{ content: classes.failed }}
        />
      )
    case 'success':
      return (
        <SpinnerLoaderComponent
          message={`Waiting for transaction to be mined 
    ID: ${tnx}`}
        />
      )
    default:
      return <SpinnerLoaderComponent message={'Loading Transaction Id'} />
  }
}

ChannelTransferMessage.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.instanceOf(_DisplayableMessage).isRequired,
  onResend: PropTypes.func,
  onCancel: PropTypes.func,
  onReply: PropTypes.func,
  rateUsd: PropTypes.instanceOf(BigNumber)
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(ChannelTransferMessage)
