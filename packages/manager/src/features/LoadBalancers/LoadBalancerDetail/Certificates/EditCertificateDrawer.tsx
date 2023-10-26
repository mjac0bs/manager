import { Certificate, UpdateCertificatePayload } from '@linode/api-v4';
import { UpdateCertificateSchema } from '@linode/validation';
import { useTheme } from '@mui/material/styles';
import { useFormik, yupToFormErrors } from 'formik';
import React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { useLoadBalancerCertificateMutation } from 'src/queries/aglb/certificates';
// import { getErrorMap } from 'src/utilities/errorUtils';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

interface Props {
  certificate: Certificate | undefined;
  loadbalancerId: number;
  onClose: () => void;
  open: boolean;
}

export const labelMap: Record<Certificate['type'], string> = {
  ca: 'Server Certificate',
  downstream: 'TLS Certificate',
};

/* TODO: AGLB - Update with final copy. */
const descriptionMap: Record<Certificate['type'], string> = {
  ca: 'You can edit this cert here. Maybe something about service targets.',
  downstream:
    'You can edit this cert here. Perhaps something about the private key and the hos header and what it does.',
};

export const EditCertificateDrawer = (props: Props) => {
  const { certificate, loadbalancerId, onClose: _onClose, open } = props;

  const theme = useTheme();

  const {
    error,
    mutateAsync: updateCertificate,
    reset,
  } = useLoadBalancerCertificateMutation(loadbalancerId, certificate?.id ?? -1);

  const formik = useFormik<UpdateCertificatePayload>({
    enableReinitialize: true,
    initialValues: {
      certificate: certificate?.certificate.trim(),
      key: '',
      label: certificate?.label ?? '',
      type: certificate?.type,
    },
    async onSubmit(values) {
      const shouldIgnoreField =
        certificate?.certificate.trim() === formik.values.certificate &&
        formik.values.key === '';
      // console.log({shouldIgnoreField}, "on submit")

      try {
        await updateCertificate({
          certificate:
            values.certificate && !shouldIgnoreField
              ? values.certificate
              : undefined,
          key: values.key && !shouldIgnoreField ? values.key : undefined,
          label: values.label,
          type: values.type,
        });
        onClose();
      } catch (errors) {
        formik.setErrors(getFormikErrorsFromAPIErrors(errors));
      }
    },
    validate(values) {
      const shouldIgnoreField =
        certificate?.certificate.trim() === formik.values.certificate &&
        formik.values.key === '';
      // console.log({shouldIgnoreField}, "on validate")
      // We must use `validate` instead of validationSchema because Formik decided to convert
      // "" to undefined before passing the values to yup. This makes it hard to validate `label`.
      // See https://github.com/jaredpalmer/formik/issues/805
      try {
        UpdateCertificateSchema.validateSync(
          {
            certificate:
              values.certificate && !shouldIgnoreField
                ? values.certificate
                : undefined,
            key: values.key && !shouldIgnoreField ? values.key : undefined,
            label: values.label,
            type: values.type,
          },
          { abortEarly: false }
        );
        return {};
      } catch (error) {
        return yupToFormErrors(error);
      }
    },
    // validationSchema: UpdateCertificateSchema,
    validateOnBlur: !error,
    validateOnChange: true,
  });

  // const errorFields = ['label', 'certificate'];

  // if (certificate?.type === 'downstream') {
  //   errorFields.push('key');
  // }

  // const errorMap = getErrorMap(errorFields, error);

  // The user has not edited their cert or the private key, so we exclude both cert and key from the request.
  // const shouldIgnoreField =
  //   certificate?.certificate.trim() === formik.values.certificate &&
  //   formik.values.key === '';

  const generalError = error?.find((e) => !e.field)?.reason;

  const onClose = () => {
    formik.resetForm();
    _onClose();
    reset();
  };

  return (
    <Drawer
      onClose={onClose}
      open={open}
      title={`Edit ${certificate?.label ?? 'Certificate'}`}
      wide
    >
      {/* {errorMap.none && <Notice variant="error">{errorMap.none}</Notice>} */}
      {generalError && <Notice variant="error">{generalError}</Notice>}
      {!certificate ? (
        <Notice variant="error">Error loading certificate.</Notice>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          {/* {errorMap.none && <Notice text={errorMap.none} variant="error" />} */}
          <Typography sx={{ marginBottom: theme.spacing(2) }}>
            {descriptionMap[certificate.type]}
          </Typography>
          <TextField
            errorText={formik.errors.label}
            expand
            label="Certificate Label"
            name="label"
            onChange={formik.handleChange}
            value={formik.values.label}
          />
          <TextField
            errorText={formik.errors.certificate}
            expand
            label={labelMap[certificate.type]}
            labelTooltipText="TODO: AGLB"
            multiline
            name="certificate"
            onChange={formik.handleChange}
            trimmed
            value={formik.values.certificate}
          />
          {certificate?.type === 'downstream' && (
            <TextField
              errorText={formik.errors.key}
              expand
              label="Private Key"
              labelTooltipText="TODO: AGLB"
              multiline
              name="key"
              onChange={formik.handleChange}
              placeholder="Private key is redacted for security."
              trimmed
              value={formik.values.key}
            />
          )}
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Update Certificate',
              type: 'submit',
            }}
          />
        </form>
      )}
    </Drawer>
  );
};
