import * as R from 'ramda'

import { withModal } from '../../../store/handlers/modals'
import SendMoneyModal from '../../../components/ui/sendMoney/SendMoneyModal'

export default R.compose(
  withModal('sendMoney')
)(SendMoneyModal)
