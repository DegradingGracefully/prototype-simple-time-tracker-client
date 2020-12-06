<script>
  import { onMount } from "svelte";
  import Todo from "./Todo.svelte";

  const baseUrl = "http://localhost:4000/task";
  let todos = [];

  onMount(async () => {
    let res = await fetch(baseUrl);
    todos = await res.json();
    console.log(todos);
  });

  let lastId = 500;
  const createTodo = (title, done = false, duration = 0) => ({
    id: lastId++,
    title: title,
    done: done,
    duration: duration,
  });
  let todoText = "";
  let hideCompleted = true;
  const ID_NO_TASK_TRACKING = 0; // represents the fact that we're not tracking any task currently
  let currentTaskTracking = {
    _id: ID_NO_TASK_TRACKING,
    timeBeginTracking: 0,
  };

  $: uncompletedCount = todos.filter((t) => !t.done).length;
  $: status = `${uncompletedCount} of ${todos.length} remaining`;
  $: todosToDisplay = todos.filter((t) => !hideCompleted || !t.done);

  function time_convert(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var seconds = seconds % 60;

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    return hours + ":" + minutes + ":" + seconds;
  }

  function getCurrentTimeString() {
    let date = new Date();
    let options = { hour: "2-digit", minute: "2-digit" };

    return date.toLocaleTimeString("en-us", options);
  }

  /*  switchTracking determines which task to begin / stop tracking / switch to other task
      and calculates the duration of the current task (if any) up to now
  */
  function switchTracking(todoId) {
    var previousTodo;

    // if we were tracking a task ...
    if (currentTaskTracking._id != ID_NO_TASK_TRACKING) {
      // ... calculates the "new" duration
      let durationMillis = Date.now() - currentTaskTracking.timeBeginTracking;
      let durationSeconds = Math.floor(durationMillis / 1000);

      // updates the task duration
      previousTodo = todos.find((t) => t._id === currentTaskTracking._id);
      previousTodo.duration += durationSeconds;
      previousTodo.durationToDisplay = time_convert(previousTodo.duration);
      todos = todos; // hack to update the array of todos in child Task.svelte, in order to update this previousTodo
      console.log(previousTodo);
    }

    let currentTaskTitle = todos.find((t) => t._id === todoId).title;

    // if we were tracking the selected task of id todoId => just stop tracking
    if (currentTaskTracking._id == todoId) {
      currentTaskTracking._id = ID_NO_TASK_TRACKING;
      console.log(getCurrentTimeString() + ": stopped task \"" + currentTaskTitle + "\"");
    } else {
      // else switch to selected task
      currentTaskTracking._id = todoId;
      currentTaskTracking.timeBeginTracking = Date.now();
      console.log(getCurrentTimeString() + ": switching to task \"" + currentTaskTitle + "\"");
    }
  }

  /* function switchTracking(todo) {
    // if we were tracking a task ...
    if (currentTaskTracking._id != ID_NO_TASK_TRACKING) {
      // ... calculates the "new" duration
      durationMillis =  Date.now() - todo.timeBeginTracking;
      durationMinutes = Math.floor(durationMillis / 1000)

      // updates the task duration
    }

    // if we were tracking the selected task of id todoId => just stop tracking
    if (currentTaskTracking._id == todo.id) {
      currentTaskTracking._id = ID_NO_TASK_TRACKING;
      console.log(getFormattedTimeString() + ": stopped task " + todo.id);
    } else {
    // else switch to selected task
      currentTaskTracking._id = todo.id;
      currentTaskTracking.timeBeginTracking = Date.now();
      console.log(getFormattedTimeString() + ": switching to task " + currentTaskTracking._id);
    }

    
  } */

  function addTodo() {
    todos = todos.concat(createTodo(todoText));
    todoText = "";
  }
  function deleteTodo(todoId) {
    todos = todos.filter((t) => t.id !== todoId);
  }
  function toggleDone(todo) {
    const { id } = todo;
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }
</script>

<style>
  button {
    margin-left: 10px;
  }
  ul.unstyled {
    list-style: none;
    margin-left: 0;
    padding-left: 0;
  }
</style>

<div>
  <h2>To Do List</h2>
  <div>
    {status}
    <div>
      Hide completed:
      <input
        type="checkbox"
        checked={hideCompleted}
        on:change={() => (hideCompleted = !hideCompleted)} />
    </div>
  </div>
  <br />
  <form on:submit|preventDefault>
    <input
      data-testid="todo-input"
      type="text"
      size="30"
      placeholder="enter new todo here"
      bind:value={todoText} />
    <button disabled={!todoText} on:click={addTodo}>Add</button>
  </form>
  <ul class="unstyled">
    {#each todosToDisplay as todo}
      <Todo
        {todo}
        on:switchTracking={() => switchTracking(todo._id)}
        on:delete={() => deleteTodo(todo._id)}
        on:toggleDone={() => toggleDone(todo)} />
    {/each}
  </ul>
</div>
