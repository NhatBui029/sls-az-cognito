import { useState } from 'react'
import './App.css'
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';

const existingConfig = Amplify.getConfig();
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '7mtik46i2gpv050k03qmab3u6s',
      userPoolId: 'ap-southeast-1_mo7brSRaY',
    }
  },
  API: {
    ...existingConfig.API,
    REST: {
      ...existingConfig.API?.REST,
      'demo-api': {
        endpoint: 'https://r2jqz65744.execute-api.ap-southeast-1.amazonaws.com/v1',
        region: 'ap-southeast-1'
      }
    }
  }
});

function App() {
  const [count, setCount] = useState(0);

  const handleCallApi = async () => {
    const responeUser = await getCurrentUser();
    console.log('user', responeUser);
    const session = await fetchAuthSession({ forceRefresh: true });
    console.log("session", session.tokens?.idToken?.toString())

    const userAttributes = await fetchUserAttributes();
    console.log(userAttributes);

    const restOperation = post({
      apiName: 'demo-api',
      path: '/hello',
      options: {
        headers: {
          Authorization: session.tokens?.idToken?.toString()
        },
        body: {
          name: "theodorebui",
          age: 21
        }
      }
    });
    const response = await restOperation.response;
    console.log('GET call succeeded: ',await response.body.json());

  }

  return (
    <>
      <h1>TheodoreBui AWS</h1>
      <Authenticator
        loginMechanisms={['email']}
        signUpAttributes={['name']}
        socialProviders={['amazon', 'apple', 'facebook', 'google']}
      >
        {({ signOut, user }) => (
          <main>
            <h1>Hello {user.signInDetails.loginId}</h1>
            <button onClick={handleCallApi}>Call API</button>
            <button onClick={signOut}>Sign out</button>
          </main>
        )}
      </Authenticator>
    </>
  )
}

export default App
