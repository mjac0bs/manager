import { styled } from '@mui/material/styles';
import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';
import { Button, ButtonProps } from 'src/components/Button/Button';

export const SwitchAccountButton = (props: ButtonProps) => {
  const { ...rest } = props;

  return (
    <StyledButton {...rest}>
      <StyledSwapIcon />
      Switch Account
    </StyledButton>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  '& path': {
    fill: theme.textColors.linkActiveLight,
  },
  '&:hover, &:focus': {
    '& path': {
      fill: theme.name === 'dark' ? '#fff' : theme.textColors.linkActiveLight,
    },
  },
}));

const StyledSwapIcon = styled(SwapIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));
