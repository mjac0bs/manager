import { IconButton, Stack, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';

import { StyledLabelTable } from './LabelTable.styles';

import type { Taint } from '@linode/api-v4';

export const TaintTable = () => {
  const {
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const taints: Taint[] = watch('taints');
  const _errors = errors.taints
    ? Object.entries(errors.taints).reduce((acc, [key, value], index) => {
        acc[index] = [Number(key), value?.key.message];
        return acc;
      }, {} as Record<number, [number, string]>)
    : undefined;

  const handleRemoveTaint = (removedTaint: Taint) => {
    setValue(
      'taints',
      taints.filter(
        (taint) =>
          taint.key !== removedTaint.key ||
          taint.value !== removedTaint.value ||
          taint.effect !== removedTaint.effect
      ),
      { shouldDirty: true }
    );
  };

  return (
    <StyledLabelTable aria-label="List of Node Pool Taints">
      <TableHead>
        <TableRow>
          <TableCell>Node Taint</TableCell>
          <TableCell>Effect</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {taints && taints.length > 0 ? (
          taints.map((taint, i) => {
            const taintError: string | undefined = _errors
              ? Object.values(_errors).find((taint) => {
                  const [index, message] = taint;
                  return index === i ? message : undefined;
                })?.[1]
              : undefined;
            return (
              <TableRow
                data-qa-taint-row={taint.key}
                key={`taint-row-${i}-${taint.key}`}
              >
                <TableCell errorCell={!!taintError} errorText={taintError}>
                  {taint.key}: {taint.value}
                </TableCell>
                <TableCell sx={{ paddingRight: 0 }}>
                  <Stack alignItems="center" direction="row">
                    {taint.effect}
                    <IconButton
                      aria-label={`Remove ${taint.key}: ${taint.value}`}
                      disableRipple
                      onClick={() => handleRemoveTaint(taint)}
                      size="medium"
                      sx={{ marginLeft: 'auto' }}
                    >
                      <Close />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow key="taint-row-empty">
            <TableCell colSpan={2}>
              <Typography textAlign="center">No taints</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </StyledLabelTable>
  );
};
