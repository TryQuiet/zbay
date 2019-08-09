import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    padding: 3 * theme.spacing.unit
  },
  divider: {
    color: theme.palette.primary.main,
    height: 2,
    width: '100%'
  },
  address: {
    wordBreak: 'break-all'
  }
})

export const SendMoneyTransactionDetails = ({
  classes,
  recipient,
  amountZec,
  amountUsd,
  feeZec,
  feeUsd,
  memo,
  handleSend
}) => {
  return (
    <Grid container className={classes.root} spacing={24}>
      <Grid item xs={12}>
        <Typography variant='body1'>Transaction Details</Typography>
      </Grid>
      <Divider className={classes.divider} />
      <Grid item xs={4}>
        <Typography variant='body1'>To</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='body1' className={classes.address}>
          {recipient}
        </Typography>
      </Grid>
      <Divider className={classes.divider} />
      <Grid item xs={4}>
        <Typography variant='body1'>Amount</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='body1'>
          {amountZec} ZEC (${amountUsd} USD)
        </Typography>
      </Grid>
      <Divider className={classes.divider} />
      <Grid item xs={4}>
        <Typography variant='body1'>Fee</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='body1'>${feeUsd}</Typography>
      </Grid>
      <Divider className={classes.divider} />
      <Grid item xs={4}>
        <Typography variant='body1'>Note</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='body1'>{memo}</Typography>
      </Grid>
      <Divider className={classes.divider} />
      <Grid item xs={4}>
        <Typography variant='body1'>Total</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant='body1'>
          {amountZec + feeZec} ZEC (${amountUsd + feeUsd} USD)
        </Typography>
      </Grid>
    </Grid>
  )
}

SendMoneyTransactionDetails.propTypes = {
  classes: PropTypes.object.isRequired
}

SendMoneyTransactionDetails.defaultProps = {}

export default withStyles(styles)(SendMoneyTransactionDetails)
