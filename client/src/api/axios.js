import axios from 'axios';

const instance = axios.create({
<<<<<<< HEAD
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com' 
    : 'https://localhost:5001',
=======
  baseURL: 'baseURL: process.env.REACT_APP_API_URL',
>>>>>>> 436ab9ca46d5d60b75688bb450b6f7c71e841d15
});

export default instance;
