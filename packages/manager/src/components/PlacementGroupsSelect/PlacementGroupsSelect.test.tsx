import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { PlacementGroupsSelect } from './PlacementGroupsSelect';

import type { PlacementGroupsSelectProps } from './PlacementGroupsSelect';

const props: PlacementGroupsSelectProps = {
  errorText: '',
  handlePlacementGroupChange: vi.fn(),
  id: '',
  label: 'Placement Groups in Atlanta, GA (us-southeast)',
  noOptionsMessage: '',
  selectedRegionId: 'us-southeast',
};

describe('PlacementGroupSelect', () => {
  it('should render a Select component', () => {
    const { getByTestId } = renderWithTheme(
      <PlacementGroupsSelect {...props} />
    );
    expect(getByTestId('placement-groups-select')).toBeInTheDocument();
  });

  it('should render a Select component with the correct label', () => {
    const { getByText } = renderWithTheme(<PlacementGroupsSelect {...props} />);
    expect(getByText(/Placement Groups in /)).toBeInTheDocument();
  });
});
