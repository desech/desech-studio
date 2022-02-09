import HelperError from '../helper/HelperError.js'
import InputUnitField from '../component/InputUnitField.js'
import CheckButtonField from '../component/CheckButtonField.js'
import TabComponent from '../component/TabComponent.js'
import ChangeStyleField from '../component/ChangeStyleField.js'
import DragAndDrop from '../component/DragAndDrop.js'
import TimingFunction from '../component/TimingFunction.js'
import TooltipComponent from '../component/TooltipComponent.js'
import DialogEvent from '../component/dialog/DialogEvent.js'
import SliderComponent from '../component/SliderComponent.js'
import ColorPicker from '../component/ColorPicker.js'
import ColorPickerButton from '../component/color-picker/ColorPickerButton.js'
import ColorPickerInput from '../component/color-picker/ColorPickerInput.js'
import ColorPickerSwatch from '../component/color-picker/ColorPickerSwatch.js'
import ColorPickerGradient from '../component/color-picker/ColorPickerGradient.js'
import ColorPickerGradientProperty from '../component/color-picker/ColorPickerGradientProperty.js'
import Start from '../start/Start.js'
import Plugin from '../start/Plugin.js'
import Auth from '../start/Auth.js'
import Main from '../main/Main.js'
import Canvas from '../main/Canvas.js'
import CanvasHand from '../main/canvas/CanvasHand.js'
import CanvasElementCreate from '../main/canvas/element/CanvasElementCreate.js'
import CanvasElementMove from '../main/canvas/element/CanvasElementMove.js'
import CanvasElementText from '../main/canvas/element/CanvasElementText.js'
import CanvasElementComponent from '../main/canvas/element/CanvasElementComponent.js'
import CanvasElementCopyPaste from '../main/canvas/element/CanvasElementCopyPaste.js'
import CanvasElementContextmenu from '../main/canvas/element/CanvasElementContextmenu.js'
import CanvasElementSelect from '../main/canvas/element/CanvasElementSelect.js'
import CanvasOverlay from '../main/canvas/CanvasOverlay.js'
import CanvasOverlayResize from '../main/canvas/overlay/CanvasOverlayResize.js'
import CanvasOverlayGrid from '../main/canvas/overlay/CanvasOverlayGrid.js'
import CanvasTextOverlayEvent from '../main/canvas/text-overlay/CanvasTextOverlayEvent.js'
import TopCommand from '../main/top/TopCommand.js'
import TopCommandSave from '../main/top/command/TopCommandSave.js'
import Top from '../main/Top.js'
import TopPreview from '../main/top/TopPreview.js'
import TopResponsive from '../main/top/TopResponsive.js'
import TopZoom from '../main/top/TopZoom.js'
import Left from '../main/Left.js'
import LeftElementList from '../main/left/element/LeftElementList.js'
import LeftElementItem from '../main/left/element/LeftElementItem.js'
import LeftFileList from '../main/left/file/LeftFileList.js'
import LeftFileItem from '../main/left/file/LeftFileItem.js'
import LeftFileContextmenu from '../main/left/file/LeftFileContextmenu.js'
import Right from '../main/Right.js'
import RightSubPanel from '../main/right/RightSubPanel.js'
import RightSection from '../main/right/RightSection.js'
import RightPageMeta from '../main/right/section/page/RightPageMeta.js'
import RightHtmlMain from '../main/right/section/html/RightHtmlMain.js'
import RightHtmlDetail from '../main/right/section/html/RightHtmlDetail.js'
import RightHtmlDetailTag from '../main/right/section/html/detail/RightHtmlDetailTag.js'
import RightHtmlAttribute from '../main/right/section/html/RightHtmlAttribute.js'
import RightSelectorList from '../main/right/section/selector/RightSelectorList.js'
import RightSelectorForm from '../main/right/section/selector/RightSelectorForm.js'
import RightSizeMargin from '../main/right/section/size/RightSizeMargin.js'
import RightGridTrack from '../main/right/section/grid/RightGridTrack.js'
import RightTextFont from '../main/right/section/text/RightTextFont.js'
import RightTextDecoration from '../main/right/section/text/RightTextDecoration.js'
import RightBorderSide from '../main/right/section/border/RightBorderSide.js'
import RightBorderRadius from '../main/right/section/border/RightBorderRadius.js'
import RightBorderFill from '../main/right/section/border/RightBorderFill.js'
import RightBorderFillForm from '../main/right/section/border/RightBorderFillForm.js'
import RightBorderFillProperty from '../main/right/section/border/RightBorderFillProperty.js'
import RightBorderImage from '../main/right/section/border/RightBorderImage.js'
import RightFillList from '../main/right/section/fill/RightFillList.js'
import RightFillForm from '../main/right/section/fill/RightFillForm.js'
import RightFillProperty from '../main/right/section/fill/RightFillProperty.js'
import RightFillImage from '../main/right/section/fill/RightFillImage.js'
import RightEffectList from '../main/right/section/effect/RightEffectList.js'
import RightEffectType from '../main/right/section/effect/RightEffectType.js'
import RightEffectForm from '../main/right/section/effect/RightEffectForm.js'
import RightAnimationList from '../main/right/section/animation/RightAnimationList.js'
import RightAnimationForm from '../main/right/section/animation/RightAnimationForm.js'
import RightCSSList from '../main/right/section/css/RightCSSList.js'
import RightCSSProperty from '../main/right/section/css/RightCSSProperty.js'
import RightComponentMain from '../main/right/section/component/RightComponentMain.js'
import RightComponentProperty from '../main/right/section/component/RightComponentProperty.js'
import RightComponentVariant from '../main/right/section/component/RightComponentVariant.js'
import RightVariableMain from '../main/right/section/variable/RightVariableMain.js'

export default {
  addEvents () {
    for (const type of this.getEventTypes()) {
      window.addEventListener(type, this)
    }
  },

  getEventTypes () {
    return [
      'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'click', 'dblclick', 'wheel',
      'keydown', 'keyup', 'input', 'change', 'focusin', 'submit', 'contextmenu', 'resize', 'paste',
      'dragstart', 'dragend', 'dragover', 'dragdropbefore', 'dragdropafter', 'dragdroproot',
      'colorchange', 'reloadcontainer', 'clearcontainer', 'openpanel', 'closepanel', 'pushcommand',
      'setsource'
    ]
  },

  async handleEvent (event) {
    try {
      await this.handleObjectEvents(event)
    } catch (error) {
      HelperError.error(error)
    }
  },

  async handleObjectEvents (event) {
    for (const obj of this.getEventClasses()) {
      for (const [type, events] of Object.entries(obj.getEvents())) {
        for (const eventName of events) {
          await this.processEvent(event, obj, type, eventName)
        }
      }
    }
  },

  async processEvent (event, obj, type, eventName) {
    // not all events are cancelable, for example `change`
    if (event.type === type && (!event.cancelable || !event.defaultPrevented)) {
      // preventDefault() will stop the rest of the events of the same type
      if (!obj[eventName]) throw new Error(`Unknown event ${eventName}`)
      await obj[eventName](event)
    }
  },

  getEventClasses () {
    return [
      ...this.getComponentEvents(),
      ...this.getStartEvents(),
      ...this.getMainEvents()
    ]
  },

  getComponentEvents () {
    return [
      InputUnitField,
      CheckButtonField,
      TabComponent,
      ChangeStyleField,
      DragAndDrop,
      TimingFunction,
      TooltipComponent,
      DialogEvent,
      SliderComponent,
      ...this.getColorPickerEvents()
    ]
  },

  getColorPickerEvents () {
    return [
      ColorPicker,
      ColorPickerButton,
      ColorPickerInput,
      ColorPickerSwatch,
      ColorPickerGradient,
      ColorPickerGradientProperty
    ]
  },

  getStartEvents () {
    return [
      Start,
      Plugin,
      Auth
    ]
  },

  getMainEvents () {
    return [
      Main,
      ...this.getCanvasEvents(),
      ...this.getTopEvents(),
      ...this.getLeftEvents(),
      ...this.getRightEvents()
    ]
  },

  getCanvasEvents () {
    return [
      CanvasOverlay,
      CanvasOverlayResize,
      CanvasOverlayGrid,
      CanvasTextOverlayEvent,
      Canvas,
      CanvasHand,
      CanvasElementCreate,
      CanvasElementMove,
      CanvasElementText,
      CanvasElementComponent,
      CanvasElementCopyPaste,
      CanvasElementContextmenu,
      // last event handler, because it ignores clicks and mousedown events
      CanvasElementSelect
    ]
  },

  getTopEvents () {
    return [
      TopCommand,
      TopCommandSave,
      Top,
      TopPreview,
      TopResponsive,
      TopZoom
    ]
  },

  getLeftEvents () {
    return [
      Left,
      LeftElementList,
      LeftElementItem,
      LeftFileList,
      LeftFileContextmenu,
      // before LeftFileItem
      LeftFileItem
    ]
  },

  getRightEvents () {
    return [
      Right,
      RightSubPanel,
      RightSection,
      RightPageMeta,
      ...this.getRightHtmlEvents(),
      ...this.getRightSelectorEvents(),
      ...this.getRightSizeEvents(),
      ...this.getRightGridEvents(),
      ...this.getRightTextEvents(),
      ...this.getRightBorderEvents(),
      ...this.getRightFillEvents(),
      ...this.getRightEffectEvents(),
      ...this.getRightAnimationEvents(),
      ...this.getRightCSSEvents(),
      ...this.getRightComponentEvents(),
      ...this.getRightVariableEvents()
    ]
  },

  getRightHtmlEvents () {
    return [
      RightHtmlMain,
      RightHtmlDetail,
      RightHtmlDetailTag,
      RightHtmlAttribute
    ]
  },

  getRightSelectorEvents () {
    return [
      RightSelectorList,
      RightSelectorForm
    ]
  },

  getRightSizeEvents () {
    return [RightSizeMargin]
  },

  getRightGridEvents () {
    return [RightGridTrack]
  },

  getRightTextEvents () {
    return [
      RightTextFont,
      RightTextDecoration
    ]
  },

  getRightBorderEvents () {
    return [
      RightBorderSide,
      RightBorderRadius,
      RightBorderFill,
      RightBorderFillForm,
      RightBorderFillProperty,
      RightBorderImage
    ]
  },

  getRightFillEvents () {
    return [
      RightFillList,
      RightFillForm,
      RightFillProperty,
      RightFillImage
    ]
  },

  getRightEffectEvents () {
    return [
      RightEffectList,
      RightEffectType,
      RightEffectForm
    ]
  },

  getRightAnimationEvents () {
    return [
      RightAnimationList,
      RightAnimationForm
    ]
  },

  getRightCSSEvents () {
    return [
      RightCSSList,
      RightCSSProperty
    ]
  },

  getRightComponentEvents () {
    return [
      RightComponentMain,
      RightComponentProperty,
      RightComponentVariant
    ]
  },

  getRightVariableEvents () {
    return [
      RightVariableMain
    ]
  }
}
