XYBASE Simple Calendar/Event Layout Component

jquery.xycal.js v1.0.4

Developer: Imam Kurniawan <geekzy@gmail.com><imam@xybase.com>
Copyright (c) 2012 XYBASE <http://www.xybase.com>

Methods:
- getSelected :
  Get curently selected day
  return day object of selected day

- setSelected(date) :
  Set the selected date, all related callbacks will also be invoked
  param date the Date object of the selected date
  return the selected date as Date Object

- today :
  Navigate to Today's date

Callbacks:
- onLoaded :
  Callback when the xycal component is loaded, scope of this is the xycal instance

- onChangeDay(selected, evented)
  Callback when the day is changed/selected, scope of this is the xycal instance
  param selected the latest selected date as Date Object
  param evented boolean value of the selected date has any event(s). true - has event(s); false - no event(s)

- onChangeMonth(selected)
  Callback when the month is changed, scope of this is the xycal instance
  param selected the latest selected date as Date Object

- onChangeYear(selected)
  Callback when the year is changed, scope of this is the xycal instance
  param selected the latest selected date as Date Object

Changes:
- [10/05/12] Fix event list referencing issue when using configuration, get it straight from selector
- [11/05/12] Add options for callback such as when xycal is loaded, date selected, month change & year change
             Add public methods to get/set the selected date and navigate to today's date.
- [14/05/12] Fix DOM Event bug when switching to other screen, replace .live with .click and reinitialize after change month
- [24/05/12] Fix Style for EduConnect