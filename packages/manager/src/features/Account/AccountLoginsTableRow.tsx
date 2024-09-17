import * as React from 'react';

import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { RedactableText } from 'src/components/RedactableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { usePreferences } from 'src/queries/profile/preferences';
import { useProfile } from 'src/queries/profile/profile';
import { capitalize } from 'src/utilities/capitalize';
import { formatDate } from 'src/utilities/formatDate';

import type {
  AccountLogin,
  AccountLoginStatus,
} from '@linode/api-v4/lib/account/types';
import type { Status } from 'src/components/StatusIcon/StatusIcon';

const accessIconMap: Record<AccountLoginStatus, Status> = {
  failed: 'other',
  successful: 'active',
};

const AccountLoginsTableRow = (props: AccountLogin) => {
  const { datetime, id, ip, restricted, status, username } = props;
  const { data: profile } = useProfile();
  const { data: preferences } = usePreferences();

  return (
    <TableRow key={id}>
      <TableCell>
        {formatDate(datetime, {
          timezone: profile?.timezone,
        })}
      </TableCell>
      <TableCell noWrap>
        <RedactableText
          isRedacted={Boolean(preferences?.redactSensitiveData)}
          isToggleable
        >
          <Link to={`/account/users/${username}`}>{username}</Link>
        </RedactableText>
      </TableCell>
      <Hidden smDown>
        <TableCell>
          <RedactableText
            isRedacted={Boolean(preferences?.redactSensitiveData)}
            isToggleable
          >
            {ip}
          </RedactableText>
        </TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell noWrap>
          {restricted ? 'Restricted' : 'Unrestricted'}
        </TableCell>
      </Hidden>
      <TableCell statusCell>
        <StatusIcon
          ariaLabel={`Status is ${status}`}
          pulse={false}
          status={accessIconMap[status] ?? 'other'}
        />
        {capitalize(status)}
      </TableCell>
    </TableRow>
  );
};

export default AccountLoginsTableRow;
