import React from 'react'
import { TextField } from 'formik-material-ui'

export const formikLinkedTextField = ({ variant, transformer, ...props }) => {
  return (
    <TextField
      variant='outlined'
      {...props}
      inputProps={{
        onChange: ({ target: { value } }) => {
          props.form.setFieldValue(props.field.name, value)
          props.form.setFieldValue(props.otherField, value * transformer)
        }
      }}
    />
  )
}
