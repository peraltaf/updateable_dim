import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import dayjs from 'dayjs';
import { diff } from 'deep-object-diff';
import {
  useUpdateDatesStore,
  UpdateDate,
  BaseRecord,
  useColumnsStore,
  ColsBaseType,
  DifferencesBaseType
} from '../context/store';


interface CompareVersionsProps {
  comparVersionsOpen: boolean
  setComparVersionsOpen: Dispatch<SetStateAction<boolean>>
}

const CompareVersions = ({ comparVersionsOpen, setComparVersionsOpen }: CompareVersionsProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [leftUpdateDate, setLeftUpdateDate] = useState<string>('');
  const [compareUpdateDates, setCompareUpdateDates] = useState<UpdateDate[]>([]);
  const [rightUpdateDate, setRightUpdateDate] = useState<string>('');
  const [rightUpdateDateVis, setRightUpdateDateVis] = useState<boolean>(false)
  const [newRecords, setNewRecords] = useState<BaseRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<BaseRecord[]>([]);
  const [differences, setDifferences] = useState<object[]>([]);
  const { updateDates } = useUpdateDatesStore();
  const [verifyColumns, setVerifyColumns] = useState<ColsBaseType[]>([]);
  const { columns } = useColumnsStore();

  const handleCompare = async () => {
    const leftSide:BaseRecord[] = await getData(leftUpdateDate);
    const rightSide:BaseRecord[] = await getData(rightUpdateDate);
    const leftGUIDS = await leftSide.map((d:BaseRecord) => d.guid);
    const rightGUIDS = await rightSide.map((d:BaseRecord) => d.guid);
    const newRows = leftSide.reduce((a:BaseRecord[],c:BaseRecord) => {
      if (!rightGUIDS.includes(c.guid)) return [...a, c];
      return a;
    }, []);
    const newGUIDS = newRows.map((d:BaseRecord) => d.guid);
    const leftSideReset = leftSide.filter((d:BaseRecord) => {
      delete d.id;
      delete d['Updated By'];
      delete d['Update Date'];
      return !newGUIDS.includes(d.guid);
    });

    // find deleted rows, right side is older
    const deletedRows = rightSide.reduce((a:BaseRecord[],c:BaseRecord) => {
      if (!leftGUIDS.includes(c.guid)) return [...a, c];
      return a;
    }, []);
    const deletedGUIDS = deletedRows.map((d:BaseRecord) => d.guid);
    const rightSideReset = rightSide.filter((d:BaseRecord) => {
      delete d.id;
      delete d['Updated By'];
      delete d['Update Date'];
      return !deletedGUIDS.includes(d.guid);
    });
    
    setNewRecords(newRows);
    setDeletedRecords(deletedRows);

    const differences:object[] = [];

    leftSideReset.forEach((d:BaseRecord) => {
      const target = rightSideReset.filter((n:BaseRecord) => n.guid === d.guid)[0];
      const diffKeys = Object.keys(diff(target, d));
      if (diffKeys.length > 0) {
        differences.push({
          new: d,
          old: target,
          changedKeys: diffKeys
        })
      }
    });
    console.log(differences)
    setDifferences(differences);
  }

  const getData = async (sel_date:string) => {
    if (sel_date === '') return;

    const res = await fetch(`/api/get_data/?updateDate=${sel_date}`);
    const records = await res.json();
    return records;
  }

  const handleClose = () => {
    setNewRecords([]);
    setDeletedRecords([]);
    setDifferences([]);
    setLeftUpdateDate('');
    setRightUpdateDate('');
    setComparVersionsOpen(false);
    setRightUpdateDateVis(false);
  }

  useEffect(() => setOpen(comparVersionsOpen), [comparVersionsOpen]);
  useEffect(() => {
    const filteredCols = columns.filter((d) => !['','Update By'].includes(d.headerName));
    setVerifyColumns(filteredCols)
  }, [columns]);

  return (
    <Dialog
      open={open}
      onClose={() => setComparVersionsOpen(false) }
      fullWidth
      maxWidth='xl'
    >
      <DialogTitle>Compare Versions</DialogTitle>
      <DialogContent>
        <Stack
          direction='row'
          spacing={1}
          sx={{ width: rightUpdateDateVis ? 800 : 325, mt: 1 }}
        >
          <FormControl
            fullWidth
            size='small'
            sx={{ mr: 1 }}
          >
            <InputLabel sx={{ background: '#FFF' }} >UPDATE DATE 1&nbsp;</InputLabel>
            <Select
              value={leftUpdateDate}
              label='Update Date 1'
              onChange={(d:SelectChangeEvent) => {
                setLeftUpdateDate(d.target.value);
                setRightUpdateDateVis(true);
                const rightDates = updateDates.filter((n) => n.update_date < d.target.value);
                setCompareUpdateDates(rightDates);
              }}
            >
              {updateDates.map((d,i) => (
                <MenuItem key={`update-dt-${i}`} value={d.update_date}>{dayjs(d.update_date).format('MMM DD, YYYY hh:mm a')} (by {d.updated_by})</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {
            rightUpdateDateVis && <>
              <FormControl
                fullWidth
                size='small'
                sx={{ mr: 1 }}
              >
                <InputLabel sx={{ background: '#FFF' }} >UPDATE DATE 2&nbsp;</InputLabel>
                <Select
                  value={rightUpdateDate}
                  label='Update Date 2'
                  onChange={(d:SelectChangeEvent) => {
                    setRightUpdateDate(d.target.value);
                  }}
                >
                  {compareUpdateDates.map((d,i) => (
                    <MenuItem key={`update-dt-${i}`} value={d.update_date}>{dayjs(d.update_date).format('MMM DD, YYYY hh:mm a')} (by {d.updated_by})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='outlined'
                sx={{ width: 200 }}
                onClick={handleCompare}
              >
                Compare
              </Button>
            </>
          }
        </Stack>

        <Divider sx={{ mt: 2, mb: 2 }} />

        {
          newRecords.length > 0 &&
          <>
            <Typography variant='h6'>New Records</Typography>
            <Table
              sx={{ minWidth: 650 }}
              size='small'
            >
              <TableHead>
                <TableRow>
                  { verifyColumns.map((x) => (
                    <TableCell
                      key={`new-record-${x.headerName}`}
                      sx={{ width: x.headerName === 'Review' ? '30%' : '8.75%' }}
                    >
                      {x.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  newRecords.map((d:BaseRecord, i:number) => {
                    return (
                      <TableRow
                        key={`new-record-${i}`}
                        sx={{ background: i%2 === 1 ? '#F2F2F2' : '' }}
                      >
                        { verifyColumns.map((x:ColsBaseType,n:number) => (
                          <TableCell 
                            key={`new-record-cell-${x.headerName}-${n}`}
                            sx={{ width: x.headerName === 'Review' ? '30%' : '8.75%', fontSize: '0.75em', color: '#5C8C46' }}
                          >
                            { x.type === 'date' ? dayjs(`${d[x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d[x.headerName as keyof BaseRecord]}` }
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </>
        }

        {
          deletedRecords.length > 0 &&
          <>
            <Divider sx={{ mt: 6, mb: 2 }} />
            <Typography variant='h6'>Deleted Records</Typography>
            <Table
              sx={{ minWidth: 650 }}
              size='small'
            >
              <TableHead>
                <TableRow>
                  { verifyColumns.map((x) => (
                    <TableCell
                      key={`new-record-${x.headerName}`}
                      sx={{ width: x.headerName === 'Review' ? '30%' : '8.75%' }}
                    >
                      {x.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  deletedRecords.map((d:BaseRecord, i:number) => {
                    return (
                      <TableRow
                        key={`new-record-${i}`}
                        sx={{ background: i%2 === 1 ? '#F2F2F2' : '' }}
                      >
                        { verifyColumns.map((x,n:number) => (
                          <TableCell 
                            key={`new-record-cell-${x.headerName}-${n}`}
                            sx={{ width: x.headerName === 'Review' ? '30%' : '8.75%', fontSize: '0.75em', color: '#BF1111' }}
                          >
                            { x.type === 'date' ? dayjs(`${d[x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d[x.headerName as keyof BaseRecord]}` }
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </>
        }

        {
          differences.length > 0 && <>
            <Divider sx={{ mt: 6, mb: 2 }} />
            <Typography variant='h6'>Updated Records</Typography>
          </>
        }

        {
          differences.length > 0 && differences.map((d:DifferencesBaseType, i:number) => {
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
                      <TableCell sx={{ width: '7.75%' }}>Record Type</TableCell>
                      { verifyColumns.map((x) => (
                        <TableCell
                          key={`new-record-${x.headerName}`}
                          sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%' }}
                        >
                          {x.headerName}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      sx={{ background: i%2 === 1 ? '#F2F2F2' : '' }}
                      key={`updated-record-${i}`}
                    >
                      <TableCell sx={{ width: '12%', fontSize: '0.75em' }}>Updated Record</TableCell>
                      { verifyColumns.map((x,n:number) => (
                        <TableCell 
                          key={`updated-record-cell-${x.headerName}-${n}-new`}
                          sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: d.changedKeys!.includes(x.headerName) ? 'orange' : 'inheret' }}
                        >
                          { x.type === 'date' ? dayjs(`${d?.new![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.new![x.headerName as keyof BaseRecord]}` }
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow
                      key={`updated-record-${i+1000}`}
                      sx={{ background: i%2 === 1 ? '#F2F2F2' : '' }}
                    >
                      <TableCell sx={{ width: '12%', fontSize: '0.75em' }}>Old Record</TableCell>
                      { verifyColumns.map((x,n:number) => {
                        if (d.old) return <TableCell 
                          key={`updated-record-cell-${x.headerName}-${n}-old`}
                          sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', color: d.changedKeys!.includes(x.headerName) ? 'orange' : 'inheret' }}
                        >
                          { x.type === 'date' ? dayjs(`${d?.old![x.headerName as keyof BaseRecord]}`).format('YYYY-MM-DD') : `${d?.old![x.headerName as keyof BaseRecord]}` }
                        </TableCell>
                        }
                      )}
                    </TableRow>
                    <TableRow >
                      <TableCell sx={{ width: '12%', fontSize: '0.75em', background: '#FFFFFF' }}></TableCell>
                      { verifyColumns.map((x,n:number) => (
                        <TableCell 
                          key={`updated-record-cell-${x.headerName}-${n}-new`}
                          sx={{ width: x.headerName === 'Review' ? '30%' : '7.75%', fontSize: '0.75em', background: '#FFFFFF' }}
                        >
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            )
          })
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompareVersions;
