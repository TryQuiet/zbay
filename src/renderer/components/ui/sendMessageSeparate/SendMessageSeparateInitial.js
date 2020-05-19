import React from 'react'
import PropTypes from 'prop-types'
import * as R from 'ramda'
import { DateTime } from 'luxon'
import { Typography } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Field } from 'formik'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import BigNumber from 'bignumber.js'

import { AutocompleteField } from '../../ui/form/Autocomplete'
import CheckboxChecked from '../../../static/images/checkbox.svg'
import CheckboxUnchecked from '../../../static/images/bg-unchecked.svg'
import FormikTextField from '../../../components/ui/form/TextField'
import Icon from '../Icon'

const styles = theme => ({
  root: {
    padding: 32,
    height: '100%',
    width: '100%'
  },
  fullContainer: {
    width: '100%',
    height: '100%'
  },
  gutter: {
    marginBottom: 0,
    marginTop: 0
  },
  button: {
    marginTop: 24,
    width: 139,
    height: 60,
    backgroundColor: theme.palette.colors.zbayBlue,
    color: theme.palette.colors.white,
    '&:hover': {
      backgroundColor: theme.palette.colors.zbayBlue
    }
  },
  title: {
    marginBottom: 24
  },
  bold: {
    fontWeight: 'bold'
  },
  infoBox: {
    width: '100%',
    backgroundColor: theme.palette.colors.gray03,
    padding: '12px 16px',
    borderRadius: 4,
    marginTop: 18,
    marginBottom: 24
  },
  typo: {
    letterSpacing: '0.4 px',
    fontSize: 12,
    lineHeight: '18px',
    color: theme.palette.colors.black
  },
  fieldTitle: {
    fontSize: 12,
    lineHeight: '14px',
    color: theme.palette.colors.black30,
    marginBottom: 6
  },
  field: {
    display: 'flex',
    alignItems: 'flex-start',
    height: 140,
    paddingTop: 4,
    boxSizing: 'border-box'
  },
  avaiableBox: {
    width: '100%',
    height: 86,
    borderRadius: 4,
    border: `1px solid ${theme.palette.colors.gray50}`
  },
  contentContainer: {
    width: 536
  },
  innerBox: {
    padding: '0px 16px'
  },
  fieldName: {
    fontSize: 12,
    lineHeight: '14px',
    color: theme.palette.colors.black30,
    marginBottom: 6
  },
  checkboxForm: {
    margin: 0,
    padding: 0
  },
  checkbox: {
    width: 14,
    height: 14,
    marginBottom: 2
  },
  recipientInfo: {
    marginBottom: 10
  },
  error: {
    marginTop: 5,
    color: theme.palette.colors.red
  },
  label: {
    fontSize: 14,
    lineHeight: '20px',
    color: theme.palette.colors.trueBlack,
    marginLeft: 12
  },
  labelDiv: {
    marginTop: 26
  }
})
export const SendMessageSeparateInitial = ({
  classes,
  handleClose,
  users,
  setFieldValue,
  values,
  isValid,
  errors,
  submitForm,
  feeUsd,
  feeZec,
  memo,
  openSentFundsModal
}) => {
  const usersArray = users.toList().toJS()
  const { recipient } = values
  const shouldSendAnonymously = values.sendAnonymously === true
  const ErrorText = ({ name }) => {
    return errors[name] ? (
      <Typography className={classes.error} variant='caption'>
        {errors[name]}
      </Typography>
    ) : (
      <span />
    )
  }
  return (
    <Grid
      container
      justify='flex-start'
      direction='column'
      className={classes.contentContainer}
    >
      <Typography variant='h3' className={classes.title}>
        New message
      </Typography>
      <Typography variant='body2' className={classes.fieldName}>Recipient</Typography>
      <AutocompleteField
        freeSolo
        name={'recipient'}
        inputValue={values.recipient || ''}
        options={usersArray.map(option => option.nickname)}
        filterOptions={(options, state) =>
          options.filter(o =>
            o.toLowerCase().includes(values.recipient || ''.toLowerCase())
          )
        }
        value={values.recipient}
        onChange={(e, v) => setFieldValue('recipient', v)}
        onInputChange={(e, v) => {
          setFieldValue('recipient', v)
        }}
        renderInput={params => (
          <TextField
            {...params}
            className={classes.gutter}
            variant='outlined'
            multiline
            maxRows={7}
            placeholder={`Enter Zbay username or z-address`}
            margin='normal'
            fullWidth
          />
        )}
      />
      <ErrorText name={'recipient'} />
      <Grid item className={classes.labelDiv}>
        <Field
          name={'sendAnonymously'}
          component={() => (<FormControlLabel
            classes={{ root: classes.checkboxForm }}
            control={
              <Checkbox
                checked={values.sendAnonymously}
                onChange={(e, v) => setFieldValue('sendAnonymously', !values.sendAnonymously)}
                color='default'
                icon={<Icon src={CheckboxUnchecked} />}
                checkedIcon={<Icon src={CheckboxChecked} />}
                className={classes.checkbox}
              />
            }
            label={
              <Typography variant='body2' className={classes.label}>
                    Send anonymously
              </Typography>
            }
          />)}
        />
      </Grid>
      {shouldSendAnonymously && (
        <Grid container item>
          <Grid className={classes.infoBox} item>
            <Typography className={classes.typo} variant='body2'><span className={classes.bold}>Warning:</span>{` anonymity in Zcash has limits. Lorem ipsum where we explain this
            anonymity in Zcash has limits. Lorem ipsum where we explain this,
            anonymity in Zcash has limits. Lorem ipsum where we explain this
            anonymity in Zcash has limits. Lorem ipsum where we explain this
            `}</Typography>
          </Grid>
          <ErrorText name={'amountZec'} />
          <Grid item xs={12}>
            <Typography className={classes.fieldName} variant='body1'>
                Memo
            </Typography>
            <FormikTextField
              name='memo'
              placeholder={
                values.recipient.length === 35
                  ? `You can't include message to transparent address`
                  : 'Enter a message'
              }
              InputProps={{ className: classes.field }}
              disabled={values.recipient.length === 35}
            />
          </Grid>
        </Grid>
      )}
      <Button
        className={classes.button}
        onClick={() => {
          submitForm()
          handleClose()
          openSentFundsModal({
            feeUsd,
            feeZec,
            recipient,
            memo,
            timestamp: DateTime.utc().toSeconds()
          })
        }}
        variant='contained'
        color='primary'
        size='large'
        type='submit'
        disabled={!isValid}
      >
        Continue
      </Button>
    </Grid>
  )
}

SendMessageSeparateInitial.propTypes = {
  classes: PropTypes.object.isRequired,
  rateUsd: PropTypes.instanceOf(BigNumber).isRequired,
  rateZec: PropTypes.number.isRequired,
  feeZec: PropTypes.number,
  feeUsd: PropTypes.number,
  handleClose: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired,
  isValid: PropTypes.bool.isRequired,
  errors: PropTypes.object.isRequired,
  submitForm: PropTypes.func.isRequired,
  memo: PropTypes.string.isRequired,
  openSentFundsModal: PropTypes.func.isRequired
}
export default R.compose(
  React.memo,
  withStyles(styles)
)(SendMessageSeparateInitial)
