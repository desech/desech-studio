import test from 'ava'
import HelperParserBackground from '../../../js/helper/parser/HelperParserBackground.js'

test('getBackgrounds', t => {
  t.deepEqual(HelperParserBackground.getBackgrounds('linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%), repeating-linear-gradient(to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%), linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%, rgb(0, 0, 0) 100%), radial-gradient(10px 20px at 10px 20px, rgb(0, 0, 0) 0%, rgba(1, 255, 255, 0) 100%), repeating-radial-gradient(closest-side at 10px, rgb(0, 0, 0) 0%, rgba(2, 255, 255, 0) 100%), radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%), url(asset/image/border-sample.png)'), [
    {
      type: 'linear-gradient',
      repeating: '',
      value: '90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%'
    },
    {
      type: 'linear-gradient',
      repeating: 'repeating',
      value: 'to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'
    },
    {
      type: 'linear-gradient',
      repeating: '',
      value: 'rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%, rgb(0, 0, 0) 100%'
    },
    {
      type: 'radial-gradient',
      repeating: '',
      value: '10px 20px at 10px 20px, rgb(0, 0, 0) 0%, rgba(1, 255, 255, 0) 100%'
    },
    {
      type: 'radial-gradient',
      repeating: 'repeating',
      value: 'closest-side at 10px, rgb(0, 0, 0) 0%, rgba(2, 255, 255, 0) 100%'
    },
    {
      type: 'radial-gradient',
      repeating: '',
      value: 'rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%'
    },
    {
      type: 'url',
      repeating: '',
      value: 'asset/image/border-sample.png'
    }
  ])
})

test('getBackgroundValues', t => {
  t.deepEqual(HelperParserBackground.getBackgroundValues('linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%), repeating-linear-gradient(to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%), linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%, rgb(0, 0, 0) 100%), radial-gradient(10px 20px at 10px 20px, rgb(0, 0, 0) 0%, rgba(1, 255, 255, 0) 100%), repeating-radial-gradient(closest-side at 10px, rgb(0, 0, 0) 0%, rgba(2, 255, 255, 0) 100%), radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%), url("asset/image/border-sample.png")'), [
    'linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%)',
    'repeating-linear-gradient(to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%)',
    'linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%, rgb(0, 0, 0) 100%)',
    'radial-gradient(10px 20px at 10px 20px, rgb(0, 0, 0) 0%, rgba(1, 255, 255, 0) 100%)',
    'repeating-radial-gradient(closest-side at 10px, rgb(0, 0, 0) 0%, rgba(2, 255, 255, 0) 100%)',
    'radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%)',
    'url("asset/image/border-sample.png")'
  ])
  t.deepEqual(HelperParserBackground.getBackgroundValues('radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%), url(asset/image/border-sample.png)'), [
    'radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%)',
    'url(asset/image/border-sample.png)'
  ])
})

test('getColors', t => {
  t.deepEqual(HelperParserBackground.getColors('rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%'), [
    {
      rgb: 'rgb(0, 0, 0)',
      position: '0%'
    },
    {
      rgb: 'rgba(3, 0, 0, 1)',
      position: '50%'
    }
  ])
  t.deepEqual(HelperParserBackground.getColors('90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%'), [
    {
      rgb: 'rgb(0, 0, 0)',
      position: '0%'
    },
    {
      rgb: 'rgba(3, 0, 0, 1)',
      position: '50%'
    },
    {
      rgb: 'rgb(1, 0, 0)',
      position: '80%'
    },
    {
      rgb: 'rgb(2, 0, 0)',
      position: '100%'
    }
  ])
  t.deepEqual(HelperParserBackground.getColors('closest-side at 10px 20px, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%'), [
    {
      rgb: 'rgb(0, 0, 0)',
      position: '0%'
    },
    {
      rgb: 'rgba(3, 0, 0, 1)',
      position: '50%'
    }
  ])
})

test('getGradientLineValue', t => {
  t.is(HelperParserBackground.getGradientLineValue('to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), 'to left')
  t.is(HelperParserBackground.getGradientLineValue('90deg, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), '90deg')
  t.is(HelperParserBackground.getGradientLineValue('rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), '')
  t.is(HelperParserBackground.getGradientLineValue('closest-side at 10px 20px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), 'closest-side at 10px 20px')
  t.is(HelperParserBackground.getGradientLineValue('10px 10px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), '10px 10px')
  t.is(HelperParserBackground.getGradientLineValue('at center 20px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%'), 'at center 20px')
})

test('getLinearGradientLine', t => {
  t.deepEqual(HelperParserBackground.getLinearGradientLine('to left'), {
    angle: 'to left'
  })
  t.deepEqual(HelperParserBackground.getLinearGradientLine('90deg'), {
    angle: '90deg'
  })
  t.deepEqual(HelperParserBackground.getLinearGradientLine(''), {})
})

test('getRadialGradientFirstLine', t => {
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('closest-side'), { size: 'closest-side' })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('farthest-side'), { size: 'farthest-side' })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('closest-corner'), { size: 'closest-corner' })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('farthest-corner'), { size: 'farthest-corner' })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('10px'), {
    size: 'length',
    width: '10px',
    height: '10px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine('10px 20px'), {
    size: 'length',
    width: '10px',
    height: '20px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine(''), {})
})

test('getRadialGradientSecondLine', t => {
  t.deepEqual(HelperParserBackground.getRadialGradientSecondLine('10px'), {
    x: '10px',
    y: '10px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientSecondLine('10px 20px'), {
    x: '10px',
    y: '20px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientFirstLine(''), {})
})

test('getRadialGradientLine', t => {
  t.deepEqual(HelperParserBackground.getRadialGradientLine('closest-side at 10px 20px'), {
    size: 'closest-side',
    x: '10px',
    y: '20px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('30px 40px at 10px 20px'), {
    size: 'length',
    width: '30px',
    height: '40px',
    x: '10px',
    y: '20px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('30px 40px'), {
    size: 'length',
    width: '30px',
    height: '40px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('30px'), {
    size: 'length',
    width: '30px',
    height: '30px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('closest-side'), {
    size: 'closest-side'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('at 10px 20px'), {
    x: '10px',
    y: '20px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('at center 10px'), {
    x: 'center',
    y: '10px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('at 10px center'), {
    x: '10px',
    y: 'center'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('at center'), {
    x: 'center',
    y: 'center'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine('at 10px'), {
    x: '10px',
    y: '10px'
  })
  t.deepEqual(HelperParserBackground.getRadialGradientLine(''), {})
})

test('getGradientLine', t => {
  t.deepEqual(HelperParserBackground.getGradientLine('rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%', 'linear-gradient'), {})
  t.deepEqual(HelperParserBackground.getGradientLine('to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%', 'linear-gradient'), {
    angle: 'to left'
  })
  t.deepEqual(HelperParserBackground.getGradientLine('rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%', 'radial-gradient'), {})
  t.deepEqual(HelperParserBackground.getGradientLine('closest-side at 10px 20px, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%', 'radial-gradient'), {
    size: 'closest-side',
    x: '10px',
    y: '20px'
  })
})

test('getGradientObject', t => {
  t.deepEqual(HelperParserBackground.getGradientObject({
    type: 'linear-gradient',
    repeating: '',
    value: '90deg, rgb(0, 0, 0) 0%, rgb(1, 0, 0) 100%'
  }), {
    type: 'linear-gradient',
    repeating: false,
    line: {
      angle: '90deg'
    },
    colors: [
      {
        rgb: 'rgb(0, 0, 0)',
        position: '0%'
      },
      {
        rgb: 'rgb(1, 0, 0)',
        position: '100%'
      }
    ]
  })
})

test('getImageObject', t => {
  t.deepEqual(HelperParserBackground.getImageObject({
    type: 'url',
    repeating: '',
    value: 'asset/image/border-sample.png'
  }), {
    type: 'image',
    url: 'asset/image/border-sample.png'
  })
})

test('parse', t => {
  t.deepEqual(HelperParserBackground.parse('linear-gradient(rgb(0, 0, 0) 0%, rgb(1, 0, 0) 100%)'), [
    {
      type: 'linear-gradient',
      repeating: false,
      line: {},
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgb(1, 0, 0)',
          position: '100%'
        }
      ]
    }
  ])
  t.deepEqual(HelperParserBackground.parse('radial-gradient(rgb(0, 0, 0) 0%, rgb(1, 0, 0) 100%)'), [
    {
      type: 'radial-gradient',
      repeating: false,
      line: {},
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgb(1, 0, 0)',
          position: '100%'
        }
      ]
    }
  ])
  t.deepEqual(HelperParserBackground.parse('linear-gradient(90deg, rgb(0, 0, 0) 0%, rgba(3, 0, 0, 1) 50%, rgb(1, 0, 0) 80%, rgb(2, 0, 0) 100%), repeating-linear-gradient(to left, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%), linear-gradient(rgb(0, 0, 0) 0%, rgba(0, 0, 0, 1) 50%, rgb(0, 0, 0) 100%), radial-gradient(10px 20px at 10px 20px, rgb(0, 0, 0) 0%, rgba(1, 255, 255, 0) 100%), repeating-radial-gradient(closest-side at 10px, rgb(0, 0, 0) 0%, rgba(2, 255, 255, 0) 100%), radial-gradient(rgb(0, 0, 0) 0%, rgba(255, 255, 0, 0) 100%), url(asset/image/border-sample.png)'), [
    {
      type: 'linear-gradient',
      repeating: false,
      line: {
        angle: '90deg'
      },
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(3, 0, 0, 1)',
          position: '50%'
        },
        {
          rgb: 'rgb(1, 0, 0)',
          position: '80%'
        },
        {
          rgb: 'rgb(2, 0, 0)',
          position: '100%'
        }
      ]
    },
    {
      type: 'linear-gradient',
      repeating: true,
      line: {
        angle: 'to left'
      },
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(0, 0, 0, 1)',
          position: '100%'
        }
      ]
    },
    {
      type: 'linear-gradient',
      repeating: false,
      line: {},
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(0, 0, 0, 1)',
          position: '50%'
        },
        {
          rgb: 'rgb(0, 0, 0)',
          position: '100%'
        }
      ]
    },
    {
      type: 'radial-gradient',
      repeating: false,
      line: {
        size: 'length',
        width: '10px',
        height: '20px',
        x: '10px',
        y: '20px'
      },
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(1, 255, 255, 0)',
          position: '100%'
        }
      ]
    },
    {
      type: 'radial-gradient',
      repeating: true,
      line: {
        size: 'closest-side',
        x: '10px',
        y: '10px'
      },
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(2, 255, 255, 0)',
          position: '100%'
        }
      ]
    },
    {
      type: 'radial-gradient',
      repeating: false,
      line: {},
      colors: [
        {
          rgb: 'rgb(0, 0, 0)',
          position: '0%'
        },
        {
          rgb: 'rgba(255, 255, 0, 0)',
          position: '100%'
        }
      ]
    },
    {
      type: 'image',
      url: 'asset/image/border-sample.png'
    }
  ])
})
