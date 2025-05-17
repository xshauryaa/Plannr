import ActivityType from './ActivityType';

const ActivityTypeIcons = {
  [ActivityType.PERSONAL]: require('../../assets/type-icons/personal.png'),
  [ActivityType.MEETING]: require('../../assets/type-icons/meeting.png'),
  [ActivityType.WORK]: require('../../assets/type-icons/work.png'),
  [ActivityType.EVENT]: require('../../assets/type-icons/event.png'),
  [ActivityType.EDUCATION]: require('../../assets/type-icons/education.png'),
  [ActivityType.TRAVEL]: require('../../assets/type-icons/travel.png'),
  [ActivityType.RECREATIONAL]: require('../../assets/type-icons/recreational.png'),
  [ActivityType.ERRAND]: require('../../assets/type-icons/errand.png'),
  [ActivityType.OTHER]: require('../../assets/type-icons/other.png'),
  [ActivityType.BREAK]: require('../../assets/type-icons/break.png'),
};

export default ActivityTypeIcons;
