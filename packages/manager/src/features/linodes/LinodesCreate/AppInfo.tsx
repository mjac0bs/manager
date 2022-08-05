import * as React from 'react';
import Info from 'src/assets/icons/info.svg';

interface Props {
  onClick: () => void;
}

const getOnClickHandler = (openDrawer: Props['onClick']) => (
  event: React.MouseEvent<any>
) => {
  event.stopPropagation();
  event.preventDefault();
  openDrawer();
};

const AppInfo = (props: Props) => {
  const { onClick } = props;
  const onClickHandler = getOnClickHandler(onClick);
  return <Info onClick={onClickHandler} />;
};

export default AppInfo;
