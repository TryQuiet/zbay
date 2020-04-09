import React, { useEffect } from 'react'
import { bindActionCreators } from 'redux'
import { Redirect } from 'react-router'
import { connect } from 'react-redux'

import vaultSelectors from '../../store/selectors/vault'
import nodeSelectors from '../../store/selectors/node'
import vaultHandlers from '../../store/handlers/vault'
import UnlockVault from './UnlockVault'
import SpinnerLoader from '../../components/ui/SpinnerLoader'
import torHandlers from '../../store/handlers/tor'

export const mapStateToProps = state => ({
  exists: vaultSelectors.exists(state),
  nodeConnected: nodeSelectors.isConnected(state)
})

export const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadVaultStatus: vaultHandlers.epics.loadVaultStatus,
      createZcashNode: torHandlers.epics.createZcashNode
    },
    dispatch
  )

export const Vault = ({ loadVaultStatus, createZcashNode, exists, nodeConnected, createVault }) => {
  useEffect(() => {
    loadVaultStatus()
  })
  useEffect(() => {
    if (exists === false && !nodeConnected) {
      createZcashNode()
    }
  }, [exists])
  if (exists === false) {
    console.log('working redirecting')
    return <Redirect to='/loading' />
  } else {
    if (exists === true) {
      return <UnlockVault />
    }
  }
  return <SpinnerLoader size={80} />
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Vault)
