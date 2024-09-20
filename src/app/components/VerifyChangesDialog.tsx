'use client';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import {
  BaseRecord,
  ColsBaseType,
  DifferencesBaseType,
  useChangesStore,
  useColumnsStore,
  useSaveErrorStore
} from '../context/store';
import dayjs from 'dayjs';


interface VerifyChangesDialogProps {
  verifyOpen: boolean
  saveError?: 'none'|'flex'
  saveErrorMsg?: string
  setVerifyOpen: Dispatch<SetStateAction<boolean>>
  handleSubmitChanges: () => Promise<void>
}

const VerifyChangesDialog = ({ verifyOpen, setVerifyOpen, handleSubmitChanges }:VerifyChangesDialogProps) => {
  const [submitBtnState, setSubmitBtnState] = useState<boolean>(false);
  const { changes } = useChangesStore();
  const { saveError, setSaveError } = useSaveErrorStore();
  const { columns } = useColumnsStore();
  const [verifyColumns, setVerifyColumns] = useState<ColsBaseType[]>([]);

  const handleSubmit = () => {
    setSubmitBtnState(true);
    handleSubmitChanges();
  }

  const handleCancel = () => {
    setSaveError({ errorState: 'none', errorMsg: '' });
    setVerifyOpen(false);
  }

  useEffect(() => setSubmitBtnState(false), [verifyOpen]);
  useEffect(() => {
    const filteredCols = columns.filter((d) => !['','Update By'].includes(d.headerName));
    setVerifyColumns(filteredCols)
  }, [columns]);

  return (
    <>
      <Dialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        fullWidth={true}
        maxWidth='xl'
      >
        <DialogTitle>Verify Changes</DialogTitle>
        <DialogContent>
          <Alert
            variant='outlined'
            severity='error'
            sx={{ display: saveError.errorState }}
            onClose={() => setSaveError({ errorState: 'none', errorMsg: '' })}
          >
            An error occured while attempting to save changes. Please contact an admin.
            <br /> {saveError.errorMsg}
          </Alert>

          {
            changes?.length > 0 
            ? changes?.map((d:DifferencesBaseType,i:number) => {
              return (
              <Box
                key={`table-changes-${i}`}
              >
                <Table
                  sx={{ minWidth: 650, background: i%2 === 1 ? '#F2F2F2' : '' }}
                  size='small'
                >
                  <TableHead sx={{ display: i === 0 ? '' : 'none' }}>
                    <TableRow>
                      <TableCell sx={{ width: 'auto' }}>Record Type</TableCell>

                      { verifyColumns.map((x,n) => (
                        <TableCell
                          key={`${x.headerName}-${n}-${i}`}
                          sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%' }}
                        >
                          {x.headerName}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    { (Object.keys(d).includes('new') && !Object.keys(d).includes('old') && !Object.keys(d).includes('changedKeys')) ?
                      <TableRow>
                        <TableCell
                          sx={{ width: 'auto', fontSize: '0.75em', color: !Object.keys(d).includes('old') ? '#5C8C46' : 'inherit' }}
                        >
                          New Record
                        </TableCell>
                        { verifyColumns.map((x,n) => (
                          <TableCell
                            key={`updated-${x.headerName}-${n}-${i}`}
                            sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: !Object.keys(d).includes('old') ? '#5C8C46' : 'inherit' }}
                          >
                            { x.type === 'date' ? dayjs(`${d?.new![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.new![x.headerName as keyof BaseRecord]}` }
                          </TableCell>
                        ))}
                      </TableRow>
                    : (Object.keys(d).includes('old') && !Object.keys(d).includes('new') && Object.keys(d).includes('changedKeys')) ?
                      <TableRow>
                        <TableCell
                          sx={{ width: 'auto', fontSize: '0.75em', color: !Object.keys(d).includes('new') ? '#BF1111' : 'inherit' }}
                        >
                          Deleted Record
                        </TableCell>
                        { verifyColumns.map((x,n) => (
                          <TableCell
                            key={`updated-${x.headerName}-${n}-${i}`}
                            sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: !Object.keys(d).includes('new') ? '#BF1111' : 'inherit' }}
                          >
                            { x.type === 'date' ? dayjs(`${d?.old![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.old![x.headerName as keyof BaseRecord]}` }
                          </TableCell>
                        ))}
                      </TableRow>
                    :
                      <>
                        <TableRow>
                          <TableCell
                            sx={{ width: 'auto', fontSize: '0.75em', color: !Object.keys(d).includes('old') ? '#5C8C46' : 'inherit' }}
                          >
                            Updated Record
                          </TableCell>
                          { verifyColumns.map((x,n) => (
                            <TableCell
                              key={`changed-${x.headerName}-${n}-${i}`}
                              sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: d.changedKeys?.includes(x.headerName) ? 'orange' : 'inheret' }}
                            >
                              { x.type === 'date' ? dayjs(`${d?.new![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.new![x.headerName as keyof BaseRecord]}` }
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell
                            sx={{ width: 'auto', fontSize: '0.75em', color: !Object.keys(d).includes('new') ? '#BF1111' : 'inherit' }}
                          >
                            Old Record
                          </TableCell>
                          { verifyColumns.map((x,n) => (
                            <TableCell
                              key={`changed-${x.headerName}-${n}-${i}`}
                              sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: d.changedKeys?.includes(x.headerName) ? 'orange' : 'inheret' }}
                            >
                              { x.type === 'date' ? dayjs(`${d?.old![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.old![x.headerName as keyof BaseRecord]}` }
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    }
                  </TableBody>
                </Table>
                <br />
                { i < changes.length-1 && <Divider /> }
              </Box>)
              })
            : <DialogContentText>
                There are no current changes to the dataset.
              </DialogContentText>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          { changes?.length > 0 && <Button disabled={submitBtnState} onClick={handleSubmit}>Submit Changes</Button> }
        </DialogActions>
      </Dialog>
    </>
  );
}

export default VerifyChangesDialog;
