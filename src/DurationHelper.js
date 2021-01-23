  const TEXT_TASK_TO_BEGIN = 'TODO';
/*  The newDuratonHelper class is a container for the "original" number of seconds of the task, as well as
    its "floored" hours, minutes, and seconds + the formatted string (ie the "{hh}hmm{m}" string format we display in the UI)
    Use: we don't provide any "updateSeconds" method. Indeed, you need to recreate a new newDurationHelper each time,
    which is not more costly than an update would be, since if updating the seconds we would have to rerun
    all the calculations.
*/
function newDurationHelper(seconds) {
  const secondsOriginal = seconds;
  const hoursFloored = Math.floor(seconds / 3600);
  const minutesFloored = Math.floor((seconds % 3600) / 60);
  const secondsFloored = hoursFloored * 3600 + minutesFloored * 60;
  let formattedDuration;

  if (secondsOriginal === 0) {
    formattedDuration = TEXT_TASK_TO_BEGIN;
  } else if (hoursFloored === 0) {
    // less than an hour => only minutes
    formattedDuration = `${minutesFloored}m`;
  } else {
    // more than an hour
    let minutesPart = minutesFloored;
    if (minutesPart < 10) {
      minutesPart = `0${minutesPart}`;
    }
    formattedDuration = `${hoursFloored}h${minutesPart}`;
  }

  return {
    getHoursFloored() {
      return hoursFloored;
    },
    getMinutesFloored() {
      return minutesFloored;
    },
    getSecondsFloored() {
      return secondsFloored;
    },
    getFormattedDuration() {
      /* console.log('secondsOriginal / hoursFloored / minutesFloored / secondsFloored / formattedDuration');
      console.log(`${secondsOriginal} / ${hoursFloored} / ${minutesFloored} / ${secondsFloored} / ${formattedDuration}`); */
      return formattedDuration;
    },
  };
}

export default newDurationHelper;