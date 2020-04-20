export const environment = {
  production: true,
  // As this is an example APP, we are using the same DB. We should make another Firebase project for another DB
  firebase: {
    apiKey: 'AIzaSyD0BzZnVyUOSkafRRDPHrmPUlCqMZxcl2I',
    authDomain: 'stripe-tutorial-7f929.firebaseapp.com',
    databaseURL: 'https://stripe-tutorial-7f929.firebaseio.com',
    projectId: 'stripe-tutorial-7f929',
    storageBucket: 'stripe-tutorial-7f929.appspot.com',
    messagingSenderId: '727823752627',
    appId: '1:727823752627:web:ce5ee7e17f81b1a3193fc6'
  },
  api: {
    baseUrl: 'https://stripe-tutorial-7f929.appspot.com/'
  }
};
