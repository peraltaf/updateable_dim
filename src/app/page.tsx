'use client';

import Header from './components/Header';
import MainApp from './components/Main';
import { useLogin } from './context/store';
import SimpleLogin from './components/SimpleLogin';


export default function FullFeaturedCrudGrid() {
  const { info } = useLogin();

  return (
    <>
      {
        info.loggedIn
        ? <>
            <Header username={info.username} />
            <MainApp /> 
          </>
        : <SimpleLogin />
      }
    </>
  );
}
