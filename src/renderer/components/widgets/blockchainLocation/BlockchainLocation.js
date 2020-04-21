import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import Modal from '../../ui/Modal'

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.colors.white,
    border: 'none'
  },
  info: {
    marginTop: 38
  },
  button: {
    height: 70,
    fontSize: '0.9rem',
    backgroundColor: theme.palette.colors.zbayBlue
  },
  updateIcon: {
    width: 102,
    height: 102
  },
  title: {
    marginTop: 24,
    marginBottom: 16
  },
  subTitle: {
    textAlign: 'center',
    marginBottom: 32
  }
})

export const UpdateModal = ({ classes, open, handleSelection }) => {
  return (
    <Modal open={open} isCloseDisabled>
      <Grid container direction='column' className={classes.root} alignItems='center' justify='flex-start'>
        <Grid container item justify='center'>
          <Grid item className={classes.title}>
            <Typography variant='h3'>Zcash blockchain has been detected</Typography>
          </Grid>
        </Grid>
        <Grid container item justify='center'>
          <Grid item className={classes.subTitle}>
            <Typography variant='body2'>If you are using full Zcash node with standard configuration you can use it to run Zbay, otherwise Zbay can sync with blockchain network very fast using our built-in mechanism. </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={8} justify='center'>
          <Grid item xs={4}>
            <Button
              variant='contained'
              size='large'
              color='primary'
              type='submit'
              onClick={() => handleSelection('EXISTING')}
              fullWidth
              className={classes.button}
            >
        Use existing one
            </Button>
          </Grid>
          <Grid item xs={4}>
            <Button
              variant='contained'
              size='large'
              color='primary'
              type='submit'
              onClick={() => handleSelection('DOWNLOAD_NEW')}
              fullWidth
              className={classes.button}
            >
        Download full Zcash node
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  )
}

UpdateModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleSelection: PropTypes.func.isRequired
}

export default withStyles(styles)(UpdateModal)
