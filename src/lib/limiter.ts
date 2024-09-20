

import { headers } from 'next/headers';


interface IpRequestsType {
  [key: string]: number[];
}

const windowSize:number = 60000;
const maxRequests:number = 5;
const ipRequests:IpRequestsType = {};

const cleanupOldRequests = (timestamps:number[]) => {
  const now = Date.now();
  return timestamps.filter((timestamp) => now - timestamp < windowSize);
};

const getIP = () => {
  const forwardedFor = headers().get('x-forwarded-for');
  const realIp = headers().get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp?.trim();
  
  return ip ?? '';
}

export {
  maxRequests,
  ipRequests,
  cleanupOldRequests,
  getIP
}
