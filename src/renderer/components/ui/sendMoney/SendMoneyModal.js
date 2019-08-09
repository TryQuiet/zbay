import React from 'react'
import PropTypes from 'prop-types'
import * as Yup from 'yup'
import * as R from 'ramda'
import { Formik } from 'formik'
import { withStyles } from '@material-ui/core/styles'

import Modal from '../Modal'
import SendMoneyForm from './SendMoneyForm'
import SendMoneyTransactionDetails from './SendMoneyTransactionDetails'

const styles = theme => ({
  paper: {
    padding: '20px'
  }
})

const formSchema = Yup.object().shape({
  password: Yup.string().required('Required')
})

export const SendMoneyModal = ({ classes, balance, handleOpen, handleClose, open }) => {
  const [step, setStep] = React.useState(1)
  const stepToTitle = {
    1: 'Send Money',
    2: `Send Money to ################`,
    3: 'Send Complete',
    4: 'Transaction Details'
  }
  const StepComponent = stepToComponent[step]
  return (
    <Formik
      onSubmit={() => {}}
      validationSchema={formSchema}
      // initialValues={initialValues}
      // validate={validateForm}
    >
      <Modal
        title={stepToTitle[step]}
        step={step}
        setStep={setStep}
        open={open}
        handleClose={handleClose}
      >
        <StepComponent
          step={step}
          setStep={setStep}
          amountUsd={200}
          amountZec={300}
          feeZec={0.1}
          feeUsd={0.1}
          memo='test MESS'
          recipient='ztestsapling1k059n2xjz5apmu49ud6xa0g4lywetd0zgpz2txe9xs5pu27fjjnp7c9yvtkcqlwz0n7qxrhylnn'
          balanceZec={'20.0000'}
          balanceUsd={'20.0000'}
        />
      </Modal>
    </Formik>
  )
}
const stepToComponent = {
  1: SendMoneyForm,
  2: SendMoneyTransactionDetails
}

SendMoneyModal.propTypes = {
  classes: PropTypes.object.isRequired
}

SendMoneyModal.defaultProps = {}

export default R.compose(
  React.memo,
  withStyles(styles)
)(SendMoneyModal)
