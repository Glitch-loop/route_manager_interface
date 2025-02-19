import dayjs from 'dayjs';
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
  return dayjs(date).format('dddd, DD-MMM-YY HH:MM').replace(/^./, (char) => char.toUpperCase());
}