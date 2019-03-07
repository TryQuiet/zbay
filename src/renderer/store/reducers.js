import { combineReducers } from 'redux-immutable'

import nodeHandlers from './handlers/node'
import ratesHandlers from './handlers/rates'
import vaultHandlers from './handlers/vault'
import vaultCreatorHandlers from './handlers/vaultCreator'
import vaultUnlockerHandlers from './handlers/vaultUnlocker'

export default combineReducers({
  rates: ratesHandlers.reducer,
  node: nodeHandlers.reducer,
  vault: vaultHandlers.reducer,
  vaultCreator: vaultCreatorHandlers.reducer,
  vaultUnlocker: vaultUnlockerHandlers.reducer
})
