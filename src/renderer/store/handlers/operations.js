import Immutable from 'immutable'
import BigNumber from 'bignumber.js'
import { createAction, handleActions } from 'redux-actions'
import * as R from 'ramda'
import logsHandlers from '../../store/handlers/logs'

import { getClient } from '../../zcash'
import { actionTypes } from '../../../shared/static'

const oneOf = (...arr) => val => R.includes(val, arr)

export const isFinished = oneOf('success', 'cancelled', 'failed')

const POLLING_OFFSET = 15000

export const initialState = Immutable.Map()

export const ZcashError = Immutable.Record({
  code: null,
  message: ''
}, 'ZcashError')

export const ShieldBalanceOp = Immutable.Record({
  amount: new BigNumber(0),
  from: '',
  to: ''
})

export const PendingMessageOp = Immutable.Record({
  message: Immutable.Map(),
  channelId: ''
})

export const PendingDirectMessageOp = Immutable.Record({
  message: Immutable.Map(),
  recipientAddress: '',
  recipientUsername: '',
  offerId: ''
})

export const operationTypes = {
  shieldBalance: 'shieldBalance',
  pendingMessage: 'pendingMessage',
  pendingDirectMessage: 'pendingDirectMessage',
  pendingPlainTransfer: 'pendingPlainTransfer'
}

export const Operation = Immutable.Record({
  opId: '',
  type: '',
  meta: {},
  txId: null,
  error: null,
  status: 'pending'
}, 'Operation')

const addOperation = createAction(actionTypes.ADD_PENDING_OPERATION)
const resolveOperation = createAction(actionTypes.RESOLVE_PENDING_OPERATION)
const removeOperation = createAction(actionTypes.REMOVE_PENDING_OPERATION)

export const actions = {
  addOperation,
  resolveOperation,
  removeOperation
}

const observeOperation = ({ opId, type, meta, checkConfirmationNumber }) => async (dispatch, getState) => {
  dispatch(addOperation({ opId, type, meta }))

  const subscribe = async (callback) => {
    async function poll () {
      const {
        status,
        result: { txid: txId } = {},
        error = null
      } = await getClient().operations.getStatus(opId) || {}
      if (isFinished(status)) {
        return callback(error, { status, txId })
      } else {
        setTimeout(poll, POLLING_OFFSET)
      }
    }
    return poll()
  }

  return subscribe((error, { status, txId }) => {
    dispatch(resolveOperation({ opId, status, txId, error }))
    dispatch(logsHandlers.epics.saveLogs({ type: 'TRANSACTION', payload: txId }))
    if (checkConfirmationNumber && !error) {
      checkConfirmationNumber({ opId, status, txId, getState, dispatch })
    }
  })
}

export const epics = {
  observeOperation
}

export const reducer = handleActions({
  [addOperation]: (state, { payload: { type, meta, opId } }) => state.set(
    opId,
    Operation({
      opId,
      type,
      meta
    })
  ),
  [resolveOperation]: (state, { payload: { opId, status, txId, error } }) => state.update(
    opId,
    m => m.merge({
      status,
      txId,
      error: error ? ZcashError(error) : null
    })
  ),
  [removeOperation]: (state, { payload: id }) => {
    if (state.has(id)) {
      return state.delete(id)
    }
    // It may be a txId
    return state.filter(pm => pm.txId !== id)
  }
}, initialState)

export default {
  actions,
  epics,
  reducer
}
