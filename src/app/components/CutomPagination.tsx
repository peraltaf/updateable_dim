import {
  GridPagination,
  useGridApiContext,
  useGridSelector,
  gridPageCountSelector
} from '@mui/x-data-grid';
import MuiPagination from '@mui/material/Pagination';
import { TablePaginationProps } from '@mui/material/TablePagination';
import { ChangeEvent, MouseEvent } from 'react';


const Pagination = ({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, 'page' | 'onPageChange' | 'className'>) => {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <MuiPagination
      color='primary'
      className={className}
      count={pageCount}
      page={page + 1}
      onChange={(event: ChangeEvent<unknown>, newPage:number) => {
        onPageChange(event as MouseEvent<HTMLButtonElement>, newPage-1);
      }}
    />
  );
}

const CustomPagination = (props: object) => {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
}

export default CustomPagination;
