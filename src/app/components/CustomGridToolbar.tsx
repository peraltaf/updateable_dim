'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  styled
} from '@mui/material';
import { GridToolbarContainer } from '@mui/x-data-grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useState
} from 'react';
import {
  BaseRecord,
  DifferencesBaseType,
  useChangesStore,
  useDeletedRowsStore,
  useNewRowsStore,
  useOGRowsStore,
  useRowsStore
} from '../context/store';
import { diff } from 'deep-object-diff';
import Papa, { ParseResult } from 'papaparse';
import { v4 as uuidv4 } from 'uuid';
import CloseIcon from '@mui/icons-material/Close';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface CustomGridToolbarProps {
  setNewRecordOpen: Dispatch<SetStateAction<boolean>>
  setVerifyOpen: Dispatch<SetStateAction<boolean>>
  setRowsAddedNonce: (nonce:number) => void
}

const CustomGridToolbar = ({ setNewRecordOpen, setVerifyOpen, setRowsAddedNonce }:CustomGridToolbarProps) => {
  const { rows, setRows } = useRowsStore();
  const { ogRows } = useOGRowsStore();
  const { newRecords, setNewRecords } = useNewRowsStore();
  const { setChanges } = useChangesStore();
  const { deletedRecords } = useDeletedRowsStore();
  const [open, setOpen] = useState<boolean>(false);

  const handleSave = () => {
    const differences:DifferencesBaseType[] = [];

    ogRows.forEach((d) => {
      const target = rows.filter((n) => n.id === d.id)[0];
      const diffs = diff(target, d);
      const diffKeys = Object.keys(diffs);

      if (diffKeys.length > 0) {
        const diff:DifferencesBaseType = {
          old: d,
          changedKeys: diffKeys
        };

        if (target) diff['new'] = target;
        differences.push(diff);
      }
    });

    newRecords.forEach((d) => {
      differences.push({
        new: d
      })
    });

    deletedRecords.forEach((d) => {
      differences.push({
        old: d
      })
    });

    setChanges(differences);
    setVerifyOpen(true);
    setRowsAddedNonce(new Date().valueOf());
  }
  
  const handleBulkOpen = async (event:ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const file = target.files![0];
    console.log(file)
    

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results:ParseResult<BaseRecord>) {
        const rawData:BaseRecord[] = results.data;
        const data:BaseRecord[] = rawData.map((d:BaseRecord) => {
          const newId = uuidv4();
          d['Review Date'] = new Date(d['Review Date']);
          d.isNew = true;
          d.id = newId;
          d.guid = newId;
          return d;
        });
        const authors = rows.map((d) => d.Author);
        const csv_authors = results.data.map((d) => d.Author);
        
        if (csv_authors.some((v:string) => authors.includes(v))) {
          setOpen(true);
          return;
        }

        setRows([...data, ...rows]);
        setNewRecords([...data, ...newRecords]);
        console.log('upload done...')
        return;
      }
    });
  }

  return (
    <GridToolbarContainer>
      <Button
        color='primary'
        startIcon={<AddIcon />}
        onClick={() => setNewRecordOpen(true)}
      >
        Add record
      </Button>

      <Button
        color='primary'
        startIcon={<CloudUploadIcon />}
        component='label'
        role={undefined} tabIndex={-1}
      >
        Upload CSV
        <VisuallyHiddenInput type='file' onChange={handleBulkOpen} />
      </Button>

      <Button
        color='primary'
        startIcon={<SaveIcon />}
        onClick={handleSave}
      >
        Save to database
      </Button>

      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Error process uploaded file
          <IconButton
            aria-label='close'
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Alert variant='outlined' severity='error'>
            Duplicate SPIDs detected in uploaded file; SPID values must be unique.
          </Alert>
        </DialogContent>
      </Dialog>
    </GridToolbarContainer>
  );
}

export default CustomGridToolbar;
