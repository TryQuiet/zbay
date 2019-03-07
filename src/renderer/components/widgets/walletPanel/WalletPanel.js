import React from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import WalletPanelActions from './WalletPanelActions'
import ZecBalance from './ZecBalance'
import UsdBalance from './UsdBalance'

const styles = theme => ({
  root: {
    paddingLeft: 2 * theme.spacing.unit,
    paddingTop: 2.5 * theme.spacing.unit,
    paddingRight: 4 * theme.spacing.unit,
    paddingBottom: theme.spacing.unit
  },
  actions: {
    marginTop: 2 * theme.spacing.unit
  },
  zec: {
    paddingTop: 2 * theme.spacing.unit
  }
})

export const WalletPanel = ({ classes }) => (
  <Grid container direction='column' className={classes.root}>
    <Grid item>
      <Grid container direction='row' justify='space-between' alignItems='center' >
        <Grid item>
          <UsdBalance value='2,366' />
        </Grid>
        <Grid item className={classes.zec}>
          <ZecBalance value='33.583004' />
        </Grid>
      </Grid>
    </Grid>
    <Grid item className={classes.actions}>
      <WalletPanelActions onSend={() => null} onReceive={() => null} />
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
