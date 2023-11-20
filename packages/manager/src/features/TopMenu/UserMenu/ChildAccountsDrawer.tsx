import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';

interface Props {
  handleAccountSwitch: () => void;
  isParentTokenError: boolean;
  //   isProxyTokenError: boolean;
  onClose: () => void;
  open: boolean;
  username: string;
}

export const ChildAccountsDrawer = (props: Props) => {
  const {
    handleAccountSwitch,
    isParentTokenError,
    onClose: _onClose,
    open,
  } = props;

  // Used to mock a failed API request to the ephemeral token for the child account.
  const [isProxyTokenError, setIsProxyTokenError] = React.useState<boolean>();

  const onClose = () => {
    _onClose();
  };

  // Toggle to mock error from API.
  setIsProxyTokenError(false);

  return (
    <Drawer onClose={onClose} open={open} title="Switch Account">
      {(isParentTokenError || isProxyTokenError) ?? (
        <Notice variant="error">There was an error switching accounts.</Notice>
      )}
      <StyledLinkButton onClick={handleAccountSwitch}>
        Linode Child Co.
      </StyledLinkButton>
    </Drawer>
  );
};
