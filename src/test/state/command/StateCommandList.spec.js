import test from 'ava'
import Template from '../../../lib/Template.js'
import TopCommandList from '../../../js/state/command/TopCommandList.js'
import StateCommand from '../../../js/state/StateCommand.js'
import StateCommandEvent from '../../../js/state/command/StateCommandEvent.js'

test.beforeEach(t => {
  StateCommand._timeout = StateCommand._command = null
  StateCommand._DELAY = 1

  TopCommandList._MAX_COMMANDS = 50
  TopCommandList._AUTOSAVE_TIME = 60 * 1000

  document.body.innerHTML = Template.getHtmlTemplate('./src/html/partial/sidebar/top/action.html', {
    partialFiles: [
      './src/html/partial/sidebar/top/history.html'
    ]
  }) + Template.getHtmlTemplate('./src/html/partial/template/command.html') +
    Template.getHtmlTemplate('./src/html/partial/canvas.html') +
    Template.getHtmlTemplate('./src/html/partial/sidebar/right.html')
  StateCommandEvent.addEvents()
})

test.afterEach(t => {
  document.body.innerHTML = ''
  StateCommandEvent.removeEvents()
})

test.serial('pushcommandEvent', t => {
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'
  document.getElementById('command-history').dispatchEvent(new CustomEvent('pushcommand', {
    detail: {
      do: {
        command: 'addElement',
        id: 'exx00xx'
      },
      undo: {
        command: 'removeElement',
        id: 'exx00xx'
      }
    },
    bubbles: true,
    cancelable: true
  }))

  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('inactive'))
  t.true(document.getElementById('save-button').classList.contains('active'))
  const elems = document.getElementById('command-history').children
  t.is(elems.length, 2)
  t.is(elems[0].className, 'previous')
  t.is(elems[1].className, 'current-command')
  t.is(elems[1].dataset.id, '2')
  t.is(elems[1].dataset.command, 'addElement')
  t.is(elems[1].dataset.data, '{"do":{"command":"addElement","id":"exx00xx"},"undo":{"command":"removeElement","id":"exx00xx"}}')
})

test.serial('clickUndoEvent', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = 'previous'
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2" data-data=\'{"undo":{"command":"addElement","id":"exx00xx"}}\'>Remove element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'
  document.getElementById('undo-button').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(document.getElementsByTagName('li')[0].className, 'current-command')
  t.is(document.getElementsByTagName('li')[1].className, 'next')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('inactive'))
  t.true(document.getElementById('redo-button').classList.contains('active'))
})

test.serial('keydownUndoEvent', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = 'previous'
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2" data-data=\'{"undo":{"command":"addElement","id":"exx00xx"}}\'>Remove element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'
  list.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Z', ctrlKey: true }))

  t.is(document.getElementsByTagName('li')[0].className, 'current-command')
  t.is(document.getElementsByTagName('li')[1].className, 'next')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('inactive'))
  t.true(document.getElementById('redo-button').classList.contains('active'))
})

test.serial('keydownUndoEvent on pending command', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = 'previous'
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2">Add element</li>')
  document.getElementById('canvas').innerHTML = '<div id="exx00xx"></div>'

  StateCommand._command = {
    do: {
      command: 'removeElement',
      id: 'exx00xx'
    },
    undo: {
      command: 'addElement',
      id: 'exx00xx'
    },
    time: 1
  }
  StateCommand.restartTimeout()

  list.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Z', ctrlKey: true }))

  t.is(document.getElementsByTagName('li')[0].className, 'previous')
  t.is(document.getElementsByTagName('li')[1].className, 'current-command')
  t.is(document.getElementsByTagName('li')[2].className, 'next')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('active'))
})

test.serial('clickRedoEvent', t => {
  const list = document.getElementById('command-history')
  list.insertAdjacentHTML('beforeend', '<li class="next" data-id="2" data-data=\'{"do":{"command":"addElement","id":"exx00xx"}}\'>Add element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'
  document.getElementById('redo-button').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

  t.is(document.getElementsByTagName('li')[0].className, 'previous')
  t.is(document.getElementsByTagName('li')[1].className, 'current-command')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('inactive'))
})

test.serial('keydownRedoEvent', t => {
  const list = document.getElementById('command-history')
  list.insertAdjacentHTML('beforeend', '<li class="next" data-id="2" data-data=\'{"do":{"command":"addElement","id":"exx00xx"}}\'>Add element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'
  list.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Z', ctrlKey: true, shiftKey: true }))

  t.is(document.getElementsByTagName('li')[0].className, 'previous')
  t.is(document.getElementsByTagName('li')[1].className, 'current-command')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('inactive'))
})

// Extra tests

test.serial('removeNextCommands', t => {
  const list = document.getElementById('command-history')
  list.insertAdjacentHTML('beforeend', '<li class="next" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="next" data-id="3">Remove element</li>')

  TopCommandList.removeNextCommands()
  t.is(document.getElementById('command-history').children.length, 1)
})

test.serial('getList', t => {
  t.is(TopCommandList.getList(), document.getElementById('command-history'))
})

test.serial('addCommand', t => {
  const elem = TopCommandList.addCommand({
    do: {
      command: 'addElement'
    }
  })
  t.is(document.getElementById('command-history').children.length, 2)
  t.is(elem.dataset.id, '2')
  t.is(elem.dataset.data, '{"do":{"command":"addElement"}}')
})

test.serial('getCommandTemplate', t => {
  t.is(typeof TopCommandList.getCommandTemplate('addElement'), 'object')

  t.throws(() => {
    TopCommandList.getCommandTemplate('noCommand')
  }, {
    instanceOf: Error,
    message: 'No command template "noCommand"'
  })
})

test.serial('setCommandData', t => {
  const elem = document.getElementsByClassName('current-command')[0]
  TopCommandList.setCommandData(elem, { foo: 'bar' })
  t.is(elem.dataset.id, '2')
  t.is(elem.dataset.data, '{"foo":"bar"}')
})

test.serial('getNextCommandId', t => {
  t.is(TopCommandList.getNextCommandId(), 2)
})

test.serial('getCurrentCommand', t => {
  t.is(TopCommandList.getCurrentCommand(), document.getElementsByClassName('current-command')[0])
})

test.serial('setCurrentCommand', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = ''
  list.insertAdjacentHTML('beforeend', '<li class="target" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="" data-id="3">Remove element</li>')

  TopCommandList.setCurrentCommand(document.getElementsByClassName('target')[0])
  const elems = document.getElementById('command-history').children
  t.is(elems[0].className, 'previous')
  t.is(elems[1].className, 'current-command')
  t.is(elems[2].className, 'next')
})

test.serial('setPreviousCommands', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = ''
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="" data-id="3">Remove element</li>')

  TopCommandList.setPreviousCommands(document.getElementsByClassName('current-command')[0])
  const elem = document.getElementsByClassName('previous')
  t.is(elem.length, 1)
  t.is(elem[0].dataset.id, '1')
})

test.serial('setNextCommands', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = ''
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="" data-id="3">Remove element</li>')

  TopCommandList.setNextCommands(document.getElementsByClassName('current-command')[0])
  const elem = document.getElementsByClassName('next')
  t.is(elem.length, 1)
  t.is(elem[0].dataset.id, '3')
})

test.serial('removeExcessCommands', t => {
  TopCommandList._MAX_COMMANDS = 2
  const list = document.getElementById('command-history')
  list.children[0].className = ''
  list.insertAdjacentHTML('beforeend', '<li class="" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="3">Remove element</li>')

  TopCommandList.removeExcessCommands()
  const elems = document.getElementById('command-history').children
  t.is(elems.length, 2)
  t.is(elems[0].dataset.id, '1')
  t.is(elems[1].dataset.id, '3')
})

test.serial('updateButtonStates', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = ''
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2">Add element</li>')
  list.insertAdjacentHTML('beforeend', '<li class="" data-id="3">Remove element</li>')

  TopCommandList.updateButtonStates()
  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('active'))
  t.true(document.getElementById('save-button').classList.contains('active'))
})

test.serial('getNodes', t => {
  const buttons = TopCommandList.getButtons()
  t.is(buttons.undo.id, 'undo-button')
  t.is(buttons.redo.id, 'redo-button')
  t.is(buttons.save.id, 'save-button')
  t.is(buttons.command.className, 'current-command')
})

test.serial('setButtonState', t => {
  const button = document.getElementById('undo-button')
  TopCommandList.setButtonState(button, true)
  t.true(button.classList.contains('active'))

  TopCommandList.setButtonState(button, false)
  t.true(button.classList.contains('inactive'))
})

test.serial('goToCommandPrev', t => {
  const list = document.getElementById('command-history')
  list.children[0].className = 'previous'
  list.insertAdjacentHTML('beforeend', '<li class="current-command" data-id="2" data-data=\'{"undo":{"command":"addElement","id":"exx00xx"}}\'>Add element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'

  TopCommandList.goToCommand(document.getElementsByTagName('li')[1], document.getElementsByTagName('li')[0], 'undo')
  t.is(document.getElementsByTagName('li')[0].className, 'current-command')
  t.is(document.getElementsByTagName('li')[1].className, 'next')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('inactive'))
  t.true(document.getElementById('redo-button').classList.contains('active'))
})

test.serial('goToCommandNext', t => {
  const list = document.getElementById('command-history')
  list.insertAdjacentHTML('beforeend', '<li class="next" data-id="2" data-data=\'{"do":{"command":"addElement","id":"exx00xx"}}\'>Add element</li>')
  document.getElementById('canvas').innerHTML = '<div hidden id="exx00xx"></div>'

  TopCommandList.goToCommand(document.getElementsByTagName('li')[0], document.getElementsByTagName('li')[1], 'do')
  t.is(document.getElementsByTagName('li')[0].className, 'previous')
  t.is(document.getElementsByTagName('li')[1].className, 'current-command')
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
  t.true(document.getElementById('undo-button').classList.contains('active'))
  t.true(document.getElementById('redo-button').classList.contains('inactive'))
})
