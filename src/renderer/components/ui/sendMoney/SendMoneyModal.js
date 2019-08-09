import React from 'react'
import PropTypes from 'prop-types'
import * as Yup from 'yup'
import * as R from 'ramda'
import { Formik } from 'formik'
import { withStyles } from '@material-ui/core/styles'

import Modal from '../Modal'
import SendMoneyForm from './SendMoneyForm'
import SendMoneyTransactionDetails from './SendMoneyTransactionDetails'
import SendMoneySending from './SendMoneySending'

const styles = theme => ({
  paper: {
    padding: '20px'
  }
})

const formSchema = Yup.object().shape({
  password: Yup.string().required('Required')
})

export const SendMoneyModal = ({
  classes,
  initialValues,
  step,
  setStep,
  balanceZec,
  handleOpen,
  handleClose,
  sent = false,
  open,
  rateUsd,
  rateZec
}) => {
  const StepComponent = stepToComponent[step]
  return (
    <Formik
      onSubmit={() => {}}
      validationSchema={formSchema}
      initialValues={initialValues}
      // validate={validateForm}
    >
      {({ values, isValid }) => {
        const stepToTitle = {
          1: 'Send Money',
          2: `Send Money to ${values.recipient.substring(0, 32)}...`,
          3: 'Send Complete',
          4: 'Transaction Details'
        }
        return (
          <Modal
            title={stepToTitle[step]}
            step={step}
            setStep={setStep}
            open={open}
            canGoBack={step === 2}
            handleClose={handleClose}
          >
            <StepComponent
              step={step}
              setStep={setStep}
              amountUsd={values.amountUsd}
              amountZec={values.amountZec}
              feeZec={0.1}
              feeUsd={0.1}
              sent={sent}
              values={values}
              lastStep={step === 4}
              memo={values.memo}
              recipient={values.recipient}
              balanceZec={balanceZec}
              isValid={isValid}
              rateZec={rateZec}
              rateUsd={rateUsd}
            />
          </Modal>
        )
      }}
    </Formik>
  )
}
const stepToComponent = {
  1: SendMoneyForm,
  2: SendMoneyTransactionDetails,
  3: SendMoneySending,
  4: SendMoneyTransactionDetails
}

SendMoneyModal.propTypes = {
  classes: PropTypes.object.isRequired
}

SendMoneyModal.defaultProps = {
  initialValues: {
    recipient: '',
    amountZec: '',
    amountUsd: '',
    memo: '',
    shippingInfo: false
  }
}

export default R.compose(
  React.memo,
  withStyles(styles)
)(SendMoneyModal)
