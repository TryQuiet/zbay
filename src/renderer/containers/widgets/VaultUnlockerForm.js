import React, { useEffect, useState } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import vaultHandlers from '../../store/handlers/vault'
import nodeHandlers from '../../store/handlers/node'
import vaultSelectors from '../../store/selectors/vault'
import nodeSelectors from '../../store/selectors/node'
import identitySelectors from '../../store/selectors/identity'
import VaultUnlockerFormComponent from '../../components/widgets/VaultUnlockerForm'
import { useInterval } from '../hooks'
import torSelectors from '../../store/selectors/tor'
import torHandlers from '../../store/handlers/tor'
import electronStore from '../../../shared/electronStore'

export const mapStateToProps = state => ({
  unlocking: vaultSelectors.unlocking(state),
  isLogIn: vaultSelectors.isLogIn(state),
  locked: vaultSelectors.locked(state),
  loader: identitySelectors.loader(state),
  nodeConnected: nodeSelectors.isConnected(state),
  exists: vaultSelectors.exists(state),
  tor: torSelectors.tor(state),
  node: nodeSelectors.node(state)
})

export const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      onSubmit: vaultHandlers.epics.unlockVault,
      setVaultIdentity: vaultHandlers.epics.setVaultIdentity,
      getStatus: nodeHandlers.epics.getStatus,
      createZcashNode: torHandlers.epics.createZcashNode
    },
    dispatch
  )
export const VaultUnlockerForm = ({
  locked,
  setVaultIdentity,
  getStatus,
  loader,
  nodeConnected,
  tor,
  createZcashNode,
  node,
  isLogIn,
  exists,
  ...props
}) => {
  const [done, setDone] = useState(true)
  useEffect(
    () => {
      const isNewUser = electronStore.get('isNewUser')
      if (!isNewUser && !locked && nodeConnected) {
        setVaultIdentity()
      }
    },
    [locked, nodeConnected]
  )
  useEffect(
    () => {
      if (!locked) {
        createZcashNode(tor.url)
      }
    },
    [locked]
  )
  useEffect(
    () => {
      if (!locked && !loader.loading) {
        setDone(true)
      }
    },
    [loader.loading]
  )

  useInterval(getStatus, 5000)
  return (
    <VaultUnlockerFormComponent
      locked={locked}
      loader={loader}
      done={done}
      tor={tor}
      exists={exists}
      setDone={setDone}
      nodeConnected={nodeConnected}
      node={node}
      isLogIn={isLogIn}
      {...props}
    />
  )
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VaultUnlockerForm)
