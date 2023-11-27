import dayjs from 'dayjs';

export function getCurrentTime(format: string = 'YYYY MM DD HH:mm:ss'){
  return dayjs().format(format)
  
}