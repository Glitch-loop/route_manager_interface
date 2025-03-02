import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

// Set the locale globally (similar to moment.locale('es'))
dayjs.locale('es');

export function timestamp_standard_format() {
  return dayjs().format('dddd, DD-MMM-YY');
}

export function timestamp_format() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

export function current_day_name() {
  return dayjs().format('dddd');
}

export function time_posix_format() {
  return dayjs().unix(); // Returns the POSIX timestamp
}

export function determineCurrentDayByDayName(dayToDetermine:string) {
  return current_day_name().toLocaleLowerCase() === dayToDetermine.toLocaleLowerCase()
}

export function cast_string_to_timestamp_standard_format(date:string) {
  return dayjs(date).format('dddd, DD-MMM-YY HH:mm').replace(/^./, (char) => char.toUpperCase());
}

export function cast_string_to_date_hour_format(date:string) {
  return dayjs(date).format('DD-MMM-YY HH:mm');
}

export function cast_string_to_hour_format(date:string) {
  return dayjs(date).format('HH:mm');
}

export function differenceBetweenDatesInSeconds(firstDate:string, secondDate:string):number {
  const date1:Dayjs = dayjs(firstDate);
  const date2:Dayjs = dayjs(secondDate);
 
  const diffInSeconds = Math.abs(date1.diff(date2, "seconds"));
  
  return diffInSeconds
}

export function differenceBetweenDatesWithFormat(firstDate:string, secondDate:string):string {
  const date1:Dayjs = dayjs(firstDate);
  const date2:Dayjs = dayjs(secondDate);
 
  const diffInSeconds = Math.abs(date1.diff(date2, "seconds"));
  
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getColorDependingOnTheDifferenceOfDates(seconds:number):string {
   // Define the max threshold (1 hour = 3600s)
   const maxSeconds = 3600; 

   // Normalize the value to a range between 0 (green) and 1 (red)
   const normalized = Math.min(1, Math.max(0, seconds / maxSeconds));
 
   // Interpolate colors manually
   const red = Math.round(255 * normalized); // More red as time increases
   const green = Math.round(255 * (1 - normalized)); // Less green as time increases
 
   return `rgb(${red},${green},0)`;
}


export function isDateGreater(a:string, b:string):boolean {
  const date1:Dayjs = dayjs(a);
  const date2:Dayjs = dayjs(b);
  let isGreater:boolean = false;

  if (date1.isBefore(date2)) {
    isGreater = false;
  } else {
    isGreater = true;
  }

  return isGreater;
}