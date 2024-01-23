import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Notice } from 'src/components/Notice/Notice';
import { useFlags } from 'src/hooks/useFlags';
import { useChildAccounts } from 'src/queries/account';
import { useProfile } from 'src/queries/profile';

import CloseAccountDialog from './CloseAccountDialog';
import {
  CHILD_ACCOUNT_LOADING_ERROR,
  CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
  PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT,
} from './constants';

const CloseAccountSetting = () => {
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const { data: profile } = useProfile();
  const { data: childAccounts, isError, isLoading } = useChildAccounts({});
  const flags = useFlags();

  const isParentAccount = profile?.user_type === 'parent';
  const hasChildAccounts = Boolean(
    isParentAccount && childAccounts && childAccounts?.data?.length > 0
  );
  const isCloseAccountDisabled = Boolean(
    flags.parentChildAccountAccess &&
      (hasChildAccounts ||
        profile?.user_type === 'child' ||
        profile?.user_type === 'proxy' ||
        isError)
  );
  const closeAccountButtonTooltipText =
    isCloseAccountDisabled && isParentAccount
      ? PARENT_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT
      : CHILD_PROXY_USER_CLOSE_ACCOUNT_TOOLTIP_TEXT;

  return (
    <>
      <Accordion defaultExpanded={true} heading="Close Account">
        <Grid container direction="column">
          <Grid>
            {isParentAccount && isError && (
              <Notice text={CHILD_ACCOUNT_LOADING_ERROR} variant="error" />
            )}
            <Button
              tooltipText={
                !isLoading && !isError
                  ? closeAccountButtonTooltipText
                  : undefined
              }
              buttonType="outlined"
              data-testid="close-account-button"
              disabled={isCloseAccountDisabled}
              loading={isLoading}
              onClick={() => setDialogOpen(true)}
            >
              Close Account
            </Button>
          </Grid>
        </Grid>
      </Accordion>
      <CloseAccountDialog
        closeDialog={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </>
  );
};

export default React.memo(CloseAccountSetting);
