import App from './App.mjs';
import Database from "./Database.mjs";
import WebSocket from 'ws';


const app = new App().application;

app.listen(5000, () => {
    console.log('Server listening on port 5000');
});
