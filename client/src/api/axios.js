import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://trading-journal-i6cc.onrender.com',
});

export default instance;
