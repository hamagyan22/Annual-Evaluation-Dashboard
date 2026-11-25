// Official Bank Structure & Roster (26 Departments, 552 Employees)
// Direct manager scoping: each manager evaluates their subordinates

import type { DynamicDepartment, DynamicEmployee } from "./customCriteriaManager";
import type { CompanyEmployee } from "./companyRoster";

export const INITIAL_DEPARTMENTS: DynamicDepartment[] = [
  {
    "id": "dept_01_ادارة_الفروع",
    "name": "ادارة الفروع",
    "nameAr": "ادارة الفروع",
    "description": "قسم ادارة الفروع - مصرف العراق الأول",
    "color": "emerald",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_02_التجاري",
    "name": "التجاري",
    "nameAr": "التجاري",
    "description": "قسم التجاري - مصرف العراق الأول",
    "color": "blue",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_03_مركز_الاتصال",
    "name": "مركز الاتصال",
    "nameAr": "مركز الاتصال",
    "description": "قسم مركز الاتصال - مصرف العراق الأول",
    "color": "teal",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_04_تقنية_المعلومات",
    "name": "تقنية المعلومات",
    "nameAr": "تقنية المعلومات",
    "description": "قسم تقنية المعلومات - مصرف العراق الأول",
    "color": "indigo",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_05_المكتب_الخلفي_-_العمليات",
    "name": "المكتب الخلفي - العمليات",
    "nameAr": "المكتب الخلفي - العمليات",
    "description": "قسم المكتب الخلفي - العمليات - مصرف العراق الأول",
    "color": "cyan",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_06_العمليات",
    "name": "العمليات",
    "nameAr": "العمليات",
    "description": "قسم العمليات - مصرف العراق الأول",
    "color": "sky",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_07_المبيعات",
    "name": "المبيعات",
    "nameAr": "المبيعات",
    "description": "قسم المبيعات - مصرف العراق الأول",
    "color": "emerald",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_08_الابلاغ_عن_غسل_الاموال_وتمويل_الارهاب",
    "name": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "nameAr": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "description": "قسم الابلاغ عن غسل الاموال وتمويل الارهاب - مصرف العراق الأول",
    "color": "amber",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_09_الهندسية_والادارية",
    "name": "الهندسية والادارية",
    "nameAr": "الهندسية والادارية",
    "description": "قسم الهندسية والادارية - مصرف العراق الأول",
    "color": "orange",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_10_المالية",
    "name": "المالية",
    "nameAr": "المالية",
    "description": "قسم المالية - مصرف العراق الأول",
    "color": "green",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_11_الدفع_الالكتروني",
    "name": "الدفع الالكتروني",
    "nameAr": "الدفع الالكتروني",
    "description": "قسم الدفع الالكتروني - مصرف العراق الأول",
    "color": "violet",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_12_الامتثال_الشرعي_ومراقبة_الامتثال",
    "name": "الامتثال الشرعي ومراقبة الامتثال",
    "nameAr": "الامتثال الشرعي ومراقبة الامتثال",
    "description": "قسم الامتثال الشرعي ومراقبة الامتثال - مصرف العراق الأول",
    "color": "yellow",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_13_الموارد_البشرية",
    "name": "الموارد البشرية",
    "nameAr": "الموارد البشرية",
    "description": "قسم الموارد البشرية - مصرف العراق الأول",
    "color": "teal",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_14_الادارة",
    "name": "الادارة",
    "nameAr": "الادارة",
    "description": "قسم الادارة - مصرف العراق الأول",
    "color": "rose",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_15_القانوني",
    "name": "القانوني",
    "nameAr": "القانوني",
    "description": "قسم القانوني - مصرف العراق الأول",
    "color": "purple",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_16_الرقابة_والتدقيق_الشرعي_الداخلي",
    "name": "الرقابة والتدقيق الشرعي الداخلي",
    "nameAr": "الرقابة والتدقيق الشرعي الداخلي",
    "description": "قسم الرقابة والتدقيق الشرعي الداخلي - مصرف العراق الأول",
    "color": "indigo",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_17_ادارة_المشاريع",
    "name": "ادارة المشاريع",
    "nameAr": "ادارة المشاريع",
    "description": "قسم ادارة المشاريع - مصرف العراق الأول",
    "color": "blue",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_18_أمن_المعلومات",
    "name": "أمن المعلومات",
    "nameAr": "أمن المعلومات",
    "description": "قسم أمن المعلومات - مصرف العراق الأول",
    "color": "red",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_19_التسويق",
    "name": "التسويق",
    "nameAr": "التسويق",
    "description": "قسم التسويق - مصرف العراق الأول",
    "color": "pink",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_20_الشمول_المالي",
    "name": "الشمول المالي",
    "nameAr": "الشمول المالي",
    "description": "قسم الشمول المالي - مصرف العراق الأول",
    "color": "emerald",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_21_الخزينة_والاستثمار_والمؤسسات_المالية",
    "name": "الخزينة والاستثمار والمؤسسات المالية",
    "nameAr": "الخزينة والاستثمار والمؤسسات المالية",
    "description": "قسم الخزينة والاستثمار والمؤسسات المالية - مصرف العراق الأول",
    "color": "amber",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_22_ادارة_المخاطر",
    "name": "ادارة المخاطر",
    "nameAr": "ادارة المخاطر",
    "description": "قسم ادارة المخاطر - مصرف العراق الأول",
    "color": "orange",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_23_ادارة_الجودة_والتطوير_المؤسسي",
    "name": "ادارة الجودة والتطوير المؤسسي",
    "nameAr": "ادارة الجودة والتطوير المؤسسي",
    "description": "قسم ادارة الجودة والتطوير المؤسسي - مصرف العراق الأول",
    "color": "blue",
    "direct_manager": "نسرين ستار باراني",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_24_الائتمان",
    "name": "الائتمان",
    "nameAr": "الائتمان",
    "description": "قسم الائتمان - مصرف العراق الأول",
    "color": "teal",
    "direct_manager": "زينب عبدالامير كاظم",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_25_العلاقات_العامة_وخدمة_كبار_العملاء",
    "name": "العلاقات العامة وخدمة كبار العملاء",
    "nameAr": "العلاقات العامة وخدمة كبار العملاء",
    "description": "قسم العلاقات العامة وخدمة كبار العملاء - مصرف العراق الأول",
    "color": "fuchsia",
    "direct_manager": "لينه ياسين عبد",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  },
  {
    "id": "dept_26_الشركات",
    "name": "الشركات",
    "nameAr": "الشركات",
    "description": "قسم الشركات - مصرف العراق الأول",
    "color": "violet",
    "direct_manager": "يسار عبدالقادر حمد الشواوره",
    "department_chief": "علي محمد حسن العاملي",
    "icon": "Building2"
  }
];

export const INITIAL_EMPLOYEES: DynamicEmployee[] = [
  {
    "id": "emp_1",
    "name": "شيماء علي حسين",
    "employee_id": "1",
    "department": "الادارة",
    "role": "معاون المدير المفوض",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون المدير المفوض",
    "role_type": "manager"
  },
  {
    "id": "emp_2",
    "name": "احمد حمزة سردال",
    "employee_id": "2",
    "department": "العمليات",
    "role": "مدير قسم العمليات المصرفية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم العمليات المصرفية",
    "role_type": "manager"
  },
  {
    "id": "emp_4",
    "name": "لينه ياسين عبد",
    "employee_id": "4",
    "department": "العلاقات العامة وخدمة كبار العملاء",
    "role": "مدير قسم العلاقات العامة وخدمة كبار العملاء",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم العلاقات العامة وخدمة كبار العملاء",
    "role_type": "manager"
  },
  {
    "id": "emp_11",
    "name": "انفال سلمان داود",
    "employee_id": "11",
    "department": "ادارة المخاطر",
    "role": "مدير قسم ادارة المخاطر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم ادارة المخاطر",
    "role_type": "manager"
  },
  {
    "id": "emp_604",
    "name": "عبدالهادي عباس عبدالصاحب",
    "employee_id": "604",
    "department": "العمليات",
    "role": "معاون مدير قسم العمليات المصرفية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم العمليات المصرفية",
    "role_type": "manager"
  },
  {
    "id": "emp_13",
    "name": "حفصه عاصم نصيف",
    "employee_id": "13",
    "department": "الادارة",
    "role": "معاون المدير المفوض",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون المدير المفوض",
    "role_type": "manager"
  },
  {
    "id": "emp_15",
    "name": "رافد محمد رضا",
    "employee_id": "15",
    "department": "أمن المعلومات",
    "role": "مدير قسم أمن المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم أمن المعلومات",
    "role_type": "manager"
  },
  {
    "id": "emp_16",
    "name": "زينب عبدالامير كاظم",
    "employee_id": "16",
    "department": "الائتمان",
    "role": "مدير قسم الائتمان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الائتمان",
    "role_type": "manager"
  },
  {
    "id": "emp_17",
    "name": "شهد نعمه حسن",
    "employee_id": "17",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "معاون مدير قسم الابلاغ عن غسل الاموال وتمويل الارهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role_type": "manager"
  },
  {
    "id": "emp_18",
    "name": "ايمان سعد محمد حسن",
    "employee_id": "18",
    "department": "الهندسية والادارية",
    "role": "مدير وحدة الديوان والارشفة الالكترونية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير وحدة الديوان والارشفة الالكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_20",
    "name": "شيماء زهير محمود",
    "employee_id": "20",
    "department": "الائتمان",
    "role": "معاون مدير قسم الأئتمان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "زينب عبدالامير كاظم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الأئتمان",
    "role_type": "manager"
  },
  {
    "id": "emp_22",
    "name": "بشار علي ناصر",
    "employee_id": "22",
    "department": "المالية",
    "role": "محاسب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محاسب",
    "role_type": "agent"
  },
  {
    "id": "emp_23",
    "name": "نسرين ستار باراني",
    "employee_id": "23",
    "department": "ادارة الجودة والتطوير المؤسسي",
    "role": "مدير قسم ادارة الجودة والتطوير المؤسسي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم ادارة الجودة والتطوير المؤسسي",
    "role_type": "manager"
  },
  {
    "id": "emp_24",
    "name": "فهد عبدالله يونس",
    "employee_id": "24",
    "department": "القانوني",
    "role": "محامي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  },
  {
    "id": "emp_26",
    "name": "روان كنعان خضير",
    "employee_id": "26",
    "department": "الموارد البشرية",
    "role": "قائد فريق شعبة المزايا والرواتب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق شعبة المزايا والرواتب",
    "role_type": "tl"
  },
  {
    "id": "emp_29",
    "name": "محمد جمال الطويل",
    "employee_id": "29",
    "department": "الادارة",
    "role": "موظف ائتمان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ائتمان",
    "role_type": "agent"
  },
  {
    "id": "emp_30",
    "name": "شهد كريم كامل",
    "employee_id": "30",
    "department": "ادارة الفروع",
    "role": "مدير مكتب مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مكتب مول القاهرة",
    "role_type": "manager"
  },
  {
    "id": "emp_31",
    "name": "رؤى موفق طالب",
    "employee_id": "31",
    "department": "الشمول المالي",
    "role": "مدير قسم الشمول المالي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الشمول المالي",
    "role_type": "manager"
  },
  {
    "id": "emp_32",
    "name": "محمد جواد كاظم",
    "employee_id": "32",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "مدير وحدة النقد المركزي / معاون مدير الاستثمار",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير وحدة النقد المركزي / معاون مدير الاستثمار",
    "role_type": "tl"
  },
  {
    "id": "emp_33",
    "name": "عفراء يونس ناجي",
    "employee_id": "33",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "معاون مدير وحدة النقد المركزي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير وحدة النقد المركزي",
    "role_type": "tl"
  },
  {
    "id": "emp_34",
    "name": "سعد عبدالعزيز مهدي",
    "employee_id": "34",
    "department": "الهندسية والادارية",
    "role": "مشرف قسم المشتريات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف قسم المشتريات",
    "role_type": "tl"
  },
  {
    "id": "emp_35",
    "name": "هدى سالم عبدالكريم",
    "employee_id": "35",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "معاون مدير قسم الامتثال الشرعي ومراقبة الامتثال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الامتثال الشرعي ومراقبة الامتثال",
    "role_type": "manager"
  },
  {
    "id": "emp_36",
    "name": "سنا هاني صالح",
    "employee_id": "36",
    "department": "الشمول المالي",
    "role": "مسؤول شعبة نظام تقارير الرقابة المصرفية BSRS",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة نظام تقارير الرقابة المصرفية BSRS",
    "role_type": "tl"
  },
  {
    "id": "emp_37",
    "name": "ياسر اكرم شفيق",
    "employee_id": "37",
    "department": "العمليات",
    "role": "منسق حوالات خارجية في ادارة الافروع",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق حوالات خارجية في ادارة الافروع",
    "role_type": "agent"
  },
  {
    "id": "emp_39",
    "name": "ساره حازم عبدالله",
    "employee_id": "39",
    "department": "المالية",
    "role": "معاون مدير قسم المالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم المالية",
    "role_type": "manager"
  },
  {
    "id": "emp_40",
    "name": "سهى عبدالكريم فجر",
    "employee_id": "40",
    "department": "العمليات",
    "role": "مسؤول شعبة المدفوعات المحلية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة المدفوعات المحلية",
    "role_type": "tl"
  },
  {
    "id": "emp_41",
    "name": "شمس صلاح سالم",
    "employee_id": "41",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_42",
    "name": "احمد بشير ابراهيم",
    "employee_id": "42",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_44",
    "name": "مهند عبدالحميد سعيد",
    "employee_id": "44",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_46",
    "name": "لبنى خميس سبتي",
    "employee_id": "46",
    "department": "الشمول المالي",
    "role": "معاون مدير قسم الشمول المالي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الشمول المالي",
    "role_type": "manager"
  },
  {
    "id": "emp_47",
    "name": "عبدالرحمن علي حميد",
    "employee_id": "47",
    "department": "الادارة",
    "role": "مدير مكتب معاون المدير المفوض",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مكتب معاون المدير المفوض",
    "role_type": "manager"
  },
  {
    "id": "emp_48",
    "name": "ساره جبار علي",
    "employee_id": "48",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "قائد فريق مكافحة الاحتيال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق مكافحة الاحتيال",
    "role_type": "tl"
  },
  {
    "id": "emp_51",
    "name": "هاله علي خليل",
    "employee_id": "51",
    "department": "ادارة المخاطر",
    "role": "معاون مدير قسم ادارة المخاطر - مخاطر غير مالية - مسؤول شعبة التمويل والاستثمار",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم ادارة المخاطر - مخاطر غير مالية - مسؤول شعبة التمويل والاستثمار",
    "role_type": "manager"
  },
  {
    "id": "emp_52",
    "name": "زينب رياض علي",
    "employee_id": "52",
    "department": "ادارة الجودة والتطوير المؤسسي",
    "role": "ضابط وثائق في قسم ادارة الجودة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط وثائق في قسم ادارة الجودة",
    "role_type": "qa"
  },
  {
    "id": "emp_54",
    "name": "احمد عباس محمد",
    "employee_id": "54",
    "department": "الهندسية والادارية",
    "role": "سائق",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "سائق",
    "role_type": "agent"
  },
  {
    "id": "emp_55",
    "name": "ابراهيم محمد علي",
    "employee_id": "55",
    "department": "الموارد البشرية",
    "role": "موظف موارد بشرية اقدم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف موارد بشرية اقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_56",
    "name": "زهراء رحيم كاظم",
    "employee_id": "56",
    "department": "الادارة",
    "role": "موظف أرشفة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف أرشفة",
    "role_type": "agent"
  },
  {
    "id": "emp_58",
    "name": "مصطفى اياد عبدالكاظم",
    "employee_id": "58",
    "department": "المبيعات",
    "role": "اخصائي بوابة الدفع الالكتروني",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "اخصائي بوابة الدفع الالكتروني",
    "role_type": "agent"
  },
  {
    "id": "emp_61",
    "name": "عبدالرحيم عباس محسن",
    "employee_id": "61",
    "department": "ادارة الفروع",
    "role": "مسؤول خدمة الزبائن - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خدمة الزبائن - الفرع الرئيسي",
    "role_type": "tl"
  },
  {
    "id": "emp_62",
    "name": "ضفار سعد عبدالحسين",
    "employee_id": "62",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة - الفرع الرئيسي",
    "role_type": "tl"
  },
  {
    "id": "emp_63",
    "name": "ميس احمد عريبي",
    "employee_id": "63",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط مكافحة غسل الأموال وتمويل الإرهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط مكافحة غسل الأموال وتمويل الإرهاب",
    "role_type": "agent"
  },
  {
    "id": "emp_64",
    "name": "بلال محمد محمود",
    "employee_id": "64",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - مكتب مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - مكتب مول القاهرة",
    "role_type": "agent"
  },
  {
    "id": "emp_65",
    "name": "عمر رياض عزيز",
    "employee_id": "65",
    "department": "ادارة الفروع",
    "role": "امين صندوق - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_67",
    "name": "صبا حيدر علي",
    "employee_id": "67",
    "department": "العمليات",
    "role": "موظف شعبة معالجة حسابات العملاء",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف شعبة معالجة حسابات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_70",
    "name": "مها عبد الوهاب فلاح",
    "employee_id": "70",
    "department": "الائتمان",
    "role": "موظف قسم الأئتمان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "زينب عبدالامير كاظم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف قسم الأئتمان",
    "role_type": "agent"
  },
  {
    "id": "emp_71",
    "name": "محمد عطيه عبدالكاظم",
    "employee_id": "71",
    "department": "الشمول المالي",
    "role": "موظف قسم الشمول المالي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف قسم الشمول المالي",
    "role_type": "agent"
  },
  {
    "id": "emp_72",
    "name": "محمد ضياء حسين",
    "employee_id": "72",
    "department": "المبيعات",
    "role": "منسق اجهزة البيع",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق اجهزة البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_75",
    "name": "احمد حسن احمد",
    "employee_id": "75",
    "department": "الهندسية والادارية",
    "role": "معتمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معتمد",
    "role_type": "agent"
  },
  {
    "id": "emp_76",
    "name": "حيدر جلال كاظم",
    "employee_id": "76",
    "department": "ادارة الفروع",
    "role": "ضابط ارتباط قسم الشمول المالي - مكتب مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الشمول المالي - مكتب مول القاهرة",
    "role_type": "agent"
  },
  {
    "id": "emp_79",
    "name": "انور كنعان هاشم",
    "employee_id": "79",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف جودة الامتثال والائتمتة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة الامتثال والائتمتة",
    "role_type": "qa"
  },
  {
    "id": "emp_82",
    "name": "علي جواد علي",
    "employee_id": "82",
    "department": "ادارة الفروع",
    "role": "امين صندوق - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_83",
    "name": "محمد عماد رفعت",
    "employee_id": "83",
    "department": "ادارة الفروع",
    "role": "موظف ارتباط قسم الشمول المالي - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ارتباط قسم الشمول المالي - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_84",
    "name": "محمد عادل هاشم",
    "employee_id": "84",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "امين خزنة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين خزنة",
    "role_type": "agent"
  },
  {
    "id": "emp_86",
    "name": "هاله رياض عبد الرحمن",
    "employee_id": "86",
    "department": "المالية",
    "role": "معاون محاسب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون محاسب",
    "role_type": "tl"
  },
  {
    "id": "emp_87",
    "name": "علي دريد احمد",
    "employee_id": "87",
    "department": "العمليات",
    "role": "اداري في قسم العمليات المصرفية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "اداري في قسم العمليات المصرفية",
    "role_type": "agent"
  },
  {
    "id": "emp_88",
    "name": "سجاد جميل نجم",
    "employee_id": "88",
    "department": "ادارة الفروع",
    "role": "امين صندوق - مكتب مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - مكتب مول القاهرة",
    "role_type": "agent"
  },
  {
    "id": "emp_91",
    "name": "عباس حسن ناجي",
    "employee_id": "91",
    "department": "الهندسية والادارية",
    "role": "عامل خدمة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عامل خدمة",
    "role_type": "agent"
  },
  {
    "id": "emp_92",
    "name": "ياسر عمار محمد",
    "employee_id": "92",
    "department": "الهندسية والادارية",
    "role": "فني صيانة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "فني صيانة",
    "role_type": "agent"
  },
  {
    "id": "emp_93",
    "name": "ابتسام جبار خلف",
    "employee_id": "93",
    "department": "الهندسية والادارية",
    "role": "موظف ضيافة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_94",
    "name": "ايناس جاسب خلف",
    "employee_id": "94",
    "department": "الهندسية والادارية",
    "role": "موظف ضيافة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_95",
    "name": "بان سلمان حمود",
    "employee_id": "95",
    "department": "الهندسية والادارية",
    "role": "موظف ضيافة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_97",
    "name": "كاروان سالم محمد سليم",
    "employee_id": "97",
    "department": "ادارة الفروع",
    "role": "مدير فرع دهوك",
    "team": "فرع دهوك",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع دهوك",
    "role_type": "manager"
  },
  {
    "id": "emp_98",
    "name": "ئاهنك حميد عبدالله",
    "employee_id": "98",
    "department": "ادارة الفروع",
    "role": "معاون مدير فرع دهوك",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير فرع دهوك",
    "role_type": "manager"
  },
  {
    "id": "emp_99",
    "name": "احمد حكمت علي",
    "employee_id": "99",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة",
    "role_type": "tl"
  },
  {
    "id": "emp_100",
    "name": "هيرش جلال محمد",
    "employee_id": "100",
    "department": "التجاري",
    "role": "مشرف إدارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف إدارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_101",
    "name": "دلال ناصر محمد",
    "employee_id": "101",
    "department": "التجاري",
    "role": "مشرف خدمة العملاء للشركات",
    "team": "فرع دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف خدمة العملاء للشركات",
    "role_type": "tl"
  },
  {
    "id": "emp_103",
    "name": "ملاك اسماعيل خليل",
    "employee_id": "103",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_104",
    "name": "ريوار طيار اونباشي",
    "employee_id": "104",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_105",
    "name": "سيبه ر احسان قادر",
    "employee_id": "105",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع دهوك",
    "team": "فرع دهوك",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع دهوك",
    "role_type": "agent"
  },
  {
    "id": "emp_106",
    "name": "سازان بلند عبدالحافظ",
    "employee_id": "106",
    "department": "ادارة الفروع",
    "role": "ضابط ارتباط قسم الشمول المالي",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الشمول المالي",
    "role_type": "agent"
  },
  {
    "id": "emp_107",
    "name": "بدرخان احمد فتح",
    "employee_id": "107",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_108",
    "name": "زينب عمر سليمان",
    "employee_id": "108",
    "department": "التجاري",
    "role": "مساعد ضابط علاقات الشركات ARM",
    "team": "فرع دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مساعد ضابط علاقات الشركات ARM",
    "role_type": "agent"
  },
  {
    "id": "emp_109",
    "name": "لاوين خليل احمد",
    "employee_id": "109",
    "department": "ادارة الفروع",
    "role": "عداد",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عداد",
    "role_type": "agent"
  },
  {
    "id": "emp_110",
    "name": "لزكين بهجت احمد",
    "employee_id": "110",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_111",
    "name": "مانويلا سالم اسحق",
    "employee_id": "111",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_112",
    "name": "طاهر نزار طاهر",
    "employee_id": "112",
    "department": "التجاري",
    "role": "مشرف إدارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف إدارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_114",
    "name": "هدير وصفي سالم",
    "employee_id": "114",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_118",
    "name": "شيان عزت ابراهيم",
    "employee_id": "118",
    "department": "ادارة الفروع",
    "role": "عداد",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عداد",
    "role_type": "agent"
  },
  {
    "id": "emp_119",
    "name": "جهاد كريم حسين",
    "employee_id": "119",
    "department": "ادارة الفروع",
    "role": "موظف استعلامات",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف استعلامات",
    "role_type": "agent"
  },
  {
    "id": "emp_120",
    "name": "رنا فوزي دانيال",
    "employee_id": "120",
    "department": "ادارة الفروع",
    "role": "موظف ضيافة",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_123",
    "name": "زيان جزا حمه سعيد",
    "employee_id": "123",
    "department": "ادارة الفروع",
    "role": "مسؤول قاعة - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول قاعة - فرع سليمانية",
    "role_type": "tl"
  },
  {
    "id": "emp_129",
    "name": "ده رون مصطفى عبدالله",
    "employee_id": "129",
    "department": "ادارة الفروع",
    "role": "امين صندوق  - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق  - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_132",
    "name": "محمد ابراهيم برزو",
    "employee_id": "132",
    "department": "التجاري",
    "role": "قائد فريق ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق ادارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_135",
    "name": "روزي جمال رؤوف",
    "employee_id": "135",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_137",
    "name": "لانو جلال عزيز",
    "employee_id": "137",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_139",
    "name": "زير علي عبدالله",
    "employee_id": "139",
    "department": "التجاري",
    "role": "قائد فريق ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق ادارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_140",
    "name": "ريفان اميد عبدالمجيد",
    "employee_id": "140",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_142",
    "name": "امانج عثمان احمد",
    "employee_id": "142",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_143",
    "name": "كوران محمد عبدل",
    "employee_id": "143",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_145",
    "name": "ره هه ند ريكه وت رؤف",
    "employee_id": "145",
    "department": "ادارة الفروع",
    "role": "عداد - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عداد - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_146",
    "name": "كوفان طارق رفيق",
    "employee_id": "146",
    "department": "ادارة الفروع",
    "role": "موظف استعلامات - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف استعلامات - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_147",
    "name": "ليهات عطار صدرالدين",
    "employee_id": "147",
    "department": "الدفع الالكتروني",
    "role": "مدير أول قسم الدفع الألكتروني",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير أول قسم الدفع الألكتروني",
    "role_type": "agent"
  },
  {
    "id": "emp_148",
    "name": "ريبوار حسيب جوهر",
    "employee_id": "148",
    "department": "الدفع الالكتروني",
    "role": "معاون مدير البطاقات",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير البطاقات",
    "role_type": "tl"
  },
  {
    "id": "emp_149",
    "name": "ديده ن دلير علي",
    "employee_id": "149",
    "department": "القانوني",
    "role": "مدير القسم القانوني",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير القسم القانوني",
    "role_type": "agent"
  },
  {
    "id": "emp_150",
    "name": "ادريس صالح حمد امين",
    "employee_id": "150",
    "department": "التجاري",
    "role": "رئيس قسم التجاري",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم التجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_151",
    "name": "درباز دارا محمد",
    "employee_id": "151",
    "department": "المالية",
    "role": "مدير تحليل بيانات",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير تحليل بيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_152",
    "name": "محمد اكرم سليم",
    "employee_id": "152",
    "department": "ادارة الفروع",
    "role": "مدير فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع اربيل",
    "role_type": "manager"
  },
  {
    "id": "emp_153",
    "name": "سيبان عادل مصطفى",
    "employee_id": "153",
    "department": "التسويق",
    "role": "مدير أول الإبداع التسويقي",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير أول الإبداع التسويقي",
    "role_type": "agent"
  },
  {
    "id": "emp_157",
    "name": "هاوسه ر عبدالله جوهر",
    "employee_id": "157",
    "department": "ادارة الفروع",
    "role": "مسؤول خدمة الزبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خدمة الزبائن - فرع اربيل",
    "role_type": "tl"
  },
  {
    "id": "emp_160",
    "name": "محمد روبيته ن ابراهيم",
    "employee_id": "160",
    "department": "الدفع الالكتروني",
    "role": "مشرف النزاعات والاسترداد",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف النزاعات والاسترداد",
    "role_type": "tl"
  },
  {
    "id": "emp_161",
    "name": "ئاره ش لقمان حكيم",
    "employee_id": "161",
    "department": "التسويق",
    "role": "أخصائي شراء الحملات الإعلانية الرقمية",
    "team": "سليمانية",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي شراء الحملات الإعلانية الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_162",
    "name": "محمد سردار عبدالله",
    "employee_id": "162",
    "department": "الادارة",
    "role": "مستشار",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار",
    "role_type": "agent"
  },
  {
    "id": "emp_165",
    "name": "ماردين صباح سعدو",
    "employee_id": "165",
    "department": "المالية",
    "role": "موظف تحليل بيانات",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تحليل بيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_166",
    "name": "زيمان محمد خضر",
    "employee_id": "166",
    "department": "الدفع الالكتروني",
    "role": "مشرف عمليات البطاقات",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف عمليات البطاقات",
    "role_type": "tl"
  },
  {
    "id": "emp_167",
    "name": "سراب عطار صدرالدين",
    "employee_id": "167",
    "department": "الهندسية والادارية",
    "role": "أخصائي مشتريات",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي مشتريات",
    "role_type": "agent"
  },
  {
    "id": "emp_168",
    "name": "ميفان عادل مصطفى",
    "employee_id": "168",
    "department": "التسويق",
    "role": "أخصائي تسويق",
    "team": "العمل من المنزل",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تسويق",
    "role_type": "agent"
  },
  {
    "id": "emp_170",
    "name": "عائشه احمد حسين",
    "employee_id": "170",
    "department": "التسويق",
    "role": "مدير الإتصالات التسويقية",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير الإتصالات التسويقية",
    "role_type": "agent"
  },
  {
    "id": "emp_172",
    "name": "هايده حسين احمد",
    "employee_id": "172",
    "department": "الدفع الالكتروني",
    "role": "أخصائي النزاعات والاسترداد",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي النزاعات والاسترداد",
    "role_type": "agent"
  },
  {
    "id": "emp_175",
    "name": "ساره سعدون شريف",
    "employee_id": "175",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_176",
    "name": "زيار شادى حمد امين",
    "employee_id": "176",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_177",
    "name": "ايه عسكر موسى",
    "employee_id": "177",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_181",
    "name": "ناديه سعد محمدسعيد",
    "employee_id": "181",
    "department": "ادارة الفروع",
    "role": "موظف ادارة علاقات العملاء - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_182",
    "name": "إسماعيل احمد عمر",
    "employee_id": "182",
    "department": "ادارة الفروع",
    "role": "موظف ادارة علاقات العملاء - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_184",
    "name": "ريام شاكر نجم",
    "employee_id": "184",
    "department": "القانوني",
    "role": "محامي",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  },
  {
    "id": "emp_185",
    "name": "زينه عمر طه",
    "employee_id": "185",
    "department": "ادارة الفروع",
    "role": "موظف ارتباط قسم الشمول المالي - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ارتباط قسم الشمول المالي - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_186",
    "name": "محمد فاضل صابر",
    "employee_id": "186",
    "department": "التجاري",
    "role": "موظف شعبة الحوالات - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف شعبة الحوالات - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_187",
    "name": "محمد صالح حمد علي",
    "employee_id": "187",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة - فرع اربيل",
    "role_type": "tl"
  },
  {
    "id": "emp_189",
    "name": "نازلي حمد امين احمد",
    "employee_id": "189",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_190",
    "name": "علي مؤيد علي",
    "employee_id": "190",
    "department": "ادارة الفروع",
    "role": "امين صندوق - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_191",
    "name": "نهاد نهرو عثمان",
    "employee_id": "191",
    "department": "ادارة الفروع",
    "role": "امين صندوق - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_192",
    "name": "ئاشنا رشاد رفيق",
    "employee_id": "192",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_193",
    "name": "محمد جوهر احمد",
    "employee_id": "193",
    "department": "التجاري",
    "role": "منسق عمليات أجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق عمليات أجهزة نقاط البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_194",
    "name": "هه ورين بابير مصطفى",
    "employee_id": "194",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_198",
    "name": "دلفين عمر رحمان",
    "employee_id": "198",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_199",
    "name": "ريناس هوشيار خضر",
    "employee_id": "199",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_200",
    "name": "ساره رائد فاروق",
    "employee_id": "200",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_201",
    "name": "ناز صلاح الدين عزيز",
    "employee_id": "201",
    "department": "التجاري",
    "role": "مشرف بوابة الدفع الالكتروني",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف بوابة الدفع الالكتروني",
    "role_type": "tl"
  },
  {
    "id": "emp_202",
    "name": "ايلاف حيدر قادر",
    "employee_id": "202",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_204",
    "name": "هكار عبدالخالق امين",
    "employee_id": "204",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_205",
    "name": "هيمن محمد عزيز",
    "employee_id": "205",
    "department": "التجاري",
    "role": "مشرف إدارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف إدارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_206",
    "name": "محمد عبدالقهار عبدالقادر",
    "employee_id": "206",
    "department": "التجاري",
    "role": "مشرف إدارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف إدارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_207",
    "name": "محمد وحيد محمود",
    "employee_id": "207",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_208",
    "name": "تافكه حامد محمد",
    "employee_id": "208",
    "department": "التجاري",
    "role": "مستشار تجاري",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_212",
    "name": "زياد اسلام نعمان",
    "employee_id": "212",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_213",
    "name": "مالك عنتر بكر",
    "employee_id": "213",
    "department": "الدفع الالكتروني",
    "role": "موظف بطاقات الكترونية",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف بطاقات الكترونية",
    "role_type": "agent"
  },
  {
    "id": "emp_214",
    "name": "هاني احمد صالح",
    "employee_id": "214",
    "department": "ادارة الفروع",
    "role": "معتمد - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معتمد - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_215",
    "name": "رنا خليل ابراهيم",
    "employee_id": "215",
    "department": "التجاري",
    "role": "مسؤول حوالات - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول حوالات - فرع اربيل",
    "role_type": "tl"
  },
  {
    "id": "emp_216",
    "name": "هيوا حمه شريف حمد",
    "employee_id": "216",
    "department": "ادارة الفروع",
    "role": "موظف عد وفرز - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف عد وفرز - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_217",
    "name": "محمد ياسين لطيف",
    "employee_id": "217",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_218",
    "name": "أبوبكر اميد مصطفى",
    "employee_id": "218",
    "department": "ادارة الفروع",
    "role": "امين صندوق - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_219",
    "name": "وليد دلشاد إبراهيم",
    "employee_id": "219",
    "department": "ادارة الفروع",
    "role": "امين صندوق - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_220",
    "name": "هارون رشيد قادر",
    "employee_id": "220",
    "department": "ادارة الفروع",
    "role": "امين صندوق - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_221",
    "name": "زاله شيرزاد خضر",
    "employee_id": "221",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_223",
    "name": "احمد هاني احمد",
    "employee_id": "223",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_225",
    "name": "رعد سعد موسى",
    "employee_id": "225",
    "department": "الموارد البشرية",
    "role": "موظف ضمان اجتماعي - عقد خارجي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضمان اجتماعي - عقد خارجي",
    "role_type": "agent"
  },
  {
    "id": "emp_226",
    "name": "الياس فوزي حسن",
    "employee_id": "226",
    "department": "الادارة",
    "role": "مستشار",
    "team": "الادارة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار",
    "role_type": "agent"
  },
  {
    "id": "emp_228",
    "name": "كوردستان شيرو  حاجي",
    "employee_id": "228",
    "department": "ادارة الفروع",
    "role": "موظف ضيافة - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_231",
    "name": "اساور خضير عباس",
    "employee_id": "231",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "قائد فريق اعرف عميلك",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق اعرف عميلك",
    "role_type": "tl"
  },
  {
    "id": "emp_232",
    "name": "عبدالله عامر نجم",
    "employee_id": "232",
    "department": "ادارة الجودة والتطوير المؤسسي",
    "role": "مسؤول وحدة السياسات والاجراءات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول وحدة السياسات والاجراءات",
    "role_type": "tl"
  },
  {
    "id": "emp_233",
    "name": "ريفين عادل رحمه الله",
    "employee_id": "233",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_235",
    "name": "ئالان مجيد باباله",
    "employee_id": "235",
    "department": "التجاري",
    "role": "منسق عمليات أجهزة نقاط البيع",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق عمليات أجهزة نقاط البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_237",
    "name": "محمد ناظم محمد",
    "employee_id": "237",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_238",
    "name": "محمد عمر عبدالله",
    "employee_id": "238",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_239",
    "name": "زه يد سلار احمد",
    "employee_id": "239",
    "department": "التجاري",
    "role": "منسق عمليات أجهزة نقاط البيع",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق عمليات أجهزة نقاط البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_240",
    "name": "رغِد عباس سعد",
    "employee_id": "240",
    "department": "ادارة الفروع",
    "role": "امين صندوق - مكتب مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - مكتب مول القاهرة",
    "role_type": "agent"
  },
  {
    "id": "emp_244",
    "name": "هه ردى جلال كريم",
    "employee_id": "244",
    "department": "التسويق",
    "role": "مدير تسويق النمو",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير تسويق النمو",
    "role_type": "agent"
  },
  {
    "id": "emp_246",
    "name": "برجين ديوالي مجيد",
    "employee_id": "246",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_250",
    "name": "امنيه فرات شاكر",
    "employee_id": "250",
    "department": "العمليات",
    "role": "موظف سويفت",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف سويفت",
    "role_type": "agent"
  },
  {
    "id": "emp_251",
    "name": "احمد ضرار لطفي",
    "employee_id": "251",
    "department": "الشمول المالي",
    "role": "مسؤول شعبة التوعية المصرفية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة التوعية المصرفية",
    "role_type": "tl"
  },
  {
    "id": "emp_252",
    "name": "محمد لازم ماضي",
    "employee_id": "252",
    "department": "المالية",
    "role": "محاسب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محاسب",
    "role_type": "agent"
  },
  {
    "id": "emp_255",
    "name": "هامنو دلشاد موسى",
    "employee_id": "255",
    "department": "ادارة الفروع",
    "role": "امين صندوق  - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق  - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_256",
    "name": "بناز ستار عبداللة",
    "employee_id": "256",
    "department": "التجاري",
    "role": "مشرف علاقات الشركات  - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف علاقات الشركات  - فرع سليمانية",
    "role_type": "tl"
  },
  {
    "id": "emp_257",
    "name": "اسراء جاسم جواد",
    "employee_id": "257",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "مدير قسم الخزينة والاستثمار والمؤسسات المالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الخزينة والاستثمار والمؤسسات المالية",
    "role_type": "manager"
  },
  {
    "id": "emp_258",
    "name": "انس وجدي عادل",
    "employee_id": "258",
    "department": "ادارة الفروع",
    "role": "موظف أرشفة - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف أرشفة - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_264",
    "name": "علي طه ياسين",
    "employee_id": "264",
    "department": "ادارة المخاطر",
    "role": "مسؤول شعبة مخاطر التشغيل / الشرعية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة مخاطر التشغيل / الشرعية",
    "role_type": "tl"
  },
  {
    "id": "emp_265",
    "name": "مصطفى خضر عباس",
    "employee_id": "265",
    "department": "ادارة الفروع",
    "role": "مدير الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_267",
    "name": "دانا ظاهر احمد",
    "employee_id": "267",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_269",
    "name": "ابراهيم شه مال محمد امين",
    "employee_id": "269",
    "department": "تقنية المعلومات",
    "role": "رئيس قسم تقنية المعلومات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم تقنية المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_270",
    "name": "دلال فقي شانه",
    "employee_id": "270",
    "department": "التجاري",
    "role": "أخصائي إدارة المبيعات",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي إدارة المبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_290",
    "name": "عبدالستار محمد باسم",
    "employee_id": "290",
    "department": "الموارد البشرية",
    "role": "موظف موارد بشرية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف موارد بشرية",
    "role_type": "agent"
  },
  {
    "id": "emp_296",
    "name": "احمد عبدالرحمن محمد القواعله",
    "employee_id": "296",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "رئيس قسم الرقابة والتدقيق الشرعي الداخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم الرقابة والتدقيق الشرعي الداخلي",
    "role_type": "qa"
  },
  {
    "id": "emp_299",
    "name": "فلاح حسن خليل كوكش",
    "employee_id": "299",
    "department": "ادارة المخاطر",
    "role": "مستشار قسم ادارة المخاطر و الائتمان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار قسم ادارة المخاطر و الائتمان",
    "role_type": "agent"
  },
  {
    "id": "emp_300",
    "name": "مروان احمد شكري الريماوي",
    "employee_id": "300",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "رئيس قسم الخزينة والاستثمار والمؤسسات المالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم الخزينة والاستثمار والمؤسسات المالية",
    "role_type": "agent"
  },
  {
    "id": "emp_301",
    "name": "بسام يوسف عون",
    "employee_id": "301",
    "department": "المالية",
    "role": "مدير قسم المالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم المالية",
    "role_type": "manager"
  },
  {
    "id": "emp_302",
    "name": "جلال محمود صالح برغل",
    "employee_id": "302",
    "department": "مركز الاتصال",
    "role": "مدير مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_306",
    "name": "محمد جمال فاروق المصري",
    "employee_id": "306",
    "department": "الشركات",
    "role": "مستشار",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يسار عبدالقادر حمد الشواوره",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار",
    "role_type": "agent"
  },
  {
    "id": "emp_307",
    "name": "عبدالرحمن هشام عدنان الحايك",
    "employee_id": "307",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "مدير حوكمة الامتثال و مكافحة الاحتيال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير حوكمة الامتثال و مكافحة الاحتيال",
    "role_type": "qa"
  },
  {
    "id": "emp_308",
    "name": "ايه عقيل مطشر",
    "employee_id": "308",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "أخصائي أول في فحص العقوبات الدولية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي أول في فحص العقوبات الدولية",
    "role_type": "agent"
  },
  {
    "id": "emp_310",
    "name": "حيدر عضيد حميد",
    "employee_id": "310",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "معاون مدير قسم الرقابة والتدقيق الشرعي الداخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الرقابة والتدقيق الشرعي الداخلي",
    "role_type": "manager"
  },
  {
    "id": "emp_311",
    "name": "ريوار عبد الستار حمد",
    "employee_id": "311",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_315",
    "name": "طه تغلب برهان الدين",
    "employee_id": "315",
    "department": "الدفع الالكتروني",
    "role": "مدير التسويات والمطابقات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير التسويات والمطابقات",
    "role_type": "agent"
  },
  {
    "id": "emp_316",
    "name": "زهراء اركان مهدي",
    "employee_id": "316",
    "department": "الدفع الالكتروني",
    "role": "معالج بيانات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معالج بيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_318",
    "name": "محمد يحيى عبد الستار",
    "employee_id": "318",
    "department": "الشمول المالي",
    "role": "موظف قسم الشمول المالي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف قسم الشمول المالي",
    "role_type": "agent"
  },
  {
    "id": "emp_320",
    "name": "نبأ احمد صبري",
    "employee_id": "320",
    "department": "العمليات",
    "role": "أخصائي تسوية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تسوية",
    "role_type": "agent"
  },
  {
    "id": "emp_321",
    "name": "احمد رياض حسن",
    "employee_id": "321",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي رئيسي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي رئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_322",
    "name": "برزي بدرخان احمد",
    "employee_id": "322",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق نظم معلومات أول",
    "team": "Ezma tower",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق نظم معلومات أول",
    "role_type": "agent"
  },
  {
    "id": "emp_323",
    "name": "عبدالله مقداد عبدالله",
    "employee_id": "323",
    "department": "ادارة الفروع",
    "role": "عداد",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عداد",
    "role_type": "agent"
  },
  {
    "id": "emp_324",
    "name": "شيراز نريمان توفيق",
    "employee_id": "324",
    "department": "ادارة الفروع",
    "role": "عداد - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "عداد - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_325",
    "name": "لافيا بختيار كمال",
    "employee_id": "325",
    "department": "التجاري",
    "role": "موظف إدارة علاقات العملاء والحوالات - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف إدارة علاقات العملاء والحوالات - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_326",
    "name": "سحر محمد مهدي عبد الكريم",
    "employee_id": "326",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_327",
    "name": "ره نج عبدالله قادر",
    "employee_id": "327",
    "department": "ادارة الفروع",
    "role": "موظف عد وفرز - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف عد وفرز - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_328",
    "name": "كولان حكمت محمد",
    "employee_id": "328",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_330",
    "name": "ئالين اسماعيل علي",
    "employee_id": "330",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_334",
    "name": "احمد جليل محمد",
    "employee_id": "334",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_336",
    "name": "احمد روستم عمر",
    "employee_id": "336",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_337",
    "name": "اكار ديار عمر",
    "employee_id": "337",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_339",
    "name": "ئالا ستار كريم",
    "employee_id": "339",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_340",
    "name": "انكيدو بويا سعده",
    "employee_id": "340",
    "department": "مركز الاتصال",
    "role": "قائد فريق مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق مركز الاتصال",
    "role_type": "tl"
  },
  {
    "id": "emp_341",
    "name": "ايه ياسين عبد الرحمن",
    "employee_id": "341",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_342",
    "name": "ازاد محمد عبدالله",
    "employee_id": "342",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_343",
    "name": "بانه فريا احمد",
    "employee_id": "343",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_344",
    "name": "ضحى خنجر نورى",
    "employee_id": "344",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_345",
    "name": "فرميسك يونس عوزير",
    "employee_id": "345",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_347",
    "name": "حسيب اديب محي الدين",
    "employee_id": "347",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_348",
    "name": "هيور عدنان اسماعيل",
    "employee_id": "348",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_349",
    "name": "كاني سامي عثمان",
    "employee_id": "349",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_350",
    "name": "لانه هه لمه ت رفيق",
    "employee_id": "350",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_351",
    "name": "لارا كامل محمد سليم",
    "employee_id": "351",
    "department": "مركز الاتصال",
    "role": "موظف تأكيد جودة",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تأكيد جودة",
    "role_type": "qa"
  },
  {
    "id": "emp_353",
    "name": "محمد ازاد صابر",
    "employee_id": "353",
    "department": "مركز الاتصال",
    "role": "موظف تدريب مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تدريب مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_356",
    "name": "محمد جهاد نوري",
    "employee_id": "356",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_357",
    "name": "محمد دلشاد عمر",
    "employee_id": "357",
    "department": "مركز الاتصال",
    "role": "موظف تأكيد جودة",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تأكيد جودة",
    "role_type": "qa"
  },
  {
    "id": "emp_358",
    "name": "مجده عمر علي",
    "employee_id": "358",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_360",
    "name": "نه وين معاذ محمد",
    "employee_id": "360",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_361",
    "name": "نور نوزاد عزيز",
    "employee_id": "361",
    "department": "الموارد البشرية",
    "role": "موظف مساعد موارد بشرية",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مساعد موارد بشرية",
    "role_type": "agent"
  },
  {
    "id": "emp_362",
    "name": "اسامة سعدي محمود",
    "employee_id": "362",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_363",
    "name": "بروين صباح سعيد",
    "employee_id": "363",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_364",
    "name": "رابه ر مجيد محمد",
    "employee_id": "364",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_365",
    "name": "ره سه ن اسماعيل موسى",
    "employee_id": "365",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_366",
    "name": "سجى بشار انور",
    "employee_id": "366",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_367",
    "name": "سانا دلير فؤاد",
    "employee_id": "367",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_368",
    "name": "سرباز نامق حسن",
    "employee_id": "368",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_369",
    "name": "ساوين سرتيب حسين",
    "employee_id": "369",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_370",
    "name": "شيرين ويسي سعيد",
    "employee_id": "370",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_371",
    "name": "سوما شيركو محمد",
    "employee_id": "371",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_372",
    "name": "تابان سيروان جلال",
    "employee_id": "372",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_373",
    "name": "يونس كمال احمد",
    "employee_id": "373",
    "department": "مركز الاتصال",
    "role": "قائد فريق مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق مركز الاتصال",
    "role_type": "tl"
  },
  {
    "id": "emp_374",
    "name": "يوسف رشيد درويش",
    "employee_id": "374",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_375",
    "name": "زهراء يوسف توفيق",
    "employee_id": "375",
    "department": "ادارة الفروع",
    "role": "موظف خدمة العملاء",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_376",
    "name": "زينب خالد رشيد",
    "employee_id": "376",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_377",
    "name": "زالة شيرزاد سلام",
    "employee_id": "377",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_378",
    "name": "ايات نافع سامي",
    "employee_id": "378",
    "department": "العلاقات العامة وخدمة كبار العملاء",
    "role": "موظف قسم العلاقات العامة وخدمة كبار العملاء",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "لينه ياسين عبد",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف قسم العلاقات العامة وخدمة كبار العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_379",
    "name": "ساره خسرو خدر",
    "employee_id": "379",
    "department": "التجاري",
    "role": "موظف دعم اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم اجهزة نقاط البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_381",
    "name": "شهاب احمد محمد صالح",
    "employee_id": "381",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_382",
    "name": "اسماعيل مجيد احمد",
    "employee_id": "382",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_383",
    "name": "طيبه علاء نصيف",
    "employee_id": "383",
    "department": "ادارة المخاطر",
    "role": "مسؤول شعبة مخاطر السيولة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة مخاطر السيولة",
    "role_type": "tl"
  },
  {
    "id": "emp_384",
    "name": "محمد بارزان قادر",
    "employee_id": "384",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_385",
    "name": "شوخان عثمان حمه صالح",
    "employee_id": "385",
    "department": "ادارة الفروع",
    "role": "موظف ضيافة - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_386",
    "name": "جابر حسن هوله",
    "employee_id": "386",
    "department": "الهندسية والادارية",
    "role": "موظف فني صيانة مولدات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف فني صيانة مولدات",
    "role_type": "agent"
  },
  {
    "id": "emp_388",
    "name": "ماردين لقمان عمر",
    "employee_id": "388",
    "department": "التسويق",
    "role": "أخصائي الاتصالات التسويقية",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الاتصالات التسويقية",
    "role_type": "agent"
  },
  {
    "id": "emp_389",
    "name": "موسى حسين حميد",
    "employee_id": "389",
    "department": "المالية",
    "role": "محاسب متدرب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محاسب متدرب",
    "role_type": "agent"
  },
  {
    "id": "emp_390",
    "name": "رشا باقر جاسم",
    "employee_id": "390",
    "department": "العمليات",
    "role": "موظف مراقبة دفتر الاستاذ العام",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مراقبة دفتر الاستاذ العام",
    "role_type": "agent"
  },
  {
    "id": "emp_391",
    "name": "دانيه عمار عبد القادر",
    "employee_id": "391",
    "department": "المبيعات",
    "role": "مساعد اداري",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مساعد اداري",
    "role_type": "agent"
  },
  {
    "id": "emp_392",
    "name": "حسن فلاح ناصر",
    "employee_id": "392",
    "department": "المبيعات",
    "role": "موظف أجهزة نقاط البيع",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف أجهزة نقاط البيع",
    "role_type": "agent"
  },
  {
    "id": "emp_393",
    "name": "احمد علي حسين",
    "employee_id": "393",
    "department": "المبيعات",
    "role": "مدير قسم المبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم المبيعات",
    "role_type": "manager"
  },
  {
    "id": "emp_394",
    "name": "محمد احمد علي",
    "employee_id": "394",
    "department": "الشمول المالي",
    "role": "مسؤول شعبة الخدمات والعمولات المصرفية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة الخدمات والعمولات المصرفية",
    "role_type": "tl"
  },
  {
    "id": "emp_396",
    "name": "عباس حسن محوط",
    "employee_id": "396",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_399",
    "name": "علي منصور مسك",
    "employee_id": "399",
    "department": "المبيعات",
    "role": "مدير حسابات الشركات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير حسابات الشركات",
    "role_type": "agent"
  },
  {
    "id": "emp_400",
    "name": "ميس رعد محمد",
    "employee_id": "400",
    "department": "المالية",
    "role": "محاسب مبتدىء",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محاسب مبتدىء",
    "role_type": "agent"
  },
  {
    "id": "emp_402",
    "name": "به ريز سعيد عبدالرحيم",
    "employee_id": "402",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_403",
    "name": "هيرو شيرزاد محمد",
    "employee_id": "403",
    "department": "التجاري",
    "role": "مستشار تجاري",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_407",
    "name": "نورالدين رياض محمود",
    "employee_id": "407",
    "department": "التجاري",
    "role": "اخصائي مبيعات",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "اخصائي مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_411",
    "name": "رسول عبدالصاحب عنيبر",
    "employee_id": "411",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_413",
    "name": "انور علي عبود",
    "employee_id": "413",
    "department": "المبيعات",
    "role": "مدير حسابات الشركات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير حسابات الشركات",
    "role_type": "agent"
  },
  {
    "id": "emp_415",
    "name": "احمد خالد حميد",
    "employee_id": "415",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_416",
    "name": "عدنان احمد عبده زكريا",
    "employee_id": "416",
    "department": "العمليات",
    "role": "رئيس قسم العمليات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم العمليات",
    "role_type": "agent"
  },
  {
    "id": "emp_417",
    "name": "فاتنه عبدالرحمن المملوك",
    "employee_id": "417",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_423",
    "name": "مريم صبيح حسن",
    "employee_id": "423",
    "department": "المبيعات",
    "role": "موظف توثيق",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف توثيق",
    "role_type": "agent"
  },
  {
    "id": "emp_424",
    "name": "مروه خليل علي",
    "employee_id": "424",
    "department": "ادارة الفروع",
    "role": "موظف خدمة العملاء",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_425",
    "name": "يسار عبدالقادر حمد الشواوره",
    "employee_id": "425",
    "department": "الشركات",
    "role": "رئيس قسم الشركات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس قسم الشركات",
    "role_type": "agent"
  },
  {
    "id": "emp_426",
    "name": "بشير علاء الدين جهاد",
    "employee_id": "426",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي",
    "role_type": "agent"
  },
  {
    "id": "emp_427",
    "name": "بيان رشيد حسين",
    "employee_id": "427",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_429",
    "name": "رابه ر حسين ملا",
    "employee_id": "429",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "موظف برامج وانظمة العقوبات الاقتصادية",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف برامج وانظمة العقوبات الاقتصادية",
    "role_type": "agent"
  },
  {
    "id": "emp_431",
    "name": "زينب محمد عزيز",
    "employee_id": "431",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط اعرف عميلك",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط اعرف عميلك",
    "role_type": "agent"
  },
  {
    "id": "emp_432",
    "name": "ساره دلير رشدي",
    "employee_id": "432",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط اعرف عميلك",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط اعرف عميلك",
    "role_type": "agent"
  },
  {
    "id": "emp_433",
    "name": "سوران برهان رشيد",
    "employee_id": "433",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_434",
    "name": "سيدره سليمان اسعد",
    "employee_id": "434",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_435",
    "name": "شه مال محمد رسول",
    "employee_id": "435",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط اعرف عميلك",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط اعرف عميلك",
    "role_type": "agent"
  },
  {
    "id": "emp_436",
    "name": "محمد احمد محمد",
    "employee_id": "436",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "موظف برامج وانظمة العقوبات الاقتصادية",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف برامج وانظمة العقوبات الاقتصادية",
    "role_type": "agent"
  },
  {
    "id": "emp_437",
    "name": "محمد حمه سعيد حمه شريف",
    "employee_id": "437",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_438",
    "name": "محمد رحيم حمد",
    "employee_id": "438",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط اعرف عميلك",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط اعرف عميلك",
    "role_type": "agent"
  },
  {
    "id": "emp_439",
    "name": "محمد يوسف علي",
    "employee_id": "439",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_440",
    "name": "مؤمن جلال كريم",
    "employee_id": "440",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "موظف برامج وانظمة العقوبات الاقتصادية",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف برامج وانظمة العقوبات الاقتصادية",
    "role_type": "agent"
  },
  {
    "id": "emp_441",
    "name": "مينا طارق عمر",
    "employee_id": "441",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_442",
    "name": "نه هاوند عوني احمد",
    "employee_id": "442",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط اعرف عميلك",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط اعرف عميلك",
    "role_type": "agent"
  },
  {
    "id": "emp_446",
    "name": "سجاد معد محمد",
    "employee_id": "446",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_449",
    "name": "عبدالمؤمن عبدالسلام عبدالكريم",
    "employee_id": "449",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_450",
    "name": "علي بلاسم طه",
    "employee_id": "450",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_451",
    "name": "انمار محمد خضر",
    "employee_id": "451",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_452",
    "name": "حسين قاسم محمد",
    "employee_id": "452",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_453",
    "name": "دعاء احمد كريم",
    "employee_id": "453",
    "department": "المبيعات",
    "role": "موظف توثيق",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف توثيق",
    "role_type": "agent"
  },
  {
    "id": "emp_456",
    "name": "ره وا سردار احمد",
    "employee_id": "456",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_457",
    "name": "سارة وليد فارس",
    "employee_id": "457",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف مكافحة احتيال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مكافحة احتيال",
    "role_type": "agent"
  },
  {
    "id": "emp_458",
    "name": "فراس عبدالرزاق جواد",
    "employee_id": "458",
    "department": "العمليات",
    "role": "مدير اول للتمويل التجاري / مدير قسم الدولي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير اول للتمويل التجاري / مدير قسم الدولي",
    "role_type": "manager"
  },
  {
    "id": "emp_459",
    "name": "محمد عبدالعزيز اسماعيل",
    "employee_id": "459",
    "department": "المالية",
    "role": "محاسب",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محاسب",
    "role_type": "agent"
  },
  {
    "id": "emp_460",
    "name": "علا اياد فاضل",
    "employee_id": "460",
    "department": "المالية",
    "role": "موظف تحليل بيانات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تحليل بيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_461",
    "name": "زينب ليث رشيد",
    "employee_id": "461",
    "department": "ادارة الفروع",
    "role": "ضابط عمليات الائتمان",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط عمليات الائتمان",
    "role_type": "agent"
  },
  {
    "id": "emp_462",
    "name": "مينا نمير فخري",
    "employee_id": "462",
    "department": "الموارد البشرية",
    "role": "موظف مساعد موارد بشرية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مساعد موارد بشرية",
    "role_type": "agent"
  },
  {
    "id": "emp_463",
    "name": "روان محمود احمد",
    "employee_id": "463",
    "department": "المبيعات",
    "role": "موظف مبيعات عبر الهاتف",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مبيعات عبر الهاتف",
    "role_type": "agent"
  },
  {
    "id": "emp_464",
    "name": "محمد باقر اسعد محمدعلي",
    "employee_id": "464",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي",
    "role_type": "agent"
  },
  {
    "id": "emp_465",
    "name": "محمد مصطفى نجيب",
    "employee_id": "465",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي",
    "role_type": "agent"
  },
  {
    "id": "emp_466",
    "name": "محمد ظاهر عبدالرزاق",
    "employee_id": "466",
    "department": "التجاري",
    "role": "أخصائي بوابة الدفع",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي بوابة الدفع",
    "role_type": "agent"
  },
  {
    "id": "emp_467",
    "name": "راويز عبدالرزاق محمد طاهر",
    "employee_id": "467",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_468",
    "name": "محمد جواد عبدالكاظم",
    "employee_id": "468",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_470",
    "name": "علي ابراهيم عبود",
    "employee_id": "470",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_471",
    "name": "علي حازم ستار",
    "employee_id": "471",
    "department": "المبيعات",
    "role": "موظف مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_472",
    "name": "ياسر يعقوب يوسف",
    "employee_id": "472",
    "department": "المبيعات",
    "role": "مدير حسابات تجارية - موظف شركات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير حسابات تجارية - موظف شركات",
    "role_type": "agent"
  },
  {
    "id": "emp_473",
    "name": "ابراهيم وضاح عبدالغفور",
    "employee_id": "473",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_474",
    "name": "ادم محمد عبدالله",
    "employee_id": "474",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "موظف عد وفرز",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف عد وفرز",
    "role_type": "agent"
  },
  {
    "id": "emp_475",
    "name": "نورالدين علي عباس",
    "employee_id": "475",
    "department": "ادارة الفروع",
    "role": "مدير ادارة الفروع",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير ادارة الفروع",
    "role_type": "agent"
  },
  {
    "id": "emp_478",
    "name": "مجبل عاطف مجبل",
    "employee_id": "478",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_480",
    "name": "شمس علي صادق",
    "employee_id": "480",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع مول القاهرة",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع مول القاهرة",
    "role_type": "agent"
  },
  {
    "id": "emp_481",
    "name": "رانيا عبدالله نجم",
    "employee_id": "481",
    "department": "المالية",
    "role": "رئيس شعبة تقارير البنك المركزي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس شعبة تقارير البنك المركزي",
    "role_type": "agent"
  },
  {
    "id": "emp_482",
    "name": "زينب عمر قادر",
    "employee_id": "482",
    "department": "التسويق",
    "role": "كاتب محتوى",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "كاتب محتوى",
    "role_type": "agent"
  },
  {
    "id": "emp_483",
    "name": "دانيار حمه طاهر فقى محمد",
    "employee_id": "483",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_484",
    "name": "نزار علي عمر",
    "employee_id": "484",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_485",
    "name": "لانه شوكت طيب",
    "employee_id": "485",
    "department": "التجاري",
    "role": "أخصائي بوابة الدفع الإلكتروني",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي بوابة الدفع الإلكتروني",
    "role_type": "agent"
  },
  {
    "id": "emp_486",
    "name": "به سار جمال اسعد",
    "employee_id": "486",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_489",
    "name": "خالد فراس خالد",
    "employee_id": "489",
    "department": "المبيعات",
    "role": "مندوب مبيعات شركات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات شركات",
    "role_type": "agent"
  },
  {
    "id": "emp_490",
    "name": "ئه زى سوران محمد",
    "employee_id": "490",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_491",
    "name": "محمد خضر محمد",
    "employee_id": "491",
    "department": "الدفع الالكتروني",
    "role": "موظف ضيافة",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_493",
    "name": "احمد محمد عزيز",
    "employee_id": "493",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_494",
    "name": "محمدصادق رائد ابراهيم",
    "employee_id": "494",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_495",
    "name": "فرياد خضر سليم",
    "employee_id": "495",
    "department": "القانوني",
    "role": "محامي",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  },
  {
    "id": "emp_496",
    "name": "اورفا اسماعيل كمال",
    "employee_id": "496",
    "department": "القانوني",
    "role": "مساعد اداري",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مساعد اداري",
    "role_type": "agent"
  },
  {
    "id": "emp_497",
    "name": "اسامه شاكر محمود",
    "employee_id": "497",
    "department": "الهندسية والادارية",
    "role": "مساعد فني صيانة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مساعد فني صيانة",
    "role_type": "agent"
  },
  {
    "id": "emp_499",
    "name": "سجاد اسعد عبدالزهره",
    "employee_id": "499",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_500",
    "name": "ادم نصير صلاح",
    "employee_id": "500",
    "department": "المبيعات",
    "role": "مندوب مبيعات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب مبيعات",
    "role_type": "agent"
  },
  {
    "id": "emp_502",
    "name": "ئوميد صالح احمد",
    "employee_id": "502",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_503",
    "name": "ئه لند هوار اسماعيل",
    "employee_id": "503",
    "department": "التجاري",
    "role": "مشرف وحدة اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف وحدة اجهزة نقاط البيع",
    "role_type": "tl"
  },
  {
    "id": "emp_505",
    "name": "ره نو ممند حسن",
    "employee_id": "505",
    "department": "التجاري",
    "role": "موظف ادارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات العملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_506",
    "name": "لافين مصلح خليل",
    "employee_id": "506",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_507",
    "name": "مخلد مدحت علي",
    "employee_id": "507",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_509",
    "name": "محمد عبدالحميد قادر",
    "employee_id": "509",
    "department": "التسويق",
    "role": "مصمم جرافيك",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مصمم جرافيك",
    "role_type": "agent"
  },
  {
    "id": "emp_510",
    "name": "دياكو جعفر لطيف",
    "employee_id": "510",
    "department": "التجاري",
    "role": "مشرف إدارة علاقات العملاء",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف إدارة علاقات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_512",
    "name": "به لين ابراهيم حمد امين",
    "employee_id": "512",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_513",
    "name": "هانا سركوت محمد",
    "employee_id": "513",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_514",
    "name": "مجيد علي خان مجيد",
    "employee_id": "514",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_515",
    "name": "مه ريوان رزكار حسن",
    "employee_id": "515",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_516",
    "name": "ريبوار زرا علي",
    "employee_id": "516",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_517",
    "name": "هاوزين عمر جبار",
    "employee_id": "517",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_518",
    "name": "ريناس ياسين محمد",
    "employee_id": "518",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_519",
    "name": "هه وال عبدالله خضر",
    "employee_id": "519",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_520",
    "name": "شادي نورالدين عبدالله",
    "employee_id": "520",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_521",
    "name": "فالا علي محمد",
    "employee_id": "521",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_522",
    "name": "زينه احمد قادر",
    "employee_id": "522",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_523",
    "name": "اردلان انور كريم",
    "employee_id": "523",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_524",
    "name": "ديدار عمر معروف",
    "employee_id": "524",
    "department": "المكتب الخلفي - العمليات",
    "role": "قائد فريق المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق المكتب الخلفي",
    "role_type": "tl"
  },
  {
    "id": "emp_525",
    "name": "اسماعيل عبد القادر مصطفى",
    "employee_id": "525",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_526",
    "name": "له رى شيروان عبدالرحمن",
    "employee_id": "526",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_527",
    "name": "ايلاف سيف الدين عبدالرحمن",
    "employee_id": "527",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_528",
    "name": "ايوب احمد اكرم",
    "employee_id": "528",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف جودة المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة المكتب الخلفي",
    "role_type": "qa"
  },
  {
    "id": "emp_529",
    "name": "ايوب عباس ملكو",
    "employee_id": "529",
    "department": "المكتب الخلفي - العمليات",
    "role": "قائد فريق المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق المكتب الخلفي",
    "role_type": "tl"
  },
  {
    "id": "emp_530",
    "name": "بسام شيرزاد مجيد",
    "employee_id": "530",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_531",
    "name": "راميار اكرم احمد",
    "employee_id": "531",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_532",
    "name": "ريان طاهر عزيز",
    "employee_id": "532",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_533",
    "name": "زيد مؤيد صالح",
    "employee_id": "533",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_534",
    "name": "سعد حسن مصطفى",
    "employee_id": "534",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_536",
    "name": "سيما سلام يعقوب",
    "employee_id": "536",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_539",
    "name": "كاميار يوسف خضر",
    "employee_id": "539",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_540",
    "name": "محمد مصطفى اسماعيل",
    "employee_id": "540",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف جودة المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة المكتب الخلفي",
    "role_type": "qa"
  },
  {
    "id": "emp_541",
    "name": "محمد اسماعيل جليل",
    "employee_id": "541",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_542",
    "name": "نيكار غفور عثمان",
    "employee_id": "542",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_543",
    "name": "مريم ريبوار محمد",
    "employee_id": "543",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_544",
    "name": "نسار جمال احمد",
    "employee_id": "544",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_545",
    "name": "محمد نذير محمد شريف",
    "employee_id": "545",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_547",
    "name": "محمد جمال مال الله",
    "employee_id": "547",
    "department": "تقنية المعلومات",
    "role": "مدير الصرافات الالية",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير الصرافات الالية",
    "role_type": "agent"
  },
  {
    "id": "emp_548",
    "name": "سه نكه ر محمد مصطفى",
    "employee_id": "548",
    "department": "تقنية المعلومات",
    "role": "مسؤول النظام",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول النظام",
    "role_type": "tl"
  },
  {
    "id": "emp_549",
    "name": "رائد نجيب كنو",
    "employee_id": "549",
    "department": "تقنية المعلومات",
    "role": "أخصائي تكنلوجيا المعلومات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تكنلوجيا المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_550",
    "name": "عبدالله عمر عزيز",
    "employee_id": "550",
    "department": "تقنية المعلومات",
    "role": "موظف دعم فني",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم فني",
    "role_type": "agent"
  },
  {
    "id": "emp_551",
    "name": "عمر ياسر عبدالستار",
    "employee_id": "551",
    "department": "تقنية المعلومات",
    "role": "مهندس شبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس شبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_552",
    "name": "شهد عبدالواحد موسى",
    "employee_id": "552",
    "department": "تقنية المعلومات",
    "role": "مسؤول النظام",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول النظام",
    "role_type": "tl"
  },
  {
    "id": "emp_553",
    "name": "عبدالرحمن طاهر عبدالله",
    "employee_id": "553",
    "department": "تقنية المعلومات",
    "role": "مدير قسم تكنلوجيا المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم تكنلوجيا المعلومات",
    "role_type": "manager"
  },
  {
    "id": "emp_554",
    "name": "وضاح عبدالهادي عبد علي",
    "employee_id": "554",
    "department": "تقنية المعلومات",
    "role": "مسؤول البنية التحتية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول البنية التحتية",
    "role_type": "tl"
  },
  {
    "id": "emp_555",
    "name": "بيشكو ئاريان احمد",
    "employee_id": "555",
    "department": "تقنية المعلومات",
    "role": "معاون مدير قسم تقنية المعلومات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم تقنية المعلومات",
    "role_type": "manager"
  },
  {
    "id": "emp_556",
    "name": "محمد جمال جعفر",
    "employee_id": "556",
    "department": "تقنية المعلومات",
    "role": "دعم تكنلوجيا المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "دعم تكنلوجيا المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_557",
    "name": "وسام شيرزاد مجيد",
    "employee_id": "557",
    "department": "المكتب الخلفي - العمليات",
    "role": "مشرف عمليات المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف عمليات المكتب الخلفي",
    "role_type": "tl"
  },
  {
    "id": "emp_558",
    "name": "جرو ابوبكر احمد",
    "employee_id": "558",
    "department": "تقنية المعلومات",
    "role": "مسؤول النظام",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول النظام",
    "role_type": "tl"
  },
  {
    "id": "emp_559",
    "name": "عبدالله احمد عبدالحسن",
    "employee_id": "559",
    "department": "تقنية المعلومات",
    "role": "دعم فني",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "دعم فني",
    "role_type": "agent"
  },
  {
    "id": "emp_560",
    "name": "زينب ميثم منعم",
    "employee_id": "560",
    "department": "تقنية المعلومات",
    "role": "منسق تكنلوجيا المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق تكنلوجيا المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_561",
    "name": "محمد رشيد محمود",
    "employee_id": "561",
    "department": "تقنية المعلومات",
    "role": "موظف دعم الأنظمة البنكية",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم الأنظمة البنكية",
    "role_type": "agent"
  },
  {
    "id": "emp_562",
    "name": "شهد حازم حميد",
    "employee_id": "562",
    "department": "المالية",
    "role": "رئيس شعبة التطوير المالي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "رئيس شعبة التطوير المالي",
    "role_type": "agent"
  },
  {
    "id": "emp_563",
    "name": "احمد قيس عبدالرحمن",
    "employee_id": "563",
    "department": "العمليات",
    "role": "مدير شعبة الرقابة على العمليات والمطابقات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير شعبة الرقابة على العمليات والمطابقات",
    "role_type": "qa"
  },
  {
    "id": "emp_564",
    "name": "اسلام فارس محمد ابراهيم",
    "employee_id": "564",
    "department": "تقنية المعلومات",
    "role": "أخصائي تكنلوجيا المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تكنلوجيا المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_565",
    "name": "ميران كاوان حمه كريم",
    "employee_id": "565",
    "department": "تقنية المعلومات",
    "role": "أخصائي تقنية المعلومات - فرع سليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تقنية المعلومات - فرع سليمانية",
    "role_type": "agent"
  },
  {
    "id": "emp_566",
    "name": "سايمون رافد يوسف",
    "employee_id": "566",
    "department": "تقنية المعلومات",
    "role": "أخصائي تقنية المعلومات - فرع دهوك",
    "team": "فرع دهوك",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي تقنية المعلومات - فرع دهوك",
    "role_type": "agent"
  },
  {
    "id": "emp_567",
    "name": "نور بهاء محمد",
    "employee_id": "567",
    "department": "المالية",
    "role": "نظم المعلومات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "نظم المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_568",
    "name": "رنا علي حسين",
    "employee_id": "568",
    "department": "المبيعات",
    "role": "معالج بيانات",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معالج بيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_569",
    "name": "روداو عبدالرحمن عبدالله",
    "employee_id": "569",
    "department": "ادارة المشاريع",
    "role": "موظف إدارة مشاريع مبتدىْ",
    "team": "سليمانية",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف إدارة مشاريع مبتدىْ",
    "role_type": "agent"
  },
  {
    "id": "emp_570",
    "name": "بيوار رشيد احمد",
    "employee_id": "570",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_571",
    "name": "وائل عباس فرمان القاضي",
    "employee_id": "571",
    "department": "ادارة المشاريع",
    "role": "مدير قسم ادارة المشاريع",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم ادارة المشاريع",
    "role_type": "manager"
  },
  {
    "id": "emp_572",
    "name": "عزت حيدر عدنان",
    "employee_id": "572",
    "department": "ادارة المشاريع",
    "role": "مدير مشروع المصرف و المدفوعات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مشروع المصرف و المدفوعات",
    "role_type": "agent"
  },
  {
    "id": "emp_573",
    "name": "علي زيره ك بشير",
    "employee_id": "573",
    "department": "ادارة المشاريع",
    "role": "موظف ادارة مشاريع",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة مشاريع",
    "role_type": "agent"
  },
  {
    "id": "emp_574",
    "name": "عمر اياد حمدي",
    "employee_id": "574",
    "department": "الموارد البشرية",
    "role": "مدير قسم الموارد البشرية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الموارد البشرية",
    "role_type": "manager"
  },
  {
    "id": "emp_575",
    "name": "كازفان وريا علي",
    "employee_id": "575",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_576",
    "name": "ريم مهدي علي الخفاجي",
    "employee_id": "576",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "مدير قسم الابلاغ عن غسل الاموال وتمويل الارهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role_type": "manager"
  },
  {
    "id": "emp_577",
    "name": "احمد عبدالسلام عبد الستار",
    "employee_id": "577",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_578",
    "name": "كاوان خالد باقر",
    "employee_id": "578",
    "department": "التجاري",
    "role": "مدير القسم التجاري",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير القسم التجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_579",
    "name": "فاتن علي حسين",
    "employee_id": "579",
    "department": "العمليات",
    "role": "موظف الخدمات المالية و التسويات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف الخدمات المالية و التسويات",
    "role_type": "agent"
  },
  {
    "id": "emp_580",
    "name": "دانية جلال احمد",
    "employee_id": "580",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "موظف امتثال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف امتثال",
    "role_type": "qa"
  },
  {
    "id": "emp_582",
    "name": "اسامة اركان حميد",
    "employee_id": "582",
    "department": "الموارد البشرية",
    "role": "معاون مدير قسم الموارد البشرية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير قسم الموارد البشرية",
    "role_type": "manager"
  },
  {
    "id": "emp_583",
    "name": "علي محمد حسن عبدالعباس العاملي",
    "employee_id": "583",
    "department": "الادارة",
    "role": "المدير المفوض",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "المدير المفوض",
    "role_type": "manager"
  },
  {
    "id": "emp_584",
    "name": "سلام صدام  محمد رشيد",
    "employee_id": "584",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_585",
    "name": "عمار حسين صالح",
    "employee_id": "585",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_586",
    "name": "حنين عبد الكريم اسكندر",
    "employee_id": "586",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_587",
    "name": "علي خليل اكبر",
    "employee_id": "587",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_589",
    "name": "محمد عبد ابراهيم",
    "employee_id": "589",
    "department": "العمليات",
    "role": "مسؤول اول شعبة معالجة حسابات العملاء",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول اول شعبة معالجة حسابات العملاء",
    "role_type": "tl"
  },
  {
    "id": "emp_591",
    "name": "افان احمد الياس",
    "employee_id": "591",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع دهوك",
    "team": "فرع دهوك",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الأموال وتمويل الأرهاب - فرع دهوك",
    "role_type": "agent"
  },
  {
    "id": "emp_594",
    "name": "محمد ليث محمد",
    "employee_id": "594",
    "department": "الموارد البشرية",
    "role": "قائد فريق شعبة عمليات الموارد البشرية وشؤون الموظفين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق شعبة عمليات الموارد البشرية وشؤون الموظفين",
    "role_type": "tl"
  },
  {
    "id": "emp_595",
    "name": "غفران ثائر جاسم",
    "employee_id": "595",
    "department": "الخزينة والاستثمار والمؤسسات المالية",
    "role": "موظف عد وفرز",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف عد وفرز",
    "role_type": "agent"
  },
  {
    "id": "emp_596",
    "name": "الان محمد معصوم",
    "employee_id": "596",
    "department": "القانوني",
    "role": "محامي",
    "team": "فرع دهوك",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  },
  {
    "id": "emp_597",
    "name": "علي عباس مكي",
    "employee_id": "597",
    "department": "ادارة الفروع",
    "role": "مدير مكتب السيدية",
    "team": "مكتب السيدية",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مكتب السيدية",
    "role_type": "manager"
  },
  {
    "id": "emp_598",
    "name": "خالد محمد طلاع",
    "employee_id": "598",
    "department": "ادارة الفروع",
    "role": "معاون مدير الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير الفرع الرئيسي",
    "role_type": "tl"
  },
  {
    "id": "emp_600",
    "name": "فاطمة زياد عبد الامير",
    "employee_id": "600",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "موظف تحليل قسم الإبلاغ عن غسل الأموال وتمويل الإرهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تحليل قسم الإبلاغ عن غسل الأموال وتمويل الإرهاب",
    "role_type": "agent"
  },
  {
    "id": "emp_601",
    "name": "رسل ستار عبد",
    "employee_id": "601",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_602",
    "name": "يونس خالد عبد الغفور",
    "employee_id": "602",
    "department": "التجاري",
    "role": "مستشار التجار - الموصل",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار التجار - الموصل",
    "role_type": "agent"
  },
  {
    "id": "emp_603",
    "name": "سنان عوني خضر",
    "employee_id": "603",
    "department": "تقنية المعلومات",
    "role": "مهندس شبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس شبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_605",
    "name": "روعه سعد رزوقي",
    "employee_id": "605",
    "department": "ادارة الجودة والتطوير المؤسسي",
    "role": "موظف سياسات واجراءات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف سياسات واجراءات",
    "role_type": "agent"
  },
  {
    "id": "emp_606",
    "name": "احمد قاسم سابط",
    "employee_id": "606",
    "department": "ادارة الجودة والتطوير المؤسسي",
    "role": "موظف سياسات واجراءات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف سياسات واجراءات",
    "role_type": "agent"
  },
  {
    "id": "emp_607",
    "name": "الند ازور محمدامين",
    "employee_id": "607",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_609",
    "name": "نجاة شفيع محمد",
    "employee_id": "609",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_610",
    "name": "عثمان ابو بكر احمد",
    "employee_id": "610",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_611",
    "name": "بيروز رحمن قادر",
    "employee_id": "611",
    "department": "المكتب الخلفي - العمليات",
    "role": "موظف المكتب الخلفي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف المكتب الخلفي",
    "role_type": "agent"
  },
  {
    "id": "emp_612",
    "name": "فؤاد سعود محطة",
    "employee_id": "612",
    "department": "التجاري",
    "role": "مستشار تجاري",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_613",
    "name": "محمد فارس مهاوش",
    "employee_id": "613",
    "department": "الهندسية والادارية",
    "role": "فني صيانة",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "فني صيانة",
    "role_type": "agent"
  },
  {
    "id": "emp_614",
    "name": "عباس صادق وادي",
    "employee_id": "614",
    "department": "الهندسية والادارية",
    "role": "فني صيانة",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "فني صيانة",
    "role_type": "agent"
  },
  {
    "id": "emp_616",
    "name": "اسماء سمير محمود",
    "employee_id": "616",
    "department": "ادارة الفروع",
    "role": "مدير فرع المنصور",
    "team": "فرع المنصور",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع المنصور",
    "role_type": "manager"
  },
  {
    "id": "emp_617",
    "name": "زينب علي عيسى",
    "employee_id": "617",
    "department": "ادارة الفروع",
    "role": "موظف خدمة عملاء",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة عملاء",
    "role_type": "agent"
  },
  {
    "id": "emp_618",
    "name": "منى عبدالحسن جبر",
    "employee_id": "618",
    "department": "ادارة الفروع",
    "role": "مدير فرع النجف",
    "team": "فرع النجف",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع النجف",
    "role_type": "manager"
  },
  {
    "id": "emp_619",
    "name": "احمد سكفان كامل",
    "employee_id": "619",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي",
    "role_type": "agent"
  },
  {
    "id": "emp_621",
    "name": "حسنين ثائر حسن",
    "employee_id": "621",
    "department": "الدفع الالكتروني",
    "role": "مدير قسم الدفع الالكتروني",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الدفع الالكتروني",
    "role_type": "manager"
  },
  {
    "id": "emp_622",
    "name": "ولاء حسن علي",
    "employee_id": "622",
    "department": "ادارة الفروع",
    "role": "مدير مكتب مول بغداد",
    "team": "مكتب مول بغداد",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مكتب مول بغداد",
    "role_type": "manager"
  },
  {
    "id": "emp_623",
    "name": "حوراء وليد حمد",
    "employee_id": "623",
    "department": "العمليات",
    "role": "مسؤول اول الرقابة الدخلية على العمليات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول اول الرقابة الدخلية على العمليات",
    "role_type": "tl"
  },
  {
    "id": "emp_624",
    "name": "احمد عبدالرزاق احمد",
    "employee_id": "624",
    "department": "الادارة",
    "role": "مسؤول شعبة علاقات المساهمين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول شعبة علاقات المساهمين",
    "role_type": "tl"
  },
  {
    "id": "emp_625",
    "name": "محمد ثامر جعفر",
    "employee_id": "625",
    "department": "الادارة",
    "role": "أمين سر مجلس الادارة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أمين سر مجلس الادارة",
    "role_type": "agent"
  },
  {
    "id": "emp_626",
    "name": "محمد وليد فتح الله",
    "employee_id": "626",
    "department": "الرقابة والتدقيق الشرعي الداخلي",
    "role": "مدقق داخلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدقق داخلي",
    "role_type": "agent"
  },
  {
    "id": "emp_627",
    "name": "رند منتظر حمزه",
    "employee_id": "627",
    "department": "العمليات",
    "role": "موظف الخدمات غير المالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف الخدمات غير المالية",
    "role_type": "agent"
  },
  {
    "id": "emp_628",
    "name": "ايه قصي عبدالقادر",
    "employee_id": "628",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "مكتب بغداد الجديدة",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_629",
    "name": "جوان سمير عبدالصاحب",
    "employee_id": "629",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_630",
    "name": "مؤمل عصام محسن",
    "employee_id": "630",
    "department": "ادارة الفروع",
    "role": "امين صندوق - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_631",
    "name": "زينب بشار عطا الله",
    "employee_id": "631",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_632",
    "name": "دجى عدي طلال",
    "employee_id": "632",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "مكتب مول بغداد",
    "direct_manager": "ولاء حسن علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_633",
    "name": "احمد نبيل كاظم",
    "employee_id": "633",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "مكتب بغداد الجديدة",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_634",
    "name": "محمد عبدالله عناد",
    "employee_id": "634",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة",
    "role_type": "tl"
  },
  {
    "id": "emp_636",
    "name": "منعم سعد حميد",
    "employee_id": "636",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_639",
    "name": "رسول محمد عبد",
    "employee_id": "639",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_640",
    "name": "تميم كاظم داخل",
    "employee_id": "640",
    "department": "ادارة الفروع",
    "role": "قائد فريق التدريب والتطوير للفروع",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق التدريب والتطوير للفروع",
    "role_type": "tl"
  },
  {
    "id": "emp_641",
    "name": "رسول ناهي جواد",
    "employee_id": "641",
    "department": "ادارة المخاطر",
    "role": "معاون مدير ادارة المخاطر - مخاطر غير مالية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير ادارة المخاطر - مخاطر غير مالية",
    "role_type": "tl"
  },
  {
    "id": "emp_642",
    "name": "سولاف حيدر غازي",
    "employee_id": "642",
    "department": "ادارة الفروع",
    "role": "مسؤول خدمة الزبائن",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خدمة الزبائن",
    "role_type": "tl"
  },
  {
    "id": "emp_670",
    "name": "دعاء رائد خالد",
    "employee_id": "670",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "موظف تحليل قسم الإبلاغ عن غسل الأموال وتمويل الإرهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تحليل قسم الإبلاغ عن غسل الأموال وتمويل الإرهاب",
    "role_type": "agent"
  },
  {
    "id": "emp_671",
    "name": "زينب رعد حنون",
    "employee_id": "671",
    "department": "ادارة الفروع",
    "role": "مدير فرع البصرة",
    "team": "فرع البصرة",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع البصرة",
    "role_type": "manager"
  },
  {
    "id": "emp_643",
    "name": "اونيل كميل شمعون",
    "employee_id": "643",
    "department": "تقنية المعلومات",
    "role": "محلل ذكاء الأعمال وحلول تقنية المعلومات أقدم",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محلل ذكاء الأعمال وحلول تقنية المعلومات أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_644",
    "name": "علي عبد الكريم عثمان",
    "employee_id": "644",
    "department": "تقنية المعلومات",
    "role": "مدير إدارة قواعد البيانات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير إدارة قواعد البيانات",
    "role_type": "manager"
  },
  {
    "id": "emp_645",
    "name": "بزار عمر محي الدين",
    "employee_id": "645",
    "department": "تقنية المعلومات",
    "role": "مدير قسم تقنيات المدفوعات والتكنولوجيا المالية",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم تقنيات المدفوعات والتكنولوجيا المالية",
    "role_type": "manager"
  },
  {
    "id": "emp_646",
    "name": "محمد ظاهر مصطفى",
    "employee_id": "646",
    "department": "تقنية المعلومات",
    "role": "مدير قسم عمليات تقنيات المدفوعات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم عمليات تقنيات المدفوعات",
    "role_type": "manager"
  },
  {
    "id": "emp_647",
    "name": "محمود سعد عثمان",
    "employee_id": "647",
    "department": "ادارة المشاريع",
    "role": "المدير الاقليمي لقسم ادارة المشاريع – إقليم كردستان",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "المدير الاقليمي لقسم ادارة المشاريع – إقليم كردستان",
    "role_type": "agent"
  },
  {
    "id": "emp_648",
    "name": "سنحاريب انويا بولس",
    "employee_id": "648",
    "department": "تقنية المعلومات",
    "role": "محلل حلول تقنية المعلومات وذكاء الأعمال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محلل حلول تقنية المعلومات وذكاء الأعمال",
    "role_type": "agent"
  },
  {
    "id": "emp_649",
    "name": "حنان فينار يعقوب",
    "employee_id": "649",
    "department": "تقنية المعلومات",
    "role": "محلل ذكاء الأعمال وحلول تقنية المعلومات أقدم",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محلل ذكاء الأعمال وحلول تقنية المعلومات أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_650",
    "name": "عبد الرحمن عبد الخالق محسن",
    "employee_id": "650",
    "department": "تقنية المعلومات",
    "role": "مهندس قواعد البيانات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس قواعد البيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_651",
    "name": "به يام ادريس عثمان",
    "employee_id": "651",
    "department": "تقنية المعلومات",
    "role": "مهندس قواعد البيانات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس قواعد البيانات",
    "role_type": "agent"
  },
  {
    "id": "emp_652",
    "name": "طه عبدالله محمد شريف",
    "employee_id": "652",
    "department": "تقنية المعلومات",
    "role": "منسق تغيير ومتابعة المورّدين",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "منسق تغيير ومتابعة المورّدين",
    "role_type": "agent"
  },
  {
    "id": "emp_653",
    "name": "ياسر عمار عبدالهادي",
    "employee_id": "653",
    "department": "تقنية المعلومات",
    "role": "موظف دعم قنوات الدفع الرقمية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم قنوات الدفع الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_654",
    "name": "شارو جلال احمد",
    "employee_id": "654",
    "department": "تقنية المعلومات",
    "role": "موظف دعم قنوات الدفع الرقمية",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم قنوات الدفع الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_655",
    "name": "عبدالله رعد عبدالهادي",
    "employee_id": "655",
    "department": "تقنية المعلومات",
    "role": "موظف دعم قنوات الدفع الرقمية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف دعم قنوات الدفع الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_656",
    "name": "محمود أسماعيل حسين",
    "employee_id": "656",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_657",
    "name": "لقمان ازاد رشيد",
    "employee_id": "657",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز البيانات والأنظمة الافتراضية أقدم",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز البيانات والأنظمة الافتراضية أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_658",
    "name": "مجد مظفر بشير",
    "employee_id": "658",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_659",
    "name": "علي ماجد محمد",
    "employee_id": "659",
    "department": "تقنية المعلومات",
    "role": "مشرف مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف مركز عمليات الشبكات",
    "role_type": "tl"
  },
  {
    "id": "emp_660",
    "name": "علي سامي مصطفى",
    "employee_id": "660",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_661",
    "name": "سالار عزيز احمد",
    "employee_id": "661",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_662",
    "name": "شيرزاد محمد مغديد",
    "employee_id": "662",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_663",
    "name": "لازو دانا شوكت",
    "employee_id": "663",
    "department": "تقنية المعلومات",
    "role": "مهندس دعم فني",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس دعم فني",
    "role_type": "agent"
  },
  {
    "id": "emp_666",
    "name": "ابراهيم ادريس حسن",
    "employee_id": "666",
    "department": "أمن المعلومات",
    "role": "مهندس مركز العمليات الأمنية",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز العمليات الأمنية",
    "role_type": "agent"
  },
  {
    "id": "emp_667",
    "name": "محمد سيروان محمد",
    "employee_id": "667",
    "department": "أمن المعلومات",
    "role": "معاون مدير امن المعلومات",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير امن المعلومات",
    "role_type": "tl"
  },
  {
    "id": "emp_668",
    "name": "سيراج عاصف صبري",
    "employee_id": "668",
    "department": "أمن المعلومات",
    "role": "مهندس عمليات إدارة الهوية",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس عمليات إدارة الهوية",
    "role_type": "agent"
  },
  {
    "id": "emp_669",
    "name": "محمد نوفل يحيى",
    "employee_id": "669",
    "department": "أمن المعلومات",
    "role": "مهندس نظام إدارة أمن المعلومات",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس نظام إدارة أمن المعلومات",
    "role_type": "agent"
  },
  {
    "id": "emp_672",
    "name": "ده ون شامل فايق",
    "employee_id": "672",
    "department": "العمليات",
    "role": "مدير قسم العمليات الرقمية",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم العمليات الرقمية",
    "role_type": "manager"
  },
  {
    "id": "emp_673",
    "name": "سه ركار فاروق مراد",
    "employee_id": "673",
    "department": "العمليات",
    "role": "أخصائي الخدمات الرقمية أول",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الخدمات الرقمية أول",
    "role_type": "agent"
  },
  {
    "id": "emp_674",
    "name": "ياسا عز الدين غفور",
    "employee_id": "674",
    "department": "العمليات",
    "role": "مدير الإصدار والجاهزية",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير الإصدار والجاهزية",
    "role_type": "agent"
  },
  {
    "id": "emp_675",
    "name": "لاجين ادريس عثمان",
    "employee_id": "675",
    "department": "العمليات",
    "role": "أخصائي الخدمات الرقمية أقدم",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الخدمات الرقمية أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_677",
    "name": "محمود مسعود عزيز",
    "employee_id": "677",
    "department": "العمليات",
    "role": "أخصائي الخدمات الرقمية",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الخدمات الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_678",
    "name": "محمد عثمان حمد",
    "employee_id": "678",
    "department": "العمليات",
    "role": "موظف التسوية والمطابقة الرقمية أقدم",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف التسوية والمطابقة الرقمية أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_679",
    "name": "نينوس ايشو دنخا",
    "employee_id": "679",
    "department": "العمليات",
    "role": "أخصائي الخدمات الرقمية",
    "team": "دهوك",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الخدمات الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_680",
    "name": "هيفار توفيق حمه",
    "employee_id": "680",
    "department": "العمليات",
    "role": "موظف تشغيل خدمات واجهات برمجة التطبيقات",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تشغيل خدمات واجهات برمجة التطبيقات",
    "role_type": "agent"
  },
  {
    "id": "emp_681",
    "name": "ايوب مطلب محمد",
    "employee_id": "681",
    "department": "العمليات",
    "role": "موظف الخدمات الرقمية",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف الخدمات الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_682",
    "name": "مير مريوان مجيد",
    "employee_id": "682",
    "department": "العمليات",
    "role": "أخصائي الخدمات الرقمية",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "أخصائي الخدمات الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_683",
    "name": "سلاف عطار صدر الدين",
    "employee_id": "683",
    "department": "العمليات",
    "role": "موظف جاهزية الخدمات الرقمية وإدارة المعرفة",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جاهزية الخدمات الرقمية وإدارة المعرفة",
    "role_type": "agent"
  },
  {
    "id": "emp_685",
    "name": "ايه فيصل عمر",
    "employee_id": "685",
    "department": "العمليات",
    "role": "موظف الخدمات الرقمية",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف الخدمات الرقمية",
    "role_type": "agent"
  },
  {
    "id": "emp_687",
    "name": "هاوكو أبوبكر أحمد",
    "employee_id": "687",
    "department": "التجاري",
    "role": "مستشار تجاري",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_686",
    "name": "نسار غالب طه",
    "employee_id": "686",
    "department": "الموارد البشرية",
    "role": "قائد فريق شعبة عمليات الموارد البشرية وشؤون الموظفين",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "قائد فريق شعبة عمليات الموارد البشرية وشؤون الموظفين",
    "role_type": "tl"
  },
  {
    "id": "emp_664",
    "name": "جرا خان سعيد عبدالله",
    "employee_id": "664",
    "department": "ادارة المشاريع",
    "role": "موظف ادارة مشاريع أقدم",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة مشاريع أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_689",
    "name": "آمنه لؤي جودت",
    "employee_id": "689",
    "department": "ادارة المشاريع",
    "role": "موظف تحليل بيانات مبتدئ",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف تحليل بيانات مبتدئ",
    "role_type": "agent"
  },
  {
    "id": "emp_690",
    "name": "متين محمد امين اسعد",
    "employee_id": "690",
    "department": "تقنية المعلومات",
    "role": "موظف مساعد دعم جيرا",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مساعد دعم جيرا",
    "role_type": "agent"
  },
  {
    "id": "emp_691",
    "name": "مروة شعلان حسين",
    "employee_id": "691",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_692",
    "name": "محمد سامان سالم",
    "employee_id": "692",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_693",
    "name": "عبدالله مضر مصطفى",
    "employee_id": "693",
    "department": "التجاري",
    "role": "مدير تطوير الاعمال",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير تطوير الاعمال",
    "role_type": "agent"
  },
  {
    "id": "emp_694",
    "name": "هدى عبدالله محمد",
    "employee_id": "694",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن - فرع اربيل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن - فرع اربيل",
    "role_type": "agent"
  },
  {
    "id": "emp_695",
    "name": "ديار دلدار نور الدين",
    "employee_id": "695",
    "department": "الهندسية والادارية",
    "role": "موظف مشتريات",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مشتريات",
    "role_type": "agent"
  },
  {
    "id": "emp_696",
    "name": "عبدالله خالص نافع",
    "employee_id": "696",
    "department": "الدفع الالكتروني",
    "role": "موظف التسويات والمطابقات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف التسويات والمطابقات",
    "role_type": "agent"
  },
  {
    "id": "emp_697",
    "name": "روژ منصور انور",
    "employee_id": "697",
    "department": "ادارة الفروع",
    "role": "مدير فرع السليمانية",
    "team": "فرع السليمانية",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع السليمانية",
    "role_type": "manager"
  },
  {
    "id": "emp_698",
    "name": "ماريوس نزار انور",
    "employee_id": "698",
    "department": "تقنية المعلومات",
    "role": "مهندس دعم نظام جيرا",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس دعم نظام جيرا",
    "role_type": "agent"
  },
  {
    "id": "emp_699",
    "name": "احمد نوري عوده",
    "employee_id": "699",
    "department": "الهندسية والادارية",
    "role": "موظف اداري",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف اداري",
    "role_type": "agent"
  },
  {
    "id": "emp_701",
    "name": "كاردو محمد احمد",
    "employee_id": "701",
    "department": "المالية",
    "role": "مستشار مالي",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مستشار مالي",
    "role_type": "agent"
  },
  {
    "id": "emp_702",
    "name": "ده شتي قاسم محمد",
    "employee_id": "702",
    "department": "الهندسية والادارية",
    "role": "امين مخزن",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين مخزن",
    "role_type": "agent"
  },
  {
    "id": "emp_703",
    "name": "أبي مجيد صالح",
    "employee_id": "703",
    "department": "المالية",
    "role": "مطور اول لنظم المعلومات الادارية",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مطور اول لنظم المعلومات الادارية",
    "role_type": "agent"
  },
  {
    "id": "emp_704",
    "name": "علي سعد حمودي",
    "employee_id": "704",
    "department": "القانوني",
    "role": "معاون مدير القسم القانوني",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير القسم القانوني",
    "role_type": "tl"
  },
  {
    "id": "emp_705",
    "name": "زهراء غازي جاسب",
    "employee_id": "705",
    "department": "الموارد البشرية",
    "role": "مسؤول توظيف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول توظيف",
    "role_type": "tl"
  },
  {
    "id": "emp_706",
    "name": "محمد صالح عبدالهادي",
    "employee_id": "706",
    "department": "القانوني",
    "role": "محامي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  },
  {
    "id": "emp_707",
    "name": "ياسر اسماعيل لازم",
    "employee_id": "707",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط تحقيق اول",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط تحقيق اول",
    "role_type": "agent"
  },
  {
    "id": "emp_709",
    "name": "هاجر احمد عبدالكريم",
    "employee_id": "709",
    "department": "ادارة المشاريع",
    "role": "موظف ادارة مشاريع أقدم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة مشاريع أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_710",
    "name": "هوشمند ياسين سعيد",
    "employee_id": "710",
    "department": "ادارة الفروع",
    "role": "مسؤول خدمة زبائن",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خدمة زبائن",
    "role_type": "tl"
  },
  {
    "id": "emp_711",
    "name": "له نيار رزكار قادر",
    "employee_id": "711",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_712",
    "name": "هيدي صباح لطيف",
    "employee_id": "712",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_713",
    "name": "باشا محمد خالد",
    "employee_id": "713",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_714",
    "name": "متي زومايا مرقس",
    "employee_id": "714",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_715",
    "name": "محمد علي محمد",
    "employee_id": "715",
    "department": "التجاري",
    "role": "مندوب تجاري",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_716",
    "name": "دلوفان صلاح رمصان",
    "employee_id": "716",
    "department": "التجاري",
    "role": "مندوب تجاري",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مندوب تجاري",
    "role_type": "agent"
  },
  {
    "id": "emp_717",
    "name": "شعلان لورنس شعلان",
    "employee_id": "717",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_718",
    "name": "عبدالرحمن اسعد اسماعيل",
    "employee_id": "718",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_719",
    "name": "حاتم ملا شيخ حاتم",
    "employee_id": "719",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_720",
    "name": "ده ريا خليل حسين",
    "employee_id": "720",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_721",
    "name": "بلال ازاد مجيد",
    "employee_id": "721",
    "department": "التجاري",
    "role": "موظف جودة اجهزة نقاط البيع",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف جودة اجهزة نقاط البيع",
    "role_type": "qa"
  },
  {
    "id": "emp_722",
    "name": "محمد سعيد مختار سعيد الحص",
    "employee_id": "722",
    "department": "الامتثال الشرعي ومراقبة الامتثال",
    "role": "مراقب الامتثال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مراقب الامتثال",
    "role_type": "qa"
  },
  {
    "id": "emp_723",
    "name": "رحمه عماد حمد",
    "employee_id": "723",
    "department": "ادارة المشاريع",
    "role": "موظف ادارة مشاريع أقدم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة مشاريع أقدم",
    "role_type": "agent"
  },
  {
    "id": "emp_724",
    "name": "ايه اسامه عبد الوهاب",
    "employee_id": "724",
    "department": "ادارة الفروع",
    "role": "موظف اداري",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نور الدين علي عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف اداري",
    "role_type": "agent"
  },
  {
    "id": "emp_725",
    "name": "زهراء منير غني",
    "employee_id": "725",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_726",
    "name": "حسين منديل حسين",
    "employee_id": "726",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة",
    "role_type": "tl"
  },
  {
    "id": "emp_727",
    "name": "عمار فاروق كاظم",
    "employee_id": "727",
    "department": "ادارة الفروع",
    "role": "معاون مدير فرع النجف",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير فرع النجف",
    "role_type": "manager"
  },
  {
    "id": "emp_728",
    "name": "زينب محسن البوسوده",
    "employee_id": "728",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_729",
    "name": "حسن اياد جلال",
    "employee_id": "729",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_730",
    "name": "رﯙڤين طالب كريم",
    "employee_id": "730",
    "department": "تقنية المعلومات",
    "role": "مهندس بنية تحتية مبتدئ",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس بنية تحتية مبتدئ",
    "role_type": "agent"
  },
  {
    "id": "emp_731",
    "name": "عبدالله سليم محمود",
    "employee_id": "731",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_732",
    "name": "هاوكار عبدالله بيروت",
    "employee_id": "732",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_733",
    "name": "عمر نشأت عبدالكريم",
    "employee_id": "733",
    "department": "تقنية المعلومات",
    "role": "مهندس بنية تحتية مبتدئ",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس بنية تحتية مبتدئ",
    "role_type": "agent"
  },
  {
    "id": "emp_734",
    "name": "كوسره ت فيصل سفر",
    "employee_id": "734",
    "department": "ادارة الفروع",
    "role": "مسؤول خزنة",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول خزنة",
    "role_type": "tl"
  },
  {
    "id": "emp_735",
    "name": "رێبین ابراهيم رسول",
    "employee_id": "735",
    "department": "تقنية المعلومات",
    "role": "مهندس مركز عمليات الشبكات",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مهندس مركز عمليات الشبكات",
    "role_type": "agent"
  },
  {
    "id": "emp_736",
    "name": "علي عمران غركان",
    "employee_id": "736",
    "department": "الهندسية والادارية",
    "role": "فني صيانة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "فني صيانة",
    "role_type": "agent"
  },
  {
    "id": "emp_737",
    "name": "جمال علاء عبدالرزاق",
    "employee_id": "737",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_738",
    "name": "علي غسان عدنان",
    "employee_id": "738",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "مكتب السيدية",
    "direct_manager": "علي عباس مكي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_739",
    "name": "نبأ حيدر محمود",
    "employee_id": "739",
    "department": "ادارة الفروع",
    "role": "امين صندوق",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "امين صندوق",
    "role_type": "agent"
  },
  {
    "id": "emp_740",
    "name": "مينا عمر خالد",
    "employee_id": "740",
    "department": "الادارة",
    "role": "مدير مكتب المدير المفوض",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير مكتب المدير المفوض",
    "role_type": "manager"
  },
  {
    "id": "emp_741",
    "name": "سلوان عمار اسماعيل",
    "employee_id": "741",
    "department": "الهندسية والادارية",
    "role": "موظف ضيافة",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ضيافة",
    "role_type": "agent"
  },
  {
    "id": "emp_742",
    "name": "ژيلان آزاد جليل",
    "employee_id": "742",
    "department": "الهندسية والادارية",
    "role": "موظف استقبال",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف استقبال",
    "role_type": "agent"
  },
  {
    "id": "emp_743",
    "name": "يوسف نزار طارق",
    "employee_id": "743",
    "department": "الهندسية والادارية",
    "role": "مدير قسم الهندسية والادارية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير قسم الهندسية والادارية",
    "role_type": "manager"
  },
  {
    "id": "emp_744",
    "name": "علي طالب ابراهيم",
    "employee_id": "744",
    "department": "العمليات",
    "role": "مسؤول اول حوالات خارجية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول اول حوالات خارجية",
    "role_type": "tl"
  },
  {
    "id": "emp_745",
    "name": "عمر عادل عبدالله",
    "employee_id": "745",
    "department": "أمن المعلومات",
    "role": "محلل مركز العمليات الامنية المستوى الاول",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محلل مركز العمليات الامنية المستوى الاول",
    "role_type": "agent"
  },
  {
    "id": "emp_747",
    "name": "امير نصير جاسم",
    "employee_id": "747",
    "department": "أمن المعلومات",
    "role": "مشرف محللي أمن مركز العمليات ألامنية ومراقبة التهديدات",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مشرف محللي أمن مركز العمليات ألامنية ومراقبة التهديدات",
    "role_type": "tl"
  },
  {
    "id": "emp_748",
    "name": "عبدالله عدنان خالد",
    "employee_id": "748",
    "department": "أمن المعلومات",
    "role": "محلل مركز العمليات الامنية المستوى الاول",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محلل مركز العمليات الامنية المستوى الاول",
    "role_type": "agent"
  },
  {
    "id": "emp_749",
    "name": "فرح غانم جدعان",
    "employee_id": "749",
    "department": "العمليات",
    "role": "موظف حوالات خارجية",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف حوالات خارجية",
    "role_type": "agent"
  },
  {
    "id": "emp_750",
    "name": "ميس محمد محسن",
    "employee_id": "750",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_751",
    "name": "هاجر جلال عبدالمجيد",
    "employee_id": "751",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_752",
    "name": "محمد صالح مناف",
    "employee_id": "752",
    "department": "مركز الاتصال",
    "role": "موظف مركز الاتصال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف مركز الاتصال",
    "role_type": "agent"
  },
  {
    "id": "emp_753",
    "name": "امنه شكيب شريف",
    "employee_id": "753",
    "department": "التجاري",
    "role": "موظف ادارة علاقات الاعمال",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف ادارة علاقات الاعمال",
    "role_type": "agent"
  },
  {
    "id": "emp_754",
    "name": "احمد مصعب سلمان",
    "employee_id": "754",
    "department": "تقنية المعلومات",
    "role": "مسؤول توثيق واختبار الانظمة",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مسؤول توثيق واختبار الانظمة",
    "role_type": "tl"
  },
  {
    "id": "emp_755",
    "name": "بارق معاذ محسن",
    "employee_id": "755",
    "department": "تقنية المعلومات",
    "role": "مدير وحدة دعم قنوات الدفع الرقمي",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير وحدة دعم قنوات الدفع الرقمي",
    "role_type": "agent"
  },
  {
    "id": "emp_756",
    "name": "مؤيد جعفر محمد",
    "employee_id": "756",
    "department": "ادارة الفروع",
    "role": "معاون مدير فرع البصرة",
    "team": "فرع البصرة",
    "direct_manager": "زينب رعد حنون",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير فرع البصرة",
    "role_type": "manager"
  },
  {
    "id": "emp_757",
    "name": "صادق حيدر هاشم",
    "employee_id": "757",
    "department": "ادارة الفروع",
    "role": "موظف عد وفرز",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف عد وفرز",
    "role_type": "agent"
  },
  {
    "id": "emp_758",
    "name": "سالي جبر كوركيس",
    "employee_id": "758",
    "department": "الموارد البشرية",
    "role": "موظف الموارد البشرية",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف الموارد البشرية",
    "role_type": "agent"
  },
  {
    "id": "emp_759",
    "name": "دنيا يوارش زيا",
    "employee_id": "759",
    "department": "ادارة الفروع",
    "role": "مدير فرع الموصل",
    "team": "فرع الموصل",
    "direct_manager": "مصطفى خضر عباس",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "مدير فرع الموصل",
    "role_type": "manager"
  },
  {
    "id": "emp_760",
    "name": "شه نگه عبدالله عزيز",
    "employee_id": "760",
    "department": "ادارة الفروع",
    "role": "موظف خدمة زبائن",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "موظف خدمة زبائن",
    "role_type": "agent"
  },
  {
    "id": "emp_761",
    "name": "ايمان عبد علي جاسم",
    "employee_id": "761",
    "department": "المالية",
    "role": "معاون مدير القسم المالي - العمليات المالية والأصول الثابتة والضرائب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "معاون مدير القسم المالي - العمليات المالية والأصول الثابتة والضرائب",
    "role_type": "tl"
  },
  {
    "id": "emp_762",
    "name": "طارق عباس فياض",
    "employee_id": "762",
    "department": "الابلاغ عن غسل الاموال وتمويل الارهاب",
    "role": "ضابط ارتباط قسم الابلاغ عن غسل الاموال وتمويل الارهاب - الفرع الرئيسي",
    "team": "الفرع الرئيسي",
    "direct_manager": "ريم مهدي علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "ضابط ارتباط قسم الابلاغ عن غسل الاموال وتمويل الارهاب - الفرع الرئيسي",
    "role_type": "agent"
  },
  {
    "id": "emp_2010",
    "name": "شيفاء عبدالرزاق عبدالرحمن",
    "employee_id": "2010",
    "department": "القانوني",
    "role": "محامي",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي",
    "department_chief": "علي محمد حسن العاملي",
    "custom_position": "محامي",
    "role_type": "agent"
  }
];

export const INITIAL_COMPANY_ROSTER: CompanyEmployee[] = [
  {
    "id": "emp_1",
    "agent_name": "شيماء علي حسين",
    "name": "شيماء علي حسين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_2",
    "agent_name": "احمد حمزة سردال",
    "name": "احمد حمزة سردال",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_4",
    "agent_name": "لينه ياسين عبد",
    "name": "لينه ياسين عبد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_11",
    "agent_name": "انفال سلمان داود",
    "name": "انفال سلمان داود",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_604",
    "agent_name": "عبدالهادي عباس عبدالصاحب",
    "name": "عبدالهادي عباس عبدالصاحب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_13",
    "agent_name": "حفصه عاصم نصيف",
    "name": "حفصه عاصم نصيف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_15",
    "agent_name": "رافد محمد رضا",
    "name": "رافد محمد رضا",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_16",
    "agent_name": "زينب عبدالامير كاظم",
    "name": "زينب عبدالامير كاظم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_17",
    "agent_name": "شهد نعمه حسن",
    "name": "شهد نعمه حسن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_18",
    "agent_name": "ايمان سعد محمد حسن",
    "name": "ايمان سعد محمد حسن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_20",
    "agent_name": "شيماء زهير محمود",
    "name": "شيماء زهير محمود",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "زينب عبدالامير كاظم"
  },
  {
    "id": "emp_22",
    "agent_name": "بشار علي ناصر",
    "name": "بشار علي ناصر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_23",
    "agent_name": "نسرين ستار باراني",
    "name": "نسرين ستار باراني",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_24",
    "agent_name": "فهد عبدالله يونس",
    "name": "فهد عبدالله يونس",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_26",
    "agent_name": "روان كنعان خضير",
    "name": "روان كنعان خضير",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_29",
    "agent_name": "محمد جمال الطويل",
    "name": "محمد جمال الطويل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_30",
    "agent_name": "شهد كريم كامل",
    "name": "شهد كريم كامل",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_31",
    "agent_name": "رؤى موفق طالب",
    "name": "رؤى موفق طالب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_32",
    "agent_name": "محمد جواد كاظم",
    "name": "محمد جواد كاظم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_33",
    "agent_name": "عفراء يونس ناجي",
    "name": "عفراء يونس ناجي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_34",
    "agent_name": "سعد عبدالعزيز مهدي",
    "name": "سعد عبدالعزيز مهدي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_35",
    "agent_name": "هدى سالم عبدالكريم",
    "name": "هدى سالم عبدالكريم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_36",
    "agent_name": "سنا هاني صالح",
    "name": "سنا هاني صالح",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_37",
    "agent_name": "ياسر اكرم شفيق",
    "name": "ياسر اكرم شفيق",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_39",
    "agent_name": "ساره حازم عبدالله",
    "name": "ساره حازم عبدالله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_40",
    "agent_name": "سهى عبدالكريم فجر",
    "name": "سهى عبدالكريم فجر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_41",
    "agent_name": "شمس صلاح سالم",
    "name": "شمس صلاح سالم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_42",
    "agent_name": "احمد بشير ابراهيم",
    "name": "احمد بشير ابراهيم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_44",
    "agent_name": "مهند عبدالحميد سعيد",
    "name": "مهند عبدالحميد سعيد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_46",
    "agent_name": "لبنى خميس سبتي",
    "name": "لبنى خميس سبتي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_47",
    "agent_name": "عبدالرحمن علي حميد",
    "name": "عبدالرحمن علي حميد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_48",
    "agent_name": "ساره جبار علي",
    "name": "ساره جبار علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_51",
    "agent_name": "هاله علي خليل",
    "name": "هاله علي خليل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود"
  },
  {
    "id": "emp_52",
    "agent_name": "زينب رياض علي",
    "name": "زينب رياض علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني"
  },
  {
    "id": "emp_54",
    "agent_name": "احمد عباس محمد",
    "name": "احمد عباس محمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_55",
    "agent_name": "ابراهيم محمد علي",
    "name": "ابراهيم محمد علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_56",
    "agent_name": "زهراء رحيم كاظم",
    "name": "زهراء رحيم كاظم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_58",
    "agent_name": "مصطفى اياد عبدالكاظم",
    "name": "مصطفى اياد عبدالكاظم",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_61",
    "agent_name": "عبدالرحيم عباس محسن",
    "name": "عبدالرحيم عباس محسن",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_62",
    "agent_name": "ضفار سعد عبدالحسين",
    "name": "ضفار سعد عبدالحسين",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_63",
    "agent_name": "ميس احمد عريبي",
    "name": "ميس احمد عريبي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_64",
    "agent_name": "بلال محمد محمود",
    "name": "بلال محمد محمود",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل"
  },
  {
    "id": "emp_65",
    "agent_name": "عمر رياض عزيز",
    "name": "عمر رياض عزيز",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_67",
    "agent_name": "صبا حيدر علي",
    "name": "صبا حيدر علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_70",
    "agent_name": "مها عبد الوهاب فلاح",
    "name": "مها عبد الوهاب فلاح",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "زينب عبدالامير كاظم"
  },
  {
    "id": "emp_71",
    "agent_name": "محمد عطيه عبدالكاظم",
    "name": "محمد عطيه عبدالكاظم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_72",
    "agent_name": "محمد ضياء حسين",
    "name": "محمد ضياء حسين",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_75",
    "agent_name": "احمد حسن احمد",
    "name": "احمد حسن احمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_76",
    "agent_name": "حيدر جلال كاظم",
    "name": "حيدر جلال كاظم",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل"
  },
  {
    "id": "emp_79",
    "agent_name": "انور كنعان هاشم",
    "name": "انور كنعان هاشم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_82",
    "agent_name": "علي جواد علي",
    "name": "علي جواد علي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_83",
    "agent_name": "محمد عماد رفعت",
    "name": "محمد عماد رفعت",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_84",
    "agent_name": "محمد عادل هاشم",
    "name": "محمد عادل هاشم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_86",
    "agent_name": "هاله رياض عبد الرحمن",
    "name": "هاله رياض عبد الرحمن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_87",
    "agent_name": "علي دريد احمد",
    "name": "علي دريد احمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_88",
    "agent_name": "سجاد جميل نجم",
    "name": "سجاد جميل نجم",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل"
  },
  {
    "id": "emp_91",
    "agent_name": "عباس حسن ناجي",
    "name": "عباس حسن ناجي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_92",
    "agent_name": "ياسر عمار محمد",
    "name": "ياسر عمار محمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_93",
    "agent_name": "ابتسام جبار خلف",
    "name": "ابتسام جبار خلف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_94",
    "agent_name": "ايناس جاسب خلف",
    "name": "ايناس جاسب خلف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_95",
    "agent_name": "بان سلمان حمود",
    "name": "بان سلمان حمود",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_97",
    "agent_name": "كاروان سالم محمد سليم",
    "name": "كاروان سالم محمد سليم",
    "team": "فرع دهوك",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_98",
    "agent_name": "ئاهنك حميد عبدالله",
    "name": "ئاهنك حميد عبدالله",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_99",
    "agent_name": "احمد حكمت علي",
    "name": "احمد حكمت علي",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_100",
    "agent_name": "هيرش جلال محمد",
    "name": "هيرش جلال محمد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_101",
    "agent_name": "دلال ناصر محمد",
    "name": "دلال ناصر محمد",
    "team": "فرع دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_103",
    "agent_name": "ملاك اسماعيل خليل",
    "name": "ملاك اسماعيل خليل",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_104",
    "agent_name": "ريوار طيار اونباشي",
    "name": "ريوار طيار اونباشي",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_105",
    "agent_name": "سيبه ر احسان قادر",
    "name": "سيبه ر احسان قادر",
    "team": "فرع دهوك",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_106",
    "agent_name": "سازان بلند عبدالحافظ",
    "name": "سازان بلند عبدالحافظ",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_107",
    "agent_name": "بدرخان احمد فتح",
    "name": "بدرخان احمد فتح",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_108",
    "agent_name": "زينب عمر سليمان",
    "name": "زينب عمر سليمان",
    "team": "فرع دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_109",
    "agent_name": "لاوين خليل احمد",
    "name": "لاوين خليل احمد",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_110",
    "agent_name": "لزكين بهجت احمد",
    "name": "لزكين بهجت احمد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_111",
    "agent_name": "مانويلا سالم اسحق",
    "name": "مانويلا سالم اسحق",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_112",
    "agent_name": "طاهر نزار طاهر",
    "name": "طاهر نزار طاهر",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_114",
    "agent_name": "هدير وصفي سالم",
    "name": "هدير وصفي سالم",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_118",
    "agent_name": "شيان عزت ابراهيم",
    "name": "شيان عزت ابراهيم",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_119",
    "agent_name": "جهاد كريم حسين",
    "name": "جهاد كريم حسين",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_120",
    "agent_name": "رنا فوزي دانيال",
    "name": "رنا فوزي دانيال",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_123",
    "agent_name": "زيان جزا حمه سعيد",
    "name": "زيان جزا حمه سعيد",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_129",
    "agent_name": "ده رون مصطفى عبدالله",
    "name": "ده رون مصطفى عبدالله",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_132",
    "agent_name": "محمد ابراهيم برزو",
    "name": "محمد ابراهيم برزو",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_135",
    "agent_name": "روزي جمال رؤوف",
    "name": "روزي جمال رؤوف",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_137",
    "agent_name": "لانو جلال عزيز",
    "name": "لانو جلال عزيز",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_139",
    "agent_name": "زير علي عبدالله",
    "name": "زير علي عبدالله",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_140",
    "agent_name": "ريفان اميد عبدالمجيد",
    "name": "ريفان اميد عبدالمجيد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_142",
    "agent_name": "امانج عثمان احمد",
    "name": "امانج عثمان احمد",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_143",
    "agent_name": "كوران محمد عبدل",
    "name": "كوران محمد عبدل",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_145",
    "agent_name": "ره هه ند ريكه وت رؤف",
    "name": "ره هه ند ريكه وت رؤف",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_146",
    "agent_name": "كوفان طارق رفيق",
    "name": "كوفان طارق رفيق",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_147",
    "agent_name": "ليهات عطار صدرالدين",
    "name": "ليهات عطار صدرالدين",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_148",
    "agent_name": "ريبوار حسيب جوهر",
    "name": "ريبوار حسيب جوهر",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_149",
    "agent_name": "ديده ن دلير علي",
    "name": "ديده ن دلير علي",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_150",
    "agent_name": "ادريس صالح حمد امين",
    "name": "ادريس صالح حمد امين",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_151",
    "agent_name": "درباز دارا محمد",
    "name": "درباز دارا محمد",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_152",
    "agent_name": "محمد اكرم سليم",
    "name": "محمد اكرم سليم",
    "team": "فرع اربيل",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_153",
    "agent_name": "سيبان عادل مصطفى",
    "name": "سيبان عادل مصطفى",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_157",
    "agent_name": "هاوسه ر عبدالله جوهر",
    "name": "هاوسه ر عبدالله جوهر",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_160",
    "agent_name": "محمد روبيته ن ابراهيم",
    "name": "محمد روبيته ن ابراهيم",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_161",
    "agent_name": "ئاره ش لقمان حكيم",
    "name": "ئاره ش لقمان حكيم",
    "team": "سليمانية",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_162",
    "agent_name": "محمد سردار عبدالله",
    "name": "محمد سردار عبدالله",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_165",
    "agent_name": "ماردين صباح سعدو",
    "name": "ماردين صباح سعدو",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_166",
    "agent_name": "زيمان محمد خضر",
    "name": "زيمان محمد خضر",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_167",
    "agent_name": "سراب عطار صدرالدين",
    "name": "سراب عطار صدرالدين",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_168",
    "agent_name": "ميفان عادل مصطفى",
    "name": "ميفان عادل مصطفى",
    "team": "العمل من المنزل",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_170",
    "agent_name": "عائشه احمد حسين",
    "name": "عائشه احمد حسين",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_172",
    "agent_name": "هايده حسين احمد",
    "name": "هايده حسين احمد",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_175",
    "agent_name": "ساره سعدون شريف",
    "name": "ساره سعدون شريف",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_176",
    "agent_name": "زيار شادى حمد امين",
    "name": "زيار شادى حمد امين",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_177",
    "agent_name": "ايه عسكر موسى",
    "name": "ايه عسكر موسى",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_181",
    "agent_name": "ناديه سعد محمدسعيد",
    "name": "ناديه سعد محمدسعيد",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_182",
    "agent_name": "إسماعيل احمد عمر",
    "name": "إسماعيل احمد عمر",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_184",
    "agent_name": "ريام شاكر نجم",
    "name": "ريام شاكر نجم",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_185",
    "agent_name": "زينه عمر طه",
    "name": "زينه عمر طه",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_186",
    "agent_name": "محمد فاضل صابر",
    "name": "محمد فاضل صابر",
    "team": "فرع اربيل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_187",
    "agent_name": "محمد صالح حمد علي",
    "name": "محمد صالح حمد علي",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_189",
    "agent_name": "نازلي حمد امين احمد",
    "name": "نازلي حمد امين احمد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_190",
    "agent_name": "علي مؤيد علي",
    "name": "علي مؤيد علي",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_191",
    "agent_name": "نهاد نهرو عثمان",
    "name": "نهاد نهرو عثمان",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_192",
    "agent_name": "ئاشنا رشاد رفيق",
    "name": "ئاشنا رشاد رفيق",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_193",
    "agent_name": "محمد جوهر احمد",
    "name": "محمد جوهر احمد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_194",
    "agent_name": "هه ورين بابير مصطفى",
    "name": "هه ورين بابير مصطفى",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_198",
    "agent_name": "دلفين عمر رحمان",
    "name": "دلفين عمر رحمان",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_199",
    "agent_name": "ريناس هوشيار خضر",
    "name": "ريناس هوشيار خضر",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_200",
    "agent_name": "ساره رائد فاروق",
    "name": "ساره رائد فاروق",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_201",
    "agent_name": "ناز صلاح الدين عزيز",
    "name": "ناز صلاح الدين عزيز",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_202",
    "agent_name": "ايلاف حيدر قادر",
    "name": "ايلاف حيدر قادر",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_204",
    "agent_name": "هكار عبدالخالق امين",
    "name": "هكار عبدالخالق امين",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_205",
    "agent_name": "هيمن محمد عزيز",
    "name": "هيمن محمد عزيز",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_206",
    "agent_name": "محمد عبدالقهار عبدالقادر",
    "name": "محمد عبدالقهار عبدالقادر",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_207",
    "agent_name": "محمد وحيد محمود",
    "name": "محمد وحيد محمود",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_208",
    "agent_name": "تافكه حامد محمد",
    "name": "تافكه حامد محمد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_212",
    "agent_name": "زياد اسلام نعمان",
    "name": "زياد اسلام نعمان",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_213",
    "agent_name": "مالك عنتر بكر",
    "name": "مالك عنتر بكر",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_214",
    "agent_name": "هاني احمد صالح",
    "name": "هاني احمد صالح",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_215",
    "agent_name": "رنا خليل ابراهيم",
    "name": "رنا خليل ابراهيم",
    "team": "فرع اربيل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_216",
    "agent_name": "هيوا حمه شريف حمد",
    "name": "هيوا حمه شريف حمد",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_217",
    "agent_name": "محمد ياسين لطيف",
    "name": "محمد ياسين لطيف",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_218",
    "agent_name": "أبوبكر اميد مصطفى",
    "name": "أبوبكر اميد مصطفى",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_219",
    "agent_name": "وليد دلشاد إبراهيم",
    "name": "وليد دلشاد إبراهيم",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_220",
    "agent_name": "هارون رشيد قادر",
    "name": "هارون رشيد قادر",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_221",
    "agent_name": "زاله شيرزاد خضر",
    "name": "زاله شيرزاد خضر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_223",
    "agent_name": "احمد هاني احمد",
    "name": "احمد هاني احمد",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_225",
    "agent_name": "رعد سعد موسى",
    "name": "رعد سعد موسى",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_226",
    "agent_name": "الياس فوزي حسن",
    "name": "الياس فوزي حسن",
    "team": "الادارة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_228",
    "agent_name": "كوردستان شيرو  حاجي",
    "name": "كوردستان شيرو  حاجي",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_231",
    "agent_name": "اساور خضير عباس",
    "name": "اساور خضير عباس",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_232",
    "agent_name": "عبدالله عامر نجم",
    "name": "عبدالله عامر نجم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني"
  },
  {
    "id": "emp_233",
    "agent_name": "ريفين عادل رحمه الله",
    "name": "ريفين عادل رحمه الله",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_235",
    "agent_name": "ئالان مجيد باباله",
    "name": "ئالان مجيد باباله",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_237",
    "agent_name": "محمد ناظم محمد",
    "name": "محمد ناظم محمد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_238",
    "agent_name": "محمد عمر عبدالله",
    "name": "محمد عمر عبدالله",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_239",
    "agent_name": "زه يد سلار احمد",
    "name": "زه يد سلار احمد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_240",
    "agent_name": "رغِد عباس سعد",
    "name": "رغِد عباس سعد",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل"
  },
  {
    "id": "emp_244",
    "agent_name": "هه ردى جلال كريم",
    "name": "هه ردى جلال كريم",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_246",
    "agent_name": "برجين ديوالي مجيد",
    "name": "برجين ديوالي مجيد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_250",
    "agent_name": "امنيه فرات شاكر",
    "name": "امنيه فرات شاكر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_251",
    "agent_name": "احمد ضرار لطفي",
    "name": "احمد ضرار لطفي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_252",
    "agent_name": "محمد لازم ماضي",
    "name": "محمد لازم ماضي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_255",
    "agent_name": "هامنو دلشاد موسى",
    "name": "هامنو دلشاد موسى",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_256",
    "agent_name": "بناز ستار عبداللة",
    "name": "بناز ستار عبداللة",
    "team": "فرع السليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_257",
    "agent_name": "اسراء جاسم جواد",
    "name": "اسراء جاسم جواد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_258",
    "agent_name": "انس وجدي عادل",
    "name": "انس وجدي عادل",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_264",
    "agent_name": "علي طه ياسين",
    "name": "علي طه ياسين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود"
  },
  {
    "id": "emp_265",
    "agent_name": "مصطفى خضر عباس",
    "name": "مصطفى خضر عباس",
    "team": "الفرع الرئيسي",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_267",
    "agent_name": "دانا ظاهر احمد",
    "name": "دانا ظاهر احمد",
    "team": "كركوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_269",
    "agent_name": "ابراهيم شه مال محمد امين",
    "name": "ابراهيم شه مال محمد امين",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_270",
    "agent_name": "دلال فقي شانه",
    "name": "دلال فقي شانه",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_290",
    "agent_name": "عبدالستار محمد باسم",
    "name": "عبدالستار محمد باسم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_296",
    "agent_name": "احمد عبدالرحمن محمد القواعله",
    "name": "احمد عبدالرحمن محمد القواعله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_299",
    "agent_name": "فلاح حسن خليل كوكش",
    "name": "فلاح حسن خليل كوكش",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود"
  },
  {
    "id": "emp_300",
    "agent_name": "مروان احمد شكري الريماوي",
    "name": "مروان احمد شكري الريماوي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_301",
    "agent_name": "بسام يوسف عون",
    "name": "بسام يوسف عون",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_302",
    "agent_name": "جلال محمود صالح برغل",
    "name": "جلال محمود صالح برغل",
    "team": "Ezma tower",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_306",
    "agent_name": "محمد جمال فاروق المصري",
    "name": "محمد جمال فاروق المصري",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يسار عبدالقادر حمد الشواوره"
  },
  {
    "id": "emp_307",
    "agent_name": "عبدالرحمن هشام عدنان الحايك",
    "name": "عبدالرحمن هشام عدنان الحايك",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_308",
    "agent_name": "ايه عقيل مطشر",
    "name": "ايه عقيل مطشر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_310",
    "agent_name": "حيدر عضيد حميد",
    "name": "حيدر عضيد حميد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_311",
    "agent_name": "ريوار عبد الستار حمد",
    "name": "ريوار عبد الستار حمد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_315",
    "agent_name": "طه تغلب برهان الدين",
    "name": "طه تغلب برهان الدين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_316",
    "agent_name": "زهراء اركان مهدي",
    "name": "زهراء اركان مهدي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_318",
    "agent_name": "محمد يحيى عبد الستار",
    "name": "محمد يحيى عبد الستار",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_320",
    "agent_name": "نبأ احمد صبري",
    "name": "نبأ احمد صبري",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_321",
    "agent_name": "احمد رياض حسن",
    "name": "احمد رياض حسن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_322",
    "agent_name": "برزي بدرخان احمد",
    "name": "برزي بدرخان احمد",
    "team": "Ezma tower",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_323",
    "agent_name": "عبدالله مقداد عبدالله",
    "name": "عبدالله مقداد عبدالله",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_324",
    "agent_name": "شيراز نريمان توفيق",
    "name": "شيراز نريمان توفيق",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_325",
    "agent_name": "لافيا بختيار كمال",
    "name": "لافيا بختيار كمال",
    "team": "فرع السليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_326",
    "agent_name": "سحر محمد مهدي عبد الكريم",
    "name": "سحر محمد مهدي عبد الكريم",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_327",
    "agent_name": "ره نج عبدالله قادر",
    "name": "ره نج عبدالله قادر",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_328",
    "agent_name": "كولان حكمت محمد",
    "name": "كولان حكمت محمد",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_330",
    "agent_name": "ئالين اسماعيل علي",
    "name": "ئالين اسماعيل علي",
    "team": "فرع دهوك",
    "direct_manager": "كاروان سالم محمد سليم"
  },
  {
    "id": "emp_334",
    "agent_name": "احمد جليل محمد",
    "name": "احمد جليل محمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_336",
    "agent_name": "احمد روستم عمر",
    "name": "احمد روستم عمر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_337",
    "agent_name": "اكار ديار عمر",
    "name": "اكار ديار عمر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_339",
    "agent_name": "ئالا ستار كريم",
    "name": "ئالا ستار كريم",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_340",
    "agent_name": "انكيدو بويا سعده",
    "name": "انكيدو بويا سعده",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_341",
    "agent_name": "ايه ياسين عبد الرحمن",
    "name": "ايه ياسين عبد الرحمن",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_342",
    "agent_name": "ازاد محمد عبدالله",
    "name": "ازاد محمد عبدالله",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_343",
    "agent_name": "بانه فريا احمد",
    "name": "بانه فريا احمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_344",
    "agent_name": "ضحى خنجر نورى",
    "name": "ضحى خنجر نورى",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_345",
    "agent_name": "فرميسك يونس عوزير",
    "name": "فرميسك يونس عوزير",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_347",
    "agent_name": "حسيب اديب محي الدين",
    "name": "حسيب اديب محي الدين",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_348",
    "agent_name": "هيور عدنان اسماعيل",
    "name": "هيور عدنان اسماعيل",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_349",
    "agent_name": "كاني سامي عثمان",
    "name": "كاني سامي عثمان",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_350",
    "agent_name": "لانه هه لمه ت رفيق",
    "name": "لانه هه لمه ت رفيق",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_351",
    "agent_name": "لارا كامل محمد سليم",
    "name": "لارا كامل محمد سليم",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_353",
    "agent_name": "محمد ازاد صابر",
    "name": "محمد ازاد صابر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_356",
    "agent_name": "محمد جهاد نوري",
    "name": "محمد جهاد نوري",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_357",
    "agent_name": "محمد دلشاد عمر",
    "name": "محمد دلشاد عمر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_358",
    "agent_name": "مجده عمر علي",
    "name": "مجده عمر علي",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_360",
    "agent_name": "نه وين معاذ محمد",
    "name": "نه وين معاذ محمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_361",
    "agent_name": "نور نوزاد عزيز",
    "name": "نور نوزاد عزيز",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_362",
    "agent_name": "اسامة سعدي محمود",
    "name": "اسامة سعدي محمود",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_363",
    "agent_name": "بروين صباح سعيد",
    "name": "بروين صباح سعيد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_364",
    "agent_name": "رابه ر مجيد محمد",
    "name": "رابه ر مجيد محمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_365",
    "agent_name": "ره سه ن اسماعيل موسى",
    "name": "ره سه ن اسماعيل موسى",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_366",
    "agent_name": "سجى بشار انور",
    "name": "سجى بشار انور",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_367",
    "agent_name": "سانا دلير فؤاد",
    "name": "سانا دلير فؤاد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_368",
    "agent_name": "سرباز نامق حسن",
    "name": "سرباز نامق حسن",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_369",
    "agent_name": "ساوين سرتيب حسين",
    "name": "ساوين سرتيب حسين",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_370",
    "agent_name": "شيرين ويسي سعيد",
    "name": "شيرين ويسي سعيد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_371",
    "agent_name": "سوما شيركو محمد",
    "name": "سوما شيركو محمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_372",
    "agent_name": "تابان سيروان جلال",
    "name": "تابان سيروان جلال",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_373",
    "agent_name": "يونس كمال احمد",
    "name": "يونس كمال احمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_374",
    "agent_name": "يوسف رشيد درويش",
    "name": "يوسف رشيد درويش",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_375",
    "agent_name": "زهراء يوسف توفيق",
    "name": "زهراء يوسف توفيق",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_376",
    "agent_name": "زينب خالد رشيد",
    "name": "زينب خالد رشيد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_377",
    "agent_name": "زالة شيرزاد سلام",
    "name": "زالة شيرزاد سلام",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_378",
    "agent_name": "ايات نافع سامي",
    "name": "ايات نافع سامي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "لينه ياسين عبد"
  },
  {
    "id": "emp_379",
    "agent_name": "ساره خسرو خدر",
    "name": "ساره خسرو خدر",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_381",
    "agent_name": "شهاب احمد محمد صالح",
    "name": "شهاب احمد محمد صالح",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_382",
    "agent_name": "اسماعيل مجيد احمد",
    "name": "اسماعيل مجيد احمد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_383",
    "agent_name": "طيبه علاء نصيف",
    "name": "طيبه علاء نصيف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود"
  },
  {
    "id": "emp_384",
    "agent_name": "محمد بارزان قادر",
    "name": "محمد بارزان قادر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_385",
    "agent_name": "شوخان عثمان حمه صالح",
    "name": "شوخان عثمان حمه صالح",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_386",
    "agent_name": "جابر حسن هوله",
    "name": "جابر حسن هوله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_388",
    "agent_name": "ماردين لقمان عمر",
    "name": "ماردين لقمان عمر",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_389",
    "agent_name": "موسى حسين حميد",
    "name": "موسى حسين حميد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_390",
    "agent_name": "رشا باقر جاسم",
    "name": "رشا باقر جاسم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_391",
    "agent_name": "دانيه عمار عبد القادر",
    "name": "دانيه عمار عبد القادر",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_392",
    "agent_name": "حسن فلاح ناصر",
    "name": "حسن فلاح ناصر",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_393",
    "agent_name": "احمد علي حسين",
    "name": "احمد علي حسين",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_394",
    "agent_name": "محمد احمد علي",
    "name": "محمد احمد علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رؤى موفق طالب"
  },
  {
    "id": "emp_396",
    "agent_name": "عباس حسن محوط",
    "name": "عباس حسن محوط",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_399",
    "agent_name": "علي منصور مسك",
    "name": "علي منصور مسك",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_400",
    "agent_name": "ميس رعد محمد",
    "name": "ميس رعد محمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_402",
    "agent_name": "به ريز سعيد عبدالرحيم",
    "name": "به ريز سعيد عبدالرحيم",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_403",
    "agent_name": "هيرو شيرزاد محمد",
    "name": "هيرو شيرزاد محمد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_407",
    "agent_name": "نورالدين رياض محمود",
    "name": "نورالدين رياض محمود",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_411",
    "agent_name": "رسول عبدالصاحب عنيبر",
    "name": "رسول عبدالصاحب عنيبر",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_413",
    "agent_name": "انور علي عبود",
    "name": "انور علي عبود",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_415",
    "agent_name": "احمد خالد حميد",
    "name": "احمد خالد حميد",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_416",
    "agent_name": "عدنان احمد عبده زكريا",
    "name": "عدنان احمد عبده زكريا",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_417",
    "agent_name": "فاتنه عبدالرحمن المملوك",
    "name": "فاتنه عبدالرحمن المملوك",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_423",
    "agent_name": "مريم صبيح حسن",
    "name": "مريم صبيح حسن",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_424",
    "agent_name": "مروه خليل علي",
    "name": "مروه خليل علي",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_425",
    "agent_name": "يسار عبدالقادر حمد الشواوره",
    "name": "يسار عبدالقادر حمد الشواوره",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_426",
    "agent_name": "بشير علاء الدين جهاد",
    "name": "بشير علاء الدين جهاد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_427",
    "agent_name": "بيان رشيد حسين",
    "name": "بيان رشيد حسين",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_429",
    "agent_name": "رابه ر حسين ملا",
    "name": "رابه ر حسين ملا",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_431",
    "agent_name": "زينب محمد عزيز",
    "name": "زينب محمد عزيز",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_432",
    "agent_name": "ساره دلير رشدي",
    "name": "ساره دلير رشدي",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_433",
    "agent_name": "سوران برهان رشيد",
    "name": "سوران برهان رشيد",
    "team": "فرع السليمانية",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_434",
    "agent_name": "سيدره سليمان اسعد",
    "name": "سيدره سليمان اسعد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_435",
    "agent_name": "شه مال محمد رسول",
    "name": "شه مال محمد رسول",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_436",
    "agent_name": "محمد احمد محمد",
    "name": "محمد احمد محمد",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_437",
    "agent_name": "محمد حمه سعيد حمه شريف",
    "name": "محمد حمه سعيد حمه شريف",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_438",
    "agent_name": "محمد رحيم حمد",
    "name": "محمد رحيم حمد",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_439",
    "agent_name": "محمد يوسف علي",
    "name": "محمد يوسف علي",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_440",
    "agent_name": "مؤمن جلال كريم",
    "name": "مؤمن جلال كريم",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_441",
    "agent_name": "مينا طارق عمر",
    "name": "مينا طارق عمر",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_442",
    "agent_name": "نه هاوند عوني احمد",
    "name": "نه هاوند عوني احمد",
    "team": "Ezma tower",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_446",
    "agent_name": "سجاد معد محمد",
    "name": "سجاد معد محمد",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_449",
    "agent_name": "عبدالمؤمن عبدالسلام عبدالكريم",
    "name": "عبدالمؤمن عبدالسلام عبدالكريم",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_450",
    "agent_name": "علي بلاسم طه",
    "name": "علي بلاسم طه",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_451",
    "agent_name": "انمار محمد خضر",
    "name": "انمار محمد خضر",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_452",
    "agent_name": "حسين قاسم محمد",
    "name": "حسين قاسم محمد",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_453",
    "agent_name": "دعاء احمد كريم",
    "name": "دعاء احمد كريم",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_456",
    "agent_name": "ره وا سردار احمد",
    "name": "ره وا سردار احمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_457",
    "agent_name": "سارة وليد فارس",
    "name": "سارة وليد فارس",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_458",
    "agent_name": "فراس عبدالرزاق جواد",
    "name": "فراس عبدالرزاق جواد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_459",
    "agent_name": "محمد عبدالعزيز اسماعيل",
    "name": "محمد عبدالعزيز اسماعيل",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_460",
    "agent_name": "علا اياد فاضل",
    "name": "علا اياد فاضل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_461",
    "agent_name": "زينب ليث رشيد",
    "name": "زينب ليث رشيد",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_462",
    "agent_name": "مينا نمير فخري",
    "name": "مينا نمير فخري",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_463",
    "agent_name": "روان محمود احمد",
    "name": "روان محمود احمد",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_464",
    "agent_name": "محمد باقر اسعد محمدعلي",
    "name": "محمد باقر اسعد محمدعلي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_465",
    "agent_name": "محمد مصطفى نجيب",
    "name": "محمد مصطفى نجيب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_466",
    "agent_name": "محمد ظاهر عبدالرزاق",
    "name": "محمد ظاهر عبدالرزاق",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_467",
    "agent_name": "راويز عبدالرزاق محمد طاهر",
    "name": "راويز عبدالرزاق محمد طاهر",
    "team": "فرع اربيل",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_468",
    "agent_name": "محمد جواد عبدالكاظم",
    "name": "محمد جواد عبدالكاظم",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_470",
    "agent_name": "علي ابراهيم عبود",
    "name": "علي ابراهيم عبود",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_471",
    "agent_name": "علي حازم ستار",
    "name": "علي حازم ستار",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_472",
    "agent_name": "ياسر يعقوب يوسف",
    "name": "ياسر يعقوب يوسف",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_473",
    "agent_name": "ابراهيم وضاح عبدالغفور",
    "name": "ابراهيم وضاح عبدالغفور",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_474",
    "agent_name": "ادم محمد عبدالله",
    "name": "ادم محمد عبدالله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_475",
    "agent_name": "نورالدين علي عباس",
    "name": "نورالدين علي عباس",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_478",
    "agent_name": "مجبل عاطف مجبل",
    "name": "مجبل عاطف مجبل",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_480",
    "agent_name": "شمس علي صادق",
    "name": "شمس علي صادق",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_481",
    "agent_name": "رانيا عبدالله نجم",
    "name": "رانيا عبدالله نجم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_482",
    "agent_name": "زينب عمر قادر",
    "name": "زينب عمر قادر",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_483",
    "agent_name": "دانيار حمه طاهر فقى محمد",
    "name": "دانيار حمه طاهر فقى محمد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_484",
    "agent_name": "نزار علي عمر",
    "name": "نزار علي عمر",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_485",
    "agent_name": "لانه شوكت طيب",
    "name": "لانه شوكت طيب",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_486",
    "agent_name": "به سار جمال اسعد",
    "name": "به سار جمال اسعد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_489",
    "agent_name": "خالد فراس خالد",
    "name": "خالد فراس خالد",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_490",
    "agent_name": "ئه زى سوران محمد",
    "name": "ئه زى سوران محمد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_491",
    "agent_name": "محمد خضر محمد",
    "name": "محمد خضر محمد",
    "team": "Ezma tower",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_493",
    "agent_name": "احمد محمد عزيز",
    "name": "احمد محمد عزيز",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_494",
    "agent_name": "محمدصادق رائد ابراهيم",
    "name": "محمدصادق رائد ابراهيم",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_495",
    "agent_name": "فرياد خضر سليم",
    "name": "فرياد خضر سليم",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_496",
    "agent_name": "اورفا اسماعيل كمال",
    "name": "اورفا اسماعيل كمال",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_497",
    "agent_name": "اسامه شاكر محمود",
    "name": "اسامه شاكر محمود",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_499",
    "agent_name": "سجاد اسعد عبدالزهره",
    "name": "سجاد اسعد عبدالزهره",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_500",
    "agent_name": "ادم نصير صلاح",
    "name": "ادم نصير صلاح",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_502",
    "agent_name": "ئوميد صالح احمد",
    "name": "ئوميد صالح احمد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_503",
    "agent_name": "ئه لند هوار اسماعيل",
    "name": "ئه لند هوار اسماعيل",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_505",
    "agent_name": "ره نو ممند حسن",
    "name": "ره نو ممند حسن",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_506",
    "agent_name": "لافين مصلح خليل",
    "name": "لافين مصلح خليل",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_507",
    "agent_name": "مخلد مدحت علي",
    "name": "مخلد مدحت علي",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_509",
    "agent_name": "محمد عبدالحميد قادر",
    "name": "محمد عبدالحميد قادر",
    "team": "Ezma tower",
    "direct_manager": "سيبان عادل مصطفى"
  },
  {
    "id": "emp_510",
    "agent_name": "دياكو جعفر لطيف",
    "name": "دياكو جعفر لطيف",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_512",
    "agent_name": "به لين ابراهيم حمد امين",
    "name": "به لين ابراهيم حمد امين",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_513",
    "agent_name": "هانا سركوت محمد",
    "name": "هانا سركوت محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_514",
    "agent_name": "مجيد علي خان مجيد",
    "name": "مجيد علي خان مجيد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_515",
    "agent_name": "مه ريوان رزكار حسن",
    "name": "مه ريوان رزكار حسن",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_516",
    "agent_name": "ريبوار زرا علي",
    "name": "ريبوار زرا علي",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_517",
    "agent_name": "هاوزين عمر جبار",
    "name": "هاوزين عمر جبار",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_518",
    "agent_name": "ريناس ياسين محمد",
    "name": "ريناس ياسين محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_519",
    "agent_name": "هه وال عبدالله خضر",
    "name": "هه وال عبدالله خضر",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_520",
    "agent_name": "شادي نورالدين عبدالله",
    "name": "شادي نورالدين عبدالله",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_521",
    "agent_name": "فالا علي محمد",
    "name": "فالا علي محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_522",
    "agent_name": "زينه احمد قادر",
    "name": "زينه احمد قادر",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_523",
    "agent_name": "اردلان انور كريم",
    "name": "اردلان انور كريم",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_524",
    "agent_name": "ديدار عمر معروف",
    "name": "ديدار عمر معروف",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_525",
    "agent_name": "اسماعيل عبد القادر مصطفى",
    "name": "اسماعيل عبد القادر مصطفى",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_526",
    "agent_name": "له رى شيروان عبدالرحمن",
    "name": "له رى شيروان عبدالرحمن",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_527",
    "agent_name": "ايلاف سيف الدين عبدالرحمن",
    "name": "ايلاف سيف الدين عبدالرحمن",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_528",
    "agent_name": "ايوب احمد اكرم",
    "name": "ايوب احمد اكرم",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_529",
    "agent_name": "ايوب عباس ملكو",
    "name": "ايوب عباس ملكو",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_530",
    "agent_name": "بسام شيرزاد مجيد",
    "name": "بسام شيرزاد مجيد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_531",
    "agent_name": "راميار اكرم احمد",
    "name": "راميار اكرم احمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_532",
    "agent_name": "ريان طاهر عزيز",
    "name": "ريان طاهر عزيز",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_533",
    "agent_name": "زيد مؤيد صالح",
    "name": "زيد مؤيد صالح",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_534",
    "agent_name": "سعد حسن مصطفى",
    "name": "سعد حسن مصطفى",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_536",
    "agent_name": "سيما سلام يعقوب",
    "name": "سيما سلام يعقوب",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_539",
    "agent_name": "كاميار يوسف خضر",
    "name": "كاميار يوسف خضر",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_540",
    "agent_name": "محمد مصطفى اسماعيل",
    "name": "محمد مصطفى اسماعيل",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_541",
    "agent_name": "محمد اسماعيل جليل",
    "name": "محمد اسماعيل جليل",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_542",
    "agent_name": "نيكار غفور عثمان",
    "name": "نيكار غفور عثمان",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_543",
    "agent_name": "مريم ريبوار محمد",
    "name": "مريم ريبوار محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_544",
    "agent_name": "نسار جمال احمد",
    "name": "نسار جمال احمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_545",
    "agent_name": "محمد نذير محمد شريف",
    "name": "محمد نذير محمد شريف",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_547",
    "agent_name": "محمد جمال مال الله",
    "name": "محمد جمال مال الله",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_548",
    "agent_name": "سه نكه ر محمد مصطفى",
    "name": "سه نكه ر محمد مصطفى",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_549",
    "agent_name": "رائد نجيب كنو",
    "name": "رائد نجيب كنو",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_550",
    "agent_name": "عبدالله عمر عزيز",
    "name": "عبدالله عمر عزيز",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_551",
    "agent_name": "عمر ياسر عبدالستار",
    "name": "عمر ياسر عبدالستار",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_552",
    "agent_name": "شهد عبدالواحد موسى",
    "name": "شهد عبدالواحد موسى",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_553",
    "agent_name": "عبدالرحمن طاهر عبدالله",
    "name": "عبدالرحمن طاهر عبدالله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_554",
    "agent_name": "وضاح عبدالهادي عبد علي",
    "name": "وضاح عبدالهادي عبد علي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_555",
    "agent_name": "بيشكو ئاريان احمد",
    "name": "بيشكو ئاريان احمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_556",
    "agent_name": "محمد جمال جعفر",
    "name": "محمد جمال جعفر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_557",
    "agent_name": "وسام شيرزاد مجيد",
    "name": "وسام شيرزاد مجيد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_558",
    "agent_name": "جرو ابوبكر احمد",
    "name": "جرو ابوبكر احمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_559",
    "agent_name": "عبدالله احمد عبدالحسن",
    "name": "عبدالله احمد عبدالحسن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_560",
    "agent_name": "زينب ميثم منعم",
    "name": "زينب ميثم منعم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_561",
    "agent_name": "محمد رشيد محمود",
    "name": "محمد رشيد محمود",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_562",
    "agent_name": "شهد حازم حميد",
    "name": "شهد حازم حميد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_563",
    "agent_name": "احمد قيس عبدالرحمن",
    "name": "احمد قيس عبدالرحمن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_564",
    "agent_name": "اسلام فارس محمد ابراهيم",
    "name": "اسلام فارس محمد ابراهيم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_565",
    "agent_name": "ميران كاوان حمه كريم",
    "name": "ميران كاوان حمه كريم",
    "team": "فرع السليمانية",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_566",
    "agent_name": "سايمون رافد يوسف",
    "name": "سايمون رافد يوسف",
    "team": "فرع دهوك",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_567",
    "agent_name": "نور بهاء محمد",
    "name": "نور بهاء محمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_568",
    "agent_name": "رنا علي حسين",
    "name": "رنا علي حسين",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "احمد علي حسين"
  },
  {
    "id": "emp_569",
    "agent_name": "روداو عبدالرحمن عبدالله",
    "name": "روداو عبدالرحمن عبدالله",
    "team": "سليمانية",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_570",
    "agent_name": "بيوار رشيد احمد",
    "name": "بيوار رشيد احمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_571",
    "agent_name": "وائل عباس فرمان القاضي",
    "name": "وائل عباس فرمان القاضي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_572",
    "agent_name": "عزت حيدر عدنان",
    "name": "عزت حيدر عدنان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_573",
    "agent_name": "علي زيره ك بشير",
    "name": "علي زيره ك بشير",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_574",
    "agent_name": "عمر اياد حمدي",
    "name": "عمر اياد حمدي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_575",
    "agent_name": "كازفان وريا علي",
    "name": "كازفان وريا علي",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_576",
    "agent_name": "ريم مهدي علي الخفاجي",
    "name": "ريم مهدي علي الخفاجي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_577",
    "agent_name": "احمد عبدالسلام عبد الستار",
    "name": "احمد عبدالسلام عبد الستار",
    "team": "الفرع الرئيسي",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_578",
    "agent_name": "كاوان خالد باقر",
    "name": "كاوان خالد باقر",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_579",
    "agent_name": "فاتن علي حسين",
    "name": "فاتن علي حسين",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_580",
    "agent_name": "دانية جلال احمد",
    "name": "دانية جلال احمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_582",
    "agent_name": "اسامة اركان حميد",
    "name": "اسامة اركان حميد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_583",
    "agent_name": "علي محمد حسن عبدالعباس العاملي",
    "name": "علي محمد حسن عبدالعباس العاملي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_584",
    "agent_name": "سلام صدام  محمد رشيد",
    "name": "سلام صدام  محمد رشيد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_585",
    "agent_name": "عمار حسين صالح",
    "name": "عمار حسين صالح",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_586",
    "agent_name": "حنين عبد الكريم اسكندر",
    "name": "حنين عبد الكريم اسكندر",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_587",
    "agent_name": "علي خليل اكبر",
    "name": "علي خليل اكبر",
    "team": "فرع اربيل",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_589",
    "agent_name": "محمد عبد ابراهيم",
    "name": "محمد عبد ابراهيم",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_591",
    "agent_name": "افان احمد الياس",
    "name": "افان احمد الياس",
    "team": "فرع دهوك",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_594",
    "agent_name": "محمد ليث محمد",
    "name": "محمد ليث محمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_595",
    "agent_name": "غفران ثائر جاسم",
    "name": "غفران ثائر جاسم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "محمد عادل هاشم"
  },
  {
    "id": "emp_596",
    "agent_name": "الان محمد معصوم",
    "name": "الان محمد معصوم",
    "team": "فرع دهوك",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_597",
    "agent_name": "علي عباس مكي",
    "name": "علي عباس مكي",
    "team": "مكتب السيدية",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_598",
    "agent_name": "خالد محمد طلاع",
    "name": "خالد محمد طلاع",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_600",
    "agent_name": "فاطمة زياد عبد الامير",
    "name": "فاطمة زياد عبد الامير",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_601",
    "agent_name": "رسل ستار عبد",
    "name": "رسل ستار عبد",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_602",
    "agent_name": "يونس خالد عبد الغفور",
    "name": "يونس خالد عبد الغفور",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_603",
    "agent_name": "سنان عوني خضر",
    "name": "سنان عوني خضر",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_605",
    "agent_name": "روعه سعد رزوقي",
    "name": "روعه سعد رزوقي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني"
  },
  {
    "id": "emp_606",
    "agent_name": "احمد قاسم سابط",
    "name": "احمد قاسم سابط",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نسرين ستار باراني"
  },
  {
    "id": "emp_607",
    "agent_name": "الند ازور محمدامين",
    "name": "الند ازور محمدامين",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_609",
    "agent_name": "نجاة شفيع محمد",
    "name": "نجاة شفيع محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_610",
    "agent_name": "عثمان ابو بكر احمد",
    "name": "عثمان ابو بكر احمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_611",
    "agent_name": "بيروز رحمن قادر",
    "name": "بيروز رحمن قادر",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_612",
    "agent_name": "فؤاد سعود محطة",
    "name": "فؤاد سعود محطة",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_613",
    "agent_name": "محمد فارس مهاوش",
    "name": "محمد فارس مهاوش",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_614",
    "agent_name": "عباس صادق وادي",
    "name": "عباس صادق وادي",
    "team": "بغداد / بناية المنصور",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_616",
    "agent_name": "اسماء سمير محمود",
    "name": "اسماء سمير محمود",
    "team": "فرع المنصور",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_617",
    "agent_name": "زينب علي عيسى",
    "name": "زينب علي عيسى",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_618",
    "agent_name": "منى عبدالحسن جبر",
    "name": "منى عبدالحسن جبر",
    "team": "فرع النجف",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_619",
    "agent_name": "احمد سكفان كامل",
    "name": "احمد سكفان كامل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_621",
    "agent_name": "حسنين ثائر حسن",
    "name": "حسنين ثائر حسن",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_622",
    "agent_name": "ولاء حسن علي",
    "name": "ولاء حسن علي",
    "team": "مكتب مول بغداد",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_623",
    "agent_name": "حوراء وليد حمد",
    "name": "حوراء وليد حمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_624",
    "agent_name": "احمد عبدالرزاق احمد",
    "name": "احمد عبدالرزاق احمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_625",
    "agent_name": "محمد ثامر جعفر",
    "name": "محمد ثامر جعفر",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_626",
    "agent_name": "محمد وليد فتح الله",
    "name": "محمد وليد فتح الله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "احمد عبدالرحمن القواعلة"
  },
  {
    "id": "emp_627",
    "agent_name": "رند منتظر حمزه",
    "name": "رند منتظر حمزه",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_628",
    "agent_name": "ايه قصي عبدالقادر",
    "name": "ايه قصي عبدالقادر",
    "team": "مكتب بغداد الجديدة",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_629",
    "agent_name": "جوان سمير عبدالصاحب",
    "name": "جوان سمير عبدالصاحب",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_630",
    "agent_name": "مؤمل عصام محسن",
    "name": "مؤمل عصام محسن",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_631",
    "agent_name": "زينب بشار عطا الله",
    "name": "زينب بشار عطا الله",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_632",
    "agent_name": "دجى عدي طلال",
    "name": "دجى عدي طلال",
    "team": "مكتب مول بغداد",
    "direct_manager": "ولاء حسن علي"
  },
  {
    "id": "emp_633",
    "agent_name": "احمد نبيل كاظم",
    "name": "احمد نبيل كاظم",
    "team": "مكتب بغداد الجديدة",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_634",
    "agent_name": "محمد عبدالله عناد",
    "name": "محمد عبدالله عناد",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_636",
    "agent_name": "منعم سعد حميد",
    "name": "منعم سعد حميد",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_639",
    "agent_name": "رسول محمد عبد",
    "name": "رسول محمد عبد",
    "team": "مكتب حي اور",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_640",
    "agent_name": "تميم كاظم داخل",
    "name": "تميم كاظم داخل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_641",
    "agent_name": "رسول ناهي جواد",
    "name": "رسول ناهي جواد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "انفال سلمان داود"
  },
  {
    "id": "emp_642",
    "agent_name": "سولاف حيدر غازي",
    "name": "سولاف حيدر غازي",
    "team": "الفرع الرئيسي",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_670",
    "agent_name": "دعاء رائد خالد",
    "name": "دعاء رائد خالد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_671",
    "agent_name": "زينب رعد حنون",
    "name": "زينب رعد حنون",
    "team": "فرع البصرة",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_643",
    "agent_name": "اونيل كميل شمعون",
    "name": "اونيل كميل شمعون",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_644",
    "agent_name": "علي عبد الكريم عثمان",
    "name": "علي عبد الكريم عثمان",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_645",
    "agent_name": "بزار عمر محي الدين",
    "name": "بزار عمر محي الدين",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_646",
    "agent_name": "محمد ظاهر مصطفى",
    "name": "محمد ظاهر مصطفى",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_647",
    "agent_name": "محمود سعد عثمان",
    "name": "محمود سعد عثمان",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_648",
    "agent_name": "سنحاريب انويا بولس",
    "name": "سنحاريب انويا بولس",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_649",
    "agent_name": "حنان فينار يعقوب",
    "name": "حنان فينار يعقوب",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_650",
    "agent_name": "عبد الرحمن عبد الخالق محسن",
    "name": "عبد الرحمن عبد الخالق محسن",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_651",
    "agent_name": "به يام ادريس عثمان",
    "name": "به يام ادريس عثمان",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_652",
    "agent_name": "طه عبدالله محمد شريف",
    "name": "طه عبدالله محمد شريف",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_653",
    "agent_name": "ياسر عمار عبدالهادي",
    "name": "ياسر عمار عبدالهادي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_654",
    "agent_name": "شارو جلال احمد",
    "name": "شارو جلال احمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_655",
    "agent_name": "عبدالله رعد عبدالهادي",
    "name": "عبدالله رعد عبدالهادي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_656",
    "agent_name": "محمود أسماعيل حسين",
    "name": "محمود أسماعيل حسين",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_657",
    "agent_name": "لقمان ازاد رشيد",
    "name": "لقمان ازاد رشيد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_658",
    "agent_name": "مجد مظفر بشير",
    "name": "مجد مظفر بشير",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_659",
    "agent_name": "علي ماجد محمد",
    "name": "علي ماجد محمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_660",
    "agent_name": "علي سامي مصطفى",
    "name": "علي سامي مصطفى",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_661",
    "agent_name": "سالار عزيز احمد",
    "name": "سالار عزيز احمد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_662",
    "agent_name": "شيرزاد محمد مغديد",
    "name": "شيرزاد محمد مغديد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_663",
    "agent_name": "لازو دانا شوكت",
    "name": "لازو دانا شوكت",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_666",
    "agent_name": "ابراهيم ادريس حسن",
    "name": "ابراهيم ادريس حسن",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_667",
    "agent_name": "محمد سيروان محمد",
    "name": "محمد سيروان محمد",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_668",
    "agent_name": "سيراج عاصف صبري",
    "name": "سيراج عاصف صبري",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_669",
    "agent_name": "محمد نوفل يحيى",
    "name": "محمد نوفل يحيى",
    "team": "Ezma tower",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_672",
    "agent_name": "ده ون شامل فايق",
    "name": "ده ون شامل فايق",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_673",
    "agent_name": "سه ركار فاروق مراد",
    "name": "سه ركار فاروق مراد",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_674",
    "agent_name": "ياسا عز الدين غفور",
    "name": "ياسا عز الدين غفور",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_675",
    "agent_name": "لاجين ادريس عثمان",
    "name": "لاجين ادريس عثمان",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_677",
    "agent_name": "محمود مسعود عزيز",
    "name": "محمود مسعود عزيز",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_678",
    "agent_name": "محمد عثمان حمد",
    "name": "محمد عثمان حمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_679",
    "agent_name": "نينوس ايشو دنخا",
    "name": "نينوس ايشو دنخا",
    "team": "دهوك",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_680",
    "agent_name": "هيفار توفيق حمه",
    "name": "هيفار توفيق حمه",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_681",
    "agent_name": "ايوب مطلب محمد",
    "name": "ايوب مطلب محمد",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_682",
    "agent_name": "مير مريوان مجيد",
    "name": "مير مريوان مجيد",
    "team": "سليمانية",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_683",
    "agent_name": "سلاف عطار صدر الدين",
    "name": "سلاف عطار صدر الدين",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_685",
    "agent_name": "ايه فيصل عمر",
    "name": "ايه فيصل عمر",
    "team": "Ezma tower",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_687",
    "agent_name": "هاوكو أبوبكر أحمد",
    "name": "هاوكو أبوبكر أحمد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_686",
    "agent_name": "نسار غالب طه",
    "name": "نسار غالب طه",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_664",
    "agent_name": "جرا خان سعيد عبدالله",
    "name": "جرا خان سعيد عبدالله",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_689",
    "agent_name": "آمنه لؤي جودت",
    "name": "آمنه لؤي جودت",
    "team": "Ezma tower",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_690",
    "agent_name": "متين محمد امين اسعد",
    "name": "متين محمد امين اسعد",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_691",
    "agent_name": "مروة شعلان حسين",
    "name": "مروة شعلان حسين",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_692",
    "agent_name": "محمد سامان سالم",
    "name": "محمد سامان سالم",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_693",
    "agent_name": "عبدالله مضر مصطفى",
    "name": "عبدالله مضر مصطفى",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_694",
    "agent_name": "هدى عبدالله محمد",
    "name": "هدى عبدالله محمد",
    "team": "فرع اربيل",
    "direct_manager": "محمد اكرم سليم"
  },
  {
    "id": "emp_695",
    "agent_name": "ديار دلدار نور الدين",
    "name": "ديار دلدار نور الدين",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_696",
    "agent_name": "عبدالله خالص نافع",
    "name": "عبدالله خالص نافع",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ليهات عطار صدر الدين"
  },
  {
    "id": "emp_697",
    "agent_name": "روژ منصور انور",
    "name": "روژ منصور انور",
    "team": "فرع السليمانية",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_698",
    "agent_name": "ماريوس نزار انور",
    "name": "ماريوس نزار انور",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_699",
    "agent_name": "احمد نوري عوده",
    "name": "احمد نوري عوده",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_701",
    "agent_name": "كاردو محمد احمد",
    "name": "كاردو محمد احمد",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_702",
    "agent_name": "ده شتي قاسم محمد",
    "name": "ده شتي قاسم محمد",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_703",
    "agent_name": "أبي مجيد صالح",
    "name": "أبي مجيد صالح",
    "team": "Ezma tower",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_704",
    "agent_name": "علي سعد حمودي",
    "name": "علي سعد حمودي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_705",
    "agent_name": "زهراء غازي جاسب",
    "name": "زهراء غازي جاسب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_706",
    "agent_name": "محمد صالح عبدالهادي",
    "name": "محمد صالح عبدالهادي",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ديدن دلير علي"
  },
  {
    "id": "emp_707",
    "agent_name": "ياسر اسماعيل لازم",
    "name": "ياسر اسماعيل لازم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_709",
    "agent_name": "هاجر احمد عبدالكريم",
    "name": "هاجر احمد عبدالكريم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_710",
    "agent_name": "هوشمند ياسين سعيد",
    "name": "هوشمند ياسين سعيد",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_711",
    "agent_name": "له نيار رزكار قادر",
    "name": "له نيار رزكار قادر",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_712",
    "agent_name": "هيدي صباح لطيف",
    "name": "هيدي صباح لطيف",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_713",
    "agent_name": "باشا محمد خالد",
    "name": "باشا محمد خالد",
    "team": "سليمانية",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_714",
    "agent_name": "متي زومايا مرقس",
    "name": "متي زومايا مرقس",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_715",
    "agent_name": "محمد علي محمد",
    "name": "محمد علي محمد",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_716",
    "agent_name": "دلوفان صلاح رمصان",
    "name": "دلوفان صلاح رمصان",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_717",
    "agent_name": "شعلان لورنس شعلان",
    "name": "شعلان لورنس شعلان",
    "team": "دهوك",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_718",
    "agent_name": "عبدالرحمن اسعد اسماعيل",
    "name": "عبدالرحمن اسعد اسماعيل",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_719",
    "agent_name": "حاتم ملا شيخ حاتم",
    "name": "حاتم ملا شيخ حاتم",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_720",
    "agent_name": "ده ريا خليل حسين",
    "name": "ده ريا خليل حسين",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_721",
    "agent_name": "بلال ازاد مجيد",
    "name": "بلال ازاد مجيد",
    "team": "Ezma tower",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_722",
    "agent_name": "محمد سعيد مختار سعيد الحص",
    "name": "محمد سعيد مختار سعيد الحص",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عبدالرحمن هشام عدنان الحايك"
  },
  {
    "id": "emp_723",
    "agent_name": "رحمه عماد حمد",
    "name": "رحمه عماد حمد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "وائل عباس فرمان القاضي"
  },
  {
    "id": "emp_724",
    "agent_name": "ايه اسامه عبد الوهاب",
    "name": "ايه اسامه عبد الوهاب",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "نور الدين علي عباس"
  },
  {
    "id": "emp_725",
    "agent_name": "زهراء منير غني",
    "name": "زهراء منير غني",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر"
  },
  {
    "id": "emp_726",
    "agent_name": "حسين منديل حسين",
    "name": "حسين منديل حسين",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر"
  },
  {
    "id": "emp_727",
    "agent_name": "عمار فاروق كاظم",
    "name": "عمار فاروق كاظم",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر"
  },
  {
    "id": "emp_728",
    "agent_name": "زينب محسن البوسوده",
    "name": "زينب محسن البوسوده",
    "team": "فرع النجف",
    "direct_manager": "منى عبدالحسن جبر"
  },
  {
    "id": "emp_729",
    "agent_name": "حسن اياد جلال",
    "name": "حسن اياد جلال",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_730",
    "agent_name": "رﯙڤين طالب كريم",
    "name": "رﯙڤين طالب كريم",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_731",
    "agent_name": "عبدالله سليم محمود",
    "name": "عبدالله سليم محمود",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_732",
    "agent_name": "هاوكار عبدالله بيروت",
    "name": "هاوكار عبدالله بيروت",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_733",
    "agent_name": "عمر نشأت عبدالكريم",
    "name": "عمر نشأت عبدالكريم",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_734",
    "agent_name": "كوسره ت فيصل سفر",
    "name": "كوسره ت فيصل سفر",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_735",
    "agent_name": "رێبین ابراهيم رسول",
    "name": "رێبین ابراهيم رسول",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_736",
    "agent_name": "علي عمران غركان",
    "name": "علي عمران غركان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_737",
    "agent_name": "جمال علاء عبدالرزاق",
    "name": "جمال علاء عبدالرزاق",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_738",
    "agent_name": "علي غسان عدنان",
    "name": "علي غسان عدنان",
    "team": "مكتب السيدية",
    "direct_manager": "علي عباس مكي"
  },
  {
    "id": "emp_739",
    "agent_name": "نبأ حيدر محمود",
    "name": "نبأ حيدر محمود",
    "team": "فرع المنصور",
    "direct_manager": "اسماء سمير محمود"
  },
  {
    "id": "emp_740",
    "agent_name": "مينا عمر خالد",
    "name": "مينا عمر خالد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_741",
    "agent_name": "سلوان عمار اسماعيل",
    "name": "سلوان عمار اسماعيل",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_742",
    "agent_name": "ژيلان آزاد جليل",
    "name": "ژيلان آزاد جليل",
    "team": "Ezma tower",
    "direct_manager": "يوسف نزار طارق"
  },
  {
    "id": "emp_743",
    "agent_name": "يوسف نزار طارق",
    "name": "يوسف نزار طارق",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "علي محمد حسن العاملي"
  },
  {
    "id": "emp_744",
    "agent_name": "علي طالب ابراهيم",
    "name": "علي طالب ابراهيم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_745",
    "agent_name": "عمر عادل عبدالله",
    "name": "عمر عادل عبدالله",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_747",
    "agent_name": "امير نصير جاسم",
    "name": "امير نصير جاسم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_748",
    "agent_name": "عبدالله عدنان خالد",
    "name": "عبدالله عدنان خالد",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "رافد محمد رضا"
  },
  {
    "id": "emp_749",
    "agent_name": "فرح غانم جدعان",
    "name": "فرح غانم جدعان",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "عدنان احمد عبده زكريا"
  },
  {
    "id": "emp_750",
    "agent_name": "ميس محمد محسن",
    "name": "ميس محمد محسن",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_751",
    "agent_name": "هاجر جلال عبدالمجيد",
    "name": "هاجر جلال عبدالمجيد",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_752",
    "agent_name": "محمد صالح مناف",
    "name": "محمد صالح مناف",
    "team": "Ezma tower",
    "direct_manager": "جلال محمود صالح برغل"
  },
  {
    "id": "emp_753",
    "agent_name": "امنه شكيب شريف",
    "name": "امنه شكيب شريف",
    "team": "الموصل",
    "direct_manager": "ادريس صالح محمد امين"
  },
  {
    "id": "emp_754",
    "agent_name": "احمد مصعب سلمان",
    "name": "احمد مصعب سلمان",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_755",
    "agent_name": "بارق معاذ محسن",
    "name": "بارق معاذ محسن",
    "team": "Ezma tower",
    "direct_manager": "عبدالرحمن طاهر عبدالله"
  },
  {
    "id": "emp_756",
    "agent_name": "مؤيد جعفر محمد",
    "name": "مؤيد جعفر محمد",
    "team": "فرع البصرة",
    "direct_manager": "زينب رعد حنون"
  },
  {
    "id": "emp_757",
    "agent_name": "صادق حيدر هاشم",
    "name": "صادق حيدر هاشم",
    "team": "بغداد القاهرة - مول القاهرة الطابق الاول",
    "direct_manager": "شهد كريم كامل"
  },
  {
    "id": "emp_758",
    "agent_name": "سالي جبر كوركيس",
    "name": "سالي جبر كوركيس",
    "team": "Ezma tower",
    "direct_manager": "عمر اياد حمدي"
  },
  {
    "id": "emp_759",
    "agent_name": "دنيا يوارش زيا",
    "name": "دنيا يوارش زيا",
    "team": "فرع الموصل",
    "direct_manager": "مصطفى خضر عباس"
  },
  {
    "id": "emp_760",
    "agent_name": "شه نگه عبدالله عزيز",
    "name": "شه نگه عبدالله عزيز",
    "team": "فرع السليمانية",
    "direct_manager": "روژ منصور انور"
  },
  {
    "id": "emp_761",
    "agent_name": "ايمان عبد علي جاسم",
    "name": "ايمان عبد علي جاسم",
    "team": "العرصات / الادارة العامة",
    "direct_manager": "حازم التميمي"
  },
  {
    "id": "emp_762",
    "agent_name": "طارق عباس فياض",
    "name": "طارق عباس فياض",
    "team": "الفرع الرئيسي",
    "direct_manager": "ريم مهدي علي"
  },
  {
    "id": "emp_2010",
    "agent_name": "شيفاء عبدالرزاق عبدالرحمن",
    "name": "شيفاء عبدالرزاق عبدالرحمن",
    "team": "Ezma tower",
    "direct_manager": "ديدن دلير علي"
  }
];
