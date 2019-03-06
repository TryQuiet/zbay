import React from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = {
}

export const WalletPanel = ({ classes }) => (
  <Grid container direction='column' className={classes.root}>
    <Typography>
      Available
    </Typography>
    <Grid item>
      <Grid container direction='row' justify='space-between'>
        <Typography>
          $2,366 USD
        </Typography>
        <Typography>
          z 33.5830004
        </Typography>
      </Grid>
    </Grid>
  </Grid>
)

WalletPanel.propTypes = {
  classes: PropTypes.object.isRequired
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(WalletPanel)
