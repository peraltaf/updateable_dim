import { Box } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowModesModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSlots,
  useGridApiRef,
} from '@mui/x-data-grid';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import {
  BaseRecord,
  useColumnsStore,
  useRowsStore,
} from '../context/store';
import CustomGridToolbar from './CustomGridToolbar';
import CustomPagination from './CutomPagination';


interface CustomDataGridProps {
  setNewRecordOpen: Dispatch<SetStateAction<boolean>>
  setVerifyOpen: Dispatch<SetStateAction<boolean>>
  rowsAddedNonce: number
  setRowsAddedNonce: (nonce:number) => void
}

const CustomDataGrid = ({ setNewRecordOpen, setVerifyOpen, rowsAddedNonce, setRowsAddedNonce }:CustomDataGridProps) => {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { rows, setRows } = useRowsStore();
  const { columns } = useColumnsStore();
  const apiRef = useGridApiRef();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 100,
    page: 0,
  });
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]); 

  const handleRowEditStop: GridEventListener<'rowEditStop'> = () => {
    setRowSelectionModel([]);
    return;
  };

  const handleRowModesModelChange = (newRowModesModel:GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleProcessRowUpdate = (updatedRow:BaseRecord, originalRow:BaseRecord) => {
    if (JSON.stringify(updatedRow) !== JSON.stringify(originalRow)) {
      updatedRow.isUpdated = true;
      setRows(rows.map((row:BaseRecord) => (row.id === updatedRow.id ? updatedRow : row)));
    }

    return updatedRow;
  }

  const handleGetRowClassName = (params:GridRowParams) => params.row.isUpdated ? 'row-updated' 
    : params.row.isNew ? 'row-new' : '';

  const handleOnProcessRowUpdateError = (params:unknown) => console.log('error', params);

  const EditToolbar = () => {
    return (
      <CustomGridToolbar 
        setNewRecordOpen={setNewRecordOpen}
        setVerifyOpen={setVerifyOpen}
        setRowsAddedNonce={setRowsAddedNonce}
      />
    );
  }

  useEffect(() => {
    setPaginationModel({
      pageSize: 100,
      page: 0,
    });
  }, [rowsAddedNonce]);


  return (
    <Box component='section' sx={{ p: 3 }}>
      <Box
        sx={{
          height: 'calc(100vh - 185px)',
          width: '100%',
          '& .actions': {
            color: 'text.secondary',
          },
          '& .textPrimary': {
            color: 'text.primary',
          },
        }}
      >
        <DataGrid
          density='compact'
          editMode='row'
          rows={rows}
          columns={columns as GridColDef[]}
          apiRef={apiRef}
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onProcessRowUpdateError={handleOnProcessRowUpdateError}
          processRowUpdate={handleProcessRowUpdate}
          getRowClassName={handleGetRowClassName}
          slots={{
            toolbar: EditToolbar as GridSlots['toolbar'],
            pagination: CustomPagination,
          }}
          onRowSelectionModelChange={(newRowSelectionModel) => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
        />
      </Box>
    </Box>
  )
}

export default CustomDataGrid;
