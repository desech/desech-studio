import test from 'ava'
import Template from '../../../lib/Template.js'
import StateCommand from '../../../js/state/StateCommand.js'
import TopCommandList from '../../../js/state/command/TopCommandList.js'
import TopCommandSave from '../../../js/state/command/TopCommandSave.js'
import StateCommandEvent from '../../../js/state/command/StateCommandEvent.js'

test.beforeEach(t => {
  StateCommand._timeout = StateCommand._command = null
  StateCommand._DELAY = 1

  TopCommandList._MAX_COMMANDS = 50
  TopCommandSave._AUTOSAVE_TIME = 60 * 1000

  document.body.innerHTML = Template.getHtmlTemplate('./src/html/partial/sidebar/top/action.html', {
    partialFiles: [
      './src/html/partial/sidebar/top/history.html'
    ]
  }) + Template.getHtmlTemplate('./src/html/partial/template/command.html') +
    Template.getHtmlTemplate('./src/html/partial/canvas.html') +
    Template.getHtmlTemplate('./src/html/partial/sidebar/right.html')
  StateCommandEvent.addEvents() // these are not actually used
})

test.afterEach(t => {
  document.body.innerHTML = ''
  StateCommandEvent.removeEvents() // these are not actually used
})

test.serial('setAutoSaveInterval', async t => {
  const button = document.getElementById('save-button')
  button.classList.replace('inactive', 'active')
  TopCommandSave._AUTOSAVE_TIME = 1
  const interval = await TopCommandSave.setAutoSaveInterval()
  clearInterval(interval)

  t.true(button.classList.contains('inactive'))
  t.is(button.dataset.commandid, '1')
})

test.serial('clickSaveEvent', async t => {
  const button = document.getElementById('save-button')
  button.classList.replace('inactive', 'active')
  // button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) // can't dispatch event because of async
  await TopCommandSave.clickSaveEvent({ target: button })

  t.true(button.classList.contains('inactive'))
  t.is(button.dataset.commandid, '1')
})

test.serial('keydownSaveEvent', async t => {
  const button = document.getElementById('save-button')
  button.classList.replace('inactive', 'active')
  // document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'S', ctrlKey: true })) // can't dispatch event because of async
  await TopCommandSave.keydownSaveEvent({ target: button, key: 'S', ctrlKey: true })

  t.true(button.classList.contains('inactive'))
  t.is(button.dataset.commandid, '1')
})

// Extra tests

test.serial('setSaveLoading', t => {
  const button = document.getElementById('save-button')
  TopCommandSave.setSaveLoading(button, document.getElementsByClassName('current-command')[0])
  t.true(button.classList.contains('loading'))
  t.is(button.dataset.commandid, '1')
})

test.serial('saveCanvasState', async t => {
  const button = document.getElementById('save-button')
  await TopCommandSave.saveCanvasState(button)
  t.true(button.classList.contains('inactive'))
})
