import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Theme, styled, useMediaQuery } from '@mui/material';
import Popover from '@mui/material/Popover';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { Divider } from 'src/components/Divider';
import { GravatarByEmail } from 'src/components/GravatarByEmail';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { Tooltip } from 'src/components/Tooltip';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useFlags } from 'src/hooks/useFlags';
import { useGrants } from 'src/queries/profile';
import { getStorage, setStorage, storage } from 'src/utilities/storage';

import { SwitchAccountDrawer } from './SwitchAccountDrawer';
// import { useHistory } from 'react-router-dom';

interface MenuLink {
  display: string;
  hide?: boolean;
  href: string;
}

const profileLinks: MenuLink[] = [
  {
    display: 'Display',
    href: '/profile/display',
  },
  { display: 'Login & Authentication', href: '/profile/auth' },
  { display: 'SSH Keys', href: '/profile/keys' },
  { display: 'LISH Console Settings', href: '/profile/lish' },
  {
    display: 'API Tokens',
    href: '/profile/tokens',
  },
  { display: 'OAuth Apps', href: '/profile/clients' },
  { display: 'Referrals', href: '/profile/referrals' },
  { display: 'My Settings', href: '/profile/settings' },
  { display: 'Log Out', href: '/logout' },
];

export const UserMenu = React.memo(() => {
  const {
    _hasAccountAccess,
    _isRestrictedUser,
    account,
    profile,
  } = useAccountManagement();

  const flags = useFlags();
  // const history = useHistory();

  const currentToken = useCurrentToken();

  // const mockExpiredTime =
  //   'Mon Nov 20 2023 22:50:52 GMT-0800 (Pacific Standard Time)'; // Uncomment this line with L69 or L116 to mock a proxy or parent token expiry.
  const mockValidTime =
    'Tue Nov 20 2024 08:55:52 GMT-0800 (Pacific Standard Time)';

  // Mock the relevant information we'd get from POST /account/child-accounts/<euuid>/token.
  const proxyToken = {
    // expiry: mockExpiredTime, // Mock an expired ephemeral proxy token by uncommenting this line and commenting the line below.
    expiry: mockValidTime, // Mock a valid proxy token by uncommenting this line and commenting the line above.
    scope: '*',
    token: import.meta.env.REACT_APP_PROXY_PAT,
  };

  // This will be determined by the new `user_type`, but we don't have that currently, so rely on username to mock.
  const isProxyUser =
    profile?.username.includes('proxy') && flags.parentChildAccountAccess;

  const matchesSmDown = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down('sm')
  );

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const [isParentTokenError, setIsParentTokenError] = React.useState<boolean>(
    false
  );
  // Used to mock a failed API request to the ephemeral token for the child account.
  const [isProxyTokenError, setIsProxyTokenError] = React.useState<boolean>(
    false
  );

  if (!currentToken) {
    setIsParentTokenError(true);
  }

  /**
   * Determine whether the tokens used for switchable accounts are still valid.
   */
  const isTokenValid = () => {
    const now = new Date().toISOString();

    // From a proxy user, check whether parent token is still valid before switching.
    if (
      isProxyUser &&
      now >
        new Date(getStorage('authentication/parent_token/expire')).toISOString() // Mock parent token is valid by uncommenting this line and commenting the one below.
    ) {
      // if (isProxyUser && now > new Date(mockExpiredTime).toISOString()) { // Mock parent token is expired by uncommenting this line and commenting the one above.
      setIsParentTokenError(true);
      return false;
    }
    return true;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Navigate to the current location, triggering a re-render without a full page reload.
  // const refreshPage = React.useCallback(() => {
  //   // TODO: Parent/Child: We need to test this against the real API.
  //   history.push(history.location.pathname);
  // }, [history]);

  /**
   * Clear account switching token errors when menu closes.
   */
  React.useEffect(() => {
    setIsParentTokenError(false);
    setIsProxyTokenError(false);
  }, [anchorEl]);

  /**
   * Perform account switch from parent to proxy or proxy to parent accounts by swapping tokens in local storage.
   */
  const handleAccountSwitch = () => {
    // Return early if a parent or proxy token has expired or the current token is not valid.
    if (!isTokenValid() || !currentToken) {
      return;
    }

    // Before swapping tokens, store the current token data based on the account type.
    if (isProxyUser) {
      setStorage(
        'authentication/proxy_token/token',
        `Bearer ${proxyToken.token}`
      );
      setStorage('authentication/proxy_token/expire', proxyToken.expiry);
      setStorage('authentication/proxy_token/scopes', proxyToken.scope);
    } else {
      setStorage('authentication/parent_token/token', currentToken);
      setStorage(
        'authentication/parent_token/expire',
        storage.authentication.expire.get() // Mock parent token is valid by uncommenting this line and commenting the one below.
        // mockExpiredTime // Mock parent token is expired by uncommenting this line and commenting the one above.
      );
      setStorage(
        'authentication/parent_token/scopes',
        storage.authentication.scopes.get()
      );
    }

    // Swap the active token, scope, and expiry.
    const activeToken = isProxyUser
      ? getStorage('authentication/parent_token/token')
      : `Bearer ${proxyToken.token}`;
    const activeScope = isProxyUser
      ? getStorage('authentication/parent_token/scopes')
      : proxyToken.scope;
    const activeExpiry = isProxyUser
      ? getStorage('authentication/parent_token/expire')
      : proxyToken.expiry;

    setStorage('authentication/token', activeToken);
    setStorage('authentication/scopes', activeScope);
    setStorage('authentication/expire', activeExpiry);

    // Using a timeout just to witness the token switch in the dev console.
    setTimeout(() => {
      location.reload();
    }, 2000);

    // refreshPage();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-menu-popover' : undefined;

  const { data: grants } = useGrants();
  // We'd check the 'user_type' to determine whether to display company name or now. For POC, default to company name.
  const userName = account?.company ?? profile?.username ?? '';
  const hasFullAccountAccess =
    grants?.global?.account_access === 'read_write' || !_isRestrictedUser;

  const accountLinks: MenuLink[] = React.useMemo(
    () => [
      {
        display: 'Billing & Contact Information',
        href: '/account/billing',
      },
      // Restricted users can't view the Users tab regardless of their grants
      {
        display: 'Users & Grants',
        hide: _isRestrictedUser,
        href: '/account/users',
      },
      // Restricted users can't view the Transfers tab regardless of their grants
      {
        display: 'Service Transfers',
        hide: _isRestrictedUser,
        href: '/account/service-transfers',
      },
      {
        display: 'Maintenance',
        href: '/account/maintenance',
      },
      // Restricted users with read_write account access can view Settings.
      {
        display: 'Account Settings',
        hide: !hasFullAccountAccess,
        href: '/account/settings',
      },
    ],
    [hasFullAccountAccess, _isRestrictedUser]
  );

  const renderLink = (link: MenuLink) => {
    if (link.hide) {
      return null;
    }

    return (
      <Grid key={link.display} xs={12}>
        <Link
          data-testid={`menu-item-${link.display}`}
          onClick={handleClose}
          style={{ fontSize: '0.875rem' }}
          to={link.href}
        >
          {link.display}
        </Link>
      </Grid>
    );
  };

  const getEndIcon = () => {
    if (matchesSmDown) {
      return undefined;
    }
    if (open) {
      return <KeyboardArrowUp sx={{ height: 26, width: 26 }} />;
    }
    return (
      <KeyboardArrowDown sx={{ color: '#9ea4ae', height: 26, width: 26 }} />
    );
  };

  return (
    <>
      <Tooltip
        disableTouchListener
        enterDelay={500}
        leaveDelay={0}
        title="Profile & Account"
      >
        <Button
          sx={(theme) => ({
            '& .MuiButton-endIcon': {
              marginLeft: '4px',
            },
            backgroundColor: open ? theme.bg.app : undefined,
            height: '50px',
            minWidth: 'unset',
            textTransform: 'none',
          })}
          aria-describedby={id}
          data-testid="nav-group-profile"
          disableRipple
          endIcon={getEndIcon()}
          onClick={handleClick}
          startIcon={<GravatarByEmail email={profile?.email ?? ''} />}
        >
          <Hidden mdDown>
            {/* We'd check the 'user_type' to determine whether to display company name. For POC, default to company name. */}
            <Stack>
              <Typography sx={{ fontSize: '0.775rem' }}>
                {/* For proxy accounts, we'll need to parse the username to get the parent's company name. For now, default to just username. */}
                {account?.company ? profile?.username : ''}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem' }}>
                {account?.company ?? userName}
              </Typography>
            </Stack>
          </Hidden>
        </Button>
      </Tooltip>
      <Popover
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        slotProps={{
          paper: {
            sx: {
              paddingX: 2.5,
              paddingY: 2,
            },
          },
        }}
        anchorEl={anchorEl}
        id={id}
        marginThreshold={0}
        onClose={handleClose}
        open={open}
      >
        <Stack data-qa-user-menu minWidth={250} spacing={2}>
          <Typography>You are currently logged in as:</Typography>
          <Typography
            color={(theme) => theme.textColors.headlineStatic}
            fontSize="1.1rem"
          >
            <strong>{userName}</strong>
          </Typography>
          <Button
            onClick={() => {
              // From parent accounts, open the drawer of child accounts; from proxy accounts, switch directly back to parent.
              if (isProxyUser) {
                handleAccountSwitch();
              } else {
                handleClose();
                setIsDrawerOpen(true);
              }
            }}
            buttonType="outlined"
          >
            Switch {isProxyUser ? 'Back' : 'Accounts'}
          </Button>
          {(isProxyTokenError || isParentTokenError) && (
            <Notice variant="error">
              There was an error switching accounts.
            </Notice>
          )}
          <Box>
            <Heading>My Profile</Heading>
            <Divider color="#9ea4ae" />
            <Grid container>
              <Grid
                container
                direction="column"
                rowGap={1}
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(0, 4).map(renderLink)}
              </Grid>
              <Grid
                container
                direction="column"
                rowGap={1}
                wrap="nowrap"
                xs={6}
              >
                {profileLinks.slice(4).map(renderLink)}
              </Grid>
            </Grid>
          </Box>
          {_hasAccountAccess && (
            <Box>
              <Heading>Account</Heading>
              <Divider color="#9ea4ae" />
              <Stack mt={1} spacing={1.5}>
                {accountLinks.map((menuLink) =>
                  menuLink.hide ? null : (
                    <Link
                      data-testid={`menu-item-${menuLink.display}`}
                      key={menuLink.display}
                      onClick={handleClose}
                      style={{ fontSize: '0.875rem' }}
                      to={menuLink.href}
                    >
                      {menuLink.display}
                    </Link>
                  )
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Popover>
      <SwitchAccountDrawer
        handleAccountSwitch={handleAccountSwitch}
        isParentTokenError={isParentTokenError}
        isProxyTokenError={isProxyTokenError}
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        username={userName}
      />
    </>
  );
});

const Heading = styled(Typography)(({ theme }) => ({
  color: theme.textColors.headlineStatic,
  fontSize: '.75rem',
  letterSpacing: 1.875,
  textTransform: 'uppercase',
}));
