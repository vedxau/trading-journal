import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'https://localhost:5001',
});

export default instance;
