import React from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = {
  value: {
    fontSize: '20px'
  },
  title: {
    fontSize: '0.71rem'
  }
}

const UsdBalance = ({ classes, value }) => (
  <Grid container direction='column'>
    <Typography variant='body2' className={classes.title}>
      Available
    </Typography>
    <Typography variant='h5' className={classes.value}>
      ${R.isNil(value) ? '-' : value} USD
    </Typography>
  </Grid>
)

UsdBalance.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.string
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(UsdBalance)
