import type { MaterialDescriptor } from '@/types'
import { InputMaterial } from './Input'
import { TextAreaMaterial } from './TextArea'
import { InputNumberMaterial } from './InputNumber'
import { SelectMaterial } from './Select'
import { RadioMaterial } from './Radio'
import { CheckboxMaterial } from './Checkbox'
import { DatePickerMaterial } from './DatePicker'
import { SwitchMaterial } from './Switch'
import { CurrencyMaterial } from './Currency'
import { TimePickerMaterial } from './TimePicker'
import { SliderMaterial } from './Slider'
import { RateMaterial } from './Rate'
import { PhoneMaterial } from './Phone'
import { EmailMaterial } from './Email'
import { LinkMaterial } from './Link'
import { IDCardMaterial } from './IDCard'
import { GroupMaterial } from './Group'
import { TitleMaterial } from './Title'
import { ParagraphMaterial } from './Paragraph'
import { ApplicantMaterial } from './Applicant'
import { DocumentHeaderMaterial } from './DocumentHeader'
import { DividerMaterial } from './Divider'
import { TabsMaterial } from './Tabs'
import { CollapseMaterial } from './Collapse'
import { LayoutContainerMaterial } from './LayoutContainer'
import { EmbedUrlMaterial } from './EmbedUrl'

/** 全部内置物料 */
export const builtInMaterials: MaterialDescriptor[] = [
  // 常规组件
  InputMaterial,
  TextAreaMaterial,
  InputNumberMaterial,
  CurrencyMaterial,
  SelectMaterial,
  RadioMaterial,
  CheckboxMaterial,
  DatePickerMaterial,
  TimePickerMaterial,
  SwitchMaterial,
  SliderMaterial,
  RateMaterial,
  PhoneMaterial,
  EmailMaterial,
  LinkMaterial,
  IDCardMaterial,
  // 布局组件
  GroupMaterial,
  TitleMaterial,
  ParagraphMaterial,
  ApplicantMaterial,
  DocumentHeaderMaterial,
  DividerMaterial,
  TabsMaterial,
  CollapseMaterial,
  LayoutContainerMaterial,
  EmbedUrlMaterial,
]
