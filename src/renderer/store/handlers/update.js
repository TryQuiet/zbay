import { ipcRenderer } from 'electron'
import { actionCreators } from './modals'
import { createMigrationFile } from './identity'
export const checkForUpdate = () => async (dispatch, getState) => {
  // create file on new update
  // Note it will recreate file on each new update so file will be up to date
  await dispatch(createMigrationFile())
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
