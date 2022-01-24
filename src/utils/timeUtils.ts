export function getCurrentTime(timeZone : string) : string {
    return new Date().toLocaleDateString('en-US', {timeZone, weekday: 'long', hour : 'numeric', minute : 'numeric'})
}

export interface BuildDateOpts {
  year?: number | null;
  month?: number | null;
  day?: number | null;
  hours?: number | null;
  minutes?: number | null;
}

export function pad (n?: number | null): string {
    return typeof n === "number" ? (n < 10 ? `0${n}` : `${n}`) : "00";
}
 
export function buildDate({
  year,
  month,
  day,
  hours,
  minutes,
}: BuildDateOpts): Date {
  return new Date(
    `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00.000Z`
  );
}

export function timeStringToMinutes(timeString : string) {
  let timings = timeString.split(":")
  const hours = Number(timings[0]);
  const minutes = Number(timings[1]);
  
  return hours * 60 + minutes;
}
