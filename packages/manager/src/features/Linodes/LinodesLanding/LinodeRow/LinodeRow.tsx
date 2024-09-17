import * as React from 'react';

import Flag from 'src/assets/icons/flag.svg';
import { BackupStatus } from 'src/components/BackupStatus/BackupStatus';
import { Hidden } from 'src/components/Hidden';
import { Link } from 'src/components/Link';
import { RedactableText } from 'src/components/RedactableText';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { LinodeActionMenu } from 'src/features/Linodes/LinodesLanding/LinodeActionMenu/LinodeActionMenu';
import {
  getProgressOrDefault,
  linodeInTransition,
  transitionText,
} from 'src/features/Linodes/transitions';
import { notificationCenterContext as _notificationContext } from 'src/features/NotificationCenter/NotificationCenterContext';
import { useInProgressEvents } from 'src/queries/events/events';
import { usePreferences } from 'src/queries/profile/preferences';
import { useTypeQuery } from 'src/queries/types';
import { capitalizeAllWords } from 'src/utilities/capitalize';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import { IPAddress } from '../IPAddress';
import { RegionIndicator } from '../RegionIndicator';
import { getLinodeIconStatus, parseMaintenanceStartTime } from '../utils';
import {
  StyledButton,
  StyledIpTableCell,
  StyledMaintenanceTableCell,
} from './LinodeRow.styles';

import type { LinodeHandlers } from '../LinodesLanding';
import type { SxProps } from '@mui/system';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';

interface Props extends LinodeWithMaintenance {
  handlers: LinodeHandlers;
}

export const LinodeRow = (props: Props) => {
  const {
    backups,
    handlers,
    id,
    ipv4,
    label,
    maintenance,
    region,
    status,
    type,
  } = props;

  const notificationContext = React.useContext(_notificationContext);

  const { data: linodeType } = useTypeQuery(type ?? '', type !== null);

  const { data: events } = useInProgressEvents();

  const recentEvent = events?.find(
    (e) => e.entity?.type === 'linode' && e.entity.id === id
  );

  const isBareMetalInstance = linodeType?.class === 'metal';

  const loading = linodeInTransition(status, recentEvent);

  const parsedMaintenanceStartTime = parseMaintenanceStartTime(
    maintenance?.when
  );

  const MaintenanceText = () => {
    return (
      <>
        This Linode&rsquo;s maintenance window opens at{' '}
        {parsedMaintenanceStartTime}. For more information, see your{' '}
        <Link to="/support/tickets?type=open">open support tickets.</Link>
      </>
    );
  };

  const iconStatus = getLinodeIconStatus(status);

  const [isHovered, setIsHovered] = React.useState(false);

  const { data: preferences } = usePreferences();

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <TableRow
      data-qa-linode={label}
      data-qa-loading
      key={id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: 'auto' }}
    >
      <TableCell noWrap>
        <Link tabIndex={0} to={`/linodes/${id}`}>
          {label}
        </Link>
      </TableCell>
      <StyledMaintenanceTableCell
        data-qa-status
        maintenance={Boolean(maintenance)}
        statusCell
      >
        {!Boolean(maintenance) ? (
          loading ? (
            <>
              <StatusIcon status={iconStatus} />
              <StyledButton onClick={notificationContext.openMenu}>
                <ProgressDisplay
                  progress={getProgressOrDefault(recentEvent)}
                  sx={{ display: 'inline-block' }}
                  text={transitionText(status, id, recentEvent)}
                />
              </StyledButton>
            </>
          ) : (
            <>
              <StatusIcon status={iconStatus} />
              {capitalizeAllWords(status.replace('_', ' '))}
            </>
          )
        ) : (
          <div style={{ alignItems: 'center', display: 'flex' }}>
            <strong>Maintenance Scheduled</strong>
            <TooltipIcon
              status="help"
              sx={{ tooltip: { maxWidth: 300 } }}
              text={<MaintenanceText />}
              tooltipPosition="top"
            />
          </div>
        )}
      </StyledMaintenanceTableCell>
      <Hidden smDown>
        <TableCell noWrap>
          {linodeType ? formatStorageUnits(linodeType.label) : type}
        </TableCell>
        <StyledIpTableCell data-qa-ips>
          <RedactableText
            isTextVisible={Boolean(preferences?.hideSensitiveData)}
            isToggleable
          >
            <IPAddress ips={ipv4} isHovered={isHovered} />
          </RedactableText>
        </StyledIpTableCell>
        <Hidden lgDown>
          <TableCell data-qa-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          <BackupStatus
            backupsEnabled={backups.enabled}
            isBareMetalInstance={isBareMetalInstance}
            linodeId={id}
            mostRecentBackup={backups.last_successful}
          />
        </TableCell>
      </Hidden>
      <TableCell actionCell data-qa-notifications>
        <RenderFlag
          mutationAvailable={
            linodeType !== undefined && linodeType?.successor !== null
          }
        />
        <LinodeActionMenu
          linodeBackups={backups}
          linodeId={id}
          linodeLabel={label}
          linodeRegion={region}
          linodeStatus={status}
          linodeType={linodeType}
          {...handlers}
          inListView
        />
      </TableCell>
    </TableRow>
  );
};

export const RenderFlag: React.FC<{
  mutationAvailable: boolean;
}> = (props) => {
  /*
   * Render either a flag for if the Linode has a notification
   * or if it has a pending mutation available. Mutations take
   * precedent over notifications
   */
  const { mutationAvailable } = props;

  if (mutationAvailable) {
    return (
      <Tooltip title="There is a free upgrade available for this Linode">
        <Flag />
      </Tooltip>
    );
  }
  return null;
};

RenderFlag.displayName = `RenderFlag`;

export const ProgressDisplay: React.FC<{
  className?: string;
  progress: null | number;
  sx?: SxProps;
  text: string | undefined;
}> = (props) => {
  const { className, progress, sx, text } = props;
  const displayProgress = progress ? `${progress}%` : `scheduled`;

  return (
    <Typography className={className} sx={sx} variant="body1">
      {text} {displayProgress === 'scheduled' ? '(0%)' : `(${displayProgress})`}
    </Typography>
  );
};
