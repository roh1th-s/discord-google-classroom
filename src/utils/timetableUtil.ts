import { getCurrentTime, timeStringToMinutes } from "./timeUtils";

const timetable = require("../../data/timetable.json");
const timings: Period[] = timetable.timings;
const subjects = timetable.subjects;
const links = timetable.links;

export interface Period {
  name?: string;
  startTime: string;
  endTime: string;
  link?: string | object;
  isSubject?: boolean;
  periodIndex?: number;
}

export enum PERIOD_ERROR_TYPE {
  NONE_SCHEDULED_TODAY = "NONE_SCHEDULED_TODAY",
  NONE_SCHEDULED_NOW = "NONE_SCHEDULED_NOW",
  NO_PERIOD_NEXT = "NO_PERIOD_NEXT",
}

function getPeriodFromTiming(timing: Period, subjectsForDay: string[]): Period {
  let name = timing.name;
  let link = links[name || ""] || "";

  if (
    timing.isSubject &&
    timing.periodIndex != undefined &&
    timing.periodIndex != null
  ) {
    let subjectName = subjectsForDay[timing.periodIndex];
    name = subjectName;
    link = links[subjectName] || links.Common;
  }

  return {
    name,
    startTime: timing.startTime,
    endTime: timing.endTime,
    link,
    isSubject: timing.isSubject,
  };
}

export function getLinks() : object {
  return links;
}

export function getPeriod(
  timezone?: string,
  next?: boolean
): [boolean, Period | PERIOD_ERROR_TYPE] {
  // Returns something like Saturday 12:05
  let timeString = getCurrentTime(timezone || "Asia/Kolkata");

  let timeParts = timeString.split(" ");
  let day: string = timeParts[0];
  let timeInMinutes = timeStringToMinutes(timeParts[1]);

  const subjectsForDay = subjects[day];

  if (!subjectsForDay) return [false, PERIOD_ERROR_TYPE.NONE_SCHEDULED_TODAY];

  let periodNow: Period | null = null;
  //check others
  for (let i = 0; i < timings.length; i++) {
    const timing = timings[i];
    const startTimeInMinutes = timeStringToMinutes(timing.startTime);
    const endTimeInMinutes = timeStringToMinutes(timing.endTime);

    if (
      timeInMinutes >= startTimeInMinutes &&
      timeInMinutes < endTimeInMinutes
    ) {
      if (next) {
        //if this is the last period, there is nothing after this
        if (i == timings.length - 1)
          return [false, PERIOD_ERROR_TYPE.NO_PERIOD_NEXT];

        periodNow = getPeriodFromTiming(timings[i + 1], subjectsForDay);
      } else {
        periodNow = getPeriodFromTiming(timing, subjectsForDay);
      }
      break;
    } else if (next && i == 0 && timeInMinutes < startTimeInMinutes) {
      periodNow = getPeriodFromTiming(timing, subjectsForDay);
      break;
    }
  }

  return periodNow
    ? [true, periodNow]
    : [false, PERIOD_ERROR_TYPE.NONE_SCHEDULED_NOW];
}
