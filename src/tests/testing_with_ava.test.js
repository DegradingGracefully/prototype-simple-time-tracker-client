// const test = require('ava');
import test from 'ava';

const TEXT_TASK_TO_BEGIN = 'TODO';

function timeSecondsToString(seconds) {
  if (seconds != 0) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);

    seconds = seconds % 60;

    console.log(`timeConvert=>${seconds}`);

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }

    return hours + ':' + minutes + ':' + seconds;
  } 
  else {
    return TEXT_TASK_TO_BEGIN;
  }
}

function getDurationSecondsSinceTimeBegin(timeBegin) { 
  const durationMillis = Date.now() - timeBegin;
  const durationSeconds = Math.floor(durationMillis / 1000);

  return durationSeconds;
}

/* test(`should get \'${TEXT_TASK_TO_BEGIN}\'`, (t) => {
  t.is(timeSecondsToString(duration), TEXT_TASK_TO_BEGIN);
}); */

// tmp testing display duration
test(`testing how it displays duration`, (t) => {
  const task = Task.New({ title: 'whatever' });

  t.is()

  t.is(task.getTaskDurationToDisplay(), Task.TEXT_TASK_TO_BEGIN); // constants exported from the class just like that ?
  
  t.setDuration(1); // one second
  t.is(task.getTaskDurationToDisplay(), '00:00:01');

  t.setDuration(61); // test minutes
  t.is(task.getTaskDurationToDisplay(), '00:01:01');


  t.setDuration(3661); // test hours
  t.is(task.getTaskDurationToDisplay(), '01:01:01');
});

// tmp testing adding duration
/* test(`testing how it adds duration'`, (t) => {
  const task = Task.new({ title: 'whatever' });

});*/


/*
/*
  it('test seconds => should get \'00:00:01\'', function () {
    duration = 1; // one second

    assert.equal(timeSecondsToString(duration), '00:00:01');
  });


  it('test minutes => should get \'00:01:01\'', function () {
    duration = 61;

    assert.equal(timeSecondsToString(duration), '00:01:01');
  });


  it('test hours => should get \'01:01:01\'', function () {
    duration = 3661;

    assert.equal(timeSecondsToString(duration), '01:01:01');
  });*/

/* it('should get previous duration + new duration', function () {
  previousDuration = 61;
  newDuration = 44;

  // actually, having this possibility to pass a second duration to add them becomes useless
  assert.equals(getTaskDurationToDisplay(previousDuration, newDuration), '01:45:00');
}); */
// });

/* describe('getDurationSecondsSinceTimeBegin', function () {

  it('should get 0 second', function () {
    timeBegin = Date.now();

    assert.equal(getDurationSecondsSinceTimeBegin(timeBegin), 0);
  });
});*/