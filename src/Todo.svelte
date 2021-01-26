<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';

import newDurationHelper from './DurationHelper.js';

const dispatch = createEventDispatcher();
export let todo;

let nbSecondsCorrection = 0;
// booleans for defining the duration text css styles
let isMouseOver = false;
let isHideButtonsOnMouseOut = true;
let isShowWaitingBeforeUpdateDuration = false;
let isShowInvalidSubstractMinute = false;
let isShowConfirmUpdate = false;


$: formattedDurationCorrected = newDurationHelper(todo.durationHelper.getSecondsFloored() + nbSecondsCorrection).getFormattedDuration();

let timeout;

function handlePlusClick() {
    clearTimeout(timeout);
    isShowWaitingBeforeUpdateDuration = true;
    isShowWaitingBeforeUpdateDuration = true;
    nbSecondsCorrection = nbSecondsCorrection + 60;
    console.log(`Additional duration = ${nbSecondsCorrection}`);
    timeout = setTimeout(saveCorrectDuration, 3000);
}

function handleMinusClick() {
    clearTimeout(timeout);
    isShowWaitingBeforeUpdateDuration = true;
    if (todo.durationHelper.getSecondsFloored() + nbSecondsCorrection >= 60) {
        nbSecondsCorrection = nbSecondsCorrection - 60;
    } else {
        isShowInvalidSubstractMinute = true;
        setTimeout(() => isShowInvalidSubstractMinute = false, 250);  
    }
    console.log(`Minus x minutes duration = ${nbSecondsCorrection}`);
    timeout = setTimeout(saveCorrectDuration, 3000);    
}

function saveCorrectDuration() {
    // send nbSecondsCorrection to parent so that it sends the update to the server
    dispatch('correctTaskDurationForToday', { todoId: todo._id, nbSecondsCorrection: nbSecondsCorrection });
    nbSecondsCorrection = 0;
    isShowWaitingBeforeUpdateDuration = false;
    isShowConfirmUpdate = true;
    setTimeout(() => isShowConfirmUpdate = false, 250);  
}

</script>
<style>
.done-true {
    color: gray;
    text-decoration: line-through;
}

.task-duration,
.task-more-info {
    text-align: right;
}

/* TODO: messy styles => may be cleaned later maybe. Just did what I needed.. class below
   to align the play/stop button with the title... */
.task-title {
    /* vertical-align: middle; */
    display: flex;
    /* align-items: center; */
    align-items: stretch;
}

.modify-duration-button {
    color: hsl(14, 100%, 53%);
    cursor: pointer;
    /* display: none; */
}

.isHideButtonsOnMouseOut {
    display: none;
}

.isShowWaitingBeforeUpdateDuration {
    text-decoration: italic;
    color: hsl(0, 0%, 71%);
}

.isShowConfirmUpdate {
    /* font-weight: bold; */
    font-size: 120%;
    /* yellow */
    color: hsl(48, 100%, 67%);
    /* red */
    /* color: hsl(14, 100%, 53%); */
}

.isShowInvalidSubstractMinute {
    /* font-weight: bold; */
    font-size: 120%;
    /* red */
    color: hsl(14, 100%, 53%);
}

.stop-button {
    height: 100%;
    margin-right: 10px;
}
</style>
<!-------------------------------------------------------------------------------->
<!---------------                 LAYOUT OF A TASK                ---------------->
<!-------------------------------------------------------------------------------->
<div transition:fade class="box">
    <div class="content columns is-multiline is-mobile">
        <div class="{'done-' + todo.done} column task-title is-5 is-clickable" on:click={() => dispatch('switchTracking')}>
            {#if todo.isTracking}
            <span class="task-title">
                <!-- must keep this apparently useless span container => fixes conflict between
                svelte registering the original span , and font awesome transforming it to an svg
                https://github.com/sveltejs/svelte/issues/5290#issuecomment-691712604
                https://stackoverflow.com/questions/58768701/sapper-how-do-i-fix-parentnode-is-null-when-navigating-away-from-a-page-with
            -->
            
                <span class='stop-button fas fa-stop-circle has-text-danger is-size-5'></span>
            
                <strong>{todo.title}</strong>
            </span>
            {:else}
            <span>
                <span class='fas fa-play is-size-7'></span>
                |
                <strong>{todo.title}</strong>
            </span>
            {/if}
        </div>
        <div class="column task-more-info is-2 py-0 modal-button" data-target="my-modal">
            <span class="icon has-text-info">
                <i class="fas fa-info-circle"></i>
            </span>
        </div>
        <div class="column task-duration is-5 py-0" on:mouseover={() => isHideButtonsOnMouseOut = false} on:mouseout={() => isHideButtonsOnMouseOut = true}>
             <!-- is-narrow ??? -->
            <span class:isHideButtonsOnMouseOut on:click={() => handlePlusClick()}>
            <!-- additionnal span fix similar to above fix => apparently font awesome removes the onclick handler on the elmements
                on which it is applied ??? (indeed, can't see the click handler if put inside the "font awesome span" below in Svelte Dev Tools )-->
                <span class="fas fa-plus-circle is-size-50 modify-duration-button"></span> <!-- previously color red ccs class has-text-danger -->
            </span>
            <small class:isShowWaitingBeforeUpdateDuration class:isShowInvalidSubstractMinute class:isShowConfirmUpdate>{formattedDurationCorrected}</small>
            {#if todo.durationHelper.getSecondsFloored() >= 60}
             <span class:isHideButtonsOnMouseOut on:click={() => handleMinusClick()}>    
            <!-- additionnal span fix similar to above fix => apparently font awesome removes the onclick handler on the elmements
                on which it is applied ??? (indeed, can't see the click handler if put inside the "font awesome span" below in Svelte Dev Tools )-->
                <span class="fas fa-minus-circle is-size-50 modify-duration-button"></span> <!-- previously color red ccs class has-text-danger -->
            </span>
            {/if}                
        </div>
        <div class="column task-title is-5  py-0">
        </div>
        <div class="column task-more-info is-2 py-0">
        </div>
        <div class="column task-duration is-5 py-0">
            <!-- is-narrow ??? -->
            <small>
            {nbSecondsCorrection}
            </small>            
        </div>
    </div>
</div>