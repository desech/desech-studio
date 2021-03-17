import test from 'ava'
import RightEffectTypeTransform from '../../../../../../js/main/right/section/effect/type/RightEffectTypeTransform.js'
import HelperStyle from '../../../../../../js/helper/HelperStyle.js'

test('joinRotate', t => {
  const transforms = HelperStyle.parseCSSValues('translate3d(0px, 0px, 0px) rotateX(1deg) rotateY(2deg) rotateZ(3deg) skew(0deg, 0deg)', {
    valuesDelimiter: ' ',
    paramsDelimiter: ', '
  })
  t.deepEqual(RightEffectTypeTransform.joinRotate(transforms), [
    {
      value: 'translate3d(0px, 0px, 0px)',
      function: 'translate3d',
      paramsString: '0px, 0px, 0px',
      params: [
        { value: '0px' },
        { value: '0px' },
        { value: '0px' }
      ]
    },
    {
      value: 'rotateX(1deg) rotateY(2deg) rotateZ(3deg)',
      function: 'rotate',
      paramsString: '1deg, 2deg, 3deg',
      params: [
        { value: '1deg' },
        { value: '2deg' },
        { value: '3deg' }
      ]
    },
    {
      value: 'skew(0deg, 0deg)',
      function: 'skew',
      paramsString: '0deg, 0deg',
      params: [
        { value: '0deg' },
        { value: '0deg' }
      ]
    }
  ])
})
