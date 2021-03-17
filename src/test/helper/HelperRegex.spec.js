import test from 'ava'
import HelperRegex from '../../js/helper/HelperRegex.js'

test('getMatchingGroups', t => {
  t.deepEqual(HelperRegex.getMatchingGroups('rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%', /((?<rgb>rgb(a)?\(.*?\)) (?<position>(.*?%)))/gi), [
    {
      rgb: 'rgb(0, 0, 0)',
      position: '0%'
    },
    {
      rgb: 'rgba(3, 0, 0, 1)',
      position: '50%'
    }
  ])

  t.deepEqual(HelperRegex.getMatchingGroups('linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(2, 0, 0) 100%), repeating-linear-gradient(to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)', /((?<repeating>repeating)-)?(?<type>(linear)?(radial)?-gradient)\((?<value>.*?%)\)/gi), [
    {
      type: 'linear-gradient',
      repeating: '',
      value: '90deg, rgb(0, 0, 0) 0%, rgb(2, 0, 0) 100%'
    },
    {
      type: 'linear-gradient',
      repeating: 'repeating',
      value: 'to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'
    }
  ])
})

test('splitByCharacter', t => {
  t.deepEqual(HelperRegex.splitByCharacter('rgb(0, 0, 0) 1px 2px 3px', ' '), [
    'rgb(0, 0, 0)',
    '1px',
    '2px',
    '3px'
  ])
})
