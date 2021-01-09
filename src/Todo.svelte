<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';

const dispatch = createEventDispatcher();
export let todo;
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
    display: none;
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
        <div class="{'done-' + todo.done} column task-title is-5 is-clickable" on:click={()=> dispatch('switchTracking')}>
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
        <div class="column task-duration is-5 py-0">
            <small>{todo.durationHelper.getFormattedDuration()}</small>
        </div>
        <div class="column task-title is-5  py-0">
        </div>
        <div class="column task-more-info is-2 py-0">
        </div>
        <div class="column task-duration is-5 py-0">
            <!-- is-narrow ??? -->
            <i class="fas fa-plus-circle is-size-7 modify-duration-button"></i> <!-- previously color red ccs class has-text-danger -->
            <i class="fas fa-minus-circle is-size-7 modify-duration-button"></i>
        </div>
    </div>
</div>