import test from 'ava'
import HelperStyle from '../../js/helper/HelperStyle.js'

test('parseCSSValues', t => {
  t.deepEqual(HelperStyle.parseCSSValues(''), [])
})

test('parseCSSValuesFilter', t => {
  t.deepEqual(HelperStyle.parseCSSValues('contrast(10) drop-shadow(rgb(0, 0, 0) 1px 2px 3px) hue-rotate(90deg)', {
    valuesDelimiter: ' ',
    paramsDelimiter: ' '
  }), [
    {
      value: 'contrast(10)',
      function: 'contrast',
      paramsString: '10',
      params: [
        { value: '10' }
      ]
    },
    {
      value: 'drop-shadow(rgb(0, 0, 0) 1px 2px 3px)',
      function: 'drop-shadow',
      paramsString: 'rgb(0, 0, 0) 1px 2px 3px',
      params: [
        {
          value: 'rgb(0, 0, 0)',
          function: 'rgb',
          paramsString: '0, 0, 0'
        },
        { value: '1px' },
        { value: '2px' },
        { value: '3px' }
      ]
    },
    {
      value: 'hue-rotate(90deg)',
      function: 'hue-rotate',
      paramsString: '90deg',
      params: [
        { value: '90deg' }
      ]
    }
  ])
})

test('parseCSSValuesShadow', t => {
  t.deepEqual(HelperStyle.parseCSSValues('rgb(0, 0, 0) 1px 2px 3px 4px, rgb(0, 0, 0) 1px 2px 3px 4px inset', {
    valuesDelimiter: ', ',
    paramsDelimiter: ' '
  }), [
    {
      value: 'rgb(0, 0, 0) 1px 2px 3px 4px',
      params: [
        {
          value: 'rgb(0, 0, 0)',
          function: 'rgb',
          paramsString: '0, 0, 0'
        },
        { value: '1px' },
        { value: '2px' },
        { value: '3px' },
        { value: '4px' }
      ]
    },
    {
      value: 'rgb(0, 0, 0) 1px 2px 3px 4px inset',
      params: [
        {
          value: 'rgb(0, 0, 0)',
          function: 'rgb',
          paramsString: '0, 0, 0'
        },
        { value: '1px' },
        { value: '2px' },
        { value: '3px' },
        { value: '4px' },
        { value: 'inset' }
      ]
    }
  ])
})

test('parseCSSValuesTransform', t => {
  t.deepEqual(HelperStyle.parseCSSValues('translate3d(0px, 0px, 0px) rotateX(1deg) rotateY(2deg) rotateZ(3deg) skew(0deg, 0deg)', {
    valuesDelimiter: ' ',
    paramsDelimiter: ', '
  }), [
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
      value: 'rotateX(1deg)',
      function: 'rotateX',
      paramsString: '1deg',
      params: [
        { value: '1deg' }
      ]
    },
    {
      value: 'rotateY(2deg)',
      function: 'rotateY',
      paramsString: '2deg',
      params: [
        { value: '2deg' }
      ]
    },
    {
      value: 'rotateZ(3deg)',
      function: 'rotateZ',
      paramsString: '3deg',
      params: [
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

test('parseCSSValuesTransition', t => {
  t.deepEqual(HelperStyle.parseCSSValues('all 0s ease 0s, margin-right 1s cubic-bezier(0.29, 1.01, 1, -0.68) 2s, padding 2s steps(2, start) 1s', {
    valuesDelimiter: ', ',
    paramsDelimiter: ' ',
    subParamsDelimiter: ', '
  }), [
    {
      value: 'all 0s ease 0s',
      params: [
        {
          value: 'all',
          params: ['all']
        },
        {
          value: '0s',
          params: ['0s']
        },
        {
          value: 'ease',
          params: ['ease']
        },
        {
          value: '0s',
          params: ['0s']
        }
      ]
    },
    {
      value: 'margin-right 1s cubic-bezier(0.29, 1.01, 1, -0.68) 2s',
      params: [
        {
          value: 'margin-right',
          params: ['margin-right']
        },
        {
          value: '1s',
          params: ['1s']
        },
        {
          value: 'cubic-bezier(0.29, 1.01, 1, -0.68)',
          function: 'cubic-bezier',
          paramsString: '0.29, 1.01, 1, -0.68',
          params: ['0.29', '1.01', '1', '-0.68']
        },
        {
          value: '2s',
          params: ['2s']
        }
      ]
    },
    {
      value: 'padding 2s steps(2, start) 1s',
      params: [
        {
          value: 'padding',
          params: ['padding']
        },
        {
          value: '2s',
          params: ['2s']
        },
        {
          value: 'steps(2, start)',
          function: 'steps',
          paramsString: '2, start',
          params: ['2', 'start']
        },
        {
          value: '1s',
          params: ['1s']
        }
      ]
    }
  ])
})

test('parseCSSValuesBackgroundImage', t => {
  t.deepEqual(HelperStyle.parseCSSValues('linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 100%), radial-gradient(rgb(0, 0, 0) 0%, rgba(1, 1, 0, 0) 100%), url(asset/image/border-sample.png)', {
    valuesDelimiter: '(?<=\\)), ',
    paramsDelimiter: ', ',
    subParamsDelimiter: ' '
  }), [
    {
      value: 'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 100%)',
      function: 'linear-gradient',
      paramsString: '90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 100%',
      params: [
        {
          value: '90deg',
          params: ['90deg']
        },
        {
          value: 'rgb(0, 0, 0) 0%',
          params: [
            'rgb(0, 0, 0)',
            '0%'
          ]
        },
        {
          value: 'rgba(3, 0, 0, 1) 100%',
          params: [
            'rgba(3, 0, 0, 1)',
            '100%'
          ]
        }
      ]
    },
    {
      value: 'radial-gradient(rgb(0, 0, 0) 0%, rgba(1, 1, 0, 0) 100%)',
      function: 'radial-gradient',
      paramsString: 'rgb(0, 0, 0) 0%, rgba(1, 1, 0, 0) 100%',
      params: [
        {
          value: 'rgb(0, 0, 0) 0%',
          params: [
            'rgb(0, 0, 0)',
            '0%'
          ]
        },
        {
          value: 'rgba(1, 1, 0, 0) 100%',
          params: [
            'rgba(1, 1, 0, 0)',
            '100%'
          ]
        }
      ]
    },
    {
      value: 'url(asset/image/border-sample.png)',
      function: 'url',
      paramsString: 'asset/image/border-sample.png',
      params: [
        {
          value: 'asset/image/border-sample.png',
          params: ['asset/image/border-sample.png']
        }
      ]
    }
  ])
})

test('parseCSSValue', t => {
  t.deepEqual(HelperStyle.parseCSSValue('drop-shadow(rgb(0, 0, 0) 1px 2px 3px)', {
    paramsDelimiter: ' '
  }), {
    value: 'drop-shadow(rgb(0, 0, 0) 1px 2px 3px)',
    function: 'drop-shadow',
    paramsString: 'rgb(0, 0, 0) 1px 2px 3px',
    params: [
      {
        value: 'rgb(0, 0, 0)',
        function: 'rgb',
        paramsString: '0, 0, 0'
      },
      { value: '1px' },
      { value: '2px' },
      { value: '3px' }
    ]
  })
})

test('parseCSSParams', t => {
  t.deepEqual(HelperStyle.parseCSSParams('rgb(0, 0, 0) 1px 2px 3px', {
    paramsDelimiter: ' '
  }), [
    {
      value: 'rgb(0, 0, 0)',
      function: 'rgb',
      paramsString: '0, 0, 0'
    },
    { value: '1px' },
    { value: '2px' },
    { value: '3px' }
  ])
})

test('extractFunctionParams', t => {
  t.deepEqual(HelperStyle.extractFunctionParams('drop-shadow(rgb(0, 0, 0) 1px 2px 3px)'), {
    function: 'drop-shadow',
    params: 'rgb(0, 0, 0) 1px 2px 3px'
  })
})

test('getParsedCSSParam', t => {
  t.is(HelperStyle.getParsedCSSParam({
    params: [
      { value: '1px' }
    ]
  }, 0), '1px')

  t.is(HelperStyle.getParsedCSSParam({
    params: [
      {
        function: 'rgb'
      }
    ]
  }, 0, 'function'), 'rgb')

  t.is(HelperStyle.getParsedCSSParam({
    params: [
      { value: '1px' }
    ]
  }, 1), '')
})

test('getParsedCSSSubParam', t => {
  t.is(HelperStyle.getParsedCSSSubParam({
    params: [
      {
        params: ['1px']
      }
    ]
  }, 0, 0), '1px')

  t.is(HelperStyle.getParsedCSSSubParam({
    params: [
      {
        params: ['1px']
      }
    ]
  }, 1, 0), '')

  t.is(HelperStyle.getParsedCSSSubParam({
    params: [
      {
        params: ['1px']
      }
    ]
  }, 1, 1), '')
})
