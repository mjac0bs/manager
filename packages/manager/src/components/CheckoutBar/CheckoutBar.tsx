import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { DisplayPrice } from 'src/components/DisplayPrice';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import {
  StyledButton,
  StyledCheckoutSection,
  StyledRoot,
  SxTypography,
} from './styles';

interface CheckoutBarProps {
  agreement?: JSX.Element;
  calculatedPrice?: number;
  children?: JSX.Element;
  disabled?: boolean;
  footer?: JSX.Element;
  heading: string;
  isMakingRequest?: boolean;
  onDeploy: () => void;
  priceHelperText?: string;
  submitText?: string;
}

const CheckoutBar = (props: CheckoutBarProps) => {
  const {
    agreement,
    calculatedPrice,
    children,
    disabled,
    footer,
    heading,
    isMakingRequest,
    onDeploy,
    priceHelperText,
    submitText,
  } = props;

  const theme = useTheme();
  const flags = useFlags();

  const price = calculatedPrice ?? 0;

  // If the DC-Specific pricing feature flag is off, price can be zero;
  // if the flag is on, price should never be zero because both a region
  // and plan selection are required for pricing, so when zero, display helper text instead.
  const shouldDisplayPrice = !flags.dcSpecificPricing ? price >= 0 : price;

  return (
    <StyledRoot>
      <Typography
        sx={{
          color: theme.color.headline,
          fontSize: '1.125rem',
          wordBreak: 'break-word',
        }}
        data-qa-order-summary
        variant="h2"
      >
        {heading}
      </Typography>
      {children}
      {
        <StyledCheckoutSection data-qa-total-price>
          {shouldDisplayPrice ? (
            <DisplayPrice interval="mo" price={price} />
          ) : undefined}
          {!shouldDisplayPrice && (
            <Typography
              sx={{
                ...SxTypography,
                marginTop: theme.spacing(),
              }}
            >
              {priceHelperText}
            </Typography>
          )}
        </StyledCheckoutSection>
      }
      {agreement ? agreement : null}
      <StyledCheckoutSection>
        <StyledButton
          buttonType="primary"
          data-qa-deploy-linode
          disabled={disabled}
          loading={isMakingRequest}
          onClick={onDeploy}
        >
          {submitText ?? 'Create'}
        </StyledButton>
      </StyledCheckoutSection>
      {footer ? footer : null}
    </StyledRoot>
  );
};

export { CheckoutBar };
