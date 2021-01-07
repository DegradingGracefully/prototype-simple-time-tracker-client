<script>
    import { onMount } from 'svelte';
    import {afterUpdate} from 'svelte';

  import Todo from './Todo.svelte';

  const URL_GET_ALL_TASKS = 'http://localhost:4000/task';
  const URL_UPDATE_TASK = 'http://localhost:4000/task';
  const URL_POST_NEW_TASK = 'http://localhost:4000/task';
  const URL_GET_CURRENT_TASK_TRACKING = 'http://localhost:4000/currentTaskTracking';
  const URL_UPDATE_CURRENT_TASK_TRACKING = 'http://localhost:4000/currentTaskTracking';

  const ID_NO_TASK_TRACKING = 0; // represents the fact that we're not tracking any task currently

  const NO_TASK_TRACKING = {
    isTracking: false,
    taskId: ID_NO_TASK_TRACKING,
    durationForToday: 0,
    timeBeginTracking: null
  };

  const TEXT_TASK_TO_BEGIN = 'TODO';

      let todos = [];
  let currentTaskTracking;

  let todoText = '';
  let hideCompleted = true;

  let globalDuration;

  $: uncompletedCount = todos.filter((t) => !t.done).length;
  $: status = `${uncompletedCount} of ${todos.length} remaining`;
  // $: todosToDisplay = todos.filter((t) => !hideCompleted || !t.done);

  let lastId = 500;

  let interval;

  function getCurrentTimeString() {
    const date = new Date();
    const options = { hour: '2-digit', minute: '2-digit' };

    return date.toLocaleTimeString('en-us', options);
  }

  function timeConvertBak(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;

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

  function timeConvert(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
    // less than an hour => only minutes
      // return `{minutes}m`; // how to do variable interpolation in string, outside of console.log ?
      return minutes + "m";
    } else {
    // more than an hour
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
      // return `{hours}h{minutes}`; 
      return hours + "h" + minutes;
    }
  }

  function getCurrentTask() {
    // console.log("current task:" + JSON.stringify(todos.find((task) => task._id === currentTaskTracking.taskId)));
        return todos.find((task) => task._id === currentTaskTracking.taskId);
  }


  /* const moreThanOneHourInSeconds = 3667;
  console.log(timeConvert(moreThanOneHourInSeconds)); */

  function updateDurationToDisplay(todo, newDuration = 0) {
    // console.log(`updateDurationToDisplay=>${todo.duration}`);
    if (newDuration !== 0) {
      todo.durationToDisplay = timeConvert(todo.durationForToday + newDuration);
    } else if (todo.durationForToday === 0) {
      todo.durationToDisplay = TEXT_TASK_TO_BEGIN;
    } else {
      todo.durationToDisplay = timeConvert(todo.durationForToday);
    }
  }

  function getCurrentTaskNewDuration() {
      // calculates the "new" duration
      /* console.log(`updateCurrentTaskTrackingDuration=>${currentTaskTracking.timeBeginTracking}`);
      console.log(`Date.now() - currentTaskTracking.timeBeginTracking=>${(Date.now() - currentTaskTracking.timeBeginTracking)}`); */

      const durationMillis = Date.now() - currentTaskTracking.timeBeginTracking;
      const durationSeconds = Math.floor(durationMillis / 1000);
      // console.log(`updateCurrentTaskTrackingDuration=>${durationSeconds}`);
     
     return durationSeconds;
  }

  function updateCurrentTaskTrackingDuration() {
    if (currentTaskTracking.isTracking) {
      // only update if there's a task selected
   // updates the task duration
      const currentTodo = todos.find((t) => t._id === currentTaskTracking.taskId);
      const newDurationSeconds = getCurrentTaskNewDuration();

      // currentTodo.duration += durationSeconds;
      // currentTodo.durationToDisplay = timeConvert(currentTodo.duration + durationSeconds);
      updateDurationToDisplay(currentTodo, newDurationSeconds);
      todos = todos;
      // todosToDisplay = todos.filter((t) => !hideCompleted || !t.done);

      // console.log(`updated currentTaskTracking: ${JSON.stringify(currentTodo)}`);
    globalDuration = timeConvert(todos.reduce((totalDuration, currentTask) => totalDuration + currentTask.durationForToday, 0) + newDurationSeconds);
    }
    // await tick();

    // setTimeout(updateCurrentTaskTrackingDuration, 1000); // replan the "eternal" timer
  }

/* ------------------------------------------------------------------------------------->
  ---------------                 BEGIN SVELTE LIFECYCLE METHODS        ---------------->
  --------------------------------------------------------------------------------------> */
  onMount(async () => {
    // must intialize currentTaskTracking to unselected here
    currentTaskTracking = { ...NO_TASK_TRACKING };

    console.log('onMount: fetching data from server...');

    // get all tasks
    let res = await fetch(URL_GET_ALL_TASKS);
    todos = await res.json();
    console.log(`Got tall tasks: ${JSON.stringify(todos)}\n`);

    // add durationToDisplay field
    /* todos = todosFromServer.map(todo => {
      durationToDisplay = todoText.duration
      Object.assign(todo, { durationToDisplay: });
    }); */
    todos.forEach((todo) => {
      updateDurationToDisplay(todo);
      todo.isTracking = false;
    });

    // get currentTaskTracking
    res = await fetch(URL_GET_CURRENT_TASK_TRACKING);
    currentTaskTracking = await res.json();
    console.log(`Got currentTaskTracking:${JSON.stringify(currentTaskTracking)}\n`);

    // hack to be able to perform javascript operations on mongo dates.... ?
    // check https://docs.mongodb.com/manual/reference/method/Date/
    currentTaskTracking.timeBeginTracking = new Date(currentTaskTracking.timeBeginTracking);

    updateCurrentTaskTrackingDuration();

    if (currentTaskTracking.isTracking) {
      let currentTask = getCurrentTask();
      currentTask.isTracking = true;      
    }

    let globalDurationWithoutCurrentTask = todos.reduce((totalDuration, currentTask) => totalDuration + currentTask.durationForToday, 0);

    if (currentTaskTracking.isTracking) {
      globalDuration = globalDurationWithoutCurrentTask + getCurrentTaskNewDuration();
    } else {
      globalDuration = globalDurationWithoutCurrentTask;
    }

    globalDuration = timeConvert(globalDuration);

//tmp 
todos.forEach((t) => console.log(t.durationForToday));

    // launch the "eternal" timer that updates the display of the duration
    interval = setInterval(() => {
      updateCurrentTaskTrackingDuration();
    }, 500);
    // setTimeout(updateCurrentTaskTrackingDuration, 1000);
  });

  afterUpdate(() => onModalButtonsOnSvelteMounted());

/* ----------------------------------------------------------------------------------->
  ---------------                 END SVELTE LIFECYCLE METHODS        ---------------->
  ------------------------------------------------------------------------------------> */

  async function sendAddNewTask(todo) {
    const body = JSON.stringify(todo);
    const headers = {
      'Content-Length': body.length,
      'Content-Type': 'application/json',
    };
    const res = await fetch(URL_POST_NEW_TASK, {
      method: 'POST',
      headers,
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
    // todo._id = await res.json()._id;
    /*let createdTodo = await res.json();
    createdTodo = JSON.parse(createdTodo);
    console.log(`sendAddNewTask got _id: ${JSON.stringify(createdTodo._id)}`);
    todo._id = createdTodo._id;*/

    // console.log(`sendAddNewTask response: ${JSON.stringify(res.json())}`);
    /* const jsonResponse = await res.json();
    console.log(`sendAddNewTask response: ${JSON.stringify(jsonResponse)}`);

    return jsonResponse; */
    // return res;
  }

  async function sendUpdateTask(todo) {
    const body = JSON.stringify(todo);
    const headers = {
      'Content-Length': body.length,
      'Content-Type': 'application/json',
    };
    const res = await fetch(`${URL_UPDATE_TASK}/${todo._id}`, {
      method: 'PUT',
      headers,
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function sendUpdateCurrentTaskTracking() {
    const body = JSON.stringify(currentTaskTracking);
    const headers = {
      'Content-Length': body.length,
      'Content-Type': 'application/json',
    };
    const res = await fetch(URL_UPDATE_CURRENT_TASK_TRACKING, {
      method: 'PUT',
      headers,
      body,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  /*  switchTracking determines which task to begin / stop tracking / switch to other task
      and calculates the duration of the current task (if any) up to now
  */
  function switchTracking(todoId) {
    clearInterval(interval);
    let previousTodo;

    // if we were tracking a task ...
    if (currentTaskTracking.isTracking) {
      // ... calculates the "new" duration
      const durationMillis = Date.now() - currentTaskTracking.timeBeginTracking;
      const durationSeconds = Math.floor(durationMillis / 1000);

      // updates the task duration
      previousTodo = todos.find((t) => t._id === currentTaskTracking.taskId);
      previousTodo.durationForToday += durationSeconds;
      previousTodo.isTracking = false;      

      // must save the tracking period we've just ended
      previousTodo.trackingByDate.push({
        dateBegin: currentTaskTracking.timeBeginTracking,
        dateEnd: Date.now()
      });

      updateDurationToDisplay(previousTodo);
      // TODO => bug?? useless call ???? sendUpdateCurrentTaskTracking();
      // hack to update the array of todos in child Task.svelte,
      // in order to update this previousTodo display
      // todos = todos;
      console.log(previousTodo);
      sendUpdateTask(previousTodo);
    }

    const newTaskTracking = todos.find((t) => t._id === todoId);

    // if we were tracking the selected task of id todoId => just stop tracking
    if (currentTaskTracking.taskId == todoId) {
      currentTaskTracking = { ...NO_TASK_TRACKING };
      console.log(`${getCurrentTimeString()}: stopped task '${newTaskTracking.title}'`);
    } else {
      // else switch to selected task
      currentTaskTracking.isTracking = true;
      currentTaskTracking.taskId = todoId;
      currentTaskTracking.timeBeginTracking = Date.now() - 1000;
      newTaskTracking.isTracking = true;
      console.log(newTaskTracking);
      console.log(`${getCurrentTimeString()}: switching to task '${newTaskTracking.title}'`);
    }

    updateCurrentTaskTrackingDuration();
    sendUpdateCurrentTaskTracking();    

    todos = todos; // hack
    // console.log('switched to task:' + JSON.stringify(todos.find((t) => t._id === todoId)));

    interval = setInterval(() => {
      updateCurrentTaskTrackingDuration();
    }, 500);
  }

  function switchTracking2(todoId) {
    const newTaskTracking = todos.find((t) => t._id === todoId);
      newTaskTracking.isTracking = true;
      todos = todos;

  }

  const createTodo = (title, done = false, durationForToday = 0 ,enabled = true) => {
  // async function createTodo(title, done = false, duration = 0, enabled = true) {
    const newTodo = {
      id: lastId++,
      title,
      done,
      durationForToday,
      trackingByDate: [],
      enabled
    };
    // we get new mongo document in json response to query
    /*const jsonResponse = await sendAddNewTask(newTodo).json()._id;
    console.log(`createTodo got response: ${JSON.stringify(jsonResponse)}`);
    newTodo._id = sendAddNewTask(newTodo)._id;
    console.log(`created todo: ${JSON.stringify(newTodo)}`);*/
    sendAddNewTask(newTodo).then(jsonTodo => {
      /* console.log(`Inside res.json() result promise, got json ${jsonTodo.data._id}`);
            console.log(`Inside res.json() result promise, got json ${JSON.stringify(jsonTodo.data)})`);

      console.log(`Inside res.json() result promise, got json ${JSON.stringify(jsonTodo)})`); */
      newTodo._id = jsonTodo.data._id;
    });    
    updateDurationToDisplay(newTodo);

    return newTodo;
  };

  async function addTodo() {
    const newTodo = await createTodo(todoText);
    todos = todos.concat(newTodo);
    todoText = '';
  }
  function deleteTodo(todoId) {
    todos = todos.filter((t) => t.id !== todoId);
  }
  function toggleDone(todo) {
    const { id } = todo;
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function filterCompleted(t) {
    return !hideCompleted || !t.done;
  }
</script>
<style>
    /* .header-info {
    vertical-align: top;
  } */
  .make-children-div-full-height {
    display: flex;
    align-items: stretch; 
    /* a "flex" option apparently, needed to have the info header dv (the one with the nb of tasks) to be full height
       to align the text to the new task input field...
       https://stackoverflow.com/questions/15381172/how-can-i-make-flexbox-children-100-height-of-their-parent ? */
  }
</style>
<div>
    <div class='container'>
        <article class="panel">
            <p class="panel-heading  
              has-background-warning">
                <span class='title is-4'>Time Brief</span>
            </p>
            <div class="panel-block columns make-children-div-full-height">
                <p class="control column is-7 has-icons-left">
                    <input data-testid="todo-input" type="text" size="30" placeholder="enter new task here" bind:value={todoText} />
                    <button disabled={!todoText} on:click={addTodo}>Add</button>
                    <span class="icon is-left">
                        <i class="fas fa-search" aria-hidden="true"></i>
                    </span>
                </p>
                <div class="column is-5 header-info">
                    {status}
                    <div>
                        Hide complete:
                        <input type="checkbox" checked={hideCompleted} on:change={()=> (hideCompleted = !hideCompleted)} />
                    </div>
                    Total duration today: {globalDuration}
                </div>
            </div>
            {#each todos.filter(filterCompleted) as todo}
            <Todo {todo} on:switchTracking={()=> switchTracking(todo._id)}
                on:delete={() => deleteTodo(todo._id)}
                on:toggleDone={() => toggleDone(todo)} />
                {/each}
        </article>
        <!---------------------------------------------------------------------->
        <!--------------       MODAL                  ------------------------>
        <!---------------------------------------------------------------------->
        <div id="my-modal" class="modal">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box">
                    <div class="content columns is-mobile">
                        <div class="column task-title is-5">
                            <strong>time-more ... </strong>
                        </div>
                        <div class="column task-duration is-5">
                            <small>1h47</small>
                        </div>
                        <div class="column task-more-info is-2">
                            <span class="icon has-text-info">
                                <i class="fas fa-info-circle"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <button class="modal-close is-large" aria-label="close"></button>
        </div>
    </div>
</div>