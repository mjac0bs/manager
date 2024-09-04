// @TODO: delete file once Gravatar is sunset
import { styled } from '@mui/material/styles';

import { GravatarByUsername } from 'src/components/GravatarByUsername';

export const StyledGravatar = styled(GravatarByUsername, {
  label: 'StyledGravatar',
})(({ theme }) => ({
  height: theme.spacing(3),
  width: theme.spacing(3),
}));
