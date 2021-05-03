<script>
    import { onMount } from 'svelte';
    import {afterUpdate} from 'svelte';

  import Todo from './Todo.svelte';

  import newDurationHelper from './DurationHelper.js';

  const URL_GET_ALL_TASKS = 'http://localhost:4017/task';
  const URL_UPDATE_TASK = 'http://localhost:4017/task';
  const URL_POST_NEW_TASK = 'http://localhost:4017/task';
  const URL_GET_CURRENT_TASK_TRACKING = 'http://localhost:4017/currentTaskTracking';
  const URL_UPDATE_CURRENT_TASK_TRACKING = 'http://localhost:4017/currentTaskTracking';

  const ID_NO_TASK_TRACKING = 0; // represents the fact that we're not tracking any task currently

  const NO_TASK_TRACKING = {
    isTracking: false,
    taskId: ID_NO_TASK_TRACKING,
    durationForToday: 0,
    timeBeginTracking: null
  };

  let todos = [];
  let currentTaskTracking;

  let todoText = '';
  let hideCompleted = true;

  let globalDuration;

  $: status = `Showing ${todos.length} tasks`;

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

  function getCurrentTask() {
    // console.log("current task:" + JSON.stringify(todos.find((task) => task._id === currentTaskTracking.taskId)));
        return todos.find((task) => task._id === currentTaskTracking.taskId);
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

  function getGlobalDurationToDisplay(todoList) {
    // const globalDurationHelper = newDurationHelper(todos.reduce((totalDuration, currentTask) => totalDuration + currentTask.durationHelper.getSecondsFloored(), 0));
    const globalDurationHelper = newDurationHelper(todos.reduce((totalDuration, currentTask) => {
      // console.log("calculate global => adding task '" + currentTask.title + "' duration => " + currentTask.durationHelper.getSecondsFloored());
      return totalDuration + currentTask.durationHelper.getSecondsFloored();
    }, 0));
    return globalDurationHelper.getFormattedDuration();
  }

  function updateCurrentTaskTrackingDuration() {
    if (currentTaskTracking.isTracking) {
      // only update if there's a task selected
   // updates the task duration
      const currentTodo = todos.find((t) => t._id === currentTaskTracking.taskId);
      const newDurationSeconds = getCurrentTaskNewDuration();

      currentTodo.durationHelper = newDurationHelper(currentTodo.durationForToday + newDurationSeconds);

      todos = todos; // force update the display
      // console.log(`updated currentTaskTracking: ${JSON.stringify(currentTodo)}`);
      globalDuration = getGlobalDurationToDisplay(todos);
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
      todo.durationHelper = newDurationHelper(todo.durationForToday);
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
      const currentTaskNewDurationSeconds = getCurrentTaskNewDuration();
      currentTask.durationHelper = newDurationHelper(currentTask.durationForToday + currentTaskNewDurationSeconds);
    }

    globalDuration = getGlobalDurationToDisplay(todos);

    todos.forEach((t) => console.log(`Task '${t.title}' duration: ${t.durationForToday}`));

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
      previousTodo = getCurrentTask();
      previousTodo.durationForToday += durationSeconds;
      previousTodo.durationHelper = newDurationHelper(previousTodo.durationForToday);
      previousTodo.isTracking = false;      

      // must save the tracking period we've just ended
      previousTodo.trackingByDate.push({
        dateBegin: currentTaskTracking.timeBeginTracking,
        dateEnd: Date.now()
      });

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

    todos = todos; // force update the display
    // console.log('switched to task:' + JSON.stringify(todos.find((t) => t._id === todoId)));

    interval = setInterval(() => {
      updateCurrentTaskTrackingDuration();
    }, 500);
  }

  function switchTracking2(todoId) {
    const newTaskTracking = todos.find((t) => t._id === todoId);
      newTaskTracking.isTracking = true;
      todos = todos; // force update the display

  }

  const createTodo = (title, done = false, durationForToday = 0 ,enabled = true) => {
  // async function createTodo(title, done = false, duration = 0, enabled = true) {
    const newTodo = {
      id: lastId++,
      title,
      done,
      durationForToday,
      durationHelper: newDurationHelper(durationForToday),
      trackingByDate: [],
      correctDurationForDate: [],
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

  function correctTaskDurationForToday(event) {
    // console.log(JSON.stringify(event.detail));
    clearInterval(interval);
    const nbSecondsCorrection = event.detail.nbSecondsCorrection;
    const taskToUpdate = todos.find((t) => t._id === event.detail.todoId);

    taskToUpdate.durationForToday = taskToUpdate.durationForToday + nbSecondsCorrection;
    taskToUpdate.durationHelper = newDurationHelper(taskToUpdate.durationForToday);
    taskToUpdate.correctDurationForDate.push({
      date: Date.now(),
      nbSecondsCorrection: nbSecondsCorrection
    });
    todos = todos; // force update the display

    // update the display of global duration
    globalDuration = getGlobalDurationToDisplay(todos);

    // todos = todos ?
    console.log(taskToUpdate);;
    sendUpdateTask(taskToUpdate);

    // finally => execute the function immediately, just if we missed it due to clearing it temporarily...
    updateCurrentTaskTrackingDuration();
    
      // launch the "eternal" timer that updates the display of the duration
    interval = setInterval(() => {
        updateCurrentTaskTrackingDuration();
    }, 500);
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
                <div class="column is-5 header-info" style="text-align: right">                                    
                    Total duration today: {globalDuration}
                    <br />
                    <div ><u>{status}</u></div>
                </div>
            </div>
            {#each todos.filter(filterCompleted) as todo}
            <Todo {todo} on:switchTracking={()=>switchTracking(todo._id)}
                on:correctTaskDurationForToday={correctTaskDurationForToday}
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