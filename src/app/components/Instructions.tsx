import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState
} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
  maxHeight: '80%'
};

const instructions = [{
  title: 'Selecting Data Date',
  description: 'The "Update Date" drop down menu allows you to select a point in time when the data was updated. You can use this selector to view historical changes to the dataset.'
}, {
  title: 'Adding a Single Record',
  description: 'Use the ADD RECORD button to add a single record. A form will appear with the appropriate fields to fill in. Keep in mind that "Rating" and "Useful Count" only accept numerical values. Also, "Author" should be unique and the form will not allow you to enter a new record with an "Author"|"Bank" combination that already exists in the dataset. See the Editing Records section to edit a record for an existing Author.'
}, {
  title: 'Adding a Multiple Records',
  description: 'Use the UPLOAD CSV button to multiple records from a CSV file. The CSV file should have a header row that includes Author, Review Date, Adress, Bank, Rating, Review Title By User, Review, Rating Title By User, and Useful Count. Keep in mind that LA and SLA only accept numerical values. Also, Authors should be unique and you will not be able to insert new records with an Author that already exists in the dataset. Keep in mind that "Rating" and "Useful Count" only accept numerical values. Also, "Author" should be unique and the form will not allow you to enter a new record with an "Author"|"Bank" combination that already exists in the dataset. See the Editing Records section to edit a record for an existing Author.'
}, {
  title: 'Editing Records',
  description: 'Double click on a field in any row of the dataset to edit the values. Click away from the row or hit enter to stage your changes. Rows with changed values will appear with an orange/yellow background. Changes will not be saved until you click on the SAVE TO DATABASE button (see Save to Database section).'
}, {
  title: 'Deleting Records',
  description: 'Click on the garbage icon to delete a row from the dataset. Changes will not be saved until you click on the SAVE TO DATABASE button (see Save to Database section).'
}, {
  title: 'Filtering Records',
  description: 'Hover over any column name in the datatable until a vertical ellipses appears. Click on the vertical ellipses and select the Filter option. Select the column to filter, the operator, and the value to look for.'
}, {
  title: 'Save to Database',
  description: 'Clicking on the SAVE TO DATABASE button will allow you to view the staged changes that you have made. Rows with green text are new records, rows with red text have been deleted, and any rows with changed values will show the old row values and new row values. Once you have verified your changes, click on the SUBMIT CHANGES button to commit your changes to the database. The datatable will refresh with all of the changes you have made and the UPDATE DATE will also be updated to reflect the timestamp of when you made your changes.'
}, {
  title: 'Comparing Changes Between Versions',
  description: 'Click the Compare icon to the right of the Update Date select menu to open the Compare Versions modal. Pick an Update Date in the Update Date 1 select menu. Pick an Update Date in the Update Date 2 select menu. Click the Compare butt to view the changes between versions.'
}];

interface InstructionsProps {
  helpOpen:boolean
  setHelpOpen:Dispatch<SetStateAction<boolean>>
}

export default function Instructions({ helpOpen, setHelpOpen }:InstructionsProps) {
  const [open, setOpen] = useState(helpOpen);
  const handleClose = () => {
    setHelpOpen(false);
    setOpen(false);
  }
  const [expanded, setExpanded] = useState<string | false>(false);
  const handleChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => setOpen(helpOpen), [helpOpen]);

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography 
            variant='h6'
            component='h2'
            sx={{ pb: 2 }}
          >
            Instructions
          </Typography>
          {
            instructions.map((d,i) => {
              return <Accordion
                key={`panel-${i}`}
                expanded={expanded === `panel-${i}`}
                onChange={handleChange(`panel-${i}`)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant='subtitle1'
                    color='primary'
                  >
                    {d.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant='body2'>
                    {d.description}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            })
          }
        </Box>
      </Modal>
    </>
  );
}
