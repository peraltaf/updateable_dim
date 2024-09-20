import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import dayjs from 'dayjs';
import {
  useEffect,
  useState
} from 'react';
import CompareVersions from './CompareVersions';
import { useUpdateDatesStore } from '../context/store';


interface UpdateDateFilterProps {
  setUpdateDateFilter: (dt:string) => void
  initialUpdateDate: string
}

const UpdateDateFilter = ({ setUpdateDateFilter, initialUpdateDate }:UpdateDateFilterProps) => {
  const [selUpdateDate, setSelUpdateDate] = useState<string>('');
  const [comparVersionsOpen, setComparVersionsOpen] = useState<boolean>(false);
  const { updateDates } = useUpdateDatesStore();
  const setUpdateDate = (sel:string) => {
    setSelUpdateDate(sel);
    setUpdateDateFilter(sel);
  }

  useEffect(() => setSelUpdateDate(initialUpdateDate), [initialUpdateDate]);

  return (
    <Box
      display='flex'
      sx={{ maxWidth: 500, pt: 3, pr: 3, pl: 3 }}
    >
      <FormControl
        fullWidth
        size='small'
        sx={{ mr: 1 }}
      >
        <InputLabel sx={{ background: '#FFF' }} >UPDATE DATE&nbsp;</InputLabel>
        <Select
          value={selUpdateDate}
          label='Update Date'
          onChange={(d:SelectChangeEvent) => {
            setUpdateDate(d.target.value);
          }}
        >
          {updateDates.map((d,i) => ( 
            <MenuItem key={`update-dt-${i}`} value={d.update_date}>{dayjs(d.update_date).format('MMM DD, YYYY hh:mm a')} (by {d.updated_by})</MenuItem>
          ))}
        </Select>
      </FormControl>

      {
        updateDates.length > 1 && <>
          <IconButton
            size='small'
            onClick={() => setComparVersionsOpen(true) }
          >
            <CompareArrowsIcon />
          </IconButton>

          <CompareVersions
            comparVersionsOpen={comparVersionsOpen}
            setComparVersionsOpen={setComparVersionsOpen}
          />
        </>
      }
    </Box>
  )
}

export default UpdateDateFilter;
