import ScheduleDate from '../model/ScheduleDate';

const convertDateToScheduleDate = (dateObj) => {
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1; // JS months are 0-based
  const year = dateObj.getFullYear();

  return new ScheduleDate(day, month, year);
}

export default convertDateToScheduleDate;