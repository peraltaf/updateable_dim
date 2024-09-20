'use client';

import Header from './components/Header';
import MainApp from './components/Main';
import { useLogin } from './context/store';
import SimpleLogin from './components/SimpleLogin';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';


inject();
injectSpeedInsights();

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
