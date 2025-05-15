import ActivityType from './ActivityType';

const ActivityTypeIcons = {
  [ActivityType.PERSONAL]: require('../../assets/icons/personal.png'),
  [ActivityType.MEETING]: require('../../assets/icons/meeting.png'),
  [ActivityType.WORK]: require('../../assets/icons/work.png'),
  [ActivityType.EVENT]: require('../../assets/icons/event.png'),
  [ActivityType.EDUCATION]: require('../../assets/icons/education.png'),
  [ActivityType.TRAVEL]: require('../../assets/icons/travel.png'),
  [ActivityType.RECREATIONAL]: require('../../assets/icons/recreational.png'),
  [ActivityType.ERRAND]: require('../../assets/icons/errand.png'),
  [ActivityType.OTHER]: require('../../assets/icons/other.png'),
  [ActivityType.BREAK]: require('../../assets/icons/break.png'),
};

export default ActivityTypeIcons;
