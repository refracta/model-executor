import App from './App';

const app = new App().application;

app.listen(5000, () => {
  console.log('Server listening on port 5000');
});