import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import * as R from 'ramda'
import classnames from 'classnames'

import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import WindowWrapper from '../ui/WindowWrapper'
import Sidebar from '../widgets/sidebar/Sidebar'
import Channel from '../../containers/pages/Channel'
import Offer from '../../containers/pages/Offer'
import DirectMessages from '../../containers/pages/DirectMessages'
import DepositMoneyModal from '../../containers/ui/DepositMoneyModal'
import LogsContainer from '../../containers/widgets/logs/Logs'
import electronStore from '../../../shared/electronStore'

const styles = {
  gridRoot: {
    'min-height': '100vh',
    'min-width': '100vw',
    overflow: 'hidden',
    position: 'relative'
  },
  logsContainer: {
    'z-index': 2000,
    position: 'absolute',
    top: 0,
    right: 0
  }
}

export const Main = ({ match, classes, disablePowerSleepMode, isLogWindowOpened }) => {
  const debounce = (fn, ms) => {
    let timer
    return _ => {
      clearTimeout(timer)
      timer = setTimeout(_ => {
        timer = null
        fn.apply(this) // // eslint-disable-line
      }, ms)
    }
  }
  const [dimensions, setDimensions] = React.useState({
    height: window.innerHeight,
    width: window.innerWidth
  })
  useEffect(() => {
    const debouncedHandleResize = debounce(function handleResize () {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth
      })
    }, 1000)

    window.addEventListener('resize', debouncedHandleResize)

    return _ => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })
  useEffect(() => {
    electronStore.set('isNewUser', false)
    electronStore.set('AppStatus.blockchain.isRescanned', true)
    disablePowerSleepMode()
  }, [])
  return (
    <>
      <DepositMoneyModal />
      <WindowWrapper>
        <Grid container direction='row' className={classes.gridRoot}>
          <Grid item>
            <Sidebar />
          </Grid>
          <Grid item xs>
            <Route path={`${match.url}/channel/:id`} component={Channel} />
            <Route path={`${match.url}/direct-messages/:id/:username`} component={DirectMessages} />
            <Route path={`${match.url}/offers/:id/:address`} component={Offer} />
          </Grid>
          {isLogWindowOpened && (
            <Grid className={classnames({
              [classes.logsContainer]: dimensions.width <= 900
            })} item>
              <LogsContainer height={dimensions.height} />
            </Grid>
          )}
        </Grid>
      </WindowWrapper>
    </>
  )
}

Main.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.shape({
    url: PropTypes.string.isRequired
  }).isRequired
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(Main)
