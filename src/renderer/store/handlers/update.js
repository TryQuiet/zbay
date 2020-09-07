import { ipcRenderer } from 'electron'
import { actionCreators } from './modals'
import { createMigrationFile } from './identity'
import vaultHandlers from './vault'
import electronStore from '../../../shared/electronStore'
import nodeSelectors from '../selectors/node'

export const checkForUpdate = () => async (dispatch, getState) => {
  // create file on new update
  // Note it will recreate file on each new update so file will be up to date
  try {
    const vaultPassword = electronStore.get('vaultPassword')
    if (vaultPassword) {
      const network = nodeSelectors.network(getState())
      await dispatch(
        vaultHandlers.actions.unlockVault({
          masterPassword: vaultPassword,
          network,
          ignoreError: true
        })
      )
      await dispatch(createMigrationFile())
    }
  } catch (error) {
    console.log('vault already initialized')
  }

  dispatch(actionCreators.openModal('applicationUpdate')())
}

export const startApplicationUpdate = () => async (dispatch, getState) => {
  ipcRenderer.send('proceed-update')
  dispatch(actionCreators.closeModal('applicationUpdate')())
}

export const declineUpdate = () => async (dispatch, getState) => {
  dispatch(actionCreators.closeModal('applicationUpdate')())
}

export const epics = {
  checkForUpdate,
  startApplicationUpdate,
  declineUpdate
}

export default {
  epics
}
