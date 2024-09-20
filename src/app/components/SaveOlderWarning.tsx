import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState
} from 'react';


interface SaveOlderWarningProps {
  olderDateData: boolean
  handleOlderDateClose: Dispatch<SetStateAction<boolean>>
  handleForceChanges: () => void
}

const SaveOlderWarning = ({ olderDateData, handleOlderDateClose, handleForceChanges }:SaveOlderWarningProps) => {
  const [open, setOpen] = useState<boolean>(false);
  
  useEffect(() => {
    setOpen(olderDateData)
  }, [olderDateData]);

  return (
    <Dialog
      open={open}
      onClose={handleOlderDateClose}
    >
      <DialogTitle>Add Record</DialogTitle>
      <DialogContent>
        <DialogContentText>
          You are attempting to make changes to an older dataset. Press OK to confirm making changes or Cancel to go back.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleOlderDateClose(false)}>Cancel</Button>
        <Button onClick={handleForceChanges}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}

export default SaveOlderWarning;
