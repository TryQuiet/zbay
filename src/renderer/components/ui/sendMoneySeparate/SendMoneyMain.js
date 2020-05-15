import React from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'
import { Formik } from 'formik'
import { withStyles } from '@material-ui/core/styles'
import { AutoSizer } from 'react-virtualized'
import { Scrollbars } from 'react-custom-scrollbars'
import * as Yup from 'yup'

import { MESSAGE_SIZE } from '../../../zbay/transit'
import { createTransfer } from '../../../zbay/messages'

import Modal from '../Modal'
import SendMoneyInitial from './SendMoneyInitial'

const styles = theme => ({})

export const formSchema = users => {
  return Yup.object().shape(
    {
      recipient: Yup.mixed()
        .test(
          'match',
          'Wrong address format or username does not exist',
          function (string) {
            const isAddressValid = /^t1[a-zA-Z0-9]{33}$|^ztestsapling1[a-z0-9]{75}$|^zs1[a-z0-9]{75}$|[A-Za-z0-9]{35}/.test(
              string
            )
            const includesNickname = users
              .toList()
              .filter(obj => obj.get('nickname') === string)
              .first()
            return includesNickname || isAddressValid
          }
        )
        .required('Required'),
      amountZec: Yup.number()
        .min(0.0, 'Please insert amount to send')
        .required('Required'),
      amountUsd: Yup.number().required('Required'),
      memo: Yup.string().max(MESSAGE_SIZE, 'Your message is too long')
    },
    ['recipient', 'amountZec', 'amoundUsd', 'memo']
  )
}

export const validateForm = ({ balanceZec, shippingData }) => values => {
  let errors = {}
  if (balanceZec.isLessThan(values.amountZec)) {
    errors['amountZec'] = `You can't send more than ${balanceZec} ZEC`
  }
  if (
    values.shippingInfo === true &&
    values.memo.length > MESSAGE_SIZE
  ) {
    errors['memo'] = `Your message and shipping information are too long`
  }
  return errors
}

export const SendMoneyModal = ({
  initialValues,
  step,
  open,
  setStep,
  users,
  nickname,
  balanceZec,
  rateZec,
  rateUsd,
  userData,
  sendMessageHandler
}) => {
  const StepComponent = stepToComponent[step]
  return (
    <Formik
      enableReinitialize
      onSubmit={(values, { resetForm }) => {
        const { recipient, ...rest } = values
        const includesNickname =
          users
            .toList()
            .filter(obj => obj.get('nickname') === recipient)
            .first() ||
          users
            .toList()
            .filter(obj => obj.get('address') === recipient)
            .first()
        if (includesNickname) {
          const messageToTransfer = createTransfer({
            recipient: includesNickname.get('address'),
            recipientUsername: includesNickname.get('nickname'),
            ...rest,
            sender: {
              address: userData.address,
              name: userData.name
            }
          })
          sendMessageHandler(messageToTransfer.toJS())
        } else {
          const messageToTransfer = createTransfer({
            recipient,
            ...rest,
            sender: {
              address: userData.address,
              name: userData.name
            }
          })
          sendMessageHandler(messageToTransfer.toJS())
        }
      }}
      validationSchema={formSchema(users)}
      initialValues={{
        ...initialValues
      }}
      validate={validateForm({ balanceZec })}
    >
      {({
        values,
        isValid,
        submitForm,
        resetForm,
        errors,
        touched,
        setFieldValue
      }) => {
        return (
          <Modal
            step={step}
            setStep={setStep}
            open={open}
          >
            <AutoSizer>
              {({ width, height }) => (
                <Scrollbars
                  autoHideTimeout={500}
                  style={{ width: width, height: height }}
                >
                  <StepComponent
                    step={step}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    setStep={setStep}
                    values={values}
                    memo={values.memo}
                    users={users}
                    nickname={nickname}
                    balanceZec={balanceZec}
                    rateUsd={rateUsd}
                    rateZec={rateZec}
                    isValid={isValid}
                    resetForm={resetForm}
                  />
                </Scrollbars>
              )}
            </AutoSizer>
          </Modal>
        )
      }}
    </Formik>
  )
}
const stepToComponent = {
  1: SendMoneyInitial
}

SendMoneyModal.propTypes = {
  classes: PropTypes.object.isRequired
}

SendMoneyModal.defaultProps = {
  initialValues: {
    recipient: '',
    amountZec: '',
    amountUsd: '',
    memo: ''
  }
}

export default R.compose(React.memo, withStyles(styles))(SendMoneyModal)
