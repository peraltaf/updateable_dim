'use client';

import {
  Alert,
  Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { GridActionsCellItem, GridEditInputCell, GridRowParams } from '@mui/x-data-grid';
import {
  useCallback,
  useEffect,
  useState
} from 'react';
import VerifyChangesDialog from './VerifyChangesDialog';
import SaveOlderWarning from './SaveOlderWarning';
import AddNewRecordDialog from './AddNewRecord';
import UpdateDateFilter from './UpdateDateFilter';
import {
  BaseRecord,
  ColsBaseType,
  useChangesStore,
  useColumnsStore,
  useDeletedRowsStore,
  useLogin,
  useNewRowsStore,
  useOGRowsStore,
  useRowsStore,
  useSaveErrorStore,
  useUpdateDatesStore
} from '../context/store';
import CustomDataGrid from './CustomDataGrid';
import dayjs from 'dayjs';


export default function MainApp() {
  const [newRecordOpen, setNewRecordOpen] = useState<boolean>(false);
  const [olderDateData, setOlderDateData] = useState<boolean>(false);
  const handleOlderDateOpen = () => setOlderDateData(true);
  const handleOlderDateClose = () => setOlderDateData(false);
  const [verifyOpen, setVerifyOpen] = useState<boolean>(false);
  const [rowsAddedNonce, setRowsAddedNonce] = useState<number>(new Date().valueOf())

  const { rows, setRows } = useRowsStore();
  const { setChanges } = useChangesStore();
  const { setColumns } = useColumnsStore();
  const { setDeletedRecords } = useDeletedRowsStore();
  const { setNewRecords } = useNewRowsStore();
  const { setOGRows } = useOGRowsStore();
  const { setSaveError } = useSaveErrorStore();
  const { updateDates, setUpdateDates } = useUpdateDatesStore();

  const [selUpdateDate, setSelUpdateDate] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<'none'|'flex'>('none');
  const [forceChanges, setForceChanges] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const { info } = useLogin();

  const handleForceChanges = () => {
    setForceChanges(true);
    handleSubmitChanges();
  }

  const handleSubmitChanges = async () => {
    if (selUpdateDate !== updateDates[0]?.update_date && !forceChanges) {
      handleOlderDateOpen();
      return;
    }

    const res = await fetch(`/api/save_changes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: info.username, data: rows })
    });

    const resJson = await res.json();
    
    if (resJson.status === 'success') {
      setVerifyOpen(false);
      setSaveError({
        errorState: 'none',
        errorMsg: ''
      });
      setSuccessMsg('flex');
      getUpdateDts();
    } else {
      setSaveError({
        errorState: 'flex',
        errorMsg: resJson.status
      });
    }
    
    setCountdown(10);
    setTimeout(() => setSuccessMsg('none'), 10000);
  }

  const handleDeleteClick = useCallback((targetID:string) => {
    const newRows = useNewRowsStore.getState().newRecords.filter((row) => row.id !== targetID);
    const updatedRows = useRowsStore.getState().rows.filter((row) => row.id !== targetID);
    setNewRecords(newRows);
    setRows(updatedRows);
  }, [setNewRecords, setRows]);

  const getData = useCallback(async (sel_date:string) => {
    if (sel_date === '') return;

    const res = await fetch(`/api/get_data/?updateDate=${sel_date}`);
    const records = await res.json();
    records.forEach((d:BaseRecord) => d['Review Date'] = dayjs(d['Review Date']).toDate());
    setRows(records);
    setOGRows(records);
    setDeletedRecords([]);
    setChanges([]);
    setNewRecords([]);

    const mappedCols = Object.keys(records[0])
      .filter((d:string) => !['Update Date', 'Updated By', 'guid', 'id'].includes(d))
      .map((d:string) => {
        const col:ColsBaseType = {
          field: d,
          headerName: d,
          flex: 1,
          editable: d === 'Update Date' ? false : true,
          type: ['Rating', 'Useful Count'].includes(d) ? 'number' : d === 'Review Date' ? 'date' : 'string'
        }

        if (d === 'Rating') {
          col.renderEditCell = (params:object) => (
            <GridEditInputCell
              {...params}
              inputProps={{
                max: 5,
                min: 1,
              }}
            />
          )
        }

        return col;
      });

    const cols = [...mappedCols, {
      field: 'actions',
      headerName: '',
      type: 'actions',
      width: 20,
      cellClassName: 'actions',
      getActions: (d:GridRowParams) => {
        return [
          <GridActionsCellItem
            key={`delete-${d?.id}`}
            icon={<DeleteIcon />}
            label='Delete'
            onClick={() => handleDeleteClick(d.row.guid)}
            color='inherit'
          />
        ];
      },
    }];
    
    setColumns(cols);
  }, [handleDeleteClick, setChanges, setColumns, setDeletedRecords, setNewRecords, setOGRows, setRows]);

  const getUpdateDts = useCallback(async () => {
    const updateRes = await fetch(`/api/get_update_dts`);
    const updateDatesJson = await updateRes.json();

    setUpdateDates(updateDatesJson);
    setSelUpdateDate(updateDatesJson[0]?.update_date);
  }, [setUpdateDates]);

  useEffect(() => {
    getUpdateDts();
  }, [getUpdateDts]);

  useEffect(() => {
    getData(selUpdateDate);
  }, [getData, selUpdateDate]);

  useEffect(() => {
    countdown > 0 && setTimeout(() => setCountdown(countdown-1), 1000);
  }, [countdown]);

  return (
    <>
      <SaveOlderWarning
        olderDateData={olderDateData}
        handleOlderDateClose={handleOlderDateClose}
        handleForceChanges={handleForceChanges}
      />

      <AddNewRecordDialog
        newRecordOpen={newRecordOpen}
        handleClose={() => {
          setNewRecordOpen(false); 
          setRowsAddedNonce(new Date().valueOf());
        }}
      />

      <VerifyChangesDialog
        verifyOpen={verifyOpen}
        setVerifyOpen={setVerifyOpen}
        handleSubmitChanges={handleSubmitChanges}
      />

      <Stack direction='row'>
        <UpdateDateFilter
          setUpdateDateFilter={setSelUpdateDate}
          initialUpdateDate={selUpdateDate}
        />

        <Alert
          variant='outlined'
          severity='success'
          sx={{ display: successMsg, alignSelf: 'flex-end', padding: '0 16px' }}
          onClose={() => setSuccessMsg('none')}
        >
          Successfully saved changes. (Closing in {countdown} seconds)
        </Alert>
      </Stack>

      <CustomDataGrid
        setNewRecordOpen={setNewRecordOpen}
        setVerifyOpen={setVerifyOpen}
        rowsAddedNonce={rowsAddedNonce}
        setRowsAddedNonce={setRowsAddedNonce}
      />
    </>
  );
}
