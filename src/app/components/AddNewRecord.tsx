import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid2,
  TextField
} from '@mui/material';
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import {
  BaseRecord,
  ColsBaseType,
  useColumnsStore,
  useLogin,
  useNewRowsStore,
  useRowsStore
} from '../context/store';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';


interface AddNewRecordDialogProps {
  newRecordOpen: boolean
  handleClose: Dispatch<SetStateAction<boolean>>
}

const AddNewRecordDialog = ({ newRecordOpen, handleClose }:AddNewRecordDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [addNewError, setAddNewError] = useState<'none'|'flex'>('none');
  const { rows, setRows } = useRowsStore();
  const { newRecords, setNewRecords } = useNewRowsStore();
  const { columns } = useColumnsStore();
  const { info } = useLogin();
  const [addNewColumns, setAddNewColumns] = useState<ColsBaseType[]>([]);

  const addNewRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const authorsBanks = rows.map((d) => `${d.Author}|${d.Bank}`);
    const targetVal = `${event.currentTarget.Author.value}|${event.currentTarget.Bank.value}`;

    if (authorsBanks.includes(targetVal)) {
      setAddNewError('flex');
      return;
    }

    setAddNewError('none');

    const newId = uuidv4();
    const newRecord:BaseRecord = {
      Author: event.currentTarget.Author.value,
      'Review Date': dayjs().toDate(),
      Address: event.currentTarget.Address.value,
      Bank: event.currentTarget.Bank.value,
      Rating: event.currentTarget.Rating.value,
      'Review Title By User': event.currentTarget['Review Title By User'].value,
      Review: event.currentTarget.Review.value,
      'Rating Title By User': event.currentTarget['Rating Title By User'].value,
      'Useful Count': 0,
      'Updated By': info.username,
      'Update Date': dayjs().toDate(),
      id: newId,
      isNew: true,
      guid: newId
    }
    
    setRows([newRecord, ...rows]);
    setNewRecords([...newRecords, newRecord]);
    handleClose(false);
  }

  useEffect(() => setOpen(newRecordOpen), [newRecordOpen]);
  useEffect(() => {
    let filteredCols = columns.filter((d) => !['','Review Date','Update By','Useful Count'].includes(d.headerName));
    filteredCols = [...filteredCols.filter(d => d.headerName !== 'Review'), ...filteredCols.filter(d => d.headerName === 'Review')];
    setAddNewColumns(filteredCols)
  }, [columns])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: 'form',
        onSubmit: (event: FormEvent<HTMLFormElement>) => addNewRecord(event),
      }}
    >
      <DialogTitle>Add Record</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Add a new record appended to the existing dataset.
        </DialogContentText>
        <Alert 
          severity='error'
          sx={{ display: addNewError }}
          variant='outlined'
        >
          <AlertTitle>Error - Duplicate Author</AlertTitle>
          Cannot use an existing Author|Bank combination to insert a new record. Create a unique Author|Bank combination to continue.
        </Alert>

        <Grid2 container spacing={1}>
          { addNewColumns.map((d) => (
            d.headerName === 'Review' 
              ? <Grid2
                  key={d.headerName}
                  size={12}
                >
                  <TextField
                    required
                    margin='dense'
                    label={d.headerName}
                    type={d.type === 'string' ? 'text' : 'number' }
                    id={d.headerName}
                    name={d.headerName}
                    fullWidth
                    multiline
                    rows={3}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid2>
              : <Grid2
                  key={d.headerName}
                  size={6}
                >
                  <TextField
                    required
                    margin='dense'
                    label={d.headerName}
                    type={d.type === 'string' ? 'text' : 'number' }
                    id={d.headerName}
                    name={d.headerName}
                    value={d.headerName === 'Author' ? info.username : undefined}
                    disabled={d.headerName === 'Author' ? true : false}
                    fullWidth
                    variant='outlined'
                    slotProps={{
                      inputLabel: { shrink: true },
                      htmlInput: {
                        min: 1,
                        max: 5
                      }
                    }}
                  />
                </Grid2>
          ))}
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
            handleClose(false);
            setAddNewError('none');
          }}
        >Cancel</Button>
        <Button type='submit'>Add Record</Button>
      </DialogActions>
      </Dialog>
  );
}

export default AddNewRecordDialog;
