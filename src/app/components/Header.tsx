'use client';

import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Toolbar,
  Typography
} from '@mui/material';
import Instructions from './Instructions';
import { useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import { useLogin } from '../context/store';


interface HeaderProps {
  username: string
}

const Header = ({ username }:HeaderProps) => {
  const [helpOpen, setHelpOpen] = useState(false);
  const { setLoggedIn } = useLogin();

  const handleLogout = () => {
    setLoggedIn({
      loggedIn: false,
      username: 'string'
    });
  }

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <Box className='flex items-center gap-2 text-lg font-semibold md:text-base'>
            <div className='logo-holder logo-text'>
              <h3>UPDATEABLE</h3>
              <p>DIMENSION</p>
            </div>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex' }} />

          <Typography variant='button'>{username}</Typography>

          <Divider
            sx={{ pr: 1, pl: 2, color: '#F8F8F8' }}
            orientation='vertical'
          >
            |
          </Divider>

          <IconButton
            aria-label='help'
            onClick={() => setHelpOpen(true)}
            sx={{ color: '#F8F8F8' }}
          >
            <HelpIcon />
          </IconButton>

          <Instructions
            helpOpen={helpOpen}
            setHelpOpen={setHelpOpen}
          />
          
          <Box sx={{ flexGrow: 0 }}>
            <Button
              sx={{ color: '#F8F8F8' }}
              onClick={handleLogout}
              type='submit'
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
