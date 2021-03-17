import test from 'ava'
import StateCommand from '../../js/state/StateCommand.js'
import Fixture from '../Fixture.js'

test.beforeEach(t => {
  StateCommand._timeout = StateCommand._command = null
  StateCommand._DELAY = 1
  Fixture.addMainContainers()
})

test.afterEach(t => {
  document.body.innerHTML = ''
})

test.serial('stackCommandEmpty', async t => {
  await new Promise(resolve => {
    document.getElementById('command-history').addEventListener('pushcommand', event => {
      t.deepEqual(event.detail.do, {
        command: 'addElement',
        id: 1
      })
      t.deepEqual(event.detail.undo, {
        command: 'removeElement',
        id: 1
      })

      t.is(typeof event.detail.time, 'number')
      t.is(StateCommand._command, null)
      t.is(typeof StateCommand._timeout, 'object')

      resolve()
    })

    StateCommand.stackCommand({
      do: {
        command: 'addElement',
        id: 1
      },
      undo: {
        command: 'removeElement',
        id: 1
      }
    })
  })
})

test.serial('stackCommandDifferent', async t => {
  let id = 1
  await new Promise(resolve => {
    document.getElementById('command-history').addEventListener('pushcommand', event => {
      if (id === 1) {
        t.deepEqual(event.detail.do, {
          command: 'editElement',
          id: 1
        })
        t.deepEqual(event.detail.undo, {
          command: 'updateElement',
          id: 1
        })
      } else { // 2
        t.deepEqual(event.detail.do, {
          command: 'addElement',
          id: 2
        })
        t.deepEqual(event.detail.undo, {
          command: 'removeElement',
          id: 2
        })
      }

      t.is(typeof event.detail.time, 'number')
      t.is(StateCommand._command, null)
      t.is(typeof StateCommand._timeout, 'object')

      if (id === 2) { // resolve when both events have been triggered
        resolve()
      }
      id++
    })

    StateCommand._command = {
      do: {
        command: 'editElement',
        id: 1
      },
      undo: {
        command: 'updateElement',
        id: 1
      },
      time: 1
    }

    StateCommand.stackCommand({
      do: {
        command: 'addElement',
        id: 2
      },
      undo: {
        command: 'removeElement',
        id: 2
      }
    })
  })
})

test.serial('stackCommandSameQuick', async t => {
  let triggered = false
  await new Promise((resolve, reject) => {
    document.getElementById('command-history').addEventListener('pushcommand', event => {
      if (triggered) reject(new Error('Another event'))
      triggered = true

      t.deepEqual(event.detail.do, {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '16px'
        }
      })
      t.deepEqual(event.detail.undo, {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '10px'
        }
      })
      t.is(typeof event.detail.time, 'number')
      t.is(StateCommand._command, null)
      t.is(typeof StateCommand._timeout, 'object')

      resolve()
    })

    StateCommand._command = {
      do: {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '13px'
        }
      },
      undo: {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '10px'
        }
      },
      time: performance.now()
    }

    StateCommand.stackCommand({
      do: {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '16px'
        }
      },
      undo: {
        command: 'changeStyle',
        selector: '#exx00xx',
        properties: {
          'font-size': '13px'
        }
      }
    })
  })
})

test.serial('stackCommandSameLate', async t => {
  let id = 1
  await new Promise(resolve => {
    document.getElementById('command-history').addEventListener('pushcommand', event => {
      if (id === 1) {
        t.deepEqual(event.detail.do, {
          command: 'addElement',
          id: 1
        })
        t.deepEqual(event.detail.undo, {
          command: 'removeElement',
          id: 1
        })
      } else { // 2
        t.deepEqual(event.detail.do, {
          command: 'addElement',
          id: 2
        })
        t.deepEqual(event.detail.undo, {
          command: 'removeElement',
          id: 2
        })
      }

      t.is(typeof event.detail.time, 'number')
      t.is(StateCommand._command, null)
      t.is(typeof StateCommand._timeout, 'object')

      if (id === 2) { // resolve when both events have been triggered
        resolve()
      }
      id++
    })

    StateCommand._command = {
      do: {
        command: 'addElement',
        id: 1
      },
      undo: {
        command: 'removeElement',
        id: 1
      },
      time: 1
    }

    StateCommand.stackCommand({
      do: {
        command: 'addElement',
        id: 2
      },
      undo: {
        command: 'removeElement',
        id: 2
      }
    })
  })
})

test.serial('setCommand', t => {
  StateCommand.setCommand({
    do: {
      command: 'addElement',
      id: 1
    },
    undo: {
      command: 'removeElement',
      id: 1
    }
  })
  t.deepEqual(StateCommand._command.do, {
    command: 'addElement',
    id: 1
  })
  t.deepEqual(StateCommand._command.undo, {
    command: 'removeElement',
    id: 1
  })
  t.is(typeof StateCommand._command.time, 'number')
})

test.serial('isSameCommand', t => {
  StateCommand._command = {
    do: {
      command: 'addElement'
    }
  }
  t.false(StateCommand.isSameCommand({
    command: 'addElement'
  }))

  StateCommand._command = {
    do: {
      command: 'changeStyle',
      selector: '#exx00xx'
    }
  }
  t.false(StateCommand.isSameCommand({
    command: 'changeStyle',
    selector: '#e000000'
  }))

  StateCommand._command = {
    do: {
      command: 'changeStyle',
      selector: '#exx00xx',
      properties: {
        'font-size': '10px'
      }
    }
  }
  t.false(StateCommand.isSameCommand({
    command: 'changeStyle',
    selector: '#exx00xx',
    properties: {
      'font-family': 'Arial'
    }
  }))

  StateCommand._command = {
    do: {
      command: 'changeStyle',
      selector: '#exx00xx',
      properties: {
        'font-size': '10px'
      }
    }
  }
  t.false(StateCommand.isSameCommand({
    command: 'changeStyle',
    selector: '#exx00xx',
    properties: {
      'font-size': '10px',
      'font-family': 'Arial'
    }
  }))

  StateCommand._command = {
    do: {
      command: 'changeStyle',
      selector: '#exx00xx',
      properties: {
        'font-size': '10px'
      }
    }
  }
  t.true(StateCommand.isSameCommand({
    command: 'changeStyle',
    selector: '#exx00xx',
    properties: {
      'font-size': '13px'
    }
  }))

  StateCommand._command = {
    do: {
      command: 'changeStyle',
      selector: '#exx00xx',
      properties: {
        'font-size': '10px',
        'font-family': 'Arial'
      }
    }
  }
  t.true(StateCommand.isSameCommand({
    command: 'changeStyle',
    selector: '#exx00xx',
    properties: {
      'font-size': '20px',
      'font-family': 'Tahoma'
    }
  }))
})

test.serial('restartTimeout', async t => {
  await StateCommand.restartTimeout()
  t.is(typeof StateCommand._timeout, 'object')
})

test.serial('clearTimeout', t => {
  StateCommand.clearTimeout()
  t.is(StateCommand._timeout, null)

  StateCommand._timeout = 1
  StateCommand.clearTimeout()
  t.is(StateCommand._timeout, null)
})

test.serial('pushCommand', t => {
  document.getElementById('command-history').addEventListener('pushcommand', event => {
    t.deepEqual(event.detail.do, {
      command: 'addElement',
      id: 1
    })
    t.deepEqual(event.detail.undo, {
      command: 'removeElement',
      id: 1
    })
    t.is(typeof event.detail.time, 'number')
  })

  StateCommand._command = {
    do: {
      command: 'addElement',
      id: 1
    },
    undo: {
      command: 'removeElement',
      id: 1
    },
    time: 1
  }
  t.true(StateCommand.pushCommand())
  t.is(StateCommand._command, null)
})

test.serial('pushCommandEmpty', t => {
  StateCommand._command = undefined
  t.false(StateCommand.pushCommand())
  StateCommand._command = null
  t.false(StateCommand.pushCommand())
  StateCommand._command = {}
  t.false(StateCommand.pushCommand())
})

test.serial('forcePushCommand', t => {
  document.getElementById('command-history').addEventListener('pushcommand', event => {
    t.deepEqual(event.detail.do, {
      command: 'addElement',
      id: 1
    })
    t.deepEqual(event.detail.undo, {
      command: 'removeElement',
      id: 1
    })
    t.is(typeof event.detail.time, 'number')
  })

  StateCommand._command = {
    do: {
      command: 'addElement',
      id: 1
    },
    undo: {
      command: 'removeElement',
      id: 1
    },
    time: 1
  }
  StateCommand.restartTimeout()
  t.true(StateCommand.forcePushCommand())
  t.is(StateCommand._command, null)
  t.is(StateCommand._timeout, null)
})

test.serial('executeCommand', t => {
  document.body.innerHTML += '<div hidden id="exx00xx"></div>'
  StateCommand.executeCommand({
    command: 'addElement',
    id: 'exx00xx'
  })
  t.false(document.getElementById('exx00xx').hasAttributeNS(null, 'hidden'))
})
