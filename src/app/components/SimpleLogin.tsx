'use client';

import {
  FormEvent,
  useState
} from 'react';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography
} from '@mui/material/';
import { useLogin } from '../context/store';


interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  persistent: HTMLInputElement;
}

interface SignInFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function SimpleLogin() {
  const [error, setError] = useState<string|null>(null);
  const { setLoggedIn } = useLogin();

  const onSubmit = async (event: FormEvent<SignInFormElement>) => {
    event.preventDefault();

    try {
      setLoggedIn({
        loggedIn: true,
        username: event.currentTarget.username.value
      });
    } catch (e) {
      setError(`You must provide a username.`);
    }
  }

  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      height='100vh'
      width='100vw'
      border='2px solid gray'
    >
      <form onSubmit={onSubmit}>
        <Typography
          variant='h3'
          gutterBottom
          sx={{ color: '#1976d2', textAlign: 'center' }}
        >
          UPDATEABLE DIM
        </Typography>

        <Stack
          gap={2}
          sx={{ border: '2px solid lightgray', p: 8, borderRadius: '4px'}}
        >
          { error && <Alert severity='warning'>{error}</Alert> }

          This simulates a login page. Any username can be entered below.
          <TextField
            name='username'
            id='username'
            size='small'
            variant='outlined'
            label='Username'
            required
            onInput={() => setError(null)}
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
          >
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
